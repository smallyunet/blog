---
layout: post
title: Cosmos 代币和生态的没落
date: 2026-09-18 19:53:00
collection: ai
tags: AI 文章库
---


> 数据截至 2026 年 9 月 18 日。本文讨论的是 Cosmos Hub、ATOM 及围绕 IBC 形成的加密原生生态，不是否认 Cosmos SDK、CometBFT 等开源技术仍被一些机构和独立区块链使用。

Cosmos 没有死于一次黑客攻击，也没有死于某一天的突然停机。

它死于一种更漫长、也更难逆转的过程：价格先失去信仰，流动性随后离开，项目逐个停摆或迁往别处，最后只剩下仍在维护的技术，以及越来越难回答的一个问题——**这一切和 ATOM 到底还有什么关系？**

如果把“倒闭”严格理解为基金会注销、代码仓库删除、所有验证节点同时关机，那么 Cosmos 当然还没有倒闭。但如果“倒闭”指的是一个曾被寄予厚望的公链经济体已经失去用户、收入、流动性与增长预期，那么 Cosmos 的倒闭其实早已发生。

它不是正在没落。它是已经没落，只是链还在出块。

## 一、最残酷的数字：ATOM 从 43.84 美元跌到 1.59 美元

2021 年 9 月，ATOM 最高达到 **43.84 美元**。截至 2026 年 9 月 18 日，ATOM 只剩约 **1.59 美元**，较历史高点下跌 **96.4%**；市值约 **8.45 亿美元**，排名已跌至第 **82** 位。[CoinGecko 的实时与历史数据](https://www.coingecko.com/en/coins/cosmos-hub)还显示，ATOM 过去一年又下跌约 **65.5%**。

这意味着，在历史高点投入 1 万美元，如今只剩约 **363 美元**。而这还没有计算持币者因不质押而承受的额外稀释。

ATOM 的创世供应量约为 **2.362 亿枚**，如今总供应量已经达到约 **5.313 亿枚**，五年多时间膨胀至原来的 **2.25 倍**。2023 年通过的 848 号提案只是把最高通胀率从 20% 降至 10%，并没有改变 ATOM 无硬上限、依赖持续增发支付安全预算的事实。[创世分配数据](https://tokeninsight.com/en/coins/cosmosatom/tokenomics)与[当前供应量](https://www.coingecko.com/en/coins/cosmos-hub)共同展示了这种长期稀释。

更刺眼的是，ATOM 并不是在一轮全行业熊市中暂时回撤。过去几年，比特币重新吸引机构资金，Solana 重建了交易、稳定币和消费应用生态，大量新链完成了新一轮叙事切换；ATOM 却一路从主流资产退化为“老公链概念币”。市场不是没有给 Cosmos 时间，而是给了它整整五年，最后选择了放弃。

## 二、ATOM 最大的问题不是价格，而是没有生意

截至统计时点，[DefiLlama](https://defillama.com/chain/cosmoshub)记录的 Cosmos Hub 数据近乎荒诞：

| 指标 | Cosmos Hub 当前数据 |
| --- | ---: |
| DeFi TVL | **11.46 万美元** |
| 24 小时链手续费 | **50.67 美元** |
| 24 小时链收入 | **0 美元** |
| ATOM 市值 | **约 8.39 亿美元** |

一个市值仍接近 10 亿美元的区块链，一天只产生几十美元链上手续费，协议收入为零。即使机械地把每日手续费年化，市值与年手续费之比仍超过 **4 万倍**；若按协议收入计算，估值倍数甚至没有意义，因为分母就是零。

这才是 ATOM 真正的死亡原因。

Cosmos SDK 的设计追求“主权区块链”：每条链拥有自己的验证人、Gas Token、治理和经济系统。这个设计在技术上非常优雅，却天然切断了生态增长与 ATOM 之间的价值传导。

BNB Chain、dYdX、Cronos、Injective、Sei、Celestia，甚至越来越多面向机构的链，都可以使用 Cosmos 的代码，却不必购买 ATOM、不必用 ATOM 支付 Gas，也不必把收入交给 Cosmos Hub。Cosmos 官方网站如今强调的是“200+ 条链”“700 亿美元公共链安全价值”和面向金融机构的技术栈，这恰恰证明了一个讽刺的事实：**Cosmos 技术使用得越广，不等于 ATOM 越值钱。**[Cosmos 官方网站](https://cosmos.network/)展示的是技术栈的采用，而不是 ATOM 的价值捕获。

这就像 Linux 被全世界使用，不代表某一枚“Linux Token”必然上涨。Cosmos 可能成为成功的开源软件，ATOM 却可能成为失败的金融资产。

## 三、时间线：从“区块链互联网”到无人问津

### 2014—2019：伟大的技术理想

2014 年，Jae Kwon 与 Ethan Buchman 开始开发 Tendermint；2016 年发布 Cosmos 白皮书；2017 年，Interchain Foundation 募集约 **1680 万美元**；2019 年 3 月 13 日，Cosmos Hub 主网上线。[Kraken 对 Cosmos 历史的梳理](https://www.kraken.com/learn/what-is-cosmos-atom)记录了这段起点。

当时的愿景极具吸引力：以太坊要把所有应用塞进同一台“世界计算机”，Cosmos 则要让每个应用拥有自己的链，再通过 IBC 彼此通信。Cosmos 自称“区块链互联网”，ATOM 则被想象成这个互联网的中心资产。

问题从一开始就埋在这里：Cosmos 建造了道路，却没有建立收费站。

### 2021：IBC 上线，价格与叙事同时到顶

2021 年，IBC 开始把多条独立链连接起来。Terra、Osmosis、Juno、Secret 等项目共同制造了 Cosmos 最繁荣的时期。ATOM 在 2021 年 9 月冲上 43.84 美元，市场相信 IBC 活跃度最终会转化为 ATOM 的价值。

但 IBC 传递的是资产和消息，不会自动把手续费、利润或货币溢价传递给 ATOM。事实证明，2021 年既是 Cosmos 的高光，也是它的估值顶点。

### 2022：Terra 崩溃，Cosmos 的流动性心脏被挖走

2022 年 3 月，Cosmos 最大 DEX Osmosis 的 TVL 一度达到约 **18 亿美元**；OSMO 代币最高达到 **11.25 美元**。仅两个月后，Terra 的 UST 与 LUNA 死亡螺旋爆发。

MIT Sloan 的研究估计，Terra 在三天内崩溃并抹去约 **500 亿美元**估值；Terraform Labs 最终于 2024 年进入破产清算，美国法院批准其停止运营，相关投资者损失估计约 **400 亿美元**。[MIT Sloan 对挤兑过程的研究](https://mitsloan.mit.edu/cfi/anatomy-a-run-terra-luna-crash)与[路透社对破产清算的报道](https://www.reuters.com/technology/terraform-labs-approved-bankruptcy-wind-down-after-us-sec-settlement-2024-09-19/)确认了这场灾难的规模。

Terra 不只是“碰巧使用 Cosmos SDK 的一条链”。在 2021—2022 年，它是 IBC 生态最重要的稳定币、用户和流动性来源。UST 崩溃之后，Cosmos 失去的不是一个项目，而是整个生态最接近真实需求的一层货币基础。

同年 11 月，试图重构 ATOM 货币政策、为 Cosmos Hub 建立新价值捕获机制的 **ATOM 2.0 提案被否决**。[Cosmos Hub 82 号提案记录](https://www.mintscan.io/cosmos/proposal/82)意味着，社区知道旧模型有问题，却无法就新模型达成共识。

### 2023：Interchain Security 成为最后一轮希望

2023 年，Cosmos Hub 推出 Replicated Security，也就是后来常说的 Interchain Security。它的逻辑是：新链不用自己维持验证人集合，而是向 Cosmos Hub 租用安全性，并向 ATOM 质押者分享收入。

Neutron 成为第一条消费链，Stride 随后加入。市场一度把它视为 ATOM 终于拥有“收费站”的开始。Neutron 当时承诺向 Hub 提供 **25% 的交易费与 MEV**，并分配 **7% 的 NTRN 供应量**。[当时的方案说明](https://thedefiant.io/news/defi/cosmos-replicated-security)看起来像是 ATOM 价值捕获问题的正式答案。

结果，这条路也没有走通。

### 2025：第一条旗舰消费链 Neutron 离开

2025 年，Neutron 决定退出 Replicated Security，转为完全主权链。Cosmos Hub 通过 993 号提案结束双方原有安全合作。讨论中，Neutron 方面明确表示 Replicated Security 存在一系列问题，并认为完全主权化是更优选择；Hub 自身也准备弃用原模型，转向新的 Partial Set Security。[Cosmos Hub 官方论坛的提案与讨论](https://forum.cosmos.network/t/proposal-993-passed-neutron-and-the-hub-a-new-chapter/15306?page=3)保留了这次分手的全过程。

最具象征意义的是：Cosmos Hub 花了多年才推出共享安全，第一条旗舰客户却只用了不到两年就离开。

这不是“产品正常迭代”，而是 ATOM 价值捕获实验的公开失败。

### 2026：Evmos 真正关机，Nolus 转向 Solana

2026 年 5 月，曾被视为“Cosmos EVM 中心”的 Evmos 通过关闭提案，在区块高度 37,318,000 停止出块和节点运营，官网与区块浏览器随后无法访问。[Evmos 停链报道](https://www.binance.com/en/square/post/05-24-2026-evmos-blockchain-halts-operations-following-shutdown-proposal-326468491143218)显示，这一次不是“社区不活跃”，而是一条 Cosmos 旗舰链在字面意义上关门。

EVMOS 代币从最高 **6.84 美元**跌至约 **0.000386 美元**，市值只剩约 **19.8 万美元**，24 小时成交额约 **60 美元**。[CoinGecko](https://www.coingecko.com/en/coins/evmos)给出的跌幅已经只能显示为 **-100.0%**。

2026 年 8 月，原生于 Cosmos 的借贷协议 Nolus 在 Solana 上线，并要求用户在 9 月 5 日前结束 Osmosis 上的头寸、迁往 Solana。项目给出的现实理由非常直接：那里有更多流动性、用户和交易机会。[Nolus 迁移记录](https://solanacompass.com/news/nolus-protocol-goes-live-on-solana-with-fixed-rate-leverage-and-no-margin-calls)还提到，新版本交互速度较此前 Cosmos 部署提高约 80%。

当开发者开始离开，原因通常不会写成“Cosmos 已经没人玩了”。他们会说多链战略、用户触达、流动性扩张和产品升级。但翻译成商业语言只有一句话：**用户在哪里，项目就去哪里；而用户已经不在 Cosmos。**

## 四、生态币不是腰斩，而是接近归零

Cosmos 的衰退并非只有 ATOM 一条价格曲线。它更像一次生态级集体退场。

| 项目 | 历史最高价 | 当前价格/状态 | 高点跌幅或现状 |
| --- | ---: | ---: | ---: |
| ATOM | $43.84 | 约 $1.59 | **-96.4%** |
| OSMO | $11.25 | 约 $0.034 | **-99.7%** |
| JUNO | $45.74 | 约 $0.01 | **约 -99.98%** |
| SCRT | $10.38 | 约 $0.008 | **-99.9%** |
| EVMOS | $6.84 | 约 $0.000386 | **约 -99.994%，且已停链** |

来源：[ATOM](https://www.coingecko.com/en/coins/cosmos-hub)、[OSMO](https://www.coingecko.com/en/coins/osmosis)、[JUNO](https://www.coingecko.com/en/coins/juno-network)、[SCRT](https://www.coingecko.com/en/coins/secret)、[EVMOS](https://www.coingecko.com/en/coins/evmos)。

Juno 的市值只剩约 **78 万美元**，24 小时成交额约 **1500 美元**；Secret 的市值约 **523 万美元**；Evmos 的每日成交额甚至不够支付一名开发者一天的工资。称这些项目仍然“活着”，更多是一种技术意义上的描述，而不是经济意义上的判断。

Osmosis 是最后一个还能代表 Cosmos 原生 DeFi 的项目，但它的数据同样说明问题。2022 年初，其 TVL 曾超过 **10 亿美元**；如今只剩约 **1111 万美元**，至少蒸发 **98.9%**。当前 24 小时 DEX 成交量约 **66 万美元**，7 天成交量约 **450 万美元**，单周又下降 **71.8%**；链手续费只有约 **47 美元/日**。[DefiLlama 的 Osmosis 页面](https://defillama.com/chain/osmosis)还把多个协议标记为 Deprecated，若干借贷、永续合约和收益协议的 TVL已经接近或等于零。

这不是“熊市里的低估”。这是一整套金融活动消失后的残骸。

## 五、为什么 Cosmos 很难再回来

### 1. 技术成功与代币成功已经彻底脱钩

Cosmos 最大的成就，是让别人更容易创建自己的区块链；它最大的失败，也是让别人不需要 Cosmos Hub 和 ATOM。

每出现一条成功的 Cosmos SDK 链，宣传材料就多一个生态 Logo；但只要该链使用自己的 Gas Token、验证人和流动性，ATOM 持有人就得不到任何自动分成。Cosmos 的技术是公共品，ATOM 却试图对公共品的繁荣收取货币溢价。这一逻辑从根上就是断裂的。

### 2. Appchain 叙事已经被更便宜的方案替代

2019 年，想拥有独立执行环境，往往真的需要运行一整套 L1。今天，Rollup-as-a-Service、共享排序器、模块化 DA、以太坊 L2、Solana 程序以及各种链抽象方案，都能以更低成本提供相似自由度。

一条 Cosmos Appchain 不只要写应用，还要维持验证人、RPC、浏览器、钱包适配、IBC Relayer、流动性和交易所上市。对绝大多数团队来说，这不是“主权”，而是沉重的固定成本。Evmos 的关机说明：当代币价格不足以补贴基础设施时，所谓主权链最终连继续出块都可能成为负担。

### 3. 流动性已经形成反向网络效应

DeFi 项目需要用户，用户需要资产与流动性，做市商需要成交量，开发者又会追随用户。这个飞轮一旦反向运转，就会变成死亡螺旋：

**价格下跌 → 激励缩水 → TVL 离开 → 滑点变差 → 用户离开 → 手续费下降 → 开发者迁移 → 价格继续下跌。**

Nolus 去 Solana 并不是孤立新闻，而是这个反向飞轮已经走到“应用迁移”的阶段。

### 4. ATOM 已经失去重新定价所需要的清晰叙事

ATOM 先后被描述为 IBC 中心资产、跨链储备货币、共享安全资产、流动性质押底层资产和机构级区块链入口。但每一次叙事都没有形成足以覆盖通胀与估值的真实收入。

ATOM 2.0 被否决，Replicated Security 的旗舰客户离开，Hub 自身的链上收入接近于零。如今再讲“下一次升级将带来价值捕获”，市场首先会问：为什么过去七年的升级都没有做到？

## 六、Cosmos 不是没有人在维护，而是已经没有人需要相信它

必须承认，Cosmos SDK、CometBFT 与 IBC 不会因为 ATOM 下跌就消失。Cosmos 官方仍宣称技术栈被 200 多条链采用，部分机构链、交易所链和独立应用链仍在运行。Akash、dYdX、Injective、Celestia 等项目也并非全部失败。

但这并不能推翻本文的结论，反而强化了它：**最成功的 Cosmos 项目，往往越成功就越像一条与 ATOM 无关的独立链。**

因此，“Cosmos 已经没人玩了”并不是说全世界每天有零笔 IBC 交易，也不是说 GitHub 再无提交；它真正表达的是：

- 新用户不再把 Cosmos 当作首选入口；
- 新资金不再把 ATOM 当作生态指数；
- 新项目不再认为留在 IBC 原生流动性中是一种优势；
- 旧项目正在停链、归零、退出共享安全或迁往其他生态；
- 链还在运行，却没有足够的经济活动证明它为何值近 10 亿美元。

一条链最可怕的结局不是宕机，而是永远正常出块，却再也没人关心区块里写了什么。

## 结论：Cosmos 的未来，可能只剩技术，没有代币

Cosmos 曾经提出了区块链行业最漂亮的愿景之一：让千万条主权链像互联网一样互联。

它确实提前看到了多链世界，也留下了一套有影响力的工程技术。但投资者后来才发现，**预测对了世界的结构，不等于设计对了代币的价值。**

ATOM 从 43.84 美元跌到 1.59 美元；供应量膨胀至创世时的 2.25 倍；Hub 一天只有几十美元手续费；Osmosis 的 TVL 从十亿美元级别跌至千万美元；JUNO、SCRT、EVMOS 等核心生态币跌去 99.9% 左右；Terra 破产清算；Neutron 离开共享安全；Evmos 直接停止出块；Nolus 把用户迁往 Solana。

这些不是偶然拼在一起的坏消息，而是同一件事的不同切面：**资本、用户和开发者正在用脚投票。**

Cosmos 不会在某一天发布一份《倒闭公告》。它会继续有会议、提案、升级、路线图和新的技术名词。但对 ATOM 持有人来说，真正重要的清算已经由市场完成。

Cosmos 作为技术栈也许还会活很多年。

Cosmos 作为一个能让 ATOM 持有人分享增长的经济体，已经结束了。
