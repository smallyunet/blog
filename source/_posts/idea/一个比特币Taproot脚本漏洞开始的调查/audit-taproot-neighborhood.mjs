#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { address as bitcoinAddress } from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';

/**
 * Read-only, one-hop Taproot neighborhood audit using the public mempool.space API.
 *
 * This script:
 *   1. Loads every bounded history page for the target address.
 *   2. Collects addresses that directly share a transaction with the target.
 *   3. Scans only the P2TR addresses among those direct neighbors.
 *   4. Looks for confirmed script-path witnesses that reveal the exact weak
 *      template:
 *
 *        <32-byte key> OP_CHECKSIG OP_IF <32-byte payload> OP_ENDIF
 *
 *   5. Reports current UTXOs at an address only when that same address has a
 *      confirmed historical reveal of the weak template.
 *
 * It does not sign, construct, or broadcast transactions. An unrevealed P2TR
 * address is reported as unknown, never as safe.
 */

const DEFAULT_API = 'https://mempool.space/api';
const PAGE_SIZE = 25;

function usage(exitCode = 0) {
  console.error(`Usage:
  node outputs/audit-taproot-neighborhood.mjs <bc1p-address> [options]

Options:
  --api=<url>            Mempool-compatible API base (default: ${DEFAULT_API})
  --max-pages=<n>        Maximum history pages per address (default: 20)
  --max-neighbors=<n>    Maximum direct P2TR neighbors to scan (default: 100)
  --delay-ms=<n>         Delay between API calls (default: 120)
  --timeout-ms=<n>       Timeout for each API request (default: 30000)
  --json                 Emit machine-readable JSON
  --help                 Show this help

Scope:
  "Neighbor" means an address that appears in an input or output of a
  transaction involving the target. The scan is one hop, not recursive.`);
  process.exit(exitCode);
}

function parsePositiveInteger(value, name, { allowZero = false } = {}) {
  if (!/^\d+$/.test(value)) throw new Error(`${name} must be an integer`);
  const parsed = Number(value);
  const minimum = allowZero ? 0 : 1;
  if (!Number.isSafeInteger(parsed) || parsed < minimum) {
    throw new Error(`${name} must be >= ${minimum}`);
  }
  return parsed;
}

