---
title: 为什么 Solana 可以查询代币的 Holder 列表，以太坊不可以？
date: 2026-10-06 12:28:19
collection: ai
tags: AI 文章库
---


这是一个看起来很简单的问题。

给定一个 Token，例如 USDC，我们想知道：

> 现在有哪些地址持有它？每个地址分别持有多少？

在 Solana 上，这是一件相对自然的事情。

对于标准 SPL Token，可以从 Token Program 拥有的 Token Account 中按照 Mint 过滤，得到这个 Token 对应的账户，再读取其中的 owner 和 amount。

但在 Ethereum 上，一个标准 ERC-20 合约却没有：

```text
getAllHolders()
```

这样的能力。

ERC-20 标准提供的是：

```solidity
balanceOf(address owner)
```

也就是说：

> 你给我一个地址，我告诉你它有多少 Token。

但它没有提供：

> 把所有有余额的地址告诉我。

当然，Etherscan、Alchemy 或其他 Indexer 依然可以提供 Holder List。

但那通常是通过扫描历史 `Transfer` Event、持续维护余额状态，最终在链下重建出来的。

这和“直接从当前链上状态枚举 Holder”不是一回事。

为什么同样是 Token，两条链会出现这么大的差异？

答案并不只是“SPL 比 ERC-20 多提供了一个接口”。

继续往下挖，会一路挖到 Solana 与 Ethereum 两套完全不同的状态模型，以及它们对“区块链应该是一台什么样的计算机”这个问题的不同答案。

---

## 第一层：Solana 可以查，Ethereum 不能直接查

先从最表面的区别开始。

一个典型 ERC-20 的余额可以理解为：

```solidity
mapping(address => uint256) balances;
```

于是：

```text
balances[Alice] = 100
balances[Bob]   = 200
balances[Carol] = 50
```

它的数据模型大致是：

```text
USDC Contract
│
└── balances
    ├── Alice → 100
    ├── Bob   → 200
    └── Carol → 50
```

问题在于，Solidity 的 `mapping` 本身不可枚举。

如果已经知道 Alice 的地址，可以查：

```text
Alice → 100
```

但如果只知道：

```text
USDC Contract = 0x...
```

EVM 并没有一个原生操作能够回答：

```text
balances 一共有多少个 key？
这些 key 分别是什么？
```

所以 ERC-20 很容易回答：

> Alice 有多少 USDC？

但不能直接回答：

> 谁拥有 USDC？

---

Solana 的 Token 模型不同。

一个 SPL Token 的余额通常不是存在某个 Token Program 内部的：

```text
owner → balance
```

映射里。

而是一个个独立存在的 Token Account。

例如：

```text
USDC Mint
│
├── Token Account A
│   ├── mint   = USDC
│   ├── owner  = Alice
│   └── amount = 100
│
├── Token Account B
│   ├── mint   = USDC
│   ├── owner  = Bob
│   └── amount = 200
│
└── Token Account C
    ├── mint   = USDC
    ├── owner  = Carol
    └── amount = 50
```

于是查 Holder 可以变成：

```text
Token Program 的 Accounts
        ↓
过滤 mint == USDC
        ↓
过滤 amount > 0
        ↓
按照 owner 聚合
        ↓
Holder List
```

这里还要注意：

> Token Account 不等于 Wallet。

同一个钱包可以拥有多个同一 Mint 的 Token Account，所以最终还要按照 owner 聚合。

但最关键的差异已经出现了：

> Ethereum 的 Token Balance 通常是 Contract 内部的一项状态；Solana 的 Token Balance 被显式表示成了一个独立 Account。

---

## 第二层：是不是因为“栈和堆”不同？

到这里，很容易产生一个看起来合理的猜测。

Ethereum 的合约执行必须是确定性的。

所有节点执行同样的交易，都必须得到完全相同的结果。

例如：

```solidity
mapping(address => uint256) balances;
```

Alice 对应哪个位置，是确定的。

那么会不会是因为 EVM 没有传统程序那种可以动态扩张、通过指针组织对象的持久 Heap，所以它无法维护一个能够被枚举的动态 Holder 集合？

反过来，Solana 会不会因为支持某种更加自由的动态 Heap，所以可以知道所有 Token Account？

答案是：

**不是。**

这里需要先区分两个完全不同的概念：

