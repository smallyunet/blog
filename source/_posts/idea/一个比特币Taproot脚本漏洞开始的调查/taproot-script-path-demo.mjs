import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';

bitcoin.initEccLib(ecc);

// Safety: this demo is intentionally fixed to Bitcoin Core regtest.
const network = bitcoin.networks.bitcoin;

// Exact x-only internal/script key and 32-byte payload revealed by:
// f460443ee5b2bff69b9f299e31e1258f01a023555de5a63cd2d10c4ead0a5bc2
const xOnlyKey = Buffer.from(
  'fa9b5ec193f735c41b804fc6ace1d28e81a299fc815c0f5009dd2dd7d0293c3b',
  'hex',
);
const payload = Buffer.from(
  'ff1275b635cd160914cfe1bc516f521abde0fc8ae3fd92ae01ca16449e4758e9',
  'hex',
);

// <xonly-pubkey> OP_CHECKSIG OP_IF <32-byte payload> OP_ENDIF
const leafScript = bitcoin.script.compile([
  xOnlyKey,
  bitcoin.opcodes.OP_CHECKSIG,
  bitcoin.opcodes.OP_IF,
  payload,
  bitcoin.opcodes.OP_ENDIF,
]);

const redeem = { output: leafScript, redeemVersion: 0xc0 };
const p2tr = bitcoin.payments.p2tr({
  internalPubkey: xOnlyKey,
  scriptTree: { output: leafScript },
  redeem,
  network,
});

if (!p2tr.address || !p2tr.output || !p2tr.witness) {
  throw new Error('P2TR construction failed');
}

const controlBlock = Buffer.from(p2tr.witness.at(-1));
const details = {
  regtestFundingAddress: p2tr.address,
  scriptPubKey: Buffer.from(p2tr.output).toString('hex'),
  leafScript: Buffer.from(leafScript).toString('hex'),
  controlBlock: controlBlock.toString('hex'),
  witnessParameters: ['51', '', '<leafScript>', '<controlBlock>'],
};
console.log(JSON.stringify(details, null, 2));

const [txid, voutText, inputSatsText, destination, feeSatsText = '500'] =
  process.argv.slice(2);

if (!txid) {
  console.error(
    '\nUsage: node taproot-script-path-demo.mjs ' +
      '<funding_txid> <vout> <input_sats> <regtest_destination> [fee_sats]',
  );
  process.exit(0);
}

if (!/^[0-9a-fA-F]{64}$/.test(txid)) throw new Error('Invalid txid');
const vout = Number(voutText);
const inputSats = BigInt(inputSatsText);
const feeSats = BigInt(feeSatsText);
if (!Number.isSafeInteger(vout) || vout < 0) throw new Error('Invalid vout');
if (inputSats <= feeSats || feeSats < 0n) throw new Error('Invalid amounts');
if (!destination) throw new Error('Missing regtest destination address');

const destinationScript = bitcoin.address.toOutputScript(destination, network);
const opReturn = bitcoin.payments.embed({
  data: [Buffer.from('taproot script-path regtest demo', 'utf8')],
});

const tx = new bitcoin.Transaction();
tx.version = 2;
tx.addInput(Buffer.from(txid, 'hex').reverse(), vout, 0xfffffffd);
tx.addOutput(opReturn.output, 0n);
tx.addOutput(destinationScript, inputSats - feeSats);

// Initial stack is [0x51, empty_signature]. CHECKSIG consumes the empty
// signature and pushes false; OP_IF consumes false and skips the payload.
// The untouched 0x51 remains as the final true stack item.
tx.setWitness(0, [
  Buffer.from([0x51]),
  Buffer.alloc(0),
  leafScript,
  controlBlock,
]);

console.log('\nrawTransaction:');
console.log(tx.toHex());