function parseArgs(argv) {
  const options = {
    api: DEFAULT_API,
    maxPages: 20,
    maxNeighbors: 100,
    delayMs: 120,
    timeoutMs: 30_000,
    json: false,
  };
  let address;

  for (const arg of argv) {
    if (arg === '--help') usage(0);
    if (arg === '--json') {
      options.json = true;
    } else if (arg.startsWith('--api=')) {
      options.api = arg.slice('--api='.length).replace(/\/+$/, '');
    } else if (arg.startsWith('--max-pages=')) {
      options.maxPages = parsePositiveInteger(
        arg.slice('--max-pages='.length),
        '--max-pages',
      );
    } else if (arg.startsWith('--max-neighbors=')) {
      options.maxNeighbors = parsePositiveInteger(
        arg.slice('--max-neighbors='.length),
        '--max-neighbors',
      );
    } else if (arg.startsWith('--delay-ms=')) {
      options.delayMs = parsePositiveInteger(
        arg.slice('--delay-ms='.length),
        '--delay-ms',
        { allowZero: true },
      );
    } else if (arg.startsWith('--timeout-ms=')) {
      options.timeoutMs = parsePositiveInteger(
        arg.slice('--timeout-ms='.length),
        '--timeout-ms',
      );
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    } else if (!address) {
      address = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }

  if (!address) usage(1);
  if (!/^bc1p[023456789acdefghjklmnpqrstuvwxyz]{58}$/i.test(address)) {
    throw new Error('Target must be a mainnet P2TR address (bc1p...)');
  }
  try {
    const decoded = bitcoinAddress.fromBech32(address);
    if (
      decoded.prefix !== 'bc' ||
      decoded.version !== 1 ||
      decoded.data.length !== 32
    ) {
      throw new Error('wrong witness program');
    }
  } catch {
    throw new Error('Target has an invalid mainnet P2TR Bech32m checksum');
  }
  if (!options.api) throw new Error('--api must not be empty');
  return { address: address.toLowerCase(), ...options };
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

class ApiClient {
  constructor(baseUrl, delayMs, timeoutMs) {
    this.baseUrl = baseUrl;
    this.delayMs = delayMs;
    this.timeoutMs = timeoutMs;
    this.requestCount = 0;
  }

  async get(path) {
    let lastError;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      if (this.requestCount > 0 && this.delayMs > 0) {
        await sleep(this.delayMs);
      }
      this.requestCount += 1;

      let response;
      try {
        response = await fetch(`${this.baseUrl}${path}`, {
          headers: { accept: 'application/json' },
          signal: AbortSignal.timeout(this.timeoutMs),
        });
      } catch (error) {
        lastError = error;
      }

      if (response?.ok) {
        try {
          return await response.json();
        } catch (error) {
          lastError = new Error(`Invalid JSON for ${path}: ${error.message}`);
        }
      } else if (response) {
        const body = (await response.text()).slice(0, 300);
        const responseError = new Error(
          `API ${response.status} for ${path}: ${body || response.statusText}`,
        );
        if (response.status !== 429 && response.status < 500) {
          throw responseError;
        }
        lastError = responseError;
      }

      if (attempt < 3) await sleep(300 * 2 ** attempt);
    }
    throw lastError;
  }
}

async function fetchAddressHistory(client, address, maxPages) {
  const transactions = [];
  const seen = new Set();
  let cursor;
  let complete = false;

  for (let pageNumber = 0; pageNumber < maxPages; pageNumber += 1) {
    const suffix = cursor ? `/txs/chain/${cursor}` : '/txs';
    const page = await client.get(`/address/${address}${suffix}`);
    if (!Array.isArray(page)) throw new Error(`Invalid history for ${address}`);

    for (const transaction of page) {
      if (!seen.has(transaction.txid)) {
        seen.add(transaction.txid);
        transactions.push(transaction);
      }
    }

    if (page.length < PAGE_SIZE) {
      complete = true;
      break;
    }
    cursor = page.at(-1)?.txid;
    if (!cursor) break;
  }

  return { transactions, complete };
}

function isP2trPrevout(prevout) {
  return (
    prevout?.scriptpubkey_type === 'v1_p2tr' &&
    typeof prevout.scriptpubkey_address === 'string'
  );
}

function collectDirectNeighbors(target, transactions) {
  const all = new Map();

  const add = (address, type, relation, txid) => {
    if (!address || address === target) return;
    const current = all.get(address) ?? {
      address,
      observedTypes: new Set(),
      relations: new Set(),
      transactionIds: new Set(),
    };
    if (type) current.observedTypes.add(type);
    current.relations.add(relation);
    current.transactionIds.add(txid);
    all.set(address, current);
  };

  for (const transaction of transactions) {
    for (const input of transaction.vin ?? []) {
      add(
        input.prevout?.scriptpubkey_address,
        input.prevout?.scriptpubkey_type,
        'input',
        transaction.txid,
      );
    }
    for (const output of transaction.vout ?? []) {
      add(
        output.scriptpubkey_address,
        output.scriptpubkey_type,
        'output',
        transaction.txid,
      );
    }
  }

  return [...all.values()].map(item => ({
    address: item.address,
    observedTypes: [...item.observedTypes].sort(),
    relations: [...item.relations].sort(),
    transactionIds: [...item.transactionIds].sort(),
  }));
}

function looksLikeControlBlock(hex) {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) return false;
  const bytes = Buffer.from(hex, 'hex');
  if (bytes.length < 33 || (bytes.length - 33) % 32 !== 0) return false;
  return (bytes[0] & 0xfe) === 0xc0;
}

function extractScriptPathWitness(witness) {
  if (!Array.isArray(witness) || witness.length < 2) return null;
  const elements = [...witness];
  let annex = null;

  if (/^50/i.test(elements.at(-1) ?? '')) {
    annex = elements.pop();
  }
  if (elements.length < 2 || !looksLikeControlBlock(elements.at(-1))) {
    return null;
  }

  return {
    stack: elements.slice(0, -2),
    leafScript: elements.at(-2),
    controlBlock: elements.at(-1),
    annex,
  };
}