```text
程序执行时的内存
```

和：

```text
区块链上的持久状态
```

---

### EVM 的持久状态不是 Stack

EVM 执行程序时确实存在 Stack。

它也存在 Memory。

但这些都属于一次执行过程中的临时环境。

简化来看：

```text
EVM

Stack
  → 临时
  → 执行结束消失

Memory
  → 临时
  → 执行结束消失

Storage
  → 持久
  → 写入链上状态
```

ERC-20 中：

```solidity
mapping(address => uint256) balances;
```

如果它是一个状态变量，它存在的是：

```text
Contract Storage
```

而不是 Stack。

`mapping` 之所以可以确定性访问，也不是因为它处于某种“栈结构”里。

它本质上是通过确定性的 Storage Addressing 来实现的。

概念上可以理解为：

```text
storage_location
=
keccak256(key, mapping_slot)
```

于是：

```text
Alice
   ↓
确定性计算
   ↓
某个 Storage Slot

Bob
   ↓
确定性计算
   ↓
另一个 Storage Slot
```

所有节点根据同一个 key 和同一个合约状态，都会得到同一个 storage location。

但这里依然没有：

```text
enumerate all keys
```

这样的能力。

因为这个数据结构本身设计的是：

```text
key → value
```

而不是：

```text
all keys → values
```

---

### Solana 同样没有“持久 Heap”

Solana Program 在执行期间当然也可以使用动态内存。

例如 Rust 可以写：

```rust
let mut orders = Vec::new();
orders.push(order);
```

运行期间，这些对象可以存在 Heap 中。

但一旦交易执行结束，这部分运行时内存同样会消失。

Solana 不会把：

```text
pointer
  ↓
heap object
  ↓
pointer
  ↓
another heap object
```

这种进程内存结构原样永久保存到区块链上。

真正能够持久保存的是：

```text
Account.data
```

也就是一个 Account 对应的一段确定字节数据。

例如：

```text
Account A
data = [01 03 7A ...]

Account B
data = [92 FF 18 ...]
```

程序可以把：

```rust
struct Position {
    owner: Pubkey,
    amount: u64,
    orders: Vec<Order>,
}
```

序列化以后写入 `Account.data`。

如果空间不够，还可以扩容。

但最终保存在链上的依然只是：

```text
deterministic bytes
```

而不是一个长期存活的 Heap。

所以从确定性执行角度看：

```text
Ethereum
和
Solana
```

没有本质区别。

它们都必须满足：

```text
相同旧状态
+
相同交易
=
相同新状态
```

---

### 所以 Holder 差异不是 Stack / Heap 造成的

这一步很重要。

我们可以排除一个看起来合理的解释：

> Solana 能枚举 Holder，并不是因为 Solana 有一种 EVM 没有的动态持久 Heap。

两边都不存在这种东西。

真正的区别发生在：

> **持久状态是如何组织的。**

Ethereum 选择的是：

```text
Contract
    ↓
Storage Namespace
    ↓
mapping / array / struct
```

例如：

```text
USDC Contract
    ↓
balances mapping
    ↓
Alice → 100
Bob   → 200
```

Alice 和 Bob 的余额并不是 Ethereum State 中独立存在的“Token Balance Object”。

它们只是 USDC Contract Storage 内部的值。

而 Solana 选择的是：

```text
Program
+
大量独立 Accounts
```

于是 SPL Token 可以定义：

```text
Token Program

Token Account A
mint   = USDC
owner  = Alice
amount = 100

Token Account B
mint   = USDC
owner  = Bob
amount = 200
```

所以真正的分界线不是：

```text
Stack vs Heap
```

而是：

```text
Contract-internal Storage
        vs
Explicit State Accounts
```

---

## 第三层：为什么 SPL Token 能这么设计？

接下来就会产生新的问题：

为什么 Solana 要把一个 Token Balance 单独做成 Token Account？

它为什么不像 ERC-20 一样，直接在 Token Program 里面维护一个：

```text
wallet → balance
```

映射？

答案是：

因为 Token Account 只是 Solana 更底层 Account Model 的一种应用。

在 Solana 中，Account 是一个系统级的一等对象。

一个 Account 大致包含：

```text
address
owner
lamports
data
executable
```

其中最重要的是：

```text
data
```

