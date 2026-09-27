---
title: How it works
description: "Who does what between your server, the SAC gateway, the app and the wallet, and three distinctions: Direct or Feed, Public or Restricted, Sandbox or Production."
slug: /how-it-works
sidebar_position: 2
---

![Your agent talks MCP to your MCP server, which exchanges pairing, requests and results with SAC on the phone and can ask the gateway push relay to wake the phone. Your feed server publishes once to the gateway, which delivers feeds, live streams and push to the phone. SAC hands approvals to Seed Vault Wallet, which acts on Solana.](/img/architecture.png)

## Who does what {#responsibilities}

| Part | Does | Never does |
| --- | --- | --- |
| **Your server**: an MCP server, a direct server of your own, or a feed publisher | Decides what to ask or publish. A direct server stores its requests and reads your answer back. A feed publisher publishes signals once and, for a Restricted feed, decides which wallets may read | Hold your wallet keys or approve for you. A feed publisher never learns what a subscriber decided |
| **The SAC gateway**, operated by the SAC team | Stores feed publications and delivers them to the subscribers each feed's policy admits, streams updates, sends push wake-ups for feeds, and relays content-free wake-ups for direct servers that ask it to | Hold keys, approve, see a decision, or learn a subscriber's wallet address |
| **SAC**, the app on your phone | Holds your connections, shows each request, builds and checks transactions, applies your rules, records your decision and its outcome | Hold wallet keys or sign transactions |
| **Your wallet**, Seed Vault Wallet | Signs and sends only what you approved in SAC. For a Restricted feed, also signs one access message that moves no funds | Know about servers or feeds |

## Direct or Feed: how a request reaches you {#direct-or-feed}

These are the two **connection modes**: how a source is connected to your phone and where your answer goes.

|  | Direct | Feed |
| --- | --- | --- |
| Source | An MCP server or another direct server, usually your own | A publisher's feed server, through the SAC gateway |
| How the phone connects | A one-use pairing link | A feed link the publisher shares |
| Who sees a request | Only the one paired phone | Everyone the feed admits |
| Where your decision goes | Back to that server, so your agent can read it | Nowhere: it stays on your phone |
| What passes through the gateway | At most a content-free wake-up | The feed's publications |

An earlier third mode, where a server reached a phone through the gateway by invitation, was retired. Such a connection shows as retired in the app; the way back is a direct pairing.

## Public or Restricted: who may read a feed {#public-or-restricted}

These are the two **access policies** of a feed. They are not connection modes: both are feeds, published the same way.

|  | Public | Restricted |
| --- | --- | --- |
| Audience | Anyone with the link | Only subscribers the publisher approved |
| What the subscriber does | Adds the link | Adds the link, proves wallet ownership by signing one message, waits for approval |
| Who decides who reads | Nobody; the link is enough | The publisher, per wallet, with its own rules |
| Who enforces it | Nothing to enforce | The gateway, per approved device, on every read, stream and push |
| What the publisher learns about subscribers | Nothing | The wallet address, a device fingerprint and the phone's name; never amounts or decisions |

Restricted is how a publisher runs a paid or invite-only audience. Any payment happens in the publisher's own system; SAC controls delivery, not billing. See [Public and Restricted feeds](/docs/feed-gateway).

## Sandbox or Production: what happens when you approve {#sandbox-or-production}

These are **execution environments**. They are not access policies, and they are not Solana networks.

|  | Sandbox | Production |
| --- | --- | --- |
| Available for | Feeds that offer it | Feeds, and every direct connection (direct is always production) |
| What approving does | The phone fetches the same market data and builds the same transaction, then **Simulate** records **Simulated** and stops. Nothing is signed or sent | The wallet opens with exactly the transaction you reviewed |
| Network | The same as production: swaps and prediction orders are mainnet transactions in both | Whatever the request names, and the wallet you connected |

Mainnet, Devnet and Testnet are **Solana networks**, a separate choice you make when you [connect your wallet](/docs/wallet-setup#which-network).

## Approval is always on the phone {#approval}

1. **Review in SAC.** The phone reads the request, for a transaction the exact bytes, applies your [rules](/docs/rules), and waits for your tap.
2. **Confirm in the wallet**, when the request needs a signature. Only then does Seed Vault Wallet open. Declining there is a rejection.

An acknowledgement ends at step 1, and so does a sandbox simulation. Joining a Restricted feed asks the wallet for one more thing, once: a signed message that proves you own the wallet. It is not a transaction and approves nothing.

## What is stored where {#data}

- **A direct server** stores its own requests and your answers to them, so your agent can read the results. Nothing about them passes through the gateway.
- **The gateway** stores what feed publishers publish, for a limited retention period, so subscribers can catch up. For a Restricted feed it also holds opaque access references, never a wallet address.
- **The phone** stores your connections, the requests and signals it received, and your Activity history.
- **The publisher of a Restricted feed** stores the wallet addresses and device fingerprints that asked for access, and its decisions.

## Next {#next}

- Use the app: [Connect your wallet](/docs/wallet-setup)
- Connect an agent: [General SAC MCP server](/docs/mcp-quickstart)
- Build or publish: [Build your own server](/docs/direct-or-feed)
