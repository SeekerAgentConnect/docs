---
title: Operator roles
excerpt: Gateway operator, direct-server operator, publisher and phone owner are four jobs. Do not mix their secrets, ports or databases.
hidden: false
---

| Role | Runs | Holds |
| --- | --- | --- |
| **Gateway operator** | `feed-gateway` (`deploy/feed`) with Centrifugo and Redis, plus the feed ingress | Centrifugo keys, the admin password hash, the one Firebase service account (`BROADCAST_PUSH_CREDENTIALS`), the publisher database |
| **Direct-server operator** | An MCP server (`mcp-server/`), an SDK server of your own, or the SKR staking server (`skr-staking-server/`) | The agent token (`MCP_TOKEN` or `SKR_STAKING_MCP_TOKEN`), the TLS key, the direct SQLite file with the phone credential hash, optionally a relay credential or `FCM_PROJECT_ID` |
| **Publisher** | A demo (`demo-copytrading/`, `demo-prediction/`) or your own backend | `BROADCAST_CREDENTIAL` for one server UUID, and the demo's `PUBLISHER_API_TOKEN` |
| **Phone owner** | SAC on the phone; Seed Vault Wallet signs | None of the above. Pairings, feed references and the wallet session stay on the phone |

The gateway never holds an agent token or a phone credential. A publisher never holds a Firebase credential. A direct server never holds a publisher credential. SAC never holds keys and never signs.

## Gateway operator

You run the shared public-feed gateway that phones read from and publishers write to. Registration is your act; there is no signup API. `feed-gatewayctl register` or the admin page gives a publisher its server ID, channel, credential handle and secret, and you tell it the public origin and the publisher API address. A registration carries capabilities: `publish` (a public feed) and `relay` (waking a phone on behalf of a direct server you do not host). Each credential is issued for one capability. See [Shared gateway](/docs/shared-gateway) and [Firebase](/docs/firebase).

## Direct-server operator

You run one server that one phone pairs with. Often you are also the phone owner: an MCP server on a laptop or VPS, paired with `pnpm pair` or a pairing link. A developer hosting an SDK server, or the SKR staking server, holds the same role for that server. Every direct server has its own database, token, listener and one paired phone; pairing again replaces the previous phone. Live updates need HTTP/2 end to end. See [Direct server ingress](/docs/direct-sidecar-proxy).

## Publisher

You publish manifests, requests, updates and withdrawals to `PublisherService` as plain Connect JSON over HTTPS, authenticated with the credential the gateway operator gave you. The demos are templates you can copy. You never learn who subscribes or what they decided. See [Public feed walkthrough](/docs/public-feed-walkthrough).

## Phone owner

You add connections in SAC: a direct pairing (code, QR, link or pairing page) or a public feed reference. You review requests; Seed Vault Wallet signs. Nothing an operator does creates, approves or shares anything on your phone.

## What no longer exists

There are no device bindings, invitations or private gateway connections. A stored one is an inert, retired record on the phone; the owner pairs directly with a direct server instead. See [Connection modes](/docs/connection-modes).

## Suggested order

1. The gateway operator brings up `deploy/feed` and `deploy/ingress/feed`, checks `/healthz` and a snapshot read.
2. The gateway operator registers each publisher and hands over its values.
3. The publisher publishes a manifest and a first request; the owner adds the feed reference in SAC.
4. Separately, a direct-server operator starts a direct server with native TLS on 8443 and pairs the phone.
5. Optionally, the gateway operator enables `relay` for that direct server so it can wake the phone.
