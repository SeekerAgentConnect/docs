---
title: Connect a server or add a feed
description: "Pair with a direct server, or add a Public feed, then choose the wallet it signs with. Both start from Add connection on Home."
slug: /connecting-servers
sidebar_position: 2
---

Every connection starts from **Add connection** on **Home**. There are two kinds.

| | A direct server | A feed |
| --- | --- | --- |
| What you get | A pairing link from your agent, or a code from the server's terminal | A feed link from the publisher |
| What it does | Pairs this phone with that server. Its requests come only to you | Subscribes this phone. Every subscriber sees the same signals |
| Who can read it | This phone only | **Public** feed: anyone with the link. **Restricted** feed: only devices the publisher approved |
| Where your answer goes | Back to the server | Nowhere: it stays on your phone |
| Environment | Always production | Sandbox or production |

## Pair with a direct server {#pair-with-a-server}

**You need:** a pairing link or code from the server's owner, usually your own agent. The two supplied servers are the [general SAC MCP server](/docs/mcp-quickstart) and the [SKR Staking MCP server](/docs/skr-staking-server).

1. Open the link on the phone and tap **Open Seeker Agent Connect**. Or, in **Add connection**, tap **Scan QR code**, or paste the `seekervault://pair?…` line into **Pairing code** and tap **Continue**.
2. Check the server address on **Pair with this server?**
3. Tap **Pair**.

**Expected result:** the server appears under **Paired servers** on Home, its page opens, and SAC asks you to [choose its wallet](#choose-a-wallet). Its requests arrive in the **Inbox**.

Opening a link does nothing by itself. A link works once and expires after ten minutes. A server has **one** paired phone: pairing again, from this phone or another, replaces the old pairing. The SKR Staking server is paired separately, with its own link. Details for developers are on [Pair your phone and enable push](/docs/pair-your-phone).

## Add a Public feed {#add-a-public-feed}

**You need:** a feed link from the publisher. It looks like `seekervault://feed?v=1&gateway=…&server=…` and carries no secret.

1. In **Add connection**, paste or scan the link.
2. Read **Add this public feed?**: it shows the gateway and the server ID.
3. Tap **Add feed**.

**Expected result:** **Feed added**, the feed's page opens, and SAC asks you to [choose its wallet](#choose-a-wallet). The feed's signals appear in the Inbox. A feed that the publisher offers in sandbox starts in sandbox; its signals say **Sandbox · no funds will move**.

For a Public feed, the phone never contacts the publisher and creates no credential. The publisher is not told who subscribed or what you decided. The gateway, not the link, decides whether a feed is Public or Restricted.

## Join a Restricted feed {#join-a-restricted-feed}

A link that ends in `&access=restricted` is a subscriber-only feed: adding it starts an access request that the publisher decides. The whole journey, including every access state, is on [Join a Restricted feed](/docs/join-restricted-feed).

## Choose the connection's wallet {#choose-a-wallet}

Every server and feed signs with **one** wallet that you choose for it. Right after you add a connection, its page opens with the wallet picker, **Wallet for** followed by the connection's name. By then SAC has read which Solana networks the server supports, so the picker can filter.

1. Read the line under the title: **This server supports** Mainnet (or the networks it names). **Only wallets on those networks are shown.**
2. Pick one of your saved wallets.
3. Tap **Use this wallet**.

**Expected result:** the connection's page shows a **Wallet** row with the wallet's name and network, and below it the full **Wallet address**, the **Wallet app** and the **Network**. For a direct server, SAC tells that server the address and network, and its agent reads them from then on (for example with `vault_get_address`).

If none of your wallets is on a supported network, the picker says **No saved wallet is on a network this server supports** and offers **Add wallet for Mainnet** (or the network the server needs). The network is already filled in; approve in the wallet app and the new wallet is offered at once, without leaving the picker. Cancelling, here or in the wallet app, changes no other wallet and no other connection.

You can leave without choosing. The connection is saved and readable, but nothing from it can be signed until it has a wallet.

Different connections can use different wallets at the same time, and several connections can share one. For example: the SKR Staking server with your main account on Mainnet, a development server with the same address on Devnet, and a prediction feed with a trading account on Mainnet. Each review and each approval uses the connection's own wallet and names it; the wallet you last looked at or used elsewhere makes no difference.

## Change a connection's wallet {#change-wallet}

Open the connection from **Paired servers** on Home and tap its **Wallet** row. The picker is the same, with the same network filter. Nothing changes until you tap **Use this wallet**, and SAC never moves a connection to another wallet or network by itself.

What changing does depends on the kind of connection. The picker says which before you choose.

| | A direct server | A feed |
| --- | --- | --- |
| Who is told | That server only. Other connections and servers are untouched | Nobody. The choice stays on your phone |
| Pending requests | The server cancels its own pending requests made for the previous wallet, and SAC tells you how many | Nothing is cancelled |
| Open reviews | A review prepared for the previous wallet can no longer be approved | Anything prepared for the previous wallet is dropped: the next review fetches a new quote and builds a new transaction for the new wallet |
| Server unreachable | The choice is saved, and SAC keeps trying to tell the server. Nothing is signed for it until the server confirms | Not applicable |
| Restricted feed access | Not applicable | The same address on another network keeps its access. Another address has to ask the publisher again ([details](/docs/join-restricted-feed#devices-and-wallets)) |

A request that was already approved and sent to the wallet finishes with the wallet it was approved with. Your **History** always shows the address and network each request actually used, whatever the connection uses now.

## Wallet status {#wallet-status}

The connection's **Wallet** row says whether it can sign. Only the first state can.

| The Wallet row says | What it means | What to do |
| --- | --- | --- |
| This connection signs only with this wallet, on this network. | Ready | Nothing |
| No wallet chosen. Nothing from this server can be signed until you choose one. | The connection has no wallet | Tap the row and choose one |
| Its wallet was removed. Choose another to sign again. | You removed the wallet it used. Nothing was chosen in its place | Tap the row and choose one |
| The wallet no longer accepts this profile's authorization. Reconnect it on the Wallets screen. | The wallet app ended SAC's authorization for that account | **Reconnect** the wallet on the **Wallets** screen. The connection keeps it |
| This server hasn't declared which Solana networks it supports. Nothing from it can be signed until it is updated to declare them. | The server is older than this app, or runs nothing that needs a wallet | Ask the server's operator to update it and declare its networks. You can still read everything it sent, and reject requests |
| This server no longer supports *network*. Choose a wallet on *networks* — the connection isn't moved for you. | The server dropped the network your wallet is on | Choose a wallet on one of the networks named |
| Telling the server about this wallet. Nothing is signed until it confirms. | A direct server has not confirmed the change yet | Wait, or check that the server is reachable |

A server that has not declared any network can still be given a wallet: a Restricted feed proves who you are with it, and the proof does not depend on a network. Nothing is signed for that server until it declares one.

## Disconnect or remove {#remove}

Open the connection from **Paired servers** on Home.

- **Disconnect** a server: the server drops this phone and cancels its pending requests. To come back, pair again.
- **Remove** a feed: its signals leave the phone. Other feeds are untouched. For a Restricted feed, the app also forgets this device's access key; adding the feed again starts a new request.

Removing a connection does not remove its wallet, which other connections may use. Your **Activity** history stays either way. If a server ends the pairing itself, the app says **Disconnected · pair again to reconnect**.

A connection from a retired, older connection mode is shown as retired and cannot be used. Pair directly with that server instead.

## Next {#next}

- [Connect your wallets](/docs/wallet-setup)
- [Review requests and signals](/docs/reviewing-requests)
- [Rules and warnings](/docs/rules)
