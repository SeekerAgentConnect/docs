---
title: Build a server
excerpt: Two developer paths — a direct server one phone pairs with, or a public feed published through the shared gateway. Neither holds keys, and neither embeds SAC screens.
hidden: false
---

You can reach Seeker Agent Connect in two developer ways:

1. **Direct server** (`direct`) — pair one phone, send it private requests, and read the declared results. Build it on the TypeScript [Direct Server SDK](/docs/direct-server-sdk) (`@seeker-vault/server-sdk`), or run the shipped [MCP server](/docs/mcp-adapter) as it is.
2. **Public feed** (`gateway_feed`) — publish one document to every subscriber through the shared feed gateway. Plain HTTPS with Connect JSON; no SDK. Decisions stay on each phone.

A third mode, gateway-routed private invitations, is [retired](/docs/private-invitation-walkthrough).

| | Direct server | Public feed |
| --- | --- | --- |
| Whose server | One owner's, hosted by you | A public publisher, hosted by you |
| How the phone adds it | A one-use pairing code, QR, or HTTPS pairing link | A public feed reference |
| Credential on the phone | Issued by your server at pairing | None |
| Who sees a request | The one paired phone | Every subscriber |
| Who the phone calls | Your server | The gateway, never you |
| Where a result goes | Back to your server | Nowhere; it stays on the phone |
| Environment | Always production | Sandbox, production, or both |

Neither server holds keys. SAC never signs; Seed Vault Wallet does. Opening a link or page never pairs, approves, or shares a wallet.

## Who does what

| Role | Does | Does not |
| --- | --- | --- |
| **Gateway operator** | Runs `feed-gateway/`, registers publishers, issues publisher and relay credentials, holds the deployment's Firebase credential | Pair phones, hold MCP tokens, see owner decisions |
| **You (developer)** | Host a direct server, or publish manifests and requests to the gateway | Receive feed decisions; hold a wallet |
| **Phone owner** | Pairs with a direct server or adds a feed; reviews; approves in the wallet | Configure your secrets |

A direct server needs nothing from an operator, except a [relay credential](/docs/push-relay) if it wants to wake a backgrounded phone without its own Firebase project.

A public feed needs registration. There is no signup endpoint: the operator registers you with `feed-gatewayctl` on the gateway host, or with **Add server** on the gateway's admin page:

```sh
cd feed-gateway
go run ./cmd/feed-gatewayctl register --database ./broadcast.db \
  --server 3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d --label "copy trading"
```

You get five values back: your **server ID**, your **channel** (`server/<server ID>`), the **credential** (shown once, stored only as a hash), the **public gateway origin** your manifest must name, and the **publisher API address** you send publications to. Store the credential as a backend secret. Never put it in HTML, JavaScript, an app, a URL, or a QR code.

## Interfaces (do not mix them up)

| Surface | Transport | Auth | Who calls it |
| --- | --- | --- | --- |
| Gateway `PublisherService` | Connect JSON over HTTPS | Publisher credential | Your backend: manifests, requests, updates, withdrawals, heartbeat |
| Gateway `FeedService` | Connect JSON | None | Phones reading manifests, requests, and presence |
| Direct `PairingService`, `RequestService` | Connect, unary | One-use pairing token, then the phone credential | The one paired phone |
| Direct `UpdateService` | gRPC over HTTP/2 | The phone credential | The paired phone's live update stream |
| MCP `/mcp` | MCP Streamable HTTP | `MCP_TOKEN` or OAuth | The owner's agents only |
| Demo `/v1` operator API | REST JSON | `PUBLISHER_API_TOKEN` | Your strategy process talking to **your** demo |
| Demo `/trader` admin UI | HTML, password-gated | `ADMIN_PASSWORDS` (a bcrypt file body) | A trader in a browser; a client of `/v1`, not a second writer |
| Gateway push relay `/relay/v1` | HTTPS JSON | Relay credential | A direct server you host, waking its phone |

`POST /v1/requests` is the demos' primary API. `/v1/signals` is a compatibility alias over the same handlers and store; new integrations do not use it.

There is no REST mirror of the Connect RPCs, and no client-app SDK.

## Pick a walkthrough

- [Direct Server SDK](/docs/direct-server-sdk), then [Build a direct server](/docs/direct-server-walkthrough)
- [Public feed sandbox](/docs/public-feed-walkthrough)
- [Waking a phone through the relay](/docs/push-relay)
- [Manifests](/docs/manifests) and [Request lifecycle](/docs/request-lifecycle)
- [Examples](/docs/examples)
