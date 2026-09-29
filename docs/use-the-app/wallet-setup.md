---
title: Connect your wallet
description: "SAC uses the wallet you already have. It never asks for a seed phrase."
slug: /wallet-setup
sidebar_position: 1
---

On a Solana Seeker that wallet is **Seed Vault Wallet**. SAC never creates a wallet and never holds your wallet's keys. No screen in SAC ever asks for a seed phrase or a private key. If something does, it is not this app.

## Connect {#connect}

**You need:** Seed Vault Wallet, or another wallet app that supports Mobile Wallet Adapter.

1. Open Seed Vault Wallet once on its own and finish its setup.
2. In SAC, open the **Wallet** tab and pick a network: **Mainnet**, **Devnet**, or **Testnet**.
3. Tap **Connect wallet**. Seed Vault Wallet opens; choose an account and approve.
4. SAC shows the address and network, and tells every paired server about them.

**Expected result:** the **Wallet** tab shows your address and network, and an agent that calls `vault_get_address` receives them.

Only the address and the network leave the phone. The wallet's authorization for SAC stays on this phone and is never backed up.

A [Restricted feed](/docs/join-restricted-feed) also asks the wallet to sign one plain-text message, which goes to that feed's publisher to prove the address is yours. It is not a transaction and moves no funds. For each Restricted feed, SAC keeps a separate device key in the Android Keystore that signs later access checks for that feed; it is not a wallet key and cannot sign transactions.

Until a wallet is connected, an agent that asks for your address is told there is none.

## Which network {#which-network}

- Swaps, prediction orders, and SKR staking need a **Mainnet** wallet, even in sandbox.
- Message signing and direct transfers work on any network the wallet offers.

## A wallet for trading {#trading-wallet}

Swaps and prediction orders from feeds are real Solana mainnet transactions with real funds; neither has a test network. Consider connecting a separate account that holds only what you mean to trade:

- **Swaps:** the input token, plus a little SOL for network and priority fees.
- **Prediction orders:** USDC or Jupiter's dollar token (JupUSD) for the stake, at least Jupiter's current $5 minimum, plus a little SOL for transaction costs.

SAC asks Jupiter for quotes and unsigned transactions and checks them; your wallet signs, and its keys never leave it. Reading a signal and dismissing it spends nothing.

## Disconnect or change {#disconnect}

**Disconnect wallet** forgets the address, tells every server, and cancels requests that were waiting for that wallet. It does not remove servers or feeds. To change the account or network, connect again.

## Troubleshooting {#troubleshooting}

| The app says                          | What to do                                                        |
| ------------------------------------- | ----------------------------------------------------------------- |
| No wallet app answered                | Install or open Seed Vault Wallet, then try again                 |
| The wallet didn't give an account     | You left without choosing. Tap **Connect wallet** again           |
| The wallet doesn't serve this network | Pick a network the wallet offers                                  |
| Couldn't tell N connections           | A server was unreachable. Tap **Tell them again** once it is back |

## Next {#next}

- [Connect a server or add a feed](/docs/connecting-servers)
- [Join a Restricted feed](/docs/join-restricted-feed)
