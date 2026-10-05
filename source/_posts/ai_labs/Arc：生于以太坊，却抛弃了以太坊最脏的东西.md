---
layout: post
title: Arc：生于以太坊，却抛弃了以太坊最脏的东西（ETH）
date: 2026-09-25 21:23:00
collection: ai
tags: AI 文章库
---


前面两篇文章，我分别讨论了 Ethereum 两个问题。

一个是：

**Ethereum 的技术架构到底有多脏。**

另一个是：

**Ethereum 如何把自己的复杂度泄漏给用户。**

The DAO 的历史特殊逻辑。

十几年 Hard Fork 沉积。

EOA。

WETH。

Approve。

Nonce。

Gas Token。

ERC-4337。

Bundler。

Paymaster。

EIP-7702。

Blob。

Rollup。

Bridge。

MEV。

这一切单独拿出来，都可以解释。

但堆在一起以后，它们构成了一套越来越庞大、越来越难以摆脱历史的系统。

所以接下来有一个非常有意思的问题：

**如果今天重新造一条链，能不能只拿 Ethereum 已经证明好用的东西，而不要 Ethereum 自己？**

Circle 的 Arc，给出了一个很有意思的答案。

我的判断是：

**Arc 最值得关注的地方，不是它发明了多少新技术。**

恰恰相反。

它真正聪明的地方，是它知道哪些东西根本没有必要重新发明。

EVM？

拿来。

Solidity？

拿来。

Ethereum 开发工具链？

拿来。

成熟的钱包体系？

拿来。

智能合约生态积累出来的开发范式？

全部拿来。

但是：

ETH？

不要。

Ethereum 共识？

不要。

Ethereum 的经济安全？

不要。

Ethereum 的 Rollup 路线？

不需要继承。

Ethereum 十几年留下来的历史政治？

跟我没有关系。

Ethereum 那个“必须拥有一种波动性原生 Token 才能使用区块链”的经济模型？

直接扔掉。

这才是 Arc 真正有意思的地方。

**它生于 Ethereum 的技术世界，却不需要活在 Ethereum 的经济世界里。**

---

# 一、Arc 最干净的一刀：这条链根本没有必要创造一个“ARC Coin”

几乎所有公链都有一个非常根深蒂固的逻辑：

我要造一条链。

所以我要发一个币。

Ethereum 有 ETH。

Solana 有 SOL。

Avalanche 有 AVAX。

BNB Chain 有 BNB。

然后这枚币承担：

Gas。

质押。

安全预算。

生态激励。

治理。

投机。

资产定价。

于是一个本来只是想使用区块链的人，被迫先参与一种资产投机。

你只是想转 1000 美元。

系统却先问：

> 你有没有买我们的 Coin？

这是 Crypto 十几年里最习以为常、同时也最奇怪的事情之一。

Arc 直接砍掉了这一层。

**Arc 的 Gas 使用 USDC。**

不是：

```text
ARC
```

不是：

```text
ARC Gas Token
```

不是：

```text
先在交易所买一点 Arc Coin，
再转进钱包支付手续费。
```

就是：

```text
USDC
```

Circle 对 Arc 的设计描述得非常明确：

> Gas in dollars.

交易费用直接由 USDC 支付，不需要持有波动性的 native token。

这件事情表面上只是：

**换了 Gas Token。**

其实远比这重要。

因为它把区块链世界长期捆绑在一起的两个概念第一次非常干净地拆开了：

```text
使用网络
≠
投资网络 Token
```

这是一个非常重要的思想变化。

---

# 二、在 Ethereum 上，“使用 Ethereum”和“持有 ETH”从来没有真正分开

这也是我一直认为 Ethereum 极其不干净的地方。

假设一个企业说：

> 我只想结算美元。

在 Ethereum 上它仍然必须面对一个完全不相干的问题：

> ETH 今天多少钱？

因为最终 Gas 是 ETH。

于是企业财务系统里面会出现一个奇怪的资产：

