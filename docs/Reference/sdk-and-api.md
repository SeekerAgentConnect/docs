---
title: SDK methods and API operations
excerpt: Template REST, Go SDK, and gateway Connect RPCs. No client-app SDK and no invented REST mirrors.
hidden: false
---

## Template REST (CopyTrading)

Base URL is **your** template, default `http://127.0.0.1:8092`. Auth: `Authorization: Bearer <PUBLISHER_API_TOKEN>` except `/healthz`.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/healthz` | Process up |
| `GET` | `/v1/status` | Identity, environment, writable flag |
| `GET` | `/v1/manifest` | Manifest and feed reference |
| `POST` | `/v1/requests` | Create; requires `Idempotency-Key` |
| `GET` | `/v1/requests` | List, newest first |
| `GET` | `/v1/requests/{id}` | One request + publication state |
| `PUT` | `/v1/requests/{id}` | Replace statement |
| `POST` | `/v1/requests/{id}/cancel` | Withdraw |
| `POST` | `/v1/requests/{id}/retry` | Retry gateway publication |

`/v1/signals` is a compatibility alias.

Prediction: create/update/cancel → `403 written_by_discovery`. Extra: `GET /v1/discovery`, `POST /v1/discovery/poll`.

## Go SDK

`github.com/BrRenat/SeekerAgentWallet/publisher/sdk`

- `New` / `Client.CreateRequest` → template `POST /v1/requests`
- `NewGateway` / `PublishServerManifest`, `CreateInvitation`, `Invitation`, `WaitForConnection`, `RevokeInvitation`, `SendRequest`, `Request`, `CancelRequest`, `RevokeConnection`

Details: [Go Server SDK](/docs/go-sdk).

## Gateway Connect RPCs (selected)

**PublisherService** (publisher credential): `PublishManifest`, `PublishRequest`, `CancelRequest`, `CreateInvitation`, `GetInvitation`, `RevokeInvitation`, `CreatePrivateRequest`, `GetPrivateRequest`, `CancelPrivateRequest`, `RevokePrivateConnection`.

**FeedService** (anonymous): `GetServerManifest`, `ListRequests`, `GetRequest`, plus stream ticket helpers.

**InvitationService / DeviceService** (invitation token, then device credential): `ResolveInvitation`, `RedeemInvitation`, list/get private requests, submit declared results.

Proposal RPCs remain compatibility adapters.

## Sidecar (direct)

Phone credential: `PairingService`, `RequestService` (`ListPending`, `GetRequest`, `PrepareRequest`, `SubmitResult`), `UpdateService` (`Subscribe`, `Sync`).

MCP token: `/mcp` tools listed in [MCP adapter](/docs/mcp-adapter).

`PHONE_TOKEN` opens only the Stage 1 live diagnostic, not durable requests.
