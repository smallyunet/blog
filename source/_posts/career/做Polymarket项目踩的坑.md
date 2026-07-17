---
title: 做 Polymarket 项目踩的坑
tags: Polymarket
date: 2026-07-10 19:53:28
draft_date: 2026-07-10 16:50:16
---


### 钱包设施的选择

现在做 Crypto 方向的项目，一般会选择 [Privy.io](https://www.privy.io/) 或 [Turnkey](https://www.turnkey.com/) 来作为钱包的基础设施提供商。这些钱包设施提供了注册登录方面的集成，可以用传统方式邮箱、Google 登录，也可以用 web3 一点的方式，比如 MetaMask 钱包或者 OKX 钱包登录。更重要的是这些钱包设施解决了钱包安全的问题，允许给用户创建 embedded wallet，如果不使用这些钱包服务，项目方需要自己在服务器上保存用户的私钥，这是很危险的，尤其是对于中小团队来说，安全问题是很沉重的负担。Privy 或者 Turnkey 的解决方案是，私钥由他们来保管，储存在 TEE 一类的加密硬件中，项目方只需要通过 API 来访问和使用钱包。

至于 Privy 还是 Turnkey 的取舍问题，比如我们经常在看的 [Kreo](https://kreopoly.app/)、[PolyCop](https://polycop.ai/)、[polymtrade](https://polym.trade/) 等项目都在用 Privy。这些项目列表都在 [Polymarket Builder 榜单](https://builders.polymarket.com/) 上。Polymarket 的这个 Builder 榜单上，列出了每一个 Polymarket 生态的项目方交易量排名。[GMGN](https://gmgn.ai/) 也用的 Privy。

用 Turnkey 的项目也有，比如 [Axiom](https://axiom.trade/)、[alchemy](https://www.alchemy.com/) 等。我们当时用了 Turnkey。一开始是因为 Turnkey 从定位上对自动化运行的 Trading Bot 更加友善，Privy 定位上有很重的对前端界面 SDK 的依赖。后来又发现了一个 Privy 和 Turnkey 比较大的区别：是否支持 Telegram 注册登录。

Privy 支持 TG 登录，Turnkey 不支持，为什么呢？

因为 TG 没有像 Google 那样成熟的 OAuth 体系，TG 账号本身无法像 email 或者 wallet 一样给 Privy/Turnkey 一个 identity provider。Privy 针对这种场景做了简化，你用 TG 登录，登录后 Privy 代替你去通过 API 请求钱包的操作，实际上此时 Privy 后端 “就是你”，假如 Privy 后端的服务器被黑了，你的钱包权限会完全暴露在黑客手里。而 Turnkey 比较生硬，无法提供 identity provider，就不能让你操作钱包，Turnkey 的后端不愿意代替用户承担这种权限风险。

所以这是我们发现的 Privy 和 Turnkey 之间比较大的场景支持程度上的差异。如果想要用 Turnkey 并且支持 TG 登录，就得专门做一个 TG Miniapp，登录的时候唤起 Miniapp 来完成。

### CLOB V2 集成

Polymarket 上的订单系统叫 CLOB，下单等行为都是在和 CLOB API 交互。4月28日，Polymarket 正式启用 [CLOB V2](https://docs.polymarket.com/v2-migration)。对于我们这种下游项目来说，最大的变动是需要换掉一些合约地址信息，比如 Copy Trading 功能需要扫描链上交易，以前监听的是 V1 版本的合约，迁移后监听的是 V2 版本的合约。此外如果下游不适配也是可以的，因为大体上兼容旧版本的订单参数。

而 CLOB V2 也引入了 FAK、FOK 等 Market Order 在使用的参数，这些参数直到一个多月以后我才发现它们的差异。因为在 V1 版本订单如果没有立即成交，会把没成交的部分自动挂单为 Limit Order，但同时又要求 Limit Order 的 shares 数量必须大于 5。所以用户有时会遇到一个奇怪的错误，为什么订单 shares 数量必须最小是 5？又为什么有时候会提醒最小订单金额是 1 美元？为什么有时候能成功有时候失败了，最小金额不是固定的？用上 FAK 参数的话倒是没有这种旧的问题了。

### Safe Wallet -> Deposit Wallet

5月4日，Polymarket 发公告说启用新的 [Deposit Wallet](https://x.com/PolymarketDevs/status/2050992767372013922)，不再使用旧版本的 Safe wallet。这是一个 breaking change，所有旧的用户依然兼容，但是新的尤其是通过 api 操作的钱包，都将使用新的 Deposit Wallet，也就是说下游项目必须兼容。

这个时间点非常微妙，因为我们原本计划项目 Beta 版本上线的日期是 5月5日。也因此当时连续两三天我紧赶慢赶去适配这个 Deposit Wallet 的迁移。这本身不是一件特别难的事情，但是由于突然升级带来的措手不及，以及上线的 delay，还是有一点点压力。

至于集成过程中遇到的唯一挫折，是 Polymarket 的 Migration 文档里没有写新的 Deposit Wallet Implementation 地址。在用 Factory 合约创建钱包的时候，需要一个 implement 合约作为参数，不同的 implement 合约出来的钱包地址是完全不一样的。而重点不只是我们用哪个地址，而是 Polymarket 的 Relayer api 用哪个，因为在新的这种 Deposit Wallet 模式下，所有的钱包操作都会通过官方的 Relayer api 了。以前用的 Safe wallet，其实我们可以自己直接去链上调合约的。Polymarket 的这个改动，反而让钱包体系更加不那么去中心化。至于正确的 implement 的值，则是需要直接从 Polymarket 发布的 SDK 里去读。而且当时还遇到个小坑就是 Polymarket 发布的不同 SDK 之间用的 implement 地址还不一样。不是同一个 SDK 不同版本，而是那种不同 SDK，比如 client-sdk, server-sdk 这种。当时 Discord 群里遇到这个集成问题的开发者非常多。

### Relayer API

刚才提到新的 Deposit Wallet 必须要通过 Polymarket 官方的 Relayer API。我们在迁移后并且项目上线一段时间、做活动，紧接着就遇到了另一个坑：Unverified 状态的 Builder API 只有每天 100次的请求额度。

<img src="1.png" width="80%">

看出 Polymarket 的阴险之处了吧，先是要求所有新用户都用 Deposit Wallet，而新的 Deposit Wallet 自然必须通过 Relayer API 来操作钱包，再然后你会发现，Relayer API 的请求是有额度限制的！如果是原本的 Safe wallet 可以直接链上操作绕过 Polymarket 的 API 额度限制。现在不行了。

这个 Relayer API，每次创建新的钱包都要用、每一次从钱包里 withdraw 钱要用，所以这是一个高频率会用到的接口。

针对这个限制的缓兵之计是，Polymarket 默认用 Builder API 来对 Relayer API 授权，但是 Relayer API 却没有要求 Builder API 具体是哪一个。所以我注册了 10个账号、每一个账号都创建了 builder api，配置到服务器里，用来暂时缓解 relayer api 的额度限制问题。每个账号每天100次请求额度，也就意味着 10 个账号一天有 1000 次额度。因为 verified 从提交到审核需要两到四周的时间，是一个很长的周期。

当然最终还是通过了 Verified，现在我们的项目已经出现在 Polymarket Builder 榜单上，并且状态是 Verified。

### Deposit Wallet 升级

7月6日，又是 Deposit Wallet 的问题。我们发现了一个很严重的 bug，自从 7月1日以来注册的全部用户，创建钱包都失败了！而因为用户反馈少，出问题很多天我们才发现这个问题。也就是说，新注册的用户，注册完之后如果充值，会把钱充值到错误的地址上。

为什么会出现这个 bug 呢，因为 7月1日，Polymarket 直接修改了创建钱包的逻辑，用上了 beacon 的方式去创建代理钱包，而且连公告都没发，直接改变 API 接口的行为。这种改动，是需要下游项目方主动适配的。

<img src="2.jpg" width="100%">

我们也有错误，我们的错误之处就在于没能及时发现这种异常，并且在程序前后端加上足够的保护性、防御措施。针对这次事故所有用户充值钱到错误地址的，全部金额都赔了，好在金额不大。

### Combos

<img src="3.png" width="100%">

Polymarket 针对世界杯的市场，新出了一个叫 combos 的功能。我们就开始评估是否可以接入这个 combos 的功能。结果就是，从 [combos 文档](https://docs.polymarket.com/market-makers/combos) 上看，API 只提供了针对做市商提交 quote 的接口，没有提供作为普通用户作为 taker 角色去下单的接口。

Polymarket 从 6月4日开始运作 combos 的接口，看起来也是在辛苦 build 中。

<img src="4.png" width="60%">

### tick size

7月10日，用户反馈遇到了订单交易失败的问题。经过排查后发现是订单的 [tick size 有了变化](https://docs.polymarket.com/changelog)，所有的世界杯市场都支持 0.0025 (0.25¢) 级别精度的 tick size。在此之前 tick size 只有固定 4 种，这个 0.25¢ 属于第 5 种（枚举类型）。

同样的，这个变动其实 Polymarket 早在 7月2日就上线了，但是我们直到 7月10日才发现 bug。

### 总结

所以你看到了，一直以来，我们都在不断的追随 Polymarket 的脚步，一直不断的响应 Polymarket 的功能更新和变化。

也因此，在构建项目的过程中，我们也开始逐渐意识到这样的项目误区：再做一个官网。

如果定位是 “再做一个官网”，项目方就会陷入非常被动的处境。而且 Polymarket 家大业大，官网 UI 做的也好，有功能都是第一时间上官网，再者官网自家的服务器，下单速度也快。我们的订单速度再快也不可能快过 Polymarket 官网。

这是一件尴尬的事情，如果想要做的比官网使用体验好，客观上难度是很高的。Polymarket 不是 memecoins，一般 memecoins 没有官网至少不会有官方钱包、官方 DEX，但是 Polymarket 有官网、有官方解决方案。Polymarket Builder 的定位，从来都不是说，Polymarket 是一个开放的去中心化协议，大家都来建设项目去玩。

与之相反，Polymarket 最近的功能更新上也越来越往中心化的方向走，定位更像是中心化交易所，比如 Binance 这种，Polymarket API，就是 Binance API。做 Polymarket 生态的项目，就有点像是做 Binance 的 Trading Bot 一类事情。
