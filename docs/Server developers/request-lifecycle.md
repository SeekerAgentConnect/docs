---
title: Request lifecycle
excerpt: One versioned envelope for private requests and feed signals. Current request APIs are primary; proposal and /v1/signals routes are compatibility.
hidden: false
---

`seekervault.request.v2.Request` is the source-authored half of work shown to an owner. The same envelope is used for a private request and a public signal. Audience and result policy say which adapter carries it.

The envelope has **no** field for an owner answer, selected wallet, decision, prepared bytes, signature, execution outcome, subscriber, credential, code, or URL.

## Eight parts

| Part | Meaning |
| --- | --- |
| `contract_version` | This release writes and executes version 1 only |
| `identity` | `source_id`, source-owned `scope`, stable `request_id` |
| `lifecycle` | Ordered `revision`, source status, timestamps, absolute `expires_at` |
| `presentation` | Unverified title and description; category `REQUEST` or `SIGNAL` |
| `action` | Versioned capability, plugin compatibility claim, typed source parameters |
| `owner_inputs` | Declarations of controls compiled into the app, never answers |
| `audience` | Private recipient **or** public feed channel |
| `result_handling` | `DEVICE_LOCAL` (required for a feed) or `RETURN_TO_ORIGIN` (private) |

## Adapters

| Adapter | How a request is created | Result |
| --- | --- | --- |
| Direct sidecar | MCP tools / sidecar store | `RETURN_TO_ORIGIN` via `PrepareRequest` / `SubmitResult` |
| Public publisher | `POST /v1/requests` or `sdk.Client.CreateRequest` | `DEVICE_LOCAL` |
| Gateway private | `sdk.Gateway.SendRequest` | `RETURN_TO_ORIGIN` through the authenticated gateway |

Android normalizes all three into one Home carousel and one review dispatcher. Existing connections and records migrate in place.

## Primary versus compatibility

| Primary | Compatibility (same rows, not a second workflow) |
| --- | --- |
| Gateway `PublishRequest` / `CancelRequest` | Stage 7.1 proposal RPCs |
| `FeedService.ListRequests` / `GetRequest` | Older proposal read RPCs |
| Template `POST /v1/requests` | `/v1/signals` |
| `sdk.Client.CreateRequest` | Older proposal-shaped JSON |

New integrations use the request APIs.

## Feed template lifecycle

1. Create with `Idempotency-Key`. Same key and body → idempotent 200. Same key, different body → 409 `key_reused`.
2. Update with `PUT /v1/requests/{id}` replaces the whole statement. Revision increases only if content changed.
3. Cancel with `POST /v1/requests/{id}/cancel` publishes a cancelled revision.
4. `expires_at` is absolute. Phones derive expiry from the clock when they look.
5. `POST /v1/requests/{id}/retry` retries gateway publication, not authorship.

The template mints the request ID, channel, operation, plugin, and environment. Callers cannot set those fields.

CopyTrading is writable. Prediction writes from discovery; create/update/cancel are `403 written_by_discovery`.

## Private lifecycle

`SendRequest` pins `(server, user_ref, connection_id)`. Identical revision and content is a no-op. A content change at the same revision is a conflict. `CancelRequest` requires the current revision.

Device-reported statuses include `REJECTED`, `SUBMITTED`, `SIMULATED`, `FAILED`, and `UNKNOWN`. A second terminal result is `RESULT_CONFLICT`.

## Direct sidecar statuses (agent-facing)

`PENDING` and `PROCESSING` mean wait. `SUBMITTED` is not success — poll again. `CONFIRMED` / `COMPLETED` are terminal success. `UNKNOWN` must **never** be retried (a transfer may already have reached the network). `REJECTED`, `EXPIRED`, `CANCELLED`, and `FAILED` are terminal; do not invent a replacement transaction.

## Execution invariants

- Sandbox stops at simulation and never asks a wallet to sign or send.
- Production always requires manual approval, then the wallet.
- An approval is for the exact revision and prepared bytes the owner reviewed.
- Unknown versions, missing plugins, unreadable bytes, and unresolved lookup tables block signing. None falls back to a blind signature.
- One execution attempt is recorded before a wallet opens.
