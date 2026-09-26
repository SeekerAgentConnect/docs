---
title: What the gateway does
excerpt: Publish a signal once. The gateway delivers it to everyone who added your feed, keeps it available, streams updates, and wakes phones.
hidden: false
---

A feed server is any backend that publishes signals to an audience. You never run the audience's connections yourself: you publish each signal **once** to the gateway, and the gateway does the rest.

| The gateway | For you |
| --- | --- |
| Stores your manifest and every signal you publish | You publish once, from anywhere, over HTTPS |
| Delivers them to every phone that added your feed, and streams updates while the app is open | No subscriber list, no sockets, no fan-out to write |
| Sends a push wake-up when you publish | Subscribers see a new signal within seconds |
| Answers whether your server is online, from your regular check-ins | Subscribers see **Feed offline** instead of a silent feed |
| Keeps the last state when your server is down | Nothing published is lost |

What the gateway never does: it never learns who subscribed, never sees an amount, an approval, or a signature, and never holds a key. Each subscriber's decision stays on their phone. You get the same: an audience you can reach, and no responsibility for their wallets.

## Getting registered

There is no self-signup. You send us the address of your server, we register it, and you get three values back: your **server ID**, a **credential** (shown once), and the **gateway address**. The full flow is on [How it works](/docs/how-it-works#registering-a-server-with-the-gateway).

In a demo server they go into `PUBLISHER_SERVER_ID`, `BROADCAST_CREDENTIAL`, and `PUBLISHER_GATEWAY_URL`. In your own backend, the credential is the bearer token on every publish call. Keep it in secret storage; never in a page, an app, or a link.

## The feed link

Your feed is identified by the gateway address and your server ID:

```text
seekervault://feed?v=1&gateway=https://feeds.example.com&server=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
```

A demo server prints it at startup. Share it with your audience any way you like: a page, a QR code, a message. It carries no secret. A subscriber pastes it into **Add connection** in SAC and is subscribed; they never contact your server.

## What you publish

- A **manifest**, once: who you are, which environment you serve (sandbox, production, or both), which action your signals ask for.
- **Signals**: a swap pair, or a prediction market. Never an amount or a side: each subscriber chooses those on their phone. See [Plugins and actions](/docs/plugins-and-actions).
- **Updates** and **withdrawals** as new revisions of the same signal.
- A **heartbeat** every 30 seconds when you have nothing to publish, so your feed reads as online.

Everything is plain JSON over HTTPS. Walk through it on [Publish your first feed](/docs/publish-your-first-feed), or start from a demo: [copy trading](/docs/recipe-copytrading) or [prediction markets](/docs/recipe-prediction).

## Sandbox and production

Your manifest names the environments you serve. A subscriber's phone starts a feed in sandbox when you offer it: it fetches real market data and builds the real transaction, then stops without signing. Sandbox is not a Solana network; swaps and prediction orders are mainnet transactions in both. Production is a separate registration with its own server ID.
