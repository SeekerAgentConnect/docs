---
title: Connect your wallets
description: "Save the wallet accounts you use, on the Solana networks you use them on. Each connection signs with the one you choose for it. SAC never asks for a seed phrase."
slug: /wallet-setup
sidebar_position: 1
---

On a Solana Seeker the wallet app is **Seed Vault Wallet**. SAC never creates a wallet and never holds your wallet's keys. No screen in SAC ever asks for a seed phrase or a private key. If something does, it is not this app.

SAC keeps a list of **wallets**: each one is an account in a wallet app, on one Solana network. You can save as many as you use, and every server or feed you connect signs with the one you choose for it. There is no single "active" wallet that every connection shares.

## Add a wallet {#connect}

**You need:** Seed Vault Wallet, or another wallet app that supports Mobile Wallet Adapter.

1. Open Seed Vault Wallet once on its own and finish its setup.
2. In SAC, open the **Wallet** tab. The **Wallets** screen lists what you saved.
3. Under **Add a wallet**, pick a network: **Mainnet**, **Devnet**, or **Testnet**. If the phone has more than one wallet app, also pick the **Wallet app**.
4. Tap **Add wallet**. The wallet app opens and asks which account to authorize; choose one and approve.

**Expected result:** the account appears on the **Wallets** screen with its network and wallet app, marked **Not used by any connection**. Adding a wallet does not bind it to anything and tells no server about it: you [choose it for a connection](/docs/connecting-servers#choose-a-wallet) separately.

Only the address and the network of the wallet a connection uses ever leave the phone, and only to that connection's server. The wallet app's authorization for SAC stays on this phone, encrypted, and is never backed up.

A [Restricted feed](/docs/join-restricted-feed) also asks the feed's wallet to sign one plain-text message, which goes to that feed's publisher to prove the address is yours. It is not a transaction and moves no funds. For each Restricted feed, SAC keeps a separate device key in the Android Keystore that signs later access checks for that feed; it is not a wallet key and cannot sign transactions.

## Several wallets {#wallet-profiles}

Each saved wallet is one account, in one wallet app, on one network.

- **The same address on two networks is two wallets.** Add your account once for **Mainnet** and again for **Devnet**, and both are listed, each with its own network. A connection uses exactly one of them.
- **Another account in the same wallet app.** Tap **Add wallet** again: SAC always asks the wallet for a fresh authorization, so the wallet lets you pick a different account instead of silently returning the one you added before. If the wallet authorizes several accounts at once, each is saved.
- **Another wallet app.** Pick it under **Wallet app**. The same address in two different wallet apps is two wallets, and each one's approvals open its own app.
- **Adding the same account again** (same wallet app, same address, same network) refreshes the wallet you already have rather than making a duplicate. Every connection that uses it keeps using it.

The **Wallets** screen shows each wallet's name, network and wallet app, and how many connections use it.

## Which network {#which-network}

A server or feed says which Solana networks it runs on, and SAC offers only your wallets on those networks when you set up the connection.

- Swaps, prediction orders, and SKR staking run on **Mainnet** only, even in sandbox. Those servers and feeds offer only Mainnet wallets.
- Message signing and direct transfers work on whichever networks the server declares, for example **Mainnet** for real use and **Devnet** for trying things out.

Mainnet, Devnet and Testnet are Solana networks. Sandbox and production are something else: whether a feed's approvals really execute. Sandbox is not Devnet.

## Rename, reconnect or remove {#disconnect}

Open a wallet on the **Wallets** screen.

- **Rename** gives it your own name. Leave the name blank to go back to the wallet app's own. Renaming changes nothing else and tells no server anything.
- **Reconnect** asks the same wallet app to authorize the same account again. Use it when SAC says the wallet no longer accepts the authorization. Connections that use the wallet keep it; nothing is moved.
- **Remove** forgets the wallet on this phone. Before it does, SAC lists the connections that use it. Each of them is left **without a wallet** until you choose one; SAC never picks a replacement for you. A direct server that used it is told there is no wallet, which cancels its own pending requests. Feeds are told nothing. Your **History** keeps the address and network each past request actually used.

Removing a server or a feed never removes a wallet. Removing a wallet never removes a connection.

If two of your saved wallets came from one authorization in the wallet app, removing one does not end the authorization the other still uses.

## Troubleshooting {#troubleshooting}

| The app says | What to do |
| --- | --- |
| No wallet app answered | Install or open Seed Vault Wallet, then try again |
| The wallet didn't give an account | You left without choosing. Tap **Add wallet** again |
| The wallet doesn't serve this network | Pick a network the wallet offers |
| The wallet didn't list this network for the account | The wallet may refuse to sign on it. Check the network in the wallet app |
| The wallet no longer accepts this profile's authorization | Tap **Reconnect** on that wallet. Only the wallets that shared that authorization are affected |
| The wallet didn't authorize this profile's account, so nothing changed | During **Reconnect** you chose another account. Reconnect again and pick the same account, or **Add wallet** for the other one |
| That server still has the previous address | A direct server was unreachable when its wallet changed, so nothing is signed for it yet. Tap **Tell them again** once it is back |

What a connection's own wallet status means is on [Connect a server or add a feed](/docs/connecting-servers#wallet-status).

## Next {#next}

- [Connect a server or add a feed](/docs/connecting-servers), and choose its wallet
- [Join a Restricted feed](/docs/join-restricted-feed)
