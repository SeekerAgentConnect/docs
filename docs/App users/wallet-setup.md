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
| Wallet **address** and **network** | Kept on the phone, and published to each **direct** server so agents can read them |
| Wallet **authorization** for this app | Encrypted on this phone only, in one sealed record with the address and network. Never backed up, never sent to a server, never logged |
| Seed phrase / private keys | Never asked for, never seen, never stored |

Until a wallet is connected, an agent that asks for the address is told `WALLET_NOT_CONNECTED`. A public feed is never told anything about your wallet.

## Before you start

1. Open **Seed Vault Wallet** on its own and finish first-run unlock (PIN, fingerprint, or face). SAC adds no lock of its own.
2. Confirm the wallet shows an account and an address.
3. Optionally [pair a direct server](/docs/connecting-servers) so the address has somewhere to go. Without one, the Wallet screen says *No connections yet, so there's no sidecar to tell.*

## Connect

1. Open SAC and tap the **Wallet** tab. Until you connect, Home also shows a **Wallet** banner reading **No wallet connected.**
2. Pick **Network**: **Mainnet**, **Devnet**, or **Testnet**. You cannot change it later without connecting again.
3. Tap **Connect wallet**. The screen says **Waiting for the wallet…** while Seed Vault Wallet opens. Choose an account and approve there.
4. Back in SAC you see **Address**, **Network**, **Account name in the wallet**, and **Connected** (when). Underneath, the app says **Told N connections.** or which ones it could not tell.

The network is the wallet's choice. SAC asks for the cluster you picked; if the wallet does not serve it, the app says so. If the wallet returned the account without listing that network, the screen warns: *The wallet didn't list this network for the account. It may refuse to sign on it.*

Jupiter swap and prediction reviews, and SKR staking, need a **mainnet** wallet. A wallet connected for devnet is refused for those even in sandbox, because the bytes they build are mainnet bytes. Devnet is for direct transfers and message signing. See [environments](/docs/environments).

## If something goes wrong

| The app says | What to do |
| --- | --- |
| **No wallet app answered** | Install or open Seed Vault Wallet, then try again |
| **The wallet didn't give an account** | You declined or left without choosing. Nothing changed. Tap **Connect wallet** again |
| **The wallet no longer accepts this app's authorization** | Tap **Connect wallet** to approve it afresh |
| **The wallet doesn't serve this network** | Pick a network the wallet offers |
| **This phone couldn't store the wallet's authorization** | Nothing was saved. Try again |
| **Couldn't tell N connections** | A direct server was unreachable. Tap **Tell them again** once it is back; opening the app again also retries. Until it hears, that server's requests name the previous wallet |

## Disconnect or change

**Disconnect wallet** forgets the address and authorization, tells every direct server that no wallet is connected, and cancels pending wallet requests. It does **not** remove paired servers or feeds.

Connect again from **Wallet** to change account or network. Pending requests queued for the old wallet are cancelled by the server. Acknowledgements that do not use a wallet are left alone.

Disconnecting the wallet and removing a server are independent actions. See [Disconnecting](/docs/disconnecting).