```text
USDC
```

这是我要使用的钱。

以及：

```text
ETH
```

这是我为了使用这些钱，
不得不额外持有的钱。

然后财务部门还得回答：

ETH 要留多少？

价格跌了怎么办？

价格涨了以后 Gas 的美元成本是多少？

什么时候补 Gas？

多个地址分别需要多少 ETH？

Treasury 是否允许持有 volatile crypto asset？

这个资产怎么记账？

这不是业务需求。

这是协议向业务强加的需求。

事实上，Circle 当初发布 Arc 时直接把企业反馈写出来了：

企业告诉 Circle：

> “我们的 Treasury 团队不能为了支付 Gas 而持有波动性的 Crypto Asset。”

于是 Arc 给出的答案简单得令人吃惊：

**那就不要持有。**

这才叫真正解决问题。

不是：

设计一个 Paymaster。

不是：

设计 Gas Station。

不是：

在 Ethereum 上搞账户抽象。

不是：

后台帮用户 Swap ETH。

不是：

Sponsor Gas。

而是：

**Gas 本来就是美元。**

一刀切掉整个问题。

---

# 三、这就是“干净架构”和“打补丁架构”的差别

Ethereum 怎么解决用户不想持有 ETH 付 Gas？

答案越来越复杂。

ERC-4337。

Paymaster。

Smart Account。

Bundler。

EntryPoint。

甚至进一步推进 native account abstraction。

所有这些技术当然非常聪明。

但从产品问题往回看，会发现一种荒诞：

用户的问题其实只是：

> 我明明有 USDC，为什么不能用 USDC 支付交易费？

Ethereum 给出的答案逐渐变成：

```text
Smart Account
    ↓
UserOperation
    ↓
Bundler
    ↓
Paymaster
    ↓
EntryPoint
    ↓
ETH
```

Arc：

```text
USDC
 ↓
Gas
```

完了。

这就是我所谓的：

**干净。**

高级技术最令人佩服的时候，不是多造五层抽象。

而是发现其中四层根本没必要存在。

---

# 四、Arc 最聪明的地方：它用了 EVM，却没有把自己变成 Ethereum

这里必须区分两个经常被 Crypto 圈混为一谈的概念：

```text
EVM
```

和：

```text
Ethereum
```

它们不是一回事。

EVM 是执行环境。

Ethereum 是一整套：

- 共识；
- 网络；
- 历史状态；
- ETH；
- validator economy；
- fee market；
- 社区治理；
- 升级路线；
- 历史兼容；

Arc 是 EVM-compatible。

所以 Solidity 开发者可以继续使用自己熟悉的工具和开发范式。Circle 从一开始就明确强调 Arc 的 EVM compatibility。

但 Arc 是自己的 **Layer 1**。

它并不是：

```text
Ethereum L2
```

也不是：

```text
Ethereum Sidechain
```

更不是：

```text
把交易最后提交到 Ethereum 获取安全性。
```

它拥有自己的 validator set 和自己的共识。

2026 年正式主网版本使用 permissioned validator set，并提供 deterministic、sub-second finality。Circle 将其定位为面向金融市场的独立 L1。

所以更准确地说：

> **Arc 使用 Ethereum 发明和普及的虚拟机标准，但并不购买 Ethereum 的安全性。**

这件事情非常关键。

---

# 五、这可能才是 EVM 最终最大的胜利：Ethereum 可以输，EVM 仍然可以赢

很多人天然认为：

EVM 生态壮大，

就意味着 Ethereum 价值增加。

我越来越不认为这两件事情一定绑定。

看看 Arc。

开发者可以继续：

```text
Solidity
Foundry
Hardhat
Viem
MetaMask
EVM ABI
0x Address
ERC-20
```

但是整个经济系统完全可以是：

```text
USDC
    ↓
Arc
```

其中根本不需要经过：

```text
ETH
```

这意味着一种非常有意思的可能：

