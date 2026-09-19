---
title: Connect your wallet
excerpt: SAC talks to Seed Vault Wallet through Mobile Wallet Adapter. It never asks for a seed phrase.
hidden: false
---

Seeker Agent Connect uses the wallet you already have. On a Solana Seeker that wallet is **Seed Vault Wallet**. The app never creates a wallet and never holds a key.

## You will never be asked for a seed phrase

No screen in SAC, no pairing page, and no agent tool in this product asks you to type, paste, photograph, or export a seed phrase, recovery phrase, or private key. If something does, it is not this product. Stop.

| What | Where it goes |
| --- | --- |
| Wallet **address** and **network** | Kept on the phone, and published to each **direct** sidecar so agents can read them |
| Wallet **authorization** for this app | Encrypted on this phone only. Never backed up, never sent to a sidecar, never logged |
| Seed phrase / private keys | Never asked for, never seen, never stored |

Until a wallet is connected, an agent that asks for the address is told `WALLET_NOT_CONNECTED`.

## Before you start

1. Open **Seed Vault Wallet** on its own and finish first-run unlock (PIN, fingerprint, or face). SAC adds no lock of its own.
2. Confirm the wallet shows an account and an address.
3. Optionally add at least one [server or feed](/docs/connecting-servers) so the address can be published to a sidecar.

## Connect

1. Open SAC. Tap **Wallet** (the first row on **Connections**).
2. Pick **Network**: **Mainnet**, **Devnet**, or **Testnet**. You cannot change it later without connecting again.
3. Tap **Connect wallet**. Seed Vault Wallet opens. Choose an account and approve.
4. Back in SAC you see the address, the network, the account name in the wallet, and when you connected. The **Connections** Wallet row then shows the address.

The network is the wallet’s choice. SAC asks for the cluster you picked; if the wallet does not serve it, the app says so.

Jupiter swap and prediction reviews still require a **mainnet** wallet. A wallet selected for devnet is refused for those plugins even in sandbox, because the bytes they build are mainnet bytes. Devnet is for direct transfers and message signing, not for Jupiter rehearsal. See [environments](/docs/environments).

## If something goes wrong

| The app says | What to do |
| --- | --- |
| **No wallet app answered** | Install or open Seed Vault Wallet, then try again |
| **The wallet didn't give an account** | You declined or left without choosing. Tap **Connect wallet** again |
| **The wallet no longer accepts this app's authorization** | Tap **Connect wallet** to approve again |
| **The wallet doesn't serve this network** | Pick a network the wallet offers |
| **Couldn't tell N connection(s)** | A sidecar was unreachable. Tap **Tell them again** once it is back |

## Disconnect or change

**Disconnect wallet** forgets the address and authorization, tells every sidecar `WALLET_NOT_CONNECTED`, and cancels pending wallet requests. It does **not** remove paired servers or feeds.

Connect again from **Wallet** to change account or network. Pending requests queued for the old wallet are cancelled. Acknowledgements that do not use a wallet are left alone.

Disconnecting the wallet and disconnecting a server are independent actions. See [Disconnecting](/docs/disconnecting).
