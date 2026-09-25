---
title: SDK methods and API operations
excerpt: The TypeScript Direct Server SDK, the two MCP servers' tools, the gateway's Connect RPCs, the relay HTTP contract, the demos' operator API, and the CopyTrading Go client.
hidden: false
---

Nothing here is published yet: the three npm packages are private and installed from a packed tarball or the checkout, and the Go modules are used from a checkout or a copied directory, not a module proxy. There is no client-app SDK and no Go gateway SDK.

## Direct Server SDK (`server-sdk/`)

Package `@seeker-vault/server-sdk`, ESM, Node 24. Two exports only: `@seeker-vault/server-sdk` and `@seeker-vault/server-sdk/protocol` (the direct protobuf messages and service descriptors). No deep imports.

| Export | What it does |
| --- | --- |
| `openDirectServer(options)` | Opens and migrates the SQLite file. Requires `databasePath`, `publicOrigin`, `log`, and the request and pairing limits; optional providers, invalidation delivery, and `relay: { relayUrl, serverId, credential }`. Importing alone opens nothing |
| `server.requests` (`AgentRequests`) | Create, read, cancel, and observe requests; answer an idempotent retry; read the wallet binding; check an asset or a submitted transaction when providers were supplied |
| `server.pairing` | `issue()` a one-use code for the public origin, inspect the paired phone, revoke it |
| `server.phoneHandler(options)` | The phone Connect handler to mount in your own listener |
| `startPhoneApi(server, { host, port })` | A small listener helper with its own `close()` |
| `server.beginShutdown()`, `server.close()` | Cancel streams, drain queued invalidations, close SQLite; idempotent |
| `privateRequest`, `RequestFailure`, `isTerminal`, `verifySignature` | Build a request; the error carrying a `RequestError`; a terminal check; an Ed25519 check |

The SDK owns request identity, validation, idempotency, lifecycle, preparation versions, result verification, SQLite persistence, pairing, the one-phone rule, phone credentials, the direct manifest, the `Pairing`, `Request`, and `Update` services, and the pairing landing page. It has no API that approves, submits a phone result, publishes a wallet, signs, or broadcasts. The host owns MCP transport and tokens, process entry, TLS, Solana RPC, and Firebase. See [Direct Server SDK](/docs/direct-server-sdk).

## MCP server tools (`mcp-server/`)

`@seeker-vault/mcp-server`, executable `seeker-agent-connect-mcp`, Streamable HTTP at `/mcp` with `MCP_TOKEN` or an OAuth access token. Errors are `"<CODE>: <message>"`.

| Tool | Purpose |
| --- | --- |
| `vault_get_address` | The owner's published `wallet`, `network`, `bound_at` |
| `vault_get_capabilities` | `approval: "manual"`, `signing: "wallet"`, served `operations`, `wallet_connected`, limits |
| `vault_sign_message` | Create a sign-message request (`wallet`, `message`, `idempotency_key`) |
| `vault_transfer` | Create a SOL or classic SPL transfer; served only with `SOLANA_RPC_URL` |
| `vault_get_request` | The request as it is now; poll until `terminal` |
| `vault_cancel_request` | PENDING to CANCELLED |
| `vault_create_pairing_link` | `pairing_uri`, `https_url`, `server_url`, `expires_at`, optional `replaces` |
| `vault_display_command` | The Stage 1 live diagnostic; needs the phone's live-test screen |
| `vault_request_ack` | Wallet-free demo request; only with `MCP_DEMO_TOOLS=true` |

Details: [MCP adapter](/docs/mcp-adapter).

## SKR staking server tools (`skr-staking-server/`)

`@seeker-vault/skr-staking-server`, executable `seeker-skr-staking-mcp`, its own `/mcp` with `SKR_STAKING_MCP_TOKEN`, mainnet-beta only.

| Tool | Purpose |
| --- | --- |
| `get_staking_status` | Reads the connected wallet's SKR, stake, pending unstake, and withdrawal readiness; creates nothing |
| `request_stake` | Approval request to stake `amount` |
| `request_unstake` | Approval request to start unstaking `amount`; starts the cooldown |
| `request_cancel_unstake` | Approval request to cancel the whole pending unstake; no amount |
| `request_withdraw` | Approval request to withdraw what a finished cooldown released; no amount |
| `skr_create_pairing_link` | A one-use pairing code for this server: `https_url` and `pairing_uri` |

Details: [SKR staking](/docs/skr-staking).

## Feed gateway Connect RPCs (`feed-gateway/`)

Connect JSON paths are `/seekervault.gateway.v1.<Service>/<Method>`; errors carry `GatewayErrorDetail`.

**`FeedService`**, anonymous, read listener (default `127.0.0.1:8090`):