**EVM 有一天可能像 Linux 一样成功，但 Ethereum 本身并不因此垄断所有经济价值。**

Linux kernel 很成功。

并不意味着所有建立在 Linux 上的软件收入都会流向一个“Linux Token”。

TCP/IP 极其成功。

也没有一个 TCP Token 因为互联网流量增加就不断升值。

HTML 成为世界标准。

也不存在一个 HTML Coin 从每次打开网页中抽税。

所以必须开始区分：

> Ethereum 创造了 EVM。

和：

> 所有使用 EVM 的经济活动都应该给 ETH 赋值。

完全是两件事情。

Arc 是这个逻辑最漂亮的案例之一。

---

# 六、Arc 可以大量使用 Ethereum 的遗产，同时让 ETH 捕获不到这些价值

假设未来 Arc 上出现：

1000 亿美元稳定币结算。

Tokenized Treasury。

外汇。

证券。

RWA。

AI Agent Payment。

企业 Treasury。

链上 Lending。

DEX。

这些应用仍然可能使用：

Solidity。

ERC-20。

ERC-721。

ERC-4626。

EVM。

甚至大量 Ethereum 时代发明的基础设施。

但这些交易：

**不需要 ETH。**

不需要买 ETH 支付 Gas。

不需要 Ethereum validator。

不需要 Ethereum blob。

不需要 Ethereum settlement。

也不需要等待 Ethereum Finality。

这形成了一种以前非常少见的状态：

> **Ethereum 的技术标准被保留了，但 ETH 的价值捕获被切断了。**

从 ETH 投资者角度，这未必是一件好事。

从整个行业角度，我反而认为非常健康。

因为：

**技术标准应该可以脱离创造它的资产存在。**

否则它就不是标准。

它只是一个围墙花园。

---

# 七、Arc 的价值尺度甚至不是“Crypto”，而是美元

这一点是 Arc 与传统公链最根本的差异之一。

Ethereum 的经济尺度最终是：

```text
ETH
```

Gas 用 ETH。

Validator 收 ETH。

安全预算以 ETH 衡量。

网络经济最终建立在 ETH 资产之上。

Arc 则把整个系统最底层的单位变成：

```text
USDC
```

而 USDC 的目标单位又是：

```text
1 USDC ≈ 1 USD
```

Circle 表示 USDC 由现金和高流动性的现金等价物 1:1 支持，并设计为可按一美元赎回。

所以 Arc 做了一件很大胆的事情：

**直接把现实世界货币单位搬进区块链底层。**

不是：

```text
Gas = 0.000034 ARC
```

然后用户再打开 CoinGecko：

> 现在 ARC 是 $17.42，所以到底多少钱？

而是：

```text
Gas ≈ $0.00x
```

这对 Consumer UX 有意义。

但对企业的意义更大。

因为企业的：

Revenue。

Cost。

Treasury。

Accounting。

Budget。

Risk。

全部是：

**Fiat-denominated。**

区块链终于停止要求企业先进入一个平行货币体系。

---

# 八、我甚至认为，“没有自己的投机 Token”是 Arc 最强大的产品设计之一

Crypto 行业已经形成了一个非常奇怪的条件反射：

一条新链发布。

大家第一句话：

> Token 是什么？

Tokenomics 怎么样？

FDV 多少？

空投多少？

什么时候 TGE？

Validator APR 多少？

Unlock Schedule 什么样？

Arc 最有意思的地方恰恰是：

**整个讨论可以不存在。**

网络需要的是：

Money。

它直接使用 USDC。

于是用户不需要同时思考：

```text
这条链好不好？
```

和：

```text
这条链的币会不会跌 80%？
```

这两个问题终于分开了。

这是极其干净的。

---

# 九、Ethereum 最大的问题之一，就是把“网络使用价值”和“Token 投资价值”永远搅在一起

Ethereum 社区长期存在一种非常奇怪的讨论：

网络使用增加，

ETH 是否应该涨？

Blob 收费增加，

