---
title: Solana 智能合约开发教程
tags:
  - 智能合约
  - 教程
date: 2025-06-24 21:51:06
draft_date: 2025-06-24 18:36:25
---


这个一个零基础的系列教程，可以从最基本的操作开始学会 Solana 智能合约的开发。一共 3 个部分：

- [第一部分](#开发教程-1)：基础环境安装、HelloWorld 合约部署、链上合约调用
- [第二部分](#开发教程-2)：实现 USDT 合约的最小模型，自定义数据结构与方法
- [第三部分](#开发教程-3)：使用官方 SPL 库复用合约功能，完成标准化代币的发行


<br>

## 开发教程-1

我们将从最基础的操作开始，学习 Solana 智能合约的开发。你只需要普通的编程基础，理解面向对象等概念就可以，不需要事先知道其他网络的智能合约概念，也不需要知道 Rust 语言的编程理念。

### 1. 安装环境

访问 Solana 官方提供的安装教程：<https://solana.com/docs/intro/installation>

文档中提供了一键安装全部依赖的单个命令行，也有分阶段安装的详细教程。要注意其中 Solana Cli 是需要修改环境变量文件的。安装好一切后，`solana` 命令应该是可用的：

```bash
solana --help
```

### 2. 初始化项目

使用 anchor 命令来初始化一个智能合约的项目，这个命令行工具在上个步骤已经安装好了，可以先不用管生成的目录结构是什么样子：

```bash
anchor init hello_sol
cd hello_sol
```

### 3. 写入合约代码

`programs/hello_sol/src` 目录下有一个 `lib.rs` 文件，`.rs` 结尾意味着这是一个 Rust 语言的代码文件。把这些代码复制进去，注意 `declare_id` 中的内容是你的项目在初始化的时候，就会自动为你生成，不需要原封不动复制下面的内容：

```rust
use anchor_lang::prelude::*;

declare_id!("3Zbdw1oWu1CiMiQr3moQeT4XzMgeqmCvjH5R5wroDWQH");

#[program]
pub mod hello_sol {
    use super::*;

    pub fn say_hello(ctx: Context<Hello>) -> Result<()> {
        msg!("Hello, world!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Hello {}
```

### 4. 编译智能合约

使用 anchor 命令编译你刚才复制进去的智能合约代码，确保编译是成功的，代码没有写错。编译过程中可能会有一些警告，那些警告不要紧，因为 Rust 语言对于代码非常严格，很小的问题都会抛出大段的警告。如果一切顺利，命令行的输出不会有错误日志：

```bash
anchor build
```

### 5. 设置本地默认网络

运行这个命令，让你本地的 solana 命令默认使用 devnet，因为 devnet 是给开发者使用的，可以用来测试自己的程序，而不需要真的花钱去买 SOL 代币：

```bash
solana config set --url https://api.devnet.solana.com
```

### 6. 创建本地账户文件

这个命令用于在你本地的默认路径下，创建一个用来部署智能合约的 Solana 账户。因为部署智能合约需要消耗手续费，这些手续费需要一个账户来支付：

```bash
solana-keygen new -o ~/.config/solana/id.json  
```

这个命令的运行结果中，有一行 `pubkey: ` 开头的输出，pubkey 后面的就是你本地的账户地址。因为上一个步骤已经设置了 devnet 为默认网络，所以可以直接使用这个命令来查看你本地账户的余额：

```bash
solana balance
```

也可以打开 devnet 的 [浏览器](https://explorer.solana.com/?cluster=devnet)，搜索你刚才生成的地址。搜索之后的 URL 形如：
https://explorer.solana.com/address/75sFifxBt7zw1YrDfCdPjDCGDyKEqLWrBarPCLg6PHwb?cluster=devnet


当然，你会发现自己的账户余额是 `0 SOL`。

### 7. 领取 devnet 上的空投

运行这个命令，你的账户就可以收到 2 个 SOL。其中参数里的 2 就是请求发放 2 个 SOL 的意思。因为领水的额度限制，你只能一次性最多领 2 个。不用担心太少，足够我们接下来的步骤使用了。

```bash
solana airdrop 2
```

### 8. 部署合约到 devnet

现在我们已经有了智能合约代码，有了本地账户，并且本地账户里有 SOL 余额。现在可以部署合约到 devnet 上了。运行这个命令：

```bash
anchor deploy --provider.cluster devnet 
```

如果部署成功，会看到 `Deploy success` 的字样。命令行输出中还有一行需要留意，`Program Id: ` 后面的，就是部署之后的合约地址，你可以直接在 devnet 的浏览器上搜索这个地址，然后看到类似这个 URL 的页面，URL 中的 `3Zbdw1oWu1CiMiQr3moQeT4XzMgeqmCvjH5R5wroDWQH` 就是我部署的合约地址：https://explorer.solana.com/address/3Zbdw1oWu1CiMiQr3moQeT4XzMgeqmCvjH5R5wroDWQH?cluster=devnet


### 9. 调用链上合约

到 `hello_sol/app` 目录下，新建一个叫 `app.js` 的文件，把这些代码复制进去。简单来说，这段代码读取了你本地默认的账户文件，然后用你的 Solana 账户发起一笔对智能合约调用的交易，这个脚本每执行一次，就会在链上创建一笔交易。：

```javascript
const anchor = require('@coral-xyz/anchor');
const fs     = require('fs');
const os     = require('os');
const path   = require('path');
const { Keypair, Connection } = anchor.web3;

const RPC_URL    = process.env.RPC_URL;
const connection = new Connection(RPC_URL, { commitment: 'confirmed' });

const secretKey = Uint8Array.from(
  JSON.parse(
    fs.readFileSync(
      path.join(os.homedir(), '.config/solana/id.json'),
      'utf8',
    ),
  ),
);

const wallet   = new anchor.Wallet(Keypair.fromSecretKey(secretKey));
const provider = new anchor.AnchorProvider(connection, wallet, {
  preflightCommitment: 'confirmed',
});
anchor.setProvider(provider);

const idlPath = path.resolve(__dirname, '../target/idl/hello_sol.json');
const idl     = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
const program = new anchor.Program(idl, provider);

(async () => {
  try {
    const sig = await program.methods.sayHello().rpc();
    console.log('✅ tx', sig);
    console.log(`🌐 https://explorer.solana.com/tx/${sig}?cluster=devnet`);
  } catch (err) {
    console.error('❌', err);
  }
})();
```

返回 `hello_sol` 项目的顶层目录，执行这些命令来安装 nodejs 的依赖：

```
npm init -y 
npm install @coral-xyz/anchor
```

然后记得现在仍然是在顶层目录，运行这个命令，来执行刚才写的 `app.js` 脚本，脚本会到 devnet 上调用我们部署的智能合约：

```bash
export RPC_URL=https://api.devnet.solana.com
node app/app.js
```

这里有一个环境变量 `RPC_URL` 是脚本请求的 API 地址，因为 nodejs 脚本默认不走系统代理，所以对于网络受阻的同学，需要用一个比公开 RPC 更好用的 API 地址。可以使用例如 [Helius](https://www.helius.dev/) 的服务，注册一个免费的账号就可以了。假如执行脚本的过程中遇到下面的错误，那就说明是网络问题，换一个好用的 RPC 地址就好了：

```javascript
❌ Error: failed to get recent blockhash: TypeError: fetch failed
    at Connection.getLatestBlockhash (/Users/smallyu/work/github/hello_sol/node_modules/@solana/web3.js/lib/index.cjs.js:7236:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async AnchorProvider.sendAndConfirm (/Users/smallyu/work/github/hello_sol/node_modules/@coral-xyz/anchor/dist/cjs/provider.js:89:35)
    at async MethodsBuilder.rpc [as _rpcFn] (/Users/smallyu/work/github/hello_sol/node_modules/@coral-xyz/anchor/dist/cjs/program/namespace/rpc.js:15:24)
    at async /Users/smallyu/work/github/hello_sol/app/app.js:40:17
```

你也许好奇为什么不需要指定调用的合约地址，这个脚本怎么知道你刚才，部署到链上的合约在哪里？注意看脚本中有一个 `idlPath` 的变量，你可以直接打开这个路径的文件 `target/idl/hello_sol.json` 查看，里面是一些合约编译后的元信息，包括合约的地址也在里面，没错合约地址是离线生成的，不需要上链，合约就有属于自己的唯一地址了。

如果执行脚本没有输出错误，就会看到终端打印出了这一次调用合约的交易哈希，以及可以直接复制访问的浏览器 URL，例如这就是一笔调用合约的交易：
https://explorer.solana.com/tx/2fnPgKkv3tGKKq72hhRxmW6WFSXuofMzXfY2UYoFZXTdJi37btdESy9NzS2gjpWzXX4CL5F7QfxugpctBVaMcBFY?cluster=devnet

这笔交易页面的最下方，可以看到我们写的智能合约在被交易调用后，打印出了 `Program logged: "Hello, world!"` 的日志，这正是我们写在合约代码中的 msg。

### 10. Troubleshooting

如果在执行上述命令或者代码的过程中，遇到了错误，可以优先考虑是命令行工具版本的问题。由于区块链行业和技术迭代比较快，很容易出现版本不兼容的情况。我本地的环境和版本是：

```text
rustup: rustup 1.28.2 (e4f3ad6f8 2025-04-28)
rustc: rustc 1.90.0-nightly (706f244db 2025-06-23)
solana: solana-cli 2.2.18 (src:8392f753; feat:3073396398, client:Agave)
archor: anchor-cli 0.31.1
node: v24.2.0
@coral-xyz/anchor(nodejs): ^0.31.1
```


<br><br>

## 开发教程-2

我们已经学会了如何创建智能合约项目、部署合约以及调用连上合约，接下来深入了解一下智能合约编程语言的写法，关注如何写出自己想要的逻辑。我们将会以写一个简单的 USDT 代币合约为例，分析相关的代码，并且理解 Solana 智能合约的写法。

### 1. 创建项目

用我们已经学会的命令，来创建一个新的项目：

```bash
anchor init usdt_clone
```

### 2. 配置文件

可以注意到项目路径 `programs/usdt_clone/Cargo.toml` 下的这个文件，Cargo 是 Rust 语言常用的包管理器，这个 `Cargo.toml` 则是包管理器的配置文件，指定了要引入哪些依赖库，以及依赖库的版本。我们自动生成的配置文件里有这么两行：

```Rsut
[dependencies]
anchor-lang = "0.31.1"
```

Anchor 提供的宏是 Solana 智能合约的关键，宏的形式如 `#[program]`、`#[account]` 等，这些宏会告诉 Solana 的 SVM 虚拟机，程序从哪里开始、数据结构在哪里定义等。如果没有 Anchor 这个依赖，合约项目就是普通的 Rust 语言项目了，Solana 的智能合约系统无法识别和解析。这也就解释了，Solana 的智能合约，是如何利用 Rust 语言来实现的。

### 3. 合约地址

我们近距离看一下合约的代码文件 `usdt_clone/programs/usdt_clone/src/lib.rs`。文件的第一行内容是这样，`use` 把 Anchor 常用的类型一下子全部导入进来了，这没什么问题，不需要修改，方便我们后续编写程序。：

```Rsut
use anchor_lang::prelude::*;
```

第二行内容是一个对 `declare_id` 函数的调用，`declare_id` 声明了当前这个智能合约项目的 Program ID，也就是合约地址是什么，之前我们提到过，Solana 的智能合约地址，是可以离线生成的。

```Rsut
declare_id!("CFmGdHuqDymqJYBX44fyNjrFoJx6wRkZPkYgZqfkAQvT");
```

这个合约地址是一个随机值，但不是随意格式的值，它是一个 Ed25529 的公钥。假如你手动把最后一个字符 `T` 改为 `t`，这整个字符串就不是一个合法的公钥了，所以这个值可以随机生成，但是不能随便改。那么既然是公钥，它的私钥在哪里呢？在初始化项目的时候，会自动生成一个私钥，文件位置在 `target/deploy/usdt_clone-keypair.json`，可以打开看到是一些字节数组，`declare_id` 使用的公钥，就是根据这个私钥生成的。

### 4. 储存数据结构

接下来我们需要新增一些自己的逻辑，在 `declare_id` 语句的下方，写入这个代码：

```Rsut
#[account]
pub struct Mint {
    pub decimals: u8,
    pub mint_authority: Pubkey,
}
```

可以理解为 `#[account]` 宏是用来定义数据结构的，Anchor 黑魔法会在背后进行一系列操作，让我们可以针对这个数据结构在链上进行读写操作。这里的代码很简单，我们定义了一个叫 `Mint` 的结构体，这个结构体包含两个属性，`decimals` 指定 USDT 代币的精度是多少，`mint_authority` 指定谁可以来挖新的币。

我们继续定义另一个结构体，用来储存每一个用户的代币数量。`owner` 就是用户地址，`balance` 则是用户的余额：

```Rsut
#[account]
pub struct TokenAccount {
    pub owner: Pubkey,
    pub balance: u64,
}
```

### 5. 账户约束结构

你可能注意到当前的代码文件最底部，还有两行自动生成的 `#[derive(Accounts)]` 开头的代码。这个宏是用来给账户写一些约束规则的。我们可以在 `#[derive(Accounts)]` 内部定义一些函数，然后再用 `#[account]` 来定义结构体，那么这个结构体就自动拥有了所有函数。类似于给结构体定义成员函数的意思。

把原本的 `Initialize` 代码删掉：

```Rsut
#[derive(Accounts)]
pub struct Initialize {}    // 删除
```

然后写入我们自己的逻辑：

```Rust
#[derive(Accounts)]
pub struct InitMint<'info> {
    #[account(
        init, 
        payer = authority,
        space = 8 + 1 + 32
    )]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
```

这段代码有点复杂。我们先看 `#[account(...)]` 这一段，这里给 `account()` 函数传递了 3 个参数进去，`account()` 函数的参数类型是 Anchor 框架定义的，第一个参数 `init` 是一个固定的关键字，不需要值，表示如果账户不存在，则创建一个新的账户。第二个参数 `payer` 是需要值的，表示谁来支付创建账户的手续费。第三个参数 `space` 的值则是我们自己计算的，系统必须预留 8 + `Mint` 结构体的第一个字段类型 `u8` 需要空间 1 + `Mint` 结构体的第二个字段类型 `Pubkey` 需要空间 32。

这个 `#[account(...)]` 的宏用来修饰 `mint` 成员变量。我们接着看 `mint` 这个成员变量，`Account` 是 Anchor 框架提供的内置的账户类型，可以对储存数据结构进行读写，例如我们之前定义的 `Mint` 或者 `TokenAccount` 结构，这个 `mint` 成员变量实际操作这些类型的数据。而 `Account` 接受两个泛型参数，第二个参数 `Mint` 指明了这个账户是在处理 `Mint` 类型的结构，而不是 `TokenAccount` 或者其他。

接着看 `#[account(mut)]` 这个宏，mut 的意思是账户金额可以变化。`authority` 也是一个成员变量，它的类型同样是一个 Anchor 内置的账户类型 `Signer`，与 `Account` 不同的是，`Signer` 意味着需要传入账户持有者本人签名，才符合类型定义。后面的 `‘info` 则是一个泛型参数，其中 `info` 是结构体的泛型传递进来的。至于 `info` 前面的单引号 `'`，是 Rust 语言里的一个特性，可以简单理解为对参数的引用传递。整体来看，这两行代码的宏和语句，共同定义了一个可以对其扣费的账户地址作为成员变量。

最后的 `system_program` 成员变量，可以把这一行理解为固定写法，只要合约需要转账 SOL，就得写上这一行。总的来说，这几行代码定义了一个新的结构体 `InitMint`，这个结构体是基于 `Mint` 进行包装的，包装后的 `InitMint` 拥有了一些账户相关的属性。

### 6. 代币合约初始化

接下来开始关注 `#[program]` 宏定义的函数。这个宏用来标注智能合约的程序入口，也就是真正执行合约逻辑的部分。我们当前文件里有几行默认的代码：

```Rust
#[program]
pub mod usdt_clone {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {   // 删除
        msg!("Greetings from: {:?}", ctx.program_id);             // 删除
        Ok(())                                                    // 删除
    }                                                             // 删除
}
```

删掉这个项目自动生成的 `initialize` 函数，我们自己写一个函数：

```Rust
pub fn init_mint(ctx: Context<InitMint>, decimals: u8) -> Result<()> {
    let mint = &mut ctx.accounts.mint;
    mint.decimals = decimals;
    mint.mint_authority = ctx.accounts.authority.key();
    Ok(())
}
```

把这个 `init_mint` 函数放在原先 `initialize` 函数的位置。如果抛开 Anchor 的宏，这个函数则是一个普通的 Rust 语法定义的函数。`Context` 类型是 Anchor 提供的包装类型 所以你也许好奇我们明明没有定义 `Context`，但是这里却直接使用了。`InitMint` 类型是则我们上一个步骤定义好的。

这个函数接受两个参数，第一个参数的类型是 `InitMint`，表示哪个账户拥有铸币权限。第二个参数类型是 `u8`，表示 USDT 的精度是多少位。这个函数返回一个空的元组 `()`，说明如果成功什么都不返回，如果失败则会报错。

函数内部的逻辑相对好理解，函数把参数接收进来的数据，赋值给了一个叫 `mint` 的变量，要注意这不是普通的新定义的变量，而是从 `ctx.accounts` 反序列化过来的、`mut` 声明的可变类型的变量，相当于直接修改一个引用类型的结构体内的属性值，所以只要给 `mint` 赋值，结构体内的数据都会保存下来，也就是保存到链上。

### 7. 单元测试

可以先到目录下，运行一下编译，看程序是否写对了，如果编译报错，可能是哪里复制漏了。由于 Rust 语言的编译器非常严格，所以即使没有错误，也会有很多 warning，暂时不用管那些警告信息：

```bash
anchor build  
```

接下来到 `usdt_clone/tests/usdt_clone.ts` 文件，复制这些代码进去：

```ts
import anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SystemProgram, Keypair } from "@solana/web3.js";
import { assert } from "chai";

const { AnchorProvider, BN } = anchor;

describe("usdt_clone / init_mint", () => {
  const provider = AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.UsdtClone as Program;

  const mintKey = Keypair.generate();

  it("creates a Mint with correct metadata", async () => {
    const txSig = await program.methods
      .initMint(new BN(6))
      .accounts({
        mint: mintKey.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([mintKey])
      .rpc();

    console.log("tx:", txSig);

    const mintAccount = await program.account.mint.fetch(mintKey.publicKey);

    assert.equal(mintAccount.decimals, 6);
    assert.equal(
      mintAccount.mintAuthority.toBase58(),
      provider.wallet.publicKey.toBase58()
    );
  });
});
```

这段代码使用本地的单元测试框架，构造了一些参数去调用我们在合约里写的 `initMint` 方法，比如指定精度为 6 位，传递了 `InitMint` 结构体需要的 3 个参数等。模拟交易的执行结果赋值给了 `txSig` 变量，可以在输出日志中看到交易哈希。并且在交易结束后，用语句 `program.account.mint.fetch` 查询了合约的 `mint` 属性的值，它的精度应该等于我们的参数，authority 也应该是我们本地发起模拟交易的账户地址。

运行这个命令来查看单元测试的效果：

```bash
anchor test
```

如果一切顺利，会看到 `1 passing (460ms)` 的字样。

### 8. 开户和转账

基于上面我们已经看懂的语法规则，可以继续在合约代码中新增这样两个账户结构的定义，分别用来开户和转账。这里的 `#[error_code]` 是新出现的宏，比较容易理解，它是一个枚举类型，用于程序报错的时候调用：

```rust
#[derive(Accounts)]
pub struct InitTokenAccount<'info> {
    #[account(init, payer = owner, space = 8 + 32 + 8)]
    pub token: Account<'info, TokenAccount>,
    #[account(mut, signer)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Transfer<'info> {
    #[account(mut, has_one = owner)]
    pub from: Account<'info, TokenAccount>,
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    #[account(signer)]
    pub owner: Signer<'info>,
}

#[error_code]
pub enum ErrorCode {
    InsufficientFunds,
    ArithmeticOverflow,
}
```

然后新增两个方法，分别执行开户的逻辑以及转账的逻辑。注意这里开户的时候，`token.balance = 1000` 意味着每一个开户的地址，默认都会有 1000 的余额。这里主要是为了简化流程和代码、方便单元测试，这个数字可以随意改动：

```Rust
pub fn init_token_account(ctx: Context<InitTokenAccount>) -> Result<()> {
  let token = &mut ctx.accounts.token;
  token.owner = ctx.accounts.owner.key();
  token.balance = 1000;
  Ok(())
}

pub fn transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
  let from = &mut ctx.accounts.from;
  let to   = &mut ctx.accounts.to;

  require!(from.balance >= amount, ErrorCode::InsufficientFunds);

  from.balance -= amount;
  to.balance = to
      .balance
      .checked_add(amount)
      .ok_or(ErrorCode::ArithmeticOverflow)?;

  Ok(())
}
```

这是针对开户和转账功能的单元测试代码：

```ts
const tokenA = Keypair.generate();
const tokenB = Keypair.generate();

it("initializes tokenA & tokenB, each with balance 1000", async () => {
  for (const tok of [tokenA, tokenB]) {
    await program.methods
      .initTokenAccount()
      .accounts({
        token: tok.publicKey,
        owner: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([tok])
      .rpc();

    const acc = await program.account.tokenAccount.fetch(tok.publicKey);
    assert.equal(
      acc.owner.toBase58(),
      provider.wallet.publicKey.toBase58()
    );
    assert.equal(acc.balance.toNumber(), 1000);
  }
});

it("transfers 250 from A to B (balances 750 / 1250)", async () => {
  await program.methods
    .transfer(new BN(250))
    .accounts({
      from:  tokenA.publicKey,
      to:    tokenB.publicKey,
      owner: provider.wallet.publicKey,
    })
    .rpc();

  const a = await program.account.tokenAccount.fetch(tokenA.publicKey);
  const b = await program.account.tokenAccount.fetch(tokenB.publicKey);

  assert.equal(a.balance.toNumber(), 750);
  assert.equal(b.balance.toNumber(), 1250);
});
```

如果有兴趣，可以试着把这个合约也部署到 devnet 上，然后通过 SDK 来发起对链上合约的调用。



<br><br>

## 开发教程-3


你也许注意到，在编写智能合约的过程中，对于程序逻辑的描述反而是轻量的，比较复杂的部分是不同类型的 `#[account]` 宏，以及去了解宏接受的参数，比如是否允许自动创建账户、如果创建应该租用多少个字节的空间等，因为 Solana 的全部账户数据需要加载到节点服务器的内存中，价格比较昂贵，所以要求开发者对于空间的占用计算比较精细。而 Solana 的账户体系又有点复杂，需要稍微理解一下。

### 1. 命令行工具发行代币

对于发行 USDT 这种经典场景，Solana 已经封装好了智能合约的库函数，可以直接调用，甚至封装好了命令行工具，只需要简单的操作，不需要写合约，就可以发行代币。Solana 把这些代币统称为 SPL Token。创建一个 6 位精度的 SPL Token 的命令是这样，注意不需要写代币名字：

```bash
spl-token create-token --decimals 6
```

命令行运行结束后，会输出一个 `Address`，这个就是 SPL Token 的代币地址，比如我得到的地址是 `E75GMXAfJ91XuRboSpjwkDmta45Etgt3F3Gf5WLZvLbV`，可以在 [区块链浏览器](https://explorer.solana.com/address/E75GMXAfJ91XuRboSpjwkDmta45Etgt3F3Gf5WLZvLbV?cluster=devnet) 上查到。

接下来需要一个操作，来给你本地的账户，在这个 USDT 代币上创建一个关联账户（Associated Token Account，ATA）。这个创建关联账户的动作，相当于在合约上实例化一个数据结构，这个数据结构里保存了你的 USDT 余额等信息，如果没有这个数据，USDT 代币的合约上就找不到你。

用 “账户” 这个词可能有点迷惑，我本地已经有账户了，还能用 `solana address` 命令看到账户地址，为什么还需要专门调用 USDT 的合约，创建什么 ATA 账户？可以理解为，合约里本来有个空的 map{}，创建 ATA 账户就是向 map 里插入了一条数据，key 是你本地的账户地址，value 是 USDT 的余额信息。如果 map 里没有你的信息，你甚至不能接受 USDT 的转账。

那么为什么 Solana 要这么设计，必须先在 map 里开辟空间，才能接受转账呢？因为一开始有提到过，对于 Solana 来说，链上空间是比较珍贵的，map 里开辟一个键值对的空间，也就是创建 ATA 账户，需要占用 165 个字节的内存，这 165 字节不是免费使用的，可以使用命令 `solana rent 165` 来计算字节数对应的费用，比如这里就会输出 `0.00203928 SOL`，也就是你创建 ATA 账户的交易，在手续费之外，会多支付这么些租金。所以必须要有创建 ATA 账户这个操作，主要是为了收费。

回到我们的操作，创建 ATA 账户的命令是：

```bash
spl-token create-account E75GMXAfJ91XuRboSpjwkDmta45Etgt3F3Gf5WLZvLbV
```

这个命令会显示 `Creating account`，后面是你的 ATA 地址，比如我的是 `E5XmcEJhhGUri8itThLGk8QfPzY1acFid8JmVyo5DWUo`,同样的，可以在 [区块链浏览器](https://explorer.solana.com/address/E5XmcEJhhGUri8itThLGk8QfPzY1acFid8JmVyo5DWUo?cluster=devnet) 中看得到。

对要注意，ATA 账户是有单独的地址的，比如你本地的账户地址是 `a`，在 USDT 代币上创建的 ADA 账户地址将是 `b`，是不一样的。而后续接受 USDT、发送 USDT，将全部通过 ATA 账户来进行，而不是你本地的那个账户。SPL Token 提供了命令来查看本地钱包账户和 ATA 账户的关系：

```bash
spl-token address --verbose --token E75GMXAfJ91XuRboSpjwkDmta45Etgt3F3Gf5WLZvLbV

// 输出是这个样子
Wallet address: 75sFifxBt7zw1YrDfCdPjDCGDyKEqLWrBarPCLg6PHwb
Associated token address: E5XmcEJhhGUri8itThLGk8QfPzY1acFid8JmVyo5DWUo
```

那么现在，可以用这个命令，来查询 USDT 的余额，`balance` 后面的参数是指代币地址，而不是 ATA 地址：

```bash
spl-token balance E75GMXAfJ91XuRboSpjwkDmta45Etgt3F3Gf5WLZvLbV 
```

当然默认是 0，现在给这个地址挖一些 USDT 上去。这个命令有点长，有 3 个参数，第一个参数是代币地址，第二个参数是代币数量，第三个参数是 ATA 地址，意味着要挖哪个代币、挖多少、挖给谁：

```bash
spl-token mint E75GMXAfJ91XuRboSpjwkDmta45Etgt3F3Gf5WLZvLbV 5 E5XmcEJhhGUri8itThLGk8QfPzY1acFid8JmVyo5DWUo
```

命令执行成功后，就可以查询到余额，也能直接在浏览器上看到余额了，类似的，转账 USDT 的命令是：

```bash
spl-token transfer <MINT> 1 <ATA>
```

Solana 为了避免用户不记得自己的 ATA 账户地址，也提供了人性化的命令，最后一个参数可以直接用本地的钱包地址，而不需要 ATA 地址，这也就是为什么我们平时使用 Solana 的钱包，并没有感觉到 ATA 账户这种东西存在的原因：

```bash
spl-token transfer <MINT> 1 <RECIPIENT_WALLET>
```

### 2. 用 spl 标准库写智能合约

我们尝试一下在智能合约里调用 spl 库函数，这种官方提供的、系统级别的库函数是经过严格安全审计的，比我们自己写要安全，所以有了这些库函数，我们可以更加关注自己定制化的业务逻辑，不需要关心太底层的东西，比如 USDT 余额计算是否精度有损失之类的问题。先创建一个新项目：

```bash
anchor init usdt_spl
```

导入 `anchor-spl` 依赖，这个命令可以把最新版本的库函数导入进来，命令运行后，可以在 `programs/usdt_spl/Cargo.toml` 文件的 `[dependencies]` 部分，新增了这样一行 `anchor-spl = "0.31.1"`，说明是成功的：

```bash
cargo add anchor-spl
```

开始写合约代码程序。先在最开始两行导入 spl 的依赖。我们之前有使用过 Anchor 框架自带的账户类型如 `Account` 和 `Signer`，那么这里 spl 也是提供了多种数据类型，比如 `TokenAccount` 就表示 ATA 账户的数据结构：

```rust
use anchor_spl::token::{self, MintTo, Token, TokenAccount, Mint};
```

接着定义 mint 行为相关的账户规则：

```rust
#[derive(Accounts)]
pub struct MintToCtx<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>, 

    #[account(mut)]
    pub to:   Account<'info, TokenAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
}
```

这几行代码中，`mut` 关键词我们之前用到过，表明账户数据要允许被写入。`Account` 类型是 anchor 框架自带的，我们也使用过。`Mint` 类型则是新出现的，是从 spl 框架里导入的，我们之前不是自己定义过一个用 `#[Account]` 宏标注的 `Mint` 结构体，然后在 `#[derive(Accounts)]` 里使用吗。现在有了 spl 库，我们不需要自己定义 `Mint` 结构体的类型、参数个数，直接使用就好。

同样的，`TokenAccount` 和 `Token` 也都是 spl 框架提供的类型。这么看似乎使用 spl 框架比自己写简单了不少？不能高兴的太早，还有一段代码没有写上：

```rust
impl<'info> From<&MintToCtx<'info>> for CpiContext<'_, '_, '_, 'info, MintTo<'info>>
{
    fn from(accts: &MintToCtx<'info>) -> Self {
        let cpi_accounts = MintTo {
            mint:      accts.mint.to_account_info(),
            to:        accts.to.to_account_info(),
            authority: accts.authority.to_account_info(),
        };
        CpiContext::new(accts.token_program.to_account_info(), cpi_accounts)
    }
}
```

这段代码乍一看眼花缭乱，可能要晕了，为什么那么多尖括号，为什么那么多单引号和下划线。这就是 Rust，为了迎合独特的内存管理设计，不得不让语言在语法形式上变得复杂。

`impl ... From<...> for ...` 是 Rust 的语法规则，大意是让一种类型变为另一种类型，我们这里就是让 `From<&MintToCtx<'info>>` 类型变为 `CpiContext<'_, '_, '_, 'info, MintTo<'info>>`。其中 `MintToCtx` 是我们上面自己用 `#[derive(Accounts)]` 宏定义的类型，然后作为泛型参数传递给了 `From`，而这个 `From`，是 Rust 标准库提供的一个包装类型，用来接受我们传入的参数。

至于后面的 `CpiContext` 部分，Cpi 的全称是跨程序调用 Cross-Program Invocation，用于把要调用的外部程序，以及账户类型，都打包到一个统一的数据结构中。前三个参数不用管，最后的 `MintTo` 是我们真正传入的类型，这个类型是 spl 库提供的。

那么也许这里有疑问，为什么还涉及到调用外部程序？CpiContext 又是如何知道要调用哪个外部程序的？这个和 Solana 智能合约的设计有关，SPL Token 不止是一些类型定义，而且是实际已经部署在 Solana 网络上的程序。我们在使用 spl 依赖库的过程，实际上就是去调用那些已经预先在 Solana 网络上部署的 spl 合约。智能合约在运行的时候，发现你要调用 spl，就去找 spl 的合约地址，执行一些操作，然后返回结果。相当于整个网络上的智能合约都在复用同一套 spl 合约。

所以要留意 Solana 智能合约依赖库的实现方式，和其他网络是有不同的。Solana 在设计上让程序和数据分离，以致于可以实现程序共享的模式。为什么我们不自己部署一套 spl 合约，或者每个人都各自部署一套 spl 合约，然后自己使用呢？一方面是需要付出额外的手续费成本，另一方面是 Solana 的智能合约本来就允许程序共享，你要是自己部署一套，用户都不知道你有没有偷偷修改标准库的代码，反而不安全了。

还有最后一部分 `#[program]` 里的程序逻辑要补齐：

```rust
pub fn mint_to(ctx: Context<MintToCtx>, amount: u64) -> Result<()> {
    token::mint_to((&*ctx.accounts).into(), amount)
}
```

### 3. 编译合约

现在代码没问题，但是如果现在编译合约项目，会遇到报错。需要修改下 `programs/usdt_spl/Cargo.toml` 文件，把这两行的特性打开：

```rust
[features]
idl-build = ["anchor-lang/idl-build", "anchor-spl/idl-build"]

[dependencies]
anchor-spl  = { version = "0.31.1", features = ["token", "idl-build"] }
```

因为静态编译的时候，命令行默认没有把 spl 标准库给带上，在配置文件里指明就可以了。现在项目可以编译成功：

```bash
anchor build
```

### 4. 写单元测试

安装 spl 相关的 nodejs 依赖，注意单元测试用的是 ts 语言，不是 Rust 语言：

```bash
npm i @coral-xyz/anchor@^0.31 @solana/spl-token chai
```

把单元测试代码复制到 `tests/usdt_spl.ts` 文件中：

```ts
import anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  createMint,
  createAssociatedTokenAccount,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";

const { AnchorProvider, BN } = anchor;

describe("usdt_spl / mint_to", () => {
  const provider = AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.UsdtSpl as Program;

  let mintPubkey: anchor.web3.PublicKey;
  let ata: anchor.web3.PublicKey;

  it("creates mint, mints 1 USDT into ATA", async () => {
    mintPubkey = await createMint(
      provider.connection,
      provider.wallet.payer,          // fee-payer
      provider.wallet.publicKey,      // mint authority
      null,                           // freeze authority
      6                               // decimals
    );

    ata = await createAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,          // fee-payer
      mintPubkey,
      provider.wallet.publicKey       // owner
    );

    await program.methods
      .mintTo(new BN(1_000_000))      // 1 USDT
      .accounts({
        mint: mintPubkey,
        to: ata,
        authority: provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const accInfo = await getAccount(provider.connection, ata);
    assert.equal(accInfo.amount.toString(), "1000000");
  });
});
```

运行单元测试，会看到成功的输出：

```bash
anchor test
```

### 5. 部署合约到 devnet

确保账户里余额足够，然后用 anchor 来部署合约：

```bash
anchor deploy --provider.cluster devnet 
```

这个命令偶尔会因为网络问题执行失败，抛出 `Operation timed out` 错误。可以直接把 provider 的参数改为自己的 rpc 地址，如果网址比较长，可以用双引号括一下：

```bash
anchor deploy --provider.cluster "<your-rpc-url>"
```

因为网络问题带来的麻烦有可能还不止如此，比如本地存在写入了一部分但是为完成的 buffer、链上存在 buffer 但是本地不存在导致状态不一致等问题，为了直接跳过那些问题，可以直接这种这样的命令：

```bash
solana program deploy \
  target/deploy/usdt_spl.so \
  --program-id target/deploy/usdt_spl-keypair.json \
  --url "<your-rpc-url>"
```

这个命令更加好用。如果没有带 `--program-id` 参数，这个命令会自动新生成 keypair，也就意味着会把合约部署的新的地址，这个根据自己的需求来选择。部署成功后，就可以去 [区块链浏览器](https://explorer.solana.com/address/CFXzAhGKEz7tSFdNcVeCX8HosFGYczD7rZyD4vwoWozY?cluster=devnet) 上查看了。

### 6. 使用 SDK 调用链上合约

我们之前使用过 SDK，现在再来使用和复习一下，编辑 `app/app.js` 文件，把代码复制进去：

```ts
// scripts/mint_to.js   (CommonJS)
const anchor = require("@coral-xyz/anchor");
const {
  createMint,
  createAssociatedTokenAccount,
  getAccount,
  TOKEN_PROGRAM_ID,
} = require("@solana/spl-token");
const fs   = require("fs");
const os   = require("os");
const path = require("path");
const { Keypair, Connection, PublicKey } = anchor.web3;

const RPC_URL = process.env.RPC_URL || "https://api.devnet.solana.com";
const connection = new Connection(RPC_URL, { commitment: "confirmed" });

const secret = Uint8Array.from(
  JSON.parse(fs.readFileSync(path.join(os.homedir(), ".config/solana/id.json")))
);
const wallet = new anchor.Wallet(Keypair.fromSecretKey(secret));
const provider = new anchor.AnchorProvider(connection, wallet, {
  preflightCommitment: 'confirmed',
});
anchor.setProvider(provider);

const idl  = JSON.parse(fs.readFileSync(path.resolve("target/idl/usdt_spl.json")));
const prog = new anchor.Program(idl, provider);

(async () => {
  const mint = await createMint(connection, wallet.payer, wallet.publicKey, null, 6);
  const ata  = await createAssociatedTokenAccount(connection, wallet.payer, mint, wallet.publicKey);

  const sig = await prog.methods
    .mintTo(new anchor.BN(1_000_000))
    .accounts({ mint, to: ata, authority: wallet.publicKey, tokenProgram: TOKEN_PROGRAM_ID })
    .rpc();

  console.log("tx:", sig);
  console.log(`explorer: https://explorer.solana.com/tx/${sig}?cluster=devnet`);

  const bal = await getAccount(connection, ata);
  console.log("balance:", bal.amount.toString());
})();
```

如果一切顺利，可以看到这样的运行结果：

```
~/work/github/sol_contract/usdt_spl main ❯ node app/app.js
tx: 3MgHxsfnJp68mrrABvCh9iwNm6MSXp1SEvk7vDYHoW7KhTEHfVNyMWsbfbEAXTC9gLzcmWu5xbkzia8hgZrcZ18i
explorer: https://explorer.solana.com/tx/3MgHxsfnJp68mrrABvCh9iwNm6MSXp1SEvk7vDYHoW7KhTEHfVNyMWsbfbEAXTC9gLzcmWu5xbkzia8hgZrcZ18i?cluster=devnet
balance: 1000000
```