| RPC | Purpose |
| --- | --- |
| `GetServerManifest` | The publisher's manifest; `known_settings_revision` answers `unchanged` |
| `ListRequests` | A page of the channel's common requests with `snapshot_sequence` |
| `GetRequest` | One request by channel and ID |
| `ListProposals`, `GetProposal` | The protocol-1 compatibility views over the same rows |
| `GetStreamTicket` | A short-lived ticket admitting a listener to the named channels |
| `GetFeedTopics` | The push topic per channel; `no_push` when nothing relays |
| `GetFeedStatus` | `ONLINE` or `OFFLINE` per channel, at most 32 per call |

**`PublisherService`**, `Authorization: Bearer replace-with-publisher-credential`, publisher listener (default `127.0.0.1:8091`):

| RPC | Purpose |
| --- | --- |
| `PublishManifest` | Register or replace the feed manifest |
| `PublishRequest` | Create or update one request (feed audience, `SIGNAL`, `DEVICE_LOCAL`) |
| `CancelRequest` | Withdraw by request ID and a higher revision |
| `PublishProposal`, `CancelProposal` | The compatibility adapters over the same rows |
| `Heartbeat` | Check in; answers `interval_seconds`. Any authenticated call also counts |

Every answer is `PUBLISH_STATUS_STORED` or `PUBLISH_STATUS_UNCHANGED`; the revision is the idempotency key. See [Public feed walkthrough](/docs/public-feed-walkthrough).

## Relay HTTP contract (`<gateway>/relay/v1`)

JSON over HTTP; `"version": "1"` in every body; bodies at most 4 KiB; unknown fields refused.

| Method and path | Listener and credential | Purpose |
| --- | --- | --- |
| `POST /relay/v1/installations` | Read; none, rate-limited per address | Enrol a device: `target` in; `installation`, `secret`, `binding_seconds` out |
| `GET`, `DELETE /relay/v1/installations/{installation}` | Read; installation secret | Reconcile (`has_target`, bindings held); forget the installation |
| `POST /relay/v1/installations/{installation}/target` | Read; installation secret | Replace the FCM registration |
| `POST /relay/v1/installations/{installation}/bindings` | Read; installation secret | Authorize `server` for `connection`; returns `binding`, `handle`, `expires` |
| `DELETE /relay/v1/installations/{installation}/bindings/{binding}` | Read; installation secret | Revoke one binding |
| `POST /relay/v1/notify` | Publisher; relay credential | `{ "handle", "hint": "created" \| "updated" }`; answers `202 accepted` or `200 coalesced` |

The phone calls the installation routes; a direct server calls only `notify`, and the SDK does that for it. See [Push relay](/docs/push-relay).

## Demo operator API (`demo-copytrading/`, `demo-prediction/`)

Plain JSON on each demo's own listener (`PUBLISHER_API_ADDRESS`, default `127.0.0.1:8092`; Compose maps CopyTrading to 8092 and Prediction to 8094), with `PUBLISHER_API_TOKEN` as the bearer on everything but `/healthz`.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/healthz` | Process up, nothing else |
| `GET` | `/v1/status` | Identity, gateway, environment, pending count |
| `GET` | `/v1/manifest` | The manifest and the `seekervault://feed` reference |
| `POST` | `/v1/requests` | Create; requires `Idempotency-Key` |
| `GET` | `/v1/requests`, `/v1/requests/{id}` | List newest first; one with its publication state |
| `PUT` | `/v1/requests/{id}` | Replace the whole statement |
| `POST` | `/v1/requests/{id}/cancel`, `/v1/requests/{id}/retry` | Withdraw; retry a refused publication |
| `GET` | `/v1/discovery` | Prediction only: filters, last cycle, tracked markets |
| `POST` | `/v1/discovery/poll` | Prediction only: run a cycle now; `409` while one runs |

`/v1/signals` remains a compatibility alias. The Prediction demo answers `403 written_by_discovery` to create, update, and cancel. The `/trader` admin UI and `publishctl` are clients of this API. See [Examples](/docs/examples).

## CopyTrading Go client (`demo-copytrading/sdk/`)

Package `sdk` in module `github.com/BrRenat/SeekerAgentWallet/demo-copytrading` (the module path predates the rename). `New(Options{ URL, Token, HTTP })` returns a `*Client` with a 10-second timeout unless you pass an `http.Client`; `Client.CreateRequest(ctx, CreateRequest{ IdempotencyKey, ExpiresAt, Description, Parameters })` sends `POST /v1/requests` and returns `{ request, publication, idempotent }` or an `*sdk.Error{ Status, Body }`. It knows no wallet, approval, store, or plugin. `publisher-support/` is the library the two demos share, not a public SDK.