ETH 是否通缩？

L2 是否吸走 ETH 价值？

Burn 是否足够？

Validator Yield 如何？

Ultrasound Money？

这些事情从技术角度和投资角度都可以讨论。

但是对于一个真正的支付系统来说：

**为什么用户需要关心这些？**

Visa 用户不会研究：

> Visa 网络每完成一笔支付，V 股票销毁多少？

银行客户不会研究：

> SWIFT 的结算 token 最近通胀率是多少？

企业只希望：

```text
发送 $1,000,000
```

然后：

```text
对方收到 $1,000,000
```

成本清楚。

时间清楚。

Finality 清楚。

Arc 从第一天开始就更加接近这个思路。

---

# 十、Arc 从来没有必要假装自己是一个无政府主义实验

这也是我认为 Arc 比许多传统 Crypto 项目诚实的地方。

Ethereum 的历史叙事里非常重要的一部分是：

Decentralization。

Censorship Resistance。

Permissionless Validation。

Trustlessness。

这些当然有价值。

但 Crypto 行业有一个非常严重的毛病：

**把“更加去中心化”默认当成所有场景唯一正确的优化方向。**

实际上不是。

银行清算不是。

证券市场不是。

企业 Treasury 不是。

跨境支付也不一定是。

这些机构更在乎的东西通常是：

谁负责？

谁监管？

Finality 是否确定？

出了问题找谁？

参与者是谁？

责任边界在哪里？

系统是否满足监管要求？

Arc 明确选择 permissioned validators。

Circle 甚至把这一点当成面对银行的卖点：

已知、经过筛选的验证者。

清晰的治理责任。

确定性 Finality。

Circle 认为这有助于银行进行风险管理，并与 Basel 和金融市场基础设施原则衔接。

Crypto 原教旨主义者可能看到：

```text
Permissioned Validator
```

然后马上说：

> 不够去中心化。

我的问题是：

**So what?**

---

# 十一、中心化从来不天然意味着不好

Coinbase 就是一个很好的例子。

Coinbase 是公司。

有人管理。

受监管。

可以收到政府命令。

需要遵守法律。

但这不意味着：

Coinbase 没有价值。

恰恰相反。

对于大量普通用户来说：

“有人负责”

甚至是优点。

因为现实世界的金融系统本来就建立在：

```text
Responsibility
Accountability
Jurisdiction
Regulation
```

之上。

去中心化解决的是一种非常重要的问题：

> 如何减少必须信任某个主体？

但它并不是免费的。

它付出的代价是：

治理更慢。

协议更难修改。

历史兼容越来越严重。

升级需要协调大量独立参与者。

复杂度很难被强制清理。

错误设计一旦广泛部署，就几乎无法推倒重来。

而 Arc 恰恰拥有 Ethereum 没有的一个巨大优势：

**它可以做决定。**

---

# 十二、“能做决定”其实是一种被 Crypto 严重低估的工程能力

如果 Ethereum 今天说：

> 我们把旧 EOA 全删了。

不可能。

> ERC-20 重新设计。

不可能。

> 所有历史 Fork 代码删掉。

不可能。

> 改账户结构。

极其困难。

> 所有用户强制迁移。

更不可能。

因为 Ethereum 是一个已经运行十几年的公共协议。

没有一个 CEO 可以按按钮：

```text
Migrate
```

Arc 不一样。

至少在目前发展阶段，它是一张非常干净的纸。

协议有什么问题？

改。

Gas 模型不合理？

改。

金融机构需要新的隐私机制？

做。

Validator 结构需要调整？

治理。

这当然意味着更多信任。

但也意味着：

**它不会天然继承 Ethereum 那种“任何历史都不能删除”的诅咒。**

一个协议越年轻，这种优势越大。

---

# 十三、为什么我说 Arc 是“从 Ethereum 的尸体里拿走 EVM”

这句话可能很难听。

但技术演化本来就经常如此。

