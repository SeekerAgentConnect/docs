---
title: Build your own server
description: "Direct or Feed: choose how your server reaches SAC users, then follow the matching path."
slug: /direct-or-feed
sidebar_position: 1
---

Build your own server when neither supplied MCP server fits: your backend already knows what it wants a person to review, and you want SAC to be the phone-side interface for it. There are two ways for a server to reach SAC, and they are built differently.

## Choose a path

| If you want to… | Use | Build with |
| --- | --- | --- |
| Send a request to **one connected person** and read their answer back: an acknowledgement, a message to sign, a transfer, a staking operation | **Direct** | The [Direct Server SDK](/docs/server-sdk) in your Node application |
| Publish the **same proposal to many subscribers**, each of whom decides on their own phone: a swap idea, a prediction market | **Feed** | The gateway's publisher API, from any language; see [Publish feeds](/docs/publish-feeds) |

|  | Direct | Feed |
| --- | --- | --- |
| Audience | The one phone paired with your server | Everyone who added your feed (Public), or the subscribers you approved (Restricted) |
| How the phone connects | A one-use pairing link your server issues | A feed link you share |
| Where the answer goes | Back to your server, with the outcome | Nowhere: each subscriber's decision, amount and result stay on their phone |
| Who hosts the phone-facing API | Your server | The SAC gateway |
| Environment | Always production | Sandbox or production, per registration |
| Solana networks | Declared by your server: `supportedNetworks` in the SDK | Declared in your manifest: `feed.supportedNetworks` |

:::note
The Direct Server SDK implements **Direct only**. It does not publish feeds. Feed publication is a separate contract, the gateway's `PublisherService`, which you call over HTTPS with JSON from any backend. The source repository also contains a Go publisher library used by the demo feed servers; see [Publish feeds](/docs/publish-feeds) for what it covers.
:::

## Direct

A direct server stores requests, serves the phone-facing API that the paired phone reads, and receives the owner's decision. The Direct Server SDK packages all of that. Continue with [Build on the Direct Server SDK](/docs/server-sdk).

Your direct server can optionally register with the SAC gateway so the gateway can wake the phone when the app is closed. That is the only part of the gateway a direct server uses; see [Connect to the SAC gateway](/docs/connect-to-gateway).

## Feed

A feed server publishes a manifest and signals to the SAC gateway, which stores them and delivers them to subscribers. A signal names an action and its terms; the subscriber's app builds and checks the transaction itself. There is no SDK to install for this path: follow [Publish feeds](/docs/publish-feeds) in order, starting with [Public and Restricted feeds](/docs/feed-gateway).

Both paths share the request vocabulary described on [Protocol](/docs/protocol).

## Declare the Solana networks you run on {#supported-networks}

Every server that asks an owner to sign declares which Solana networks its operations actually run on: Mainnet, Devnet, Testnet, or a combination. The phone uses that list twice. When the owner adds your server or feed, it offers only their saved wallets on those networks. Before anything is signed, it checks that the wallet chosen for the connection is on one of them.

| Your server | Where the list goes | How you set it |
| --- | --- | --- |
| General SAC MCP server | `direct.supportedNetworks` in its manifest | `SAC_SUPPORTED_NETWORKS`, for example `mainnet` or `mainnet,devnet` ([details](/docs/mcp-quickstart#declare-networks)) |
| SKR Staking MCP server | `direct.supportedNetworks` | Nothing to set: always Mainnet, the only network the staking program exists on |
| Your own direct server on the SDK | `direct.supportedNetworks` | `supportedNetworks` in `openDirectServer` ([details](/docs/server-sdk#declare-networks)) |
| A demo feed server, or one built on the Go publisher library | `feed.supportedNetworks` | `PUBLISHER_SUPPORTED_NETWORKS`. The two demos default to `mainnet` and refuse `devnet` or `testnet`, because Jupiter runs only on Mainnet |
| Your own feed backend | `feed.supportedNetworks` | In the manifest you publish ([example](/docs/publish-your-first-feed#manifest)) |

The rules are the same everywhere:

- **Declare what you really run.** The cluster your RPC endpoint serves, plus any network the owner signs messages on. Not every network the protocol can name: a network you list but do not run is an owner signing something that cannot land.
- **There is no default.** An empty list means *no networks declared*. It never means Mainnet and never means "all networks". An up-to-date phone shows such a connection and everything it sends, but signs nothing for it and tells the owner the server has to be updated. A server whose requests never reach a wallet, such as one that only asks for acknowledgements, rightly declares nothing.
- **Network is not environment.** `production` does not mean Mainnet, and `sandbox` does not mean Devnet or Testnet. A sandbox feed still reads Mainnet market data.
- **Each network at most once, never unspecified.** The configuration helpers accept the lowercase names `mainnet`, `devnet` and `testnet`, or `none` alone, and refuse anything else at startup. The gateway refuses a feed manifest that names an unknown network or one twice (`bad_network`).
- **Order does not matter.** Manifests list networks in canonical order (Mainnet, Devnet, Testnet), so the same set written in another order is the same manifest.
- **Changing the list is a new revision.** Adding or dropping a network changes your settings, so the manifest's `settings_revision` goes up and phones read it again. The supplied servers and the publisher library do this for you on the next start. A manifest that keeps its revision but changes the list is refused, by the gateway as `revision_conflict` and by the phone too.
- **Dropping a network the owner uses stops signing, not reading.** The phone never moves a connection to another network. It tells the owner their wallet's network is no longer supported, and they choose another wallet.

Server metadata is not the only check. For each operation the phone still verifies the signer, the transaction itself, the owner's rules, and that the execution provider serves that network. A multi-network server does not make every action available on every network.

### Deployment order {#deployment-order}

Update your server and set its networks **before** your owners update their phones. A phone from before network declarations ignores the list and keeps signing as it did. An updated phone meeting a server that declares nothing shows *This server hasn't declared which Solana networks it supports* and signs nothing for it until the server is updated. The connection, its history and its pending requests stay readable, and the owner can still reject them.

A direct server keeps storing whatever wallet binding an older phone publishes, including one on a network it does not declare, and logs that it did.