function analyzeExactWeakTemplate(scriptHex) {
  if (!/^[0-9a-f]+$/i.test(scriptHex) || scriptHex.length % 2 !== 0) {
    return null;
  }
  const script = Buffer.from(scriptHex, 'hex');

  // 0x20 <32-byte key> 0xac 0x63 0x20 <32-byte payload> 0x68
  if (
    script.length !== 69 ||
    script[0] !== 0x20 ||
    script[33] !== 0xac ||
    script[34] !== 0x63 ||
    script[35] !== 0x20 ||
    script[68] !== 0x68
  ) {
    return null;
  }

  return {
    template: '<key32> OP_CHECKSIG OP_IF <payload32> OP_ENDIF',
    xOnlyKey: script.subarray(1, 33).toString('hex'),
    payload: script.subarray(36, 68).toString('hex'),
    reason:
      'A truthy initial stack item plus an empty signature leaves exactly one true item.',
  };
}

function taggedHash(tag, payload) {
  const tagHash = createHash('sha256').update(tag).digest();
  return createHash('sha256')
    .update(tagHash)
    .update(tagHash)
    .update(payload)
    .digest();
}

function encodeCompactSize(value) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error('CompactSize value must be a non-negative safe integer');
  }
  if (value < 0xfd) return Buffer.from([value]);
  if (value <= 0xffff) {
    const encoded = Buffer.alloc(3);
    encoded[0] = 0xfd;
    encoded.writeUInt16LE(value, 1);
    return encoded;
  }
  if (value <= 0xffffffff) {
    const encoded = Buffer.alloc(5);
    encoded[0] = 0xfe;
    encoded.writeUInt32LE(value, 1);
    return encoded;
  }
  const encoded = Buffer.alloc(9);
  encoded[0] = 0xff;
  encoded.writeBigUInt64LE(BigInt(value), 1);
  return encoded;
}

function verifyTaprootCommitment(prevoutScriptHex, leafScriptHex, controlBlockHex) {
  try {
    if (
      !/^[0-9a-f]{66,}$/i.test(controlBlockHex) ||
      !/^[0-9a-f]+$/i.test(leafScriptHex) ||
      !/^[0-9a-f]{68}$/i.test(prevoutScriptHex)
    ) {
      return { valid: false, reason: 'Malformed commitment data' };
    }

    const controlBlock = Buffer.from(controlBlockHex, 'hex');
    const leafScript = Buffer.from(leafScriptHex, 'hex');
    const prevoutScript = Buffer.from(prevoutScriptHex, 'hex');
    if (
      controlBlock.length < 33 ||
      controlBlock.length > 33 + 32 * 128 ||
      (controlBlock.length - 33) % 32 !== 0
    ) {
      return { valid: false, reason: 'Invalid control-block length' };
    }
    if (prevoutScript[0] !== 0x51 || prevoutScript[1] !== 0x20) {
      return { valid: false, reason: 'Prevout is not a canonical P2TR scriptPubKey' };
    }

    const leafVersion = controlBlock[0] & 0xfe;
    if (leafVersion !== 0xc0) {
      return { valid: false, reason: 'Revealed leaf is not Tapscript v0xc0' };
    }
    const parity = controlBlock[0] & 1;
    const internalKey = controlBlock.subarray(1, 33);
    let merkleRoot = taggedHash(
      'TapLeaf',
      Buffer.concat([
        Buffer.from([leafVersion]),
        encodeCompactSize(leafScript.length),
        leafScript,
      ]),
    );

    for (let offset = 33; offset < controlBlock.length; offset += 32) {
      const node = controlBlock.subarray(offset, offset + 32);
      const [left, right] =
        Buffer.compare(merkleRoot, node) < 0
          ? [merkleRoot, node]
          : [node, merkleRoot];
      merkleRoot = taggedHash('TapBranch', Buffer.concat([left, right]));
    }

    const tweak = taggedHash(
      'TapTweak',
      Buffer.concat([internalKey, merkleRoot]),
    );
    const tweaked = ecc.xOnlyPointAddTweak(internalKey, tweak);
    if (!tweaked) {
      return { valid: false, reason: 'Invalid internal key or TapTweak' };
    }

    const outputKey = prevoutScript.subarray(2);
    const valid =
      tweaked.parity === parity &&
      Buffer.from(tweaked.xOnlyPubkey).equals(outputKey);
    return {
      valid,
      reason: valid
        ? null
        : 'Control block does not commit to the spent P2TR output',
      leafVersion,
      internalKey: internalKey.toString('hex'),
      merkleRoot: merkleRoot.toString('hex'),
    };
  } catch (error) {
    return {
      valid: false,
      reason: `Commitment verification failed: ${error.message}`,
    };
  }
}