新系统最聪明的做法，并不是拒绝上一代的一切。

而是：

**继承标准，抛弃实现。**

Unix 留下 POSIX。

浏览器留下 JavaScript。

SQL 跨越几十年的数据库。

x86 软件甚至跨越完全不同世代的 CPU。

Arc 对 Ethereum 最聪明的态度也是：

Ethereum 花十年替整个行业做了一件最困难的事情：

建立：

```text
EVM
Solidity
ABI
ERC
Wallet
Tooling
Developer Mindshare
```

这些东西为什么不要？

当然要。

但是：

```text
ETH monetary system
PoS economics
historical state
old forks
Ethereum governance
Rollup roadmap
L1 fee history
```

为什么一定要一起继承？

**完全没有必要。**

所以我越来越认为：

Arc 不是 Ethereum Killer。

这个词太低级了。

它更像：

**Ethereum Unbundling。**

把 Ethereum 打开。

留下有价值的组件。

丢掉不需要的组件。

---

# 十四、这也是 Arc 比 Base 更有意思的地方

Base 很成功。

而且非常好用。

但 Base 从技术经济关系上仍然属于 Ethereum 世界。

它是一条 Ethereum L2。

最终 settlement 和它的长期安全架构与 Ethereum 有结构性关联。

Arc 不一样。

Arc 是 L1。

它不是：

> 一个更好用的 Ethereum入口。

而是：

> **一个使用 Ethereum 开发标准、却拥有自己金融体系的独立网络。**

这个区别非常大。

Base 的发展在一定程度上可以继续扩大 Ethereum 的 Rollup 版图。

Arc 的发展反而证明另一件事情：

**EVM 生态扩张，不等于 Ethereum 本体扩张。**

某种意义上，这是对 ETH Value Capture Thesis 更危险的一种路线。

---

# 十五、Arc 真正的护城河甚至不是区块链，而是 Circle 已经拥有的钱

这是另一个很多“新公链”无法复制的地方。

普通公链启动时面对一个鸡生蛋问题：

没人用。

所以没有流动性。

没有流动性。

所以没人部署应用。

没人部署应用。

所以用户更少。

最后只能：

发 Token。

挖矿。

补贴。

空投。

给 TVL。

拿钱买生态。

Arc 的起点完全不同。

它背后已经有：

**USDC。**

截至 Arc 2026 年 9 月主网上线时，Circle 表示 USDC 流通量已经超过 **740 亿美元**。

USDC 在 2025 年底已经原生部署在 30 条区块链上；Circle 的 CCTP 当时覆盖 18 条链，并且 2025 年第三季度处理约 310 亿美元跨链转移。

这意味着 Arc 不需要从零发明：

“钱。”

Circle 已经有钱。

Arc 做的是：

**给这些钱造一个自己的操作系统。**

这是完全不同的起点。

---

# 十六、以前 Circle 是别人区块链上的租户，现在它自己成为房东

这是理解 Arc 最简单的方法。

以前：

USDC 跑在 Ethereum。

Circle 给 Ethereum 带来巨大交易需求。

但是用户支付 ETH Gas。

Ethereum Validator 获得费用。

USDC 的应用增长帮助 Ethereum 生态。

然后 USDC 又跑到：

Solana。

Base。

Arbitrum。

Avalanche。

Polygon。

很多链。

Circle 是：

**资产发行商。**

链是：

**基础设施拥有者。**

Arc 出现以后，这个关系发生了变化。

Circle 第一次拥有：

```text
Money
+
Settlement Layer
+
Developer Infrastructure
+
Interoperability
+
Payments Network
+
FX
```

Circle 在 2026 年甚至直接把自己的产品体系描述为 Internet Financial Platform，而 Arc 是其中底层的 Economic OS。

这才是 Arc 真正巨大的潜力所在。

它不是多一条 TPS 更高的 EVM Chain。

**它是 Circle 从“在别人操作系统上发行钱”，走向“自己拥有操作系统”。**

