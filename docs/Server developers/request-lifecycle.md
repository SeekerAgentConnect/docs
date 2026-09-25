---
title: Request lifecycle
excerpt: One versioned envelope for direct requests and feed signals. Direct results return to your server; feed decisions never leave the phone.
hidden: false
---

`seekervault.request.v2.Request` is the source-authored half of work shown to an owner. The same envelope carries a private request and a public signal. Audience and result policy say which adapter carries it.

The envelope has **no** field for an owner answer, selected wallet, decision, prepared bytes, signature, execution outcome, subscriber, credential, code, or URL.

## Eight parts

| Part | Meaning |
| --- | --- |
| `contract_version` | This release writes and executes version 1 only |
| `identity` | `source_id`, source-owned `scope`, stable `request_id` |
| `lifecycle` | Ordered `revision`, status, timestamps, absolute `expires_at` |
| `presentation` | Unverified title and description; category `REQUEST` or `SIGNAL` |
| `action` | `capability_id`, `capability_version`, `plugin_id`, typed parameters |
| `owner_inputs` | Declarations of controls compiled into the app, never answers |
| `audience` | Private recipient **or** public feed channel |
| `result_handling` | `RETURN_TO_ORIGIN` (direct) or `DEVICE_LOCAL` (required for a feed) |

## Two adapters

| Adapter | How a request is created | Result |
| --- | --- | --- |
| Direct server | `requests.createRequest(privateRequest(…))` in the [SDK](/docs/direct-server-sdk), or an MCP tool on the MCP server | `RETURN_TO_ORIGIN`: the phone calls `PrepareRequest` and `SubmitResult` on your server |
| Public feed | `PublisherService.PublishRequest`, or the demos' `POST /v1/requests` | `DEVICE_LOCAL`: nothing comes back, and there is no endpoint that could take it |

Primary APIs: gateway `PublishRequest` / `CancelRequest`, `FeedService.ListRequests` / `GetRequest`, demo `POST /v1/requests`. Compatibility over the same rows: `PublishProposal` / `CancelProposal`, `ListProposals` / `GetProposal`, `/v1/signals`.

## Direct lifecycle

A request belongs to the one paired connection for good; with no phone paired, creation fails `NOT_PAIRED`. Every creation carries an `idempotency_key`: the same key with the same action returns the original, a different action is `IDEMPOTENCY_CONFLICT`. `expires_in_seconds` is 60 to 604800.

| State | Terminal | Meaning |
| --- | --- | --- |
| `PENDING` | No | Waiting for the owner until `expires_at` |
| `PROCESSING` | No | Approved; the phone is asking the wallet |
| `SUBMITTED` | No | The wallet sent the transaction; not yet confirmed |
| `CONFIRMED` | Yes | The transaction succeeded on chain |
| `COMPLETED` | Yes | Acknowledged, or the message was signed |
| `REJECTED` | Yes | Rejected in the app or declined in the wallet |
| `CANCELLED` | Yes | Withdrawn by the server, or the connection was revoked |
| `EXPIRED` | Yes | `expires_at` passed while PENDING |
| `FAILED` | Yes | The wallet failed, the chain failed, or the blockhash expired before it landed |
| `UNKNOWN` | No | Outcome not known. **Never retry it** — a transfer may already have reached the network |

Only a `PENDING` request can be cancelled. Revoking the connection cancels its PENDING requests; approved ones are still resolved. Approval is the commit point: it names the exact prepared version and content hash the owner reviewed, and an older version is `STALE_PREPARATION`.

**Confirmation of a submitted transaction** happens when somebody asks — the server has no background worker. The SDK's confirmation provider (the MCP server's `SOLANA_RPC_URL`) checks the endpoint's genesis hash against the request's network, reads the signature's status, and compares the transaction on chain with the approved bytes. A missing status is never proof: a request goes to `FAILED` only when the chain reports an error, or when the approved blockhash window has closed and a ledger search still finds nothing. Nothing replaces a transaction. Without a provider, nothing is confirmed.

**Staking** is the fifth action kind: `StakingAction { wallet, network, operation, amount }` with `STAKING_OPERATION_STAKE`, `UNSTAKE`, `CANCEL_UNSTAKE`, `WITHDRAW`. `amount` is required for stake and unstake and empty for the other two. Mainnet-beta only; the phone reads the staking program itself and verifies the prepared bytes. See [SKR staking](/docs/skr-staking).

## Feed lifecycle

**Revisions.** The revision is the idempotency key. The same revision with identical content answers `PUBLISH_STATUS_UNCHANGED` and notifies nobody; the held revision with different content is `revision_conflict`; a lower one is `stale_revision`. Retry the same revision and content until you learn the outcome. Never invent a higher revision because a response was lost.

**Expiry** is absolute and lives in the document. The gateway serves an expired item until retention sweeps it (`BROADCAST_RETENTION_HOURS`, a week by default, past its own expiry); the phone derives "expired" from the clock when it looks.

**Withdrawal** is a new revision with a cancelled status, not a deletion. It is final for that identity: propose something else as a new request ID. A record of an execution that already happened stays as it is.

**Retries.** Transport failures and `unavailable` / `internal` are retried with backoff. Fix `unauthenticated`, `permission_denied`, `invalid_argument`, and `failed_precondition` first. The demos keep a durable outbox: a publication the gateway could not take is stored and retried, and `POST /v1/requests/{id}/retry` clears a permanent refusal by hand.

**Demo API.** Create with `Idempotency-Key`: same key and body → 200 idempotent replay; same key, different body → 409 `key_reused`. `PUT /v1/requests/{id}` replaces the whole statement, and the revision moves only if content changed. `POST /v1/requests/{id}/cancel` withdraws. Status codes: **201** published, **202** stored and pending, **502** refused by the gateway, **200** unchanged. The demo mints the request ID, channel, operation, plugin, and environment; a body naming one is a 400. Prediction writes from discovery: create, update, and cancel answer `403 written_by_discovery`.

**Presence.** The gateway never contacts a publisher, so a publisher checks in: every authenticated `PublisherService` call counts, and `Heartbeat` exists for one with nothing to publish. Phones call `FeedService.GetFeedStatus` (at most 32 channels per call) and get `ONLINE` or `OFFLINE` per channel within a window of 3 × `BROADCAST_HEARTBEAT_SECONDS` (default 30 s, so 90 s). An offline feed stays readable: the row stays Connected and reads "Feed offline · N pending". An unreadable status is unknown, never online.

## Execution invariants

- Sandbox stops at simulation and never asks a wallet to sign or send.
- Production always requires manual approval, then the wallet.
- An approval is for the exact revision and prepared bytes the owner reviewed.
- Unknown versions, missing plugins, unreadable bytes, and unresolved lookup tables block signing. None falls back to a blind signature.
- An uncertain submission is not retried as a failure.