function findReveals(address, transactions) {
  const reveals = [];

  for (const transaction of transactions) {
    for (let vin = 0; vin < (transaction.vin?.length ?? 0); vin += 1) {
      const input = transaction.vin[vin];
      if (
        input.prevout?.scriptpubkey_address !== address ||
        !isP2trPrevout(input.prevout)
      ) {
        continue;
      }

      const scriptPath = extractScriptPathWitness(input.witness);
      if (!scriptPath) continue;
      const weak = analyzeExactWeakTemplate(scriptPath.leafScript);
      const commitment = verifyTaprootCommitment(
        input.prevout.scriptpubkey,
        scriptPath.leafScript,
        scriptPath.controlBlock,
      );

      reveals.push({
        spendingTxid: transaction.txid,
        vin,
        confirmed: transaction.status?.confirmed === true,
        prevout: `${input.txid}:${input.vout}`,
        prevoutScriptPubKey: input.prevout.scriptpubkey,
        leafScript: scriptPath.leafScript,
        controlBlock: scriptPath.controlBlock,
        initialStack: scriptPath.stack,
        taprootCommitment: commitment,
        weakTemplate: commitment.valid ? weak : null,
      });
    }
  }
  return reveals;
}

async function auditP2trAddress(client, neighbor, maxPages) {
  const history = await fetchAddressHistory(
    client,
    neighbor.address,
    maxPages,
  );
  const reveals = findReveals(neighbor.address, history.transactions);
  const confirmedWeakReveals = reveals.filter(
    reveal =>
      reveal.confirmed &&
      reveal.taprootCommitment.valid &&
      reveal.weakTemplate !== null,
  );

  let utxos = [];
  if (confirmedWeakReveals.length > 0) {
    const response = await client.get(`/address/${neighbor.address}/utxo`);
    if (!Array.isArray(response)) {
      throw new Error(`Invalid UTXO response for ${neighbor.address}`);
    }
    utxos = response.map(utxo => ({
      outpoint: `${utxo.txid}:${utxo.vout}`,
      value: utxo.value,
      confirmed: utxo.status?.confirmed === true,
      blockHeight: utxo.status?.block_height ?? null,
    }));
  }

  return {
    ...neighbor,
    historyComplete: history.complete,
    transactionsScanned: history.transactions.length,
    scriptPathReveals: reveals.length,
    confirmedWeakReveals,
    currentUtxos: utxos,
    currentBalanceSats: utxos.reduce(
      (total, utxo) =>
        Number.isSafeInteger(utxo.value) ? total + utxo.value : total,
      0,
    ),
  };
}

function selectP2trNeighbors(neighbors, limit) {
  const candidates = neighbors
    .filter(neighbor => neighbor.observedTypes.includes('v1_p2tr'))
    .sort(
      (a, b) =>
        b.transactionIds.length - a.transactionIds.length ||
        a.address.localeCompare(b.address),
    );
  return {
    selected: candidates.slice(0, limit),
    total: candidates.length,
    truncated: candidates.length > limit,
  };
}