---

# 十七、甚至跨链，对 Arc 来说都是一个完全不同的问题

Ethereum L2 世界的跨链问题是：

资产碎了。

怎么办？

于是出现：

Bridge。

Liquidity Provider。

Solver。

Intent。

Canonical Bridge。

Message Passing。

Arc 的路线则有一个天然优势：

**Circle 本身就是 USDC 的发行者。**

这意味着它不一定需要把“跨链 USDC”理解为：

> 把 A 链上的一枚包装 Token 锁起来，然后在 B 链铸造一个映射 Token。

CCTP 可以做：

```text
Burn on chain A

↓

Circle attestation

↓

Mint native USDC on chain B
```

Circle 还在用 Gateway 把多个链上的 USDC 流动性抽象成统一余额。其 2026 年资料明确把 Arc 定位为跨链 USDC 可以汇聚的高速结算环境。

这意味着：

很多公链需要通过复杂金融工程解决的问题，

Circle 可以直接在：

**货币发行层**

解决。

这是一个巨大的结构优势。

---

# 十八、Arc 的终局可能根本不是 DeFi Chain，而是美元的互联网执行层

如果只是把 Arc 理解为：

“Circle 做了一条 EVM Chain。”

我认为严重低估了它。

Circle 自己的目标已经非常明显：

Payments。

FX。

Capital Markets。

Tokenized Assets。

Treasury。

AI Agents。

Machine-to-machine Payments。

主网发布时甚至直接把 Arc 称为：

**Economic Operating System for the Internet。**

这种说法当然有营销成分。

但方向值得认真看。

因为真正巨大的市场从来不是：

Crypto Degens 多 Swap 几次。

而是：

全球公司之间每天发生的资金流。

证券清算。

跨境支付。

资金管理。

外汇结算。

Tokenized Treasury。

AI Agent 自动支付。

如果这些东西真的进入链上，它们需要的未必是：

> 世界上最去中心化的智能合约平台。

它们可能更需要：

```text
美元计价
确定性 Finality
明确治理
监管兼容
隐私
可编程
全球 24/7
标准化开发工具
```

而这恰恰是 Arc 从第一天就在针对的东西。

---

# 十九、Arc 的“中心化”甚至可能是它竞争 Ethereum 最大的武器

很多人会认为：

Ethereum：

```text
decentralized
```

Arc：

```text
permissioned validators
```

所以 Ethereum 高级。

Arc 低级。

我反而认为这种判断过于简单。

如果目标是：

**Censorship-resistant sovereign money**

Ethereum 的模式显然有巨大优势。

如果目标是：

**让全球银行在链上结算 10 亿美元**

情况就未必一样了。

一家银行更可能问：

> 谁运营 Validator？

> 如果网络出现问题谁负责？

> Finality 的法律意义是什么？

> 能不能确定交易不会被 reorg？

> 是否符合监管要求？

> 能不能保护敏感交易信息？

这时候：

```text
Known Validators
```

甚至可能不是缺陷。

而是：

**Feature。**

Circle 正在明确利用这种结构争取银行和机构场景，而不是试图假装 Arc 与 Ethereum 做的是完全相同的事情。

---

# 二十、当然，Arc 的“干净”不是免费的

这里必须把另一面说清楚。

否则就会把文章写成广告。

Arc 没有 Ethereum 的历史债。

但它拥有自己的集中风险。

Arc 使用 permissioned validator set。

它与 Circle 的基础设施高度绑定。

USDC 的信用来自 Circle 的储备、监管和美元银行体系。

所以 Arc 并不是：

**Trustless Ethereum，但更好。**

完全不是。

它做的是另一个 trade-off：

Ethereum：

```text
更强的去中心化
更强的抗审查属性
更难改变
更多历史债
复杂经济体系
```

Arc：

```text
更明确的控制边界
更强的机构属性
更容易治理
更容易做产品优化
但更加依赖 Circle、
validator governance
以及美元体系
```

