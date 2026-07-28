---
title: 一个比特币 Taproot 脚本漏洞开始的调查
date: 2026-07-28 00:50:05
tags: 比特币
---

### 起因

在 bitcointalk 上看到一个帖子：[How to handle weak scripts?](https://bitcointalk.org/index.php?topic=5588964.0)

这个帖子说明了一种 Taproot 脚本的漏洞，无需经过签名验证，任何人都可以花费在这个 UTXO 上的余额。在 mempool 浏览器的界面上可以清晰看到，这笔 [`f460...5bc2`](https://mempool.space/tx/f460443ee5b2bff69b9f299e31e1258f01a023555de5a63cd2d10c4ead0a5bc2) 交易转出的一方有一个 unsigned 的标识，这个标识在比特币网络上并不多见：

<img src="1.png" width="100%">

帖子中描述的 Taproot 脚本的逻辑是这样，这也是 `f460...5bc2` 交易真实执行的脚本过程：

```bash
OP_PUSHBYTES_32 fa9b5ec193f735c41b804fc6ace1d28e81a299fc815c0f5009dd2dd7d0293c3b
OP_CHECKSIG
OP_IF
OP_PUSHBYTES_32 ff1275b635cd160914cfe1bc516f521abde0fc8ae3fd92ae01ca16449e4758e9
OP_ENDIF
```

可以简化为：

```bash
<pubkey A>
OP_CHECKSIG
OP_IF
    <pubkey B>
OP_ENDIF
```

比特币的 Taproot 是基于栈结构的脚本，理解起来需要绕弯，把这个脚本翻译为 JavaScript 代码的话，大概是这个意思：

```js
function isTrue(...params)
{
  var pubkeyA = params[-1];
  params--;
  if (checkSign(pubkeyA))
  {
    return true;
  }
  else
  {
    //
  }
  return params[-1];
}
```

从代码来看，在正常使用流程下，假如输入的参数是 `[pubkeyA]`，那么 `checkSign(pubkeyA)` 为 true，最终 `return true`，这个是合理的。

假如输入的参数是 `[pubkeyC]`，那么 `checkSign(pubkeyA)` 为 `false`，下面的 else 分支什么都不做，最终 `return null`，依然不是 `true`，这个也合理。

这个脚本的漏洞在哪里呢，在于 params 是一个数组，用户未必只输入一个参数。

在漏洞逻辑下，可以输入非预期的参数组合 `[true, pubkeyC]`，那么按照后面的执行流程，当进入 else 分支什么都不做之后，`return params[0]` 会把 `true` 给返回出来。

这里面存在几个基础的问题：

1. 代码没有处理 else 分支
2. 比特币的 Taproot 脚本没有类型检查（只有操作码）
3. 脚本作者没有正确理解 Taproot 脚本的写法，忽略了 witness 可以提交任意数量的参数

### 分析

所以很简单，这个所谓的脚本漏洞，实际上是作者自己写了不严谨的代码导致的。要注意这里指的不是比特币的作者，仅仅只是比特币的用户。比特币的 Taproot 相当于以太坊的智能合约，任何人都可以写一些脚本规则，来决定钱怎么控制、怎么花。只不过比特币的脚本写起来复杂，而且不是图灵完备，所以很多人忽略了比特币可以自己写脚本这件事情。

很明显这不是一个比特币协议级别的漏洞，比特币的共识只负责按照脚本规则正确执行，而脚本逻辑是否有漏洞，跟协议无关。

而且事实上无论是比特币钱包还是比特币生态的项目，如果依赖于 Taproot 的脚本逻辑，一定会经过审计公司来审核代码，这种低级错误出现在主网上的情况恐怕会非常少。

另外 Taproot 这种脚本设计的隐私性其实很强，我们只能知道比特币地址 `bc1p` 开头是 Taproot 脚本，`0xc0` 开头的是当前版本号，但是一个 UTXO 在没有被花费之前，网络上是无法看到脚本具体内容的。而在被花费的那一刻，大概率全部的钱都已经被转走了。一个 P2TR UTXO 被创建的时候，链上只保存这棵树结构的根节点哈希，任何可以解锁 root 的路径都是有效输入，这些有效输入只有在花费的时候，链上才需要根据具体的 leaf 和 key path 去验证。而且即使某一个 leaf 被公开，链上也只能看到其中一个，看不到同一个 root 下的其他 leaf。

比特币从设计之初，就提倡每一笔转账都使用一个新的地址，实际上大多数靠谱的钱包也是这么设计的，这本身就很大程度规避了漏洞脚本被再次利用的风险。

所以无论是从技术上和商业逻辑上，这种漏洞脚本的出现都是极其小概率的个例，完全就是脚本作者自己写错了。主网上存在漏洞脚本的可能性很小。

### 调查

#### 示例地址

有没有可能网路上真的存在这种漏洞脚本，不需要验证签名就可以把钱转走的？

先从 [`bc1p...cn8z`](https://mempool.space/address/bc1p78u5v2rgsu7gf79yw5c85fs3da0hfsw25ht5tr6p3mvh5wvmck6qpxcn8z) 这个例子入手，有几个问题：

1. 假如这个地址上还有钱，要怎么转出？

这显然不是钱包 App 提供的功能，而且比特币的交易比较麻烦，得把 UTXO 来源的交易和编号都作为参数才能构造出交易。这是一个示例脚本 [taproot-script-path-demo.mjs](./taproot-script-path-demo.mjs)，可以这样来运行：

```bash
TXID='0618d93bc4eef77f4b47c4b4b188011f95c7ccb929e6226df2774b88b5d4693d'
VOUT='0'
INPUT_SATS='15000'
DESTINATION='bc1px6jn77jd4tplp94q46svkuutc53wtn24dk34wxp4dfur6tvez89swvlcmj'
FEE_SATS='1000'

node outputs/taproot-script-path-demo.mjs \
  "$TXID" \
  "$VOUT" \
  "$INPUT_SATS" \
  "$DESTINATION" \
  "$FEE_SATS"
```

如果你不小心把钱打到了地址 `bc1p...cn8z` 上，就可以用这个脚本，在没有私钥的情况下，把钱转出来。但是要小心脚本里的 `xOnlyKey` 和 `payload` 都是硬编码，如果换一个目标地址，这两个值就不一样了，得用另外的值。那么这个值应该是什么呢？这个值只有在 P2TR 被花费过之后才能知道。

这也就意味着，即使我们知道链上某一个地址有余额、脚本有漏洞，因为不知道整个树结构、拿不到 xOnlyKey 和 payload 的值，我们也无法动这个地址上的钱。从这个角度看，比特币上的资产安全程度还是很高的。

2. 有没有可能这个作者把钱转给了某一个有同样漏洞的 P2TR，但是忘了转出？

同样有一个示例脚本来干这个事情：[audit-taproot-neighborhood.mjs](./audit-taproot-neighborhood.mjs)，结果就是，没有。这个作者把全部关联地址的钱都转走了，不存在这种低级漏洞。

#### 扫描全网

这个程序可以扫描整个比特币网络上类似的脚本漏洞：[tapscript_weak_finder](https://github.com/smallyunet/tapscript_weak_finder)

扫描逻辑是这样：

1. 逐个区块扫描每一笔交易，判断是不是 Taproot Script 且 version 为 `0xc0`
2. 这个程序里实现了一个非常轻量的解释器，用来处理 witness 参数
3. 会分别用 3 种参数策略来测试脚本是否可以不需要签名也能通过
  1. 直接用 `[01, <empty signatrue>]` 的排列组合，处理 0 个参数、1 个参数、2 个参数的情况，一共 12 种
  2. 把 atom 从 `01`, `<empty signatrue>`，扩展到小整数和一些常量，比如 `02`, `03`, `true`, `false` 等
  3. 对于已经公开执行过的 witness 参数比如 `[[data, sigA, sigB]]`，尝试变换组合，比如 `[data, "", sigB]`、`[data, sigA, ""]` 等
4. 如果程序发现了不需要签名的脚本、一定返回 `OP_SUCCESS80`的脚本，或者目前规范还没有定义的公钥类型，会记录到数据库

#### 扫描结果

当然我会告诉你运行结果。如果你运行了这个开源程序，会得到和我一样的结果和结论。我的启动参数是从区块高度 `709632` 开始，这是比特币主网启用 Taproot 的高度，到 `959701` 高度结束，也就是最新的区块高度。

一共扫描了 71037 个区块，扫描了 127119410 笔交易，扫描到 1000061 个 Taproot 地址，其中 427378 个属于当前程序没识别出问题的脚本，12 是有可能有漏洞的弱脚本。

在 12 个有可能有漏洞的脚本中，8 个属于不需要签名的弱脚本，1 个属于始终返回 `OP_SUCCESS80` 的非漏洞脚本，3 个属于包含扫描程序解释器不支持操作码的非漏洞脚本。

#### 结果分析

来逐个分析一下扫描到的有可能是 weak script 的交易。最终输出的、未经加工的结果数据在这个文件：[result_report.json](./result_report.json)，可以还原出我下面提到的地址和交易、脚本。

##### 1

首先扫描到的这个 taproot 地址出现在 758737 区块：[`bc1p...2354`](https://mempool.space/address/bc1pnwu7l0wln4c2l5av9nhsz968yd4alyyr9futpr6h6yfe7pa2jxzshv2354)

这个地址出现了 2 笔异常交易：

- [`00c1...c40e`](https://mempool.space/tx/00c1af8f7d9e2bfe854d1718db078eb6740920f702bc00d4a9f205d3a084c40e)
- [`73be...2a7e`](https://mempool.space/tx/73be398c4bdc43709db7398106609eea2a7841aaf3a4fa2000dc18184faa2a7e)

先说结论，这 2 笔交易是非常专业的开发者在演示比特币主网的 BIP342 规范而发起的。

第一笔交易 `00c1...c40e` 包含 2 个 witness 参数，是用来测试交易的。

第二笔交易 `73be...2a7e` 就离谱了，包含 500001 个 witness 参数，`OP_RETURN` 的内容解码后得到 "you'll run cln. and you'll be happy." 的文本。

TapScript 的规定是，初始栈最多只能有 1000 个元素，但是第二笔交易出现了 500001 个元素而且交易成功了，是因为 BIP342 规范定义，如果脚本中出现 `OP_SUCCESSx`，则无论脚本包含多少元素，一律视作成功。因为 `OP_SUCCESSx` 属于目前还未明确支持、但是预留给未来有可能使用的操作码，所以 BIP342 这样来规定了。

很明显第二笔交易就是用来演示这种状况的。也因为这笔交易包含大量参数，花费了超过 700 美元的手续费。

##### 2

其次扫描到的地址出现在 771740 区块；

- [`bc1p...648w`](https://mempool.space/address/bc1pzmc9a8uczft74n2s0lakz7jgmfn3jmgpd8wnqg2eyn8mev25cccsne648w)
- [`bc1p...u69a`](https://mempool.space/address/bc1p2y390fnxvgevhwx5v47amhzm4e347vkckksusc30z0z6zq8f62hqc2u69a)
- [`bc1p...n6cl`](https://mempool.space/address/bc1pkntn5g8mg9fwf32xwj52e0vx9gaxv5zzn4yt54saaaj8x825a43qu3n6cl)

这 3 个脚本对应的交易包含了 `OP_CHECKSEQUENCEVERIFY` 操作码，扫描程序没有处理这个操作码，所以认为是异常给挑出来了。`OP_CHECKSEQUENCEVERIFY` 操作码的含义是，必须等待多少个区块，才可以使用地址里的资金。属于是典型的 TimeLock 脚本。

##### 3

在区块高度 775722，扫描到了这个地址：[`bc1p...amq6`](https://mempool.space/address/bc1p9zpp682rerqscftc98kn7g3yne08mkte27eletq3w9kdw8q3prcqqaamq6)

这是一个真正有逻辑漏洞的脚本，不需要任何签名就可以转移资金。这个脚本明显是一个 Ordinals 数据结构的封装，可能是某个开发者在尝试自己开发类似 Ordinals 的协议。当然这个地址上的钱当时就被全部转走了，现在没有余额。

另外还有几个地址，数量不多，大多数是 Ordinals 的测试交易，就不一一详细解释了：

- [`bc1p...3hu0`](https://mempool.space/address/bc1p07d0z7drxkewne2z665xngf8rtnga9p32wl957zwtd96n89qja2sch3hu0)，区块高度 777335，一个 Ordinals PNG 图片
- [`bc1p...xgdr`](https://mempool.space/address/bc1pna0qxzm3z8vwre6h6vv5fh6m7pc5e9pk3nqtfxd77zad4jm8c25q88xgdr)，区块高度 777617，一个加法运算，没有校验签名
- [`bc1p...gq7d`](https://mempool.space/address/bc1p395qvu3zaehjrvek9nqjkdd785f379y7zsjesy0p8vugd7gkr94qd7gq7d)，区块高度 777681，一个测试脚本，固定返回 true
- [`bc1p...9x3t`](https://mempool.space/address/bc1pmqpwg3gh5dcaepz2ttuet7vtdtug23zpjz93p7e902jv582nudcqk09x3t)，一个 Ordinals 的 Hello World 脚本
- ...

### 结论

已经扫描了从 Taproot 脚本功能上线到至今为止全部的区块和交易，真的出现了少量 [How to handle weak scripts?](https://bitcointalk.org/index.php?topic=5588964.0) 中描述的类似的脚本漏洞，不过那些地址上都已经没有余额了。

这件事情另外的启发：

1. 比特币网络是否存在更复杂类型的脚本漏洞？
2. 以太坊的脚本漏洞是否可以用类似的手段扫描？