function summarize(
  options,
  client,
  targetHistory,
  neighborSelection,
  audits,
  failedAddresses,
) {
  const vulnerable = audits.filter(
    audit => audit.confirmedWeakReveals.length > 0,
  );
  const incompleteAudits = audits.filter(audit => !audit.historyComplete);
  return {
    generatedAt: new Date().toISOString(),
    target: options.address,
    scope: {
      network: 'bitcoin-mainnet',
      neighborhood: 'one-hop',
      onlyPubliclyRevealedScriptPaths: true,
      targetHistoryComplete: targetHistory.complete,
      maxPagesPerAddress: options.maxPages,
      maxP2trNeighbors: options.maxNeighbors,
      p2trNeighborsFound: neighborSelection.total,
      p2trNeighborsScanned: audits.length,
      p2trNeighborsTruncated: neighborSelection.truncated,
      incompleteNeighborHistories: incompleteAudits.length,
      failedNeighborAudits: failedAddresses.length,
    },
    summary: {
      apiRequests: client.requestCount,
      vulnerableAddresses: vulnerable.length,
      currentUtxosAtVulnerableAddresses: vulnerable.reduce(
        (total, audit) => total + audit.currentUtxos.length,
        0,
      ),
      currentBalanceSatsAtVulnerableAddresses: vulnerable.reduce(
        (total, audit) => total + audit.currentBalanceSats,
        0,
      ),
      conclusion:
        vulnerable.length > 0
          ? 'Confirmed weak-template reveals were found.'
          : 'No confirmed weak-template reveal was found within the bounded scan.',
    },
    warnings: [
      'An unrevealed P2TR address is unknown, not safe.',
      ...(targetHistory.complete
        ? []
        : ['Target history reached --max-pages and is incomplete.']),
      ...(neighborSelection.truncated
        ? ['P2TR neighbors reached --max-neighbors and were truncated.']
        : []),
      ...(incompleteAudits.length > 0
        ? ['One or more neighbor histories reached --max-pages and are incomplete.']
        : []),
      ...(failedAddresses.length > 0
        ? ['One or more neighbor audits failed; inspect failedAddresses.']
        : []),
    ],
    failedAddresses,
    vulnerableAddresses: vulnerable,
    scannedAddresses: audits,
  };
}

function printHumanReport(report) {
  const { scope, summary } = report;
  console.log(`Taproot one-hop audit: ${report.target}`);
  console.log(
    `Scanned ${scope.p2trNeighborsScanned}/${scope.p2trNeighborsFound} direct P2TR neighbors (${summary.apiRequests} API requests).`,
  );
  if (scope.failedNeighborAudits > 0) {
    console.log(`Failed neighbor audits: ${scope.failedNeighborAudits}.`);
  }
  console.log(
    `Confirmed weak addresses: ${summary.vulnerableAddresses}; current UTXOs: ${summary.currentUtxosAtVulnerableAddresses}; balance: ${summary.currentBalanceSatsAtVulnerableAddresses} sats.`,
  );
  console.log(`Conclusion: ${summary.conclusion}`);

  if (report.warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warning of report.warnings) console.log(`- ${warning}`);
  }

  if (report.failedAddresses.length > 0) {
    console.log('\nFailed neighbors:');
    for (const failure of report.failedAddresses) {
      console.log(`- ${failure.address}: ${failure.error}`);
    }
  }

  if (report.vulnerableAddresses.length > 0) {
    console.log('\nConfirmed weak-template reveals:');
    for (const audit of report.vulnerableAddresses) {
      console.log(
        `- ${audit.address}: ${audit.confirmedWeakReveals.length} reveal(s), ${audit.currentUtxos.length} UTXO(s), ${audit.currentBalanceSats} sats`,
      );
      for (const reveal of audit.confirmedWeakReveals) {
        console.log(
          `  ${reveal.spendingTxid}:${reveal.vin} spends ${reveal.prevout}`,
        );
      }
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const client = new ApiClient(options.api, options.delayMs, options.timeoutMs);
  const targetHistory = await fetchAddressHistory(
    client,
    options.address,
    options.maxPages,
  );
  const neighbors = collectDirectNeighbors(
    options.address,
    targetHistory.transactions,
  );
  const neighborSelection = selectP2trNeighbors(
    neighbors,
    options.maxNeighbors,
  );
  const audits = [];
  const failedAddresses = [];

  for (let index = 0; index < neighborSelection.selected.length; index += 1) {
    const neighbor = neighborSelection.selected[index];
    if (!options.json) {
      console.error(
        `Scanning neighbor ${index + 1}/${neighborSelection.selected.length}: ${neighbor.address}`,
      );
    }
    try {
      audits.push(await auditP2trAddress(client, neighbor, options.maxPages));
    } catch (error) {
      failedAddresses.push({
        address: neighbor.address,
        error: error.message,
      });
      console.error(`Skipping ${neighbor.address}: ${error.message}`);
    }
  }

  const report = summarize(
    options,
    client,
    targetHistory,
    neighborSelection,
    audits,
    failedAddresses,
  );
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printHumanReport(report);
  }
}

export {
  analyzeExactWeakTemplate,
  extractScriptPathWitness,
  verifyTaprootCommitment,
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch(error => {
    console.error(`Audit failed: ${error.message}`);
    process.exitCode = 1;
  });
}
