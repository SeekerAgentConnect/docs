---
title: Welcome to Seeker Agent Connect
excerpt: Seeker Agent Connect is the phone app that reviews and authorizes requests from independent servers. The wallet you already have still signs.
hidden: false
---

Seeker Agent Connect (SAC) is an Android app for the Solana Seeker. Independent servers send you **private requests** and **public feed signals**. You review each one on the phone. When something needs a signature or a send, **Seed Vault Wallet** — a separate app that already holds your keys — is the one that signs.

SAC does not create a wallet, does not hold a seed phrase, and does not sign on its own. Connecting a server, opening an invitation, or adding a feed is transport only. It does not select a wallet, approve a request, or authorize spending.

## What you can do here

| If you are | Start with |
| --- | --- |
| New to SAC | [How the pieces fit](/docs/how-it-fits-together) and [the three connection modes](/docs/connection-modes) |
| Using the app | [Connect your wallet](/docs/wallet-setup) and [review requests](/docs/reviewing-requests) |
| Building a server | [Server developer overview](/docs/overview) and the [private invitation walkthrough](/docs/private-invitation-walkthrough) |
| Wiring an agent | [MCP adapter](/docs/mcp-adapter) and the [direct sidecar walkthrough](/docs/direct-sidecar-walkthrough) |
| Running infrastructure | [Operator roles](/docs/roles) |

## The three connection modes

SAC talks to servers in three ways. The server's own **manifest** states the mode. The phone never guesses it.

| Mode | What it is | Result of a decision |
| --- | --- | --- |
| `direct` | Your own sidecar, paired with a one-use code | Returned to that sidecar |
| `gateway_feed` | A public publisher. You hold no credential | Stays on this phone |
| `gateway_private` | An independent server, after you confirm an invitation | Returned only to that authenticated server |

A phone can hold any mix of the three. One connection never changes another.

## Sandbox is not a Solana network

**Sandbox** and **Production** describe whether this phone will open the wallet after you review a feed or gateway plugin request. They are not Solana clusters.

- **Sandbox** uses the same live market data and the same prepared bytes as production, then **does not sign and does not send**. Activity records the outcome as **Simulated**.
- **Production** opens the wallet after you approve, and a signature can reach the network.
- **Mainnet / Devnet / Testnet** is the network you pick when you [connect the wallet](/docs/wallet-setup). Jupiter swap and prediction plugins build **mainnet** routes in both sandbox and production. There is no Jupiter sandbox-as-devnet trading path.

Direct sidecar connections are always production. An agent waiting for a signature cannot be handed a simulation.

## What is implemented

This documentation describes the shipped app, the Go Server SDK in `publisher/sdk`, the shared broadcast gateway, the bundled `jupiter.swap` and `jupiter.prediction` plugins, and the optional MCP adapter on the owner sidecar.

It does not claim physical-device or live Firebase delivery beyond what the implementation and automated checks cover. Planned or incomplete items — for example a `seekervault://feed` deep link, a client-app SDK that embeds SAC screens, and direct-mode swap execution over MCP — are called out where they matter.

The implementation this site was written against is [SeekerAgentWallet](https://github.com/BrRenat/SeekerAgentWallet) at commit `e0d54b402c42ffca9c77c91fa372edc6de3ad898`. See the [source mapping](/docs/source-mapping) when the protocol or SDK changes.