它是一段由拥有这个 Account 的 Program 自己解释的字节数据。

更关键的是：

**Solana Program 本身基本是无状态的。**

可变状态放在独立 Data Account 里。

于是一个 DEX 可以长成：

```text
DEX Program
│
├── Pool Account
├── Position Account A
├── Position Account B
├── Vault Account
└── ...
```

Program 保存的是代码。

Account 保存的是状态。

所以 SPL Token 自然也变成：

```text
Token Program
│
├── Mint Account
├── Alice Token Account
├── Bob Token Account
└── Carol Token Account
```

因此更准确地说：

> Solana 并不是在 Runtime 里原生硬编码了“Holder 查询”。

真正发生的是：

```text
Solana 原生提供 Account Model
+
Token Program 把 Token Balance 标准化成 Account
```

两者结合以后，Holder Enumeration 就变得非常自然。

---

## 第四层：EVM 为什么没有类似概念？

Ethereum 的核心抽象更接近：

```text
Contract
│
├── Code
└── Storage
```

Contract 自己拥有一片持久化 Storage。

开发者可以随意定义：

```solidity
mapping(address => uint256) balances;

mapping(address => Position) positions;

mapping(bytes32 => Order) orders;
```

对开发者来说，这很简单。

例如保存余额：

```solidity
balances[user] = 100;
```

就结束了。

开发者不需要：

```text
创建 Balance Account
分配空间
指定 owner
把 Account 传进交易
验证 Account
序列化 Account
```

EVM 把这些东西都隐藏掉了。

但代价也同时产生。

对于 EVM Runtime 来说，它看到的只是：

```text
Contract
+
Storage Slots
```

它不知道：

```text
这个 slot 是 Token Balance
那个 slot 是 Position
另外一个 slot 是 Order
```

这些语义完全属于智能合约自身。

ERC-20 只是一个应用层约定：

```text
如果某个 Contract 实现：
balanceOf()
transfer()
approve()
...

那么我们把它解释为 Token。
```

但 EVM 本身并不知道：

> 这里有一个叫 Token 的系统对象。

更不知道：

> 这里有一种叫 Token Holder 的对象。

所以它当然也不可能天然提供：

```text
getAllTokenHolders()
```

这种系统能力。

---

## 第五层：为什么 Solana 要把 Account 做成一等公民？

问题到这里才真正触及 Solana 的核心设计。

Solana 为什么愿意付出这么多复杂性，把状态拆成大量独立 Account？

一个非常重要的答案是：

# 为了并行执行。

假设有两笔交易：

```text
Transaction A:
read  Account 1
write Account 2

Transaction B:
read  Account 3
write Account 4
```

如果 Runtime 在真正执行之前就知道这些信息，那么它立刻能够发现：

```text
A 和 B 没有状态冲突
```

于是可以：

```text
Transaction A ─────→ CPU Core 1

Transaction B ─────→ CPU Core 2
```

同时执行。

而如果：

```text
Transaction A:
write Account X

Transaction B:
write Account X
```

Runtime 同样能够提前知道：

```text
发生写冲突
```

于是不能并行。

这要求一个非常重要的前提：

> 一笔交易必须提前声明自己要访问哪些状态。

这正是 Solana Instruction Model 的一个核心特征。

一条 Instruction 不只是说：

```text
我要调用 Program X
```

还要告诉 Runtime：

```text
我要访问 Account A
我要访问 Account B
我要写 Account C
```

于是 Runtime 可以提前建立一份类似：

```text
Read Set
Write Set
```

的状态依赖关系。

Account 自然就成为：

```text
状态分片单位
+
锁粒度
+
并行调度单位
```

所以可以得到这样一条逻辑链：

```text
Account 是一等公民
        ↓
Program 与 State 分离
        ↓
Transaction 显式声明 Accounts
        ↓
Runtime 提前知道状态依赖
        ↓
冲突检测
        ↓
并行调度
```

而：

```text
可以很方便地查询 Token Holder
```

只是这个架构顺带产生的结果之一。

---

## 第六层：为什么 EVM 很难这样并行？

再来看 EVM。

假设 Alice 调用 Contract A：

```text
Alice
  ↓
Contract A
```

交易真正开始执行以前，你未必知道它最终会碰到哪些状态。

因为执行过程中可能变成：

