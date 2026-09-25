---
title: Authentication roles
excerpt: One credential per boundary. Pairing, publishing, relaying, and reading a feed each use a different secret, and none of them selects a wallet or signs.
hidden: false
---

There are no device credentials and no invitation tokens: the private gateway mode that used them was retired, and its routes answer 404. What remains is one credential per boundary.

## Direct server (MCP server, SKR staking server, or your own on the SDK)

| Boundary | Credential | Issued by | Stored as |
| --- | --- | --- | --- |
| Agent → `/mcp` | `MCP_TOKEN` (`SKR_STAKING_MCP_TOKEN` on the staking server), or an OAuth access token when `MCP_OAUTH_ISSUER` is set | The operator; the operator's authorization server | The value in the environment; a token is validated and discarded |
| Phone → `PairingService.Pair` | One-use pairing token, 32 random bytes, in the `seekervault://pair` code and the `/pair#…` fragment | `pnpm pair`, `vault_create_pairing_link`, `skr_create_pairing_link` | SHA-256 hash, with its URL and expiry |
| Phone → `RequestService`, `UpdateService`, authenticated `PairingService` calls | Phone credential (`phone_token`), returned once by `Pair` | The direct server, at pairing | SHA-256 hash; the phone keeps the value in platform-backed secure storage |
| Live-test screen → `LiveCommandService` | `PHONE_TOKEN` (Stage 1 diagnostic only) | The operator | The value in the environment |
| Anyone → `GET /healthz`, `GET /pair` | None | | |

An access token must carry `aud` equal to `MCP_OAUTH_RESOURCE`, `iss` equal to the issuer, an asymmetric signature, and any `MCP_OAUTH_SCOPE`. It opens `/mcp` and nothing else, and is never passed on.

Agents cannot prepare, approve, submit a result, publish a wallet, register a push target, or revoke a phone. The MCP token is refused on every phone RPC; phone credentials are refused on `/mcp`. Pairing again revokes the previous phone: one paired phone per direct server.

## Feed gateway

| Boundary | Credential | Notes |
| --- | --- | --- |
| Publisher backend → `PublisherService` | Publisher credential, issued per capability (`feed-gatewayctl register --for publish`, or the admin page) | 32 random bytes as `Authorization: Bearer replace-with-publisher-credential`; stored as SHA-256; shown once. Rotate, then revoke |
| Direct server → `POST /relay/v1/notify` | Relay credential (`--for relay`) | A separate capability and column. A relay credential is refused on the publisher API, and a publishing credential on the relay |
| Phone → `/relay/v1/installations…` | Installation secret, minted once at enrolment | Proves ownership of the device's registration; the gateway keeps only its hash |
| Phone → direct server (`SetRelayHandle`) | Binding handle, issued per connection by the gateway | Useless without that server's relay credential; never stored as an FCM target |
| Phone → Centrifugo stream | Stream ticket from `FeedService.GetStreamTicket` | Names channels, not a person; expires (60 minutes by default); never recorded |
| Phone → `FeedService` | None | Reads are anonymous; the gateway never learns a subscriber's decision |
| Operator → admin page | Password hashed into `BROADCAST_ADMIN_PASSWORD_HASH` (`feed-gatewayctl password`) | The page exists only when the hash is set; sessions are in-process cookies |

An unauthenticated call gets one answer whether the credential is missing, unknown, revoked, or for the other capability.

## Demo publishers

| Boundary | Credential |
| --- | --- |
| Strategy or `publishctl` → the demo's `/v1` API | `PUBLISHER_API_TOKEN` (or `PUBLISHER_API_TOKEN_FILE`). It is the whole grant to publish as that source, and not a gateway or phone credential |
| Demo → the gateway | `BROADCAST_CREDENTIAL` (or `_FILE`), the publisher credential above |
| Person → `/trader` admin UI | `ADMIN_PASSWORDS`, the body of a bcrypt password file (or `ADMIN_PASSWORDS_FILE`), plus `ADMIN_SESSION_SECRET`. The UI is a client of the same token-protected API |

## What connecting never grants

Pairing, adding a feed, authorizing a relay binding, and opening a pairing link do not select a wallet, approve a request, open the wallet, or sign. Seed Vault Wallet signs; SAC and every server hold no key. See [Roles](/docs/roles) and [Connection modes](/docs/connection-modes).
