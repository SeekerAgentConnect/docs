---
title: Build a server
excerpt: Public feeds and private invitations share one request envelope and one Go Server SDK. They are not MCP and not a client-app SDK.
hidden: false
---

You can reach Seeker Agent Connect in two developer ways:

1. **Public feed** (`gateway_feed`) — publish one request to every subscriber. Decisions stay on each phone.
2. **Private independent server** (`gateway_private`) — invite one device, send a request to that exact binding, and read the declared result.

Both use `seekervault.request.v2.Request` and the Go module `github.com/BrRenat/SeekerAgentWallet/publisher`. Neither holds keys, and neither embeds SAC screens.

A third path, the **owner sidecar** with optional MCP, is for the phone owner’s own agents. It is documented under [Integrations](/docs/mcp-adapter). Do not treat MCP as the way to build a public publisher.

## Who does what

| Role | Does | Does not |
| --- | --- | --- |
| **Gateway operator** | Runs `broadcast/`, registers server IDs, issues publisher credentials | Pair phones, hold MCP tokens, see owner amounts |
| **You (developer)** | Run a template or your own backend; publish manifests and requests | Receive feed decisions; hold device credentials |
| **Phone owner** | Adds the feed or confirms the invitation; reviews; approves | Configure your secrets |

Ask the operator for the gateway **origin** (character for character, including scheme and port) and a **publisher credential**. There is no signup endpoint. Registration writes to the gateway database locally:

```sh
cd broadcast
go run ./cmd/broadcastctl register --database ./broadcast.db \
  --server 3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d --label "copy trading"
```

The credential is shown once. Store it as a backend secret. Never put it in HTML, JavaScript, an app, a URL, or a QR code.

## Interfaces (do not mix them up)

| Surface | Transport | Auth | Use |
| --- | --- | --- | --- |
| Template JSON API | REST, `POST /v1/requests` | `PUBLISHER_API_TOKEN` | Your strategy process talks to **your** CopyTrading template |
| Go `sdk.Client` | That same REST API | Same token | `CreateRequest` |
| Go `sdk.Gateway` | Connect/gRPC `PublisherService` | Publisher / `BROADCAST_CREDENTIAL` | Manifests, invitations, private requests |
| Gateway `FeedService` | Connect, unauthenticated | None | Phones reading feeds |
| Gateway `InvitationService` / `DeviceService` | Connect | Invitation token, then device credential | SAC redeem and private results |
| Sidecar MCP `/mcp` | MCP over HTTP | `MCP_TOKEN` | Owner agents only |

Current request APIs are primary: gateway request RPCs and `POST /v1/requests`. Proposal RPCs and `/v1/signals` remain **compatibility** aliases over the same store. New integrations should not use them.

There is no REST mirror of Connect RPCs, and no client-app SDK.

## Pick a walkthrough

- [Private invitation to result](/docs/private-invitation-walkthrough)
- [Public feed sandbox](/docs/public-feed-walkthrough)
- [Go Server SDK](/docs/go-sdk)
- [Manifests](/docs/manifests)
- [Request lifecycle](/docs/request-lifecycle)
- [Examples](/docs/examples)
