---
title: Connect your wallet
excerpt: SAC uses the wallet you already have. It never asks for a seed phrase.
hidden: false
---
On a Solana Seeker that wallet is **Seed Vault Wallet**. SAC never creates a wallet and never holds a key. No screen in SAC ever asks for a seed phrase or a private key. If something does, it is not this app.

## Connect

1. Open Seed Vault Wallet once on its own and finish its setup.
2. In SAC, open the **Wallet** tab and pick a network: **Mainnet**, **Devnet**, or **Testnet**.
3. Tap **Connect wallet**. Seed Vault Wallet opens; choose an account and approve.
4. SAC shows the address and network, and tells every paired server about them.

Only the address and the network leave the phone. The wallet's authorization for SAC stays on this phone and is never backed up.

Until a wallet is connected, an agent that asks for your address is told there is none.

## Which network

- Swaps, prediction orders, and SKR staking need a **Mainnet** wallet, even in sandbox.
- Message signing and direct transfers work on any network the wallet offers.

## Disconnect or change

**Disconnect wallet** forgets the address, tells every server, and cancels requests that were waiting for that wallet. It does not remove servers or feeds. To change the account or network, connect again.

## If something goes wrong

| The app says                          | What to do                                                        |
| ------------------------------------- | ----------------------------------------------------------------- |
| No wallet app answered                | Install or open Seed Vault Wallet, then try again                 |
| The wallet didn't give an account     | You left without choosing. Tap **Connect wallet** again           |
| The wallet doesn't serve this network | Pick a network the wallet offers                                  |
| Couldn't tell N connections           | A server was unreachable. Tap **Tell them again** once it is back |
