---
title: Welcome to Seeker Agent Connect
excerpt: Seeker Agent Connect is the phone app that reviews and authorizes requests from independent servers. The wallet you already have still signs.
hidden: false
---

Seeker Agent Connect (SAC) is an Android app for the Solana Seeker. Independent servers send you **private requests** and **public feed signals**. You review each one on the phone. When something needs a signature or a send, **Seed Vault Wallet** — a separate app that already holds your keys — is the one that signs.

SAC does not create a wallet, does not hold a seed phrase, and does not sign on its own. Pairing a server or adding a feed is transport only. It does not select a wallet, approve a request, or authorize spending.

## What you can do here

| If you are | Start with |
| --- | --- |
| New to SAC | [How the pieces fit](/docs/how-it-fits-together) and [the two connection modes](/docs/connection-modes) |
| Using the app | [Connect your wallet](/docs/wallet-setup) and [review requests](/docs/reviewing-requests) |
| Building a server | [Server developer overview](/docs/overview), then the [direct server walkthrough](/docs/direct-server-walkthrough) or the [public feed walkthrough](/docs/public-feed-walkthrough) |
| Wiring an agent | [MCP adapter](/docs/mcp-adapter) and the [direct MCP server walkthrough](/docs/direct-sidecar-walkthrough) |
| Running infrastructure | [Operator roles](/docs/roles) |

## The two connection modes

SAC talks to servers in two ways. The server's own **manifest** states the mode. The phone never guesses it.

| Mode | What it is | Result of a decision |
| --- | --- | --- |
| `direct` | A server you pair with using a one-use code: the MCP server, the SKR staking server, or any server built on the Direct Server SDK | Returned to that server |
| `gateway_feed` | A public publisher, read through the shared feed gateway. You hold no credential | Stays on this phone |

A phone can hold any mix of the two. One connection never changes another.

An earlier third mode, `gateway_private`, was retired. A private connection stored from that time is now an inert record on the phone, and its owner needs a fresh direct pairing. See [connection modes](/docs/connection-modes).

## Sandbox is not a Solana network

**Sandbox** and **Production** describe whether this phone will open the wallet after you review a feed signal. They are not Solana clusters.

- **Sandbox** uses the same live market data and the same prepared bytes as production, then **does not sign and does not send**. Activity records the outcome as **Simulated**.
- **Production** opens the wallet after you approve, and a signature can reach the network.
- **Mainnet / Devnet / Testnet** is the network you pick when you [connect the wallet](/docs/wallet-setup). The Jupiter swap and prediction actions build **mainnet** routes in both sandbox and production. There is no Jupiter sandbox-as-devnet trading path.

Direct connections are always production. An agent waiting for a signature cannot be handed a simulation.

## What is implemented

This documentation describes the shipped app and the components beside it:

| Component | Where | What it is |
| --- | --- | --- |
| Direct Server SDK | `server-sdk/` | The TypeScript engine for a direct server: pairing, the request lifecycle, SQLite persistence, the phone-facing services, live updates, manifests, and the pairing page. A private package, installed from a packed tarball |
| MCP server | `mcp-server/` | The self-hosted direct server with the optional MCP adapter for agents |
| SKR staking server | `skr-staking-server/` | A second direct MCP server, for one owner's SKR staking position. Mainnet-beta only |
| Feed gateway | `feed-gateway/` | The shared public feed gateway: fan-out for feeds, publisher registration, and an optional push relay for direct servers |
| Feed demos | `demo-copytrading/`, `demo-prediction/` | Two independent public-feed publishers you can copy |
| `jupiter` execution provider | Compiled into the app | Prepares and inspects the `swap` and `prediction.buy` actions on the phone |
| Direct pairing page | `server-sdk/`, served by the MCP server and the staking server at `/pair` | The HTTPS page that opens the same `seekervault://pair` code. It never pairs on its own |
| Gateway push relay | `feed-gateway/` | Wakes a backgrounded phone for a direct server that has no Firebase project of its own. The wake-up carries no content |

It does not claim physical-device or live Firebase delivery beyond what the implementation and automated checks cover. Planned or incomplete items — for example a `seekervault://feed` deep link, a client-app SDK that embeds SAC screens, and direct-mode swap execution over MCP — are called out where they matter.

The implementation this site was written against is [SeekerAgentConnect](https://github.com/BrRenat/SeekerAgentConnect) at commit `ce340cdc008efef4dce3cddc591616dba1ba4012`. See the [source mapping](/docs/source-mapping) when the protocol or SDK changes.
