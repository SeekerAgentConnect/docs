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

:::note
The Direct Server SDK implements **Direct only**. It does not publish feeds. Feed publication is a separate contract, the gateway's `PublisherService`, which you call over HTTPS with JSON from any backend. The source repository also contains a Go publisher library used by the demo feed servers; see [Publish feeds](/docs/publish-feeds) for what it covers.
:::

## Direct

A direct server stores requests, serves the phone-facing API that the paired phone reads, and receives the owner's decision. The Direct Server SDK packages all of that. Continue with [Build on the Direct Server SDK](/docs/server-sdk).

Your direct server can optionally register with the SAC gateway so the gateway can wake the phone when the app is closed. That is the only part of the gateway a direct server uses; see [Connect to the SAC gateway](/docs/connect-to-gateway).

## Feed

A feed server publishes a manifest and signals to the SAC gateway, which stores them and delivers them to subscribers. A signal names an action and its terms; the subscriber's app builds and checks the transaction itself. There is no SDK to install for this path: follow [Publish feeds](/docs/publish-feeds) in order, starting with [Public and Restricted feeds](/docs/feed-gateway).

Both paths share the request vocabulary described on [Protocol](/docs/protocol).