```text
Contract A
    ↓
读取 Storage
    ↓
根据结果决定调用 Contract B
    ↓
Contract B 调用 Contract C
    ↓
读取另外的 Storage
    ↓
最终修改某些状态
```

甚至被调用的 Contract 地址本身，都可能由程序运行时动态决定。

所以 EVM 更接近：

```text
开始执行
    ↓
运行程序
    ↓
逐渐发现需要访问哪些状态
```

而 Solana 更接近：

```text
先声明 Accounts
    ↓
建立状态依赖
    ↓
然后执行
```

这个顺序几乎正好相反。

因此不能简单说：

> EVM 永远不能并行。

现代 EVM Client 完全可以做 speculative execution、冲突检测、并行预执行等优化。

真正的问题是：

> 经典 EVM 状态模型没有要求 Transaction 在执行前显式声明完整 Read Set / Write Set。

因此想做确定性的提前并行调度，就要困难得多。

Solana 从架构设计阶段就选择：

> 让开发者和 Runtime 共同承担这个复杂性。

---

## 第七层：Solana 的性能不是免费的

到了这里，就能理解一个经常被忽略的问题：

**Solana 的高性能并不是单纯因为“代码跑得快”。**

它实际上改变了智能合约编程模型。

在 EVM 里，开发者经常可以写：

```solidity
balances[user] += 100;
```

但在 Solana 里，一个类似应用可能需要显式处理：

```text
Program
User Account
Position Account
Pool Account
Vault Account
Token Account
Token Program
System Program
...
```

这些 Account 还涉及：

```text
创建
分配空间
传入 Transaction
验证 owner
验证 PDA
序列化
反序列化
处理 Account Lock
```

复杂 DeFi Transaction 因此经常携带很长的 Account List。

这不是偶然的 API 设计问题。

而是 Solana 有意把一部分原本由虚拟机隐藏的状态管理复杂性暴露了出来。

为什么？

因为 Runtime 需要知道：

```text
你要读什么？
你要写什么？
```

只有这样，它才能更积极地进行：

```text
locking
scheduling
parallel execution
```

所以可以把 Solana 的设计理解为：

> **用开发复杂性，换运行时可预测性和并行能力。**

---

## 第八层：Ethereum 选择了另一种方向

Ethereum 的选择则更接近：

> 给开发者一台足够通用、动态的虚拟计算机。

Contract 拥有自己的 Storage。

Contract 可以动态调用其他 Contract。

程序可以在执行过程中决定接下来访问什么。

开发者面对的是：

```text
Code
+
Storage
```

而不需要首先思考：

```text
我要拆几个 Account？
这笔交易要传哪些 Account？
哪个 Account 会产生 Write Lock？
```

这让 EVM 的编程模型非常自然。

尤其是动态组合性很强。

例如：

```solidity
address target = calculateTarget();

ITarget(target).foo();
```

只要程序逻辑允许，运行到这里才决定调用谁都可以。

但代价是：

**Runtime 对应用状态的语义几乎一无所知。**

它不知道：

```text
什么是 Token
什么是 Pool
什么是 Position
什么是 Order
什么是 Vault
```

甚至不知道：

```text
某个 mapping 表达的是什么业务对象
```

于是很多东西必须由链下基础设施重新理解。

例如：

```text
Token Holder Indexer
DEX Indexer
NFT Indexer
Position Indexer
The Graph
Etherscan
Alchemy
```

从这个角度看，Ethereum 对 Indexer 的依赖，并不只是因为数据量大。

更深层的原因是：

> **大量业务对象只存在于 Contract 的内部语义中，而不是以系统级对象的形式显式存在。**

---

## 第九层：两种完全不同的状态哲学

走到这里，“为什么 Solana 能查 Holder，而 Ethereum 不能直接查”已经不再是 Token 标准本身的问题。

它最终变成了两套区块链对：

> 程序和状态应该是什么关系？

这个问题的不同答案。

Ethereum 更接近：

```text
Contract-centric

Contract
├── Code
└── Storage
```

程序拥有状态。

开发者自由组织 Storage。

Runtime 尽量少理解业务语义。

Solana 更接近：

```text
Account-centric

Program
├── Account
├── Account
├── Account
└── Account
```

程序负责解释状态。

状态被拆成大量独立、可寻址、可拥有、可锁定的 Account。

