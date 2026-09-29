---
title: Public and Restricted feeds
description: "Publish a signal once; the SAC gateway delivers it to everyone who added your feed, or only to the subscribers you approved. Choose an access policy and see who is responsible for what."
slug: /feed-gateway
sidebar_position: 1
---

A feed server is any backend that publishes signals to an audience: a trading desk, an analyst, a market scanner, a community bot. You never run your audience's connections yourself. You publish each signal **once** to the SAC gateway, and the gateway stores it and delivers it to every phone your feed admits. Each subscriber reviews it and decides on their own phone.

This section is a progression. Read it in order:

1. **Public and Restricted feeds** (this page): choose your audience.
2. [Connect to the SAC gateway](/docs/connect-to-gateway): onboard with the SAC team and configure your server.
3. [Publish your first feed](/docs/publish-your-first-feed): manifest, signal, update, withdrawal, heartbeat.
4. [Run a Restricted feed](/docs/restricted-feeds): wallet proof and authorization.
5. [Manage subscriber access](/docs/manage-subscriber-access): approve, reject, revoke, renew.
6. [Supported actions](/docs/plugins-and-actions): what a signal can ask for.

## Choose an access policy {#access-policy}

Every feed is **Public** or **Restricted**. Both are the same kind of feed, published the same way; only who may read differs.

| | Public | Restricted |
| --- | --- | --- |
| Good for | An open audience: anyone you share the link with | A paid community, an invite-only group, a feed a subscription unlocks |
| Who can read | Anyone who adds the feed link | Only devices you approved |
| What a subscriber does | Adds the link | Adds the link, signs one wallet message, waits for your decision |
| What you run besides publishing | Nothing | An authentication endpoint phones prove their wallet to, and your own approval rule |
| What you learn about subscribers | Nothing | The wallet address that proved itself, a device fingerprint and the phone's name |
| Push to subscribers | A shared topic per feed | One target per approved device, dropped with its access |

The policy is part of your gateway registration: the SAC team sets it when you onboard, and changes it when you ask. A feed is Public unless you ask for Restricted. See [Connect to the SAC gateway](/docs/connect-to-gateway).

## Who is responsible for what {#responsibilities}

| | Your feed server | The SAC gateway | SAC on each phone |
| --- | --- | --- | --- |
| Content | Publishes the manifest and signals: the terms, never an amount or side | Stores publications and serves them to admitted phones, streams updates, sends push wake-ups | Shows each signal, lets the subscriber enter their part, builds and checks the transaction |
| Access (Restricted) | Decides which wallets and devices may read: eligibility, approval, revocation, renewal | Enforces your decisions on every read, stream and push | Proves the wallet once, then uses a per-feed device key |
| Billing | Yours entirely, if you charge anything | None | None |
| Decisions and results | Never sees them | Never sees them | Keeps them on the phone |

The gateway never learns a subscriber's wallet address, never sees an amount, an approval or a signature, and never holds a key. For a Public feed it does not know who subscribed; for a Restricted feed it holds only opaque references your server gives it.

## The feed link {#feed-link}

Your feed is identified by the gateway address and your server ID:

```text
seekervault://feed?v=1&gateway=https://gateway.example.com&server=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
```

Share it with your audience any way you like: a page, a QR code, a message. It carries no secret.

- **Public feed:** a subscriber adds it in SAC and is subscribed. They never contact your server.
- **Restricted feed:** the link ends in `&access=restricted`, and holding it grants nothing. The phone reads the feed's policy and your authentication address from the gateway, never from the link.

## What you publish {#what-you-publish}

- A **manifest**: your display name, the environment you serve (sandbox or production), which action plugin your signals need, and the Solana networks they execute on ([Declare the Solana networks you run on](/docs/direct-or-feed#supported-networks)).
- **Signals**: the terms of an action, such as a swap pair or a prediction market. Never an amount or a side: each subscriber chooses those. See [Supported actions](/docs/plugins-and-actions).
- **Updates** and **withdrawals**, as higher revisions of the same signal.
- A **heartbeat** when you have nothing to publish, so your feed reads as online.

Everything is JSON over HTTPS; no SDK is required. The source repository also has two demo feed servers and a Go publisher library they share; the [recipes](/docs/recipes) use them.

## Delivery and availability {#delivery}

- **Delivery.** While a subscriber has SAC open, new signals arrive over a live stream. When it is closed, the gateway sends a content-free push wake-up where the subscriber's device allows it. Push is best effort: a subscriber who misses one still finds the signal when SAC next reads the feed.
- **Retention.** The gateway keeps each publication, including withdrawn and expired ones, for a retention period after it ends (a week by default), so subscribers can catch up. It is not an archive.
- **When your server is down.** What you already published stays readable. After three missed heartbeats, subscribers see **Feed offline** instead of a silent feed. Signals you have not yet delivered to the gateway are your server's to keep and retry.

## Sandbox and production {#sandbox-and-production}

A sandbox feed lets subscribers rehearse: the phone fetches real market data and builds the real transaction, then stops without signing. Sandbox is not a Solana network; swaps and prediction orders are mainnet transactions in both. Sandbox and production are separate registrations with separate server IDs, and a subscriber adds each feed separately.

## Next {#next}

[Connect to the SAC gateway](/docs/connect-to-gateway)