所以真正的问题不是：

谁绝对正确？

而是：

**金融世界到底需要哪一种东西？**

我的判断是：

两者都会存在。

但过去 Crypto 行业严重高估了第一种需求，

同时严重低估了第二种需求。

---

# 二十一、Arc 最可怕的地方，是它不需要证明 ETH 没有价值

我认为这才是 Ethereum 真正值得警惕的一点。

Arc 根本不需要：

攻击 Ethereum。

杀死 Ethereum。

取代 Ethereum。

证明 ETH 归零。

都不需要。

它只需要证明一件事情：

> **一个巨大的链上金融系统，可以使用 EVM，却完全不需要 ETH。**

如果这个命题成立，

其意义远比所谓：

```text
Ethereum Killer
```

大得多。

因为过去 Ethereum 最大的护城河之一是：

开发者。

工具链。

Solidity。

EVM。

钱包生态。

标准。

但是 Arc 暗示了一种未来：

这些东西全部可以继续存在。

与此同时：

**Ethereum 自己却不一定站在价值流的中心。**

---

# 二十二、这可能才是 Ethereum 最终真正面对的竞争

Ethereum 一直担心：

Solana。

更快的链。

更便宜的链。

更高 TPS。

我越来越觉得真正值得担心的可能不是这些。

最危险的竞争者不是：

> 我重新设计一套比 EVM 更好的 VM。

而是：

> **谢谢你帮整个行业花十年把 EVM、Solidity、钱包和开发工具都做成熟了。**

> **这些我全部拿走。**

> **剩下的我不要。**

ETH 不要。

历史债不要。

Gas Token 投机不要。

十几年 Fork 不要。

Rollup 复杂度不要。

意识形态包袱也不要。

这就是 Arc 最锋利的地方。

---

# 结语：Ethereum 发明了世界，Arc 只拿走其中有用的部分

我并不认为 Arc 是什么技术革命。

某种意义上恰恰相反：

**它可能是一场技术去魅。**

它承认：

EVM 很好。

Solidity 很好。

ERC 很好。

智能合约很好。

公开可编程账本很好。

但是：

这并不意味着 Ethereum 的所有设计都必须一起继承。

更不意味着：

**为了使用区块链，世界必须先接受一种波动性 Crypto Asset 作为经济底座。**

Arc 做的事情其实非常简单：

```text
保留 EVM
保留 Solidity
保留 ERC
保留智能合约

删除 ETH 依赖
删除原生投机 Token
删除 Ethereum settlement
删除 Ethereum 历史状态
删除 Ethereum Rollup 包袱

加入 USDC Gas
加入确定性 Finality
加入已知 Validator
加入机构治理
加入原生金融基础设施
```

这就是为什么我觉得 Arc 非常干净。

Ethereum 像一座有十几年历史的老城。

无数道路不能拆。

无数老楼不能动。

地下埋着不同年代的管线。

每一次现代化，

都只能在过去上面继续施工。

Arc 不一样。

它是一张新图纸。

但它又不是从石器时代重新开始。

它直接把这座老城十几年最好的工业成果拿来：

EVM。

Solidity。

ERC。

Wallet。

Tooling。

然后重新规划城市。

所以如果非要用一句话概括 Arc：

**它不是抛弃 Ethereum。**

恰恰相反。

**它理解 Ethereum 到了这样一种程度：知道 Ethereum 哪些东西值得继承，又有哪些东西根本不值得继承。**

Ethereum 创造了 EVM。

但 EVM 未必永远属于 Ethereum。

USDC 曾经出生、成长于 Ethereum 世界。

但美元也未必永远需要 ETH 才能在链上流动。

Arc 最有意思的地方就在这里：

**它生于 Ethereum 的技术时代，却第一次认真尝试建立一个不需要 Ethereum 的 EVM 金融世界。**

如果它成功，

Ethereum 留给下一代最大的遗产，

可能最终不是 ETH。

而是：

**EVM。**