因此两条链逐渐表现出完全不同的特征：

| 维度 | Ethereum / EVM | Solana |
|---|---|---|
| 核心抽象 | Contract | Account + Program |
| 状态归属 | Contract Storage | 独立 Data Account |
| Token Balance | Contract 内部状态 | Token Account |
| 状态访问 | 更动态 | 提前声明 Account |
| Holder 枚举 | 通常依赖 Indexer | 可扫描 Token Account |
| Runtime 对业务对象的理解 | 很少 | 至少知道 Account 边界 |
| 并行调度 | 原生模型下较困难 | Account 模型天然有利 |
| 动态组合性 | 很强 | 更受 Account List 约束 |
| 状态管理复杂性 | 更多被 VM 隐藏 | 更多暴露给开发者 |
| 性能取舍 | 灵活性优先 | 可调度性与吞吐优先 |

这不是简单的：

```text
谁先进
谁落后
```

而是不同的工程取舍。

---

## 第十层：Solana 把复杂性交给开发者，Ethereum 把复杂性交给系统和基础设施

如果继续往下总结，可以得到一个很有意思的结论。

Solana 的很多“别扭”，其实是有原因的。

为什么写一个 Program 要传这么多 Account？

为什么要处理 PDA？

为什么复杂交易 Account List 会很长？

为什么要关心 Hot Account？

为什么应用设计时要考虑 State Sharding？

因为 Solana 希望 Runtime 能够理解：

```text
哪些状态正在被访问
哪些状态会冲突
哪些交易可以并行
```

所以开发者必须把这些关系显式表达出来。

换句话说：

> Solana 把更多复杂性交给了应用开发者，以换取 Runtime 层面的确定性和性能。

Ethereum 则走了另一条路。

开发者可以简单地：

```solidity
mapping(address => Position) positions;
```

然后把大量状态组织问题留在 Contract Storage 里面。

开发体验更自然。

动态性更强。

但代价是 Runtime 很难理解：

```text
谁在访问什么业务状态
哪些数据结构代表什么
哪些交易真正互不冲突
```

于是这些复杂性不会消失。

它只是被转移到了其他地方：

```text
Indexer
Client
Rollup
Execution Engine
State Database
Off-chain Infrastructure
```

所以两者并不是：

```text
一个复杂
一个简单
```

而更像：

> **复杂性被放在了不同的位置。**

Solana 更倾向于：

```text
复杂性 → 开发者 + 显式状态模型
```

Ethereum 更倾向于：

```text
复杂性 → VM + Client + Indexer + 基础设施
```

---

# 最后，再回到 Holder

现在重新回答文章最开始的问题：

> 为什么 Solana 可以查询一个 Token 的 Holder，而 Ethereum 不可以直接查询？

最浅的一层答案是：

> 因为 SPL Token 使用标准化 Token Account，而 ERC-20 没有 Holder Enumeration。

再深一层：

> 因为 ERC-20 Balance 通常位于 Contract 内部 Storage，而 SPL Token Balance 被显式表示成独立 Account。

再深一层：

> 因为 Solana 把 Account 做成了状态模型的一等公民，而 Ethereum 的主要状态抽象是 Contract Storage。

再深一层：

> 因为 Solana 希望 Transaction 在执行前显式声明状态依赖，以便 Runtime 做冲突判断和并行调度。

继续往下：

> Solana 愿意牺牲一部分动态状态访问的自由度，并增加开发者负担，以换取更强的运行时可调度性和并行能力。

而 Ethereum 更愿意提供一个：

> 动态、通用、容易组合的智能合约环境。

于是 Ethereum 的 Contract 可以更自由地组织内部状态，但 Runtime 也因此很难从系统层理解这些业务对象。

最终，这个问题真正揭示的是：

```text
Ethereum：
程序自由地拥有和访问状态。

Solana：
状态被显式拆成 Account，
程序围绕这些 Account 运行。
```

所以：

```text
Solana 可以查询 Token Holder
```

并不是一个孤立的 RPC 特性。

它只是一个很小的入口。

从这个入口继续向下追，最终会看到：

> **Solana 和 Ethereum 对“区块链应该怎样组织状态、怎样执行程序、怎样利用并行计算”做出了两种不同的选择。**

而 Holder List，只是这种架构差异最容易被观察到的一个结果。

