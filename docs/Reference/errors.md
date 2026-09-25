---
title: Errors
excerpt: Request-level failure codes, gateway problems, relay refusals, provider and staking refusals, MCP tool errors, demo API errors, and the pairing page's two refusals.
hidden: false
---

## Request errors (direct)

`RequestError` in `request/v1/request.proto` names every failure on both sides. An MCP tool error is `isError: true` with text `"<CODE>: <message>"`; a phone RPC error carries a `RequestErrorDetail` with the code and, for `INVALID_STATE` and `STALE_PREPARATION`, the request as it is now.

| Code | When | Agent | Phone |
| --- | --- | --- | --- |
| `INVALID_PARAMETERS` | A field is missing, malformed, or out of range; a signature does not verify | Tool error | `invalid_argument` |
| `IDEMPOTENCY_CONFLICT` | The key was used with different parameters; nothing created | Tool error | — |
| `NOT_FOUND` | No such request for the caller, including another connection's | Tool error | `not_found` |
| `NOT_PAIRED` | No phone is paired | Tool error | — |
| `WALLET_MISMATCH` | The wallet or network is not the connection's current binding | Tool error | — |
| `PENDING_LIMIT` | The connection is at `REQUEST_PENDING_LIMIT` | Tool error | — |
| `INVALID_STATE` | The state does not allow the operation | Tool error | `failed_precondition` |
| `STALE_PREPARATION` | The approval names an old version, a different hash, or an expiring blockhash | — | `failed_precondition` |
| `UNAUTHENTICATED` | Missing, wrong, revoked, or other-role credential; used or expired pairing token | HTTP 401 | `unauthenticated` |
| `WALLET_NOT_CONNECTED` | The owner has no wallet connected | Tool error | — |
| `CHAIN_UNAVAILABLE` | No RPC endpoint, or it did not answer; nothing created or prepared; retry | Tool error | `unavailable` |

`UNKNOWN` is a request state, not an error: it means the outcome is not known yet, and an agent must not retry it as a failure. The Stage 1 live diagnostic keeps its own codes (`OFFLINE`, `BUSY`, `TIMEOUT`, `CANCELLED`, `INVALID_TEXT`). The update stream fails with `UPDATE_ERROR_PROTOCOL_UNSUPPORTED` or `UPDATE_ERROR_SNAPSHOT_INVALID`, and asks for a full sync with a `SyncRequired` reason.

### Staking-specific refusals

- A connection bound to devnet or testnet is refused with `INVALID_PARAMETERS` before anything is read; the server itself refuses to start against an endpoint whose genesis hash is not mainnet-beta's.
- An `amount` on `request_cancel_unstake` or `request_withdraw` is refused.
- Unstaking again after the cooldown finished is refused by name, because the program answers `WithdrawRequired`: withdraw first. Withdrawing before the cooldown ends is refused too.
- Below the minimum stake, insufficient balance, nothing staked, or nothing pending are checked against the chain before the owner is asked.

## Gateway problems

Every `FeedService` and `PublisherService` error carries `GatewayErrorDetail { problem, field, held_revision }`. The message is the lowercase problem word; refused values are never echoed.

| Connect code | Problems |
| --- | --- |
| `unauthenticated` | `unauthenticated` (one answer for missing, unknown, revoked, or wrong-capability) |
| `permission_denied` | `other_server`, `foreign_channel` |
| `invalid_argument` | `bad_id`, `bad_revision`, `not_a_feed`, `other_gateway`, `other_protocol`, `bad_plugin`, `duplicate_plugin`, `too_many_plugins`, `bad_environment`, `bad_name`, `bad_operation`, `no_status`, `bad_times`, `bad_note`, `bad_value`, `duplicate_value`, `too_many_values`, `cancel_on_publish`, `bad_cursor`, `bad_page_size`, `too_many_channels` |
| `failed_precondition` | `stale_revision`, `revision_conflict` (with `held_revision`), `cancelled`, `too_many_proposals`, `other_environment` |
| `not_found` | `no_such_server`, `no_such_proposal` |
| `resource_exhausted` | `too_many_requests` |
| `unimplemented` | `no_stream`, `no_push` (this deployment has no broker or no relay; not a failure) |

Values 35–46 and their names (invitations, bindings, private requests, results) are reserved and never sent. Retry only transport failures, `unavailable`, `internal`, and `too_many_requests`; fix everything else before retrying.

## Relay refusals (`/relay/v1`)

| HTTP | Problem text | Meaning |
| --- | --- | --- |
| 400 | `that request could not be read`, `this relay speaks version 1` | Malformed body, unknown field, or wrong version |
| 401 | `that credential was not accepted` | Unknown, revoked, or wrong-kind credential |
| 403 | `that handle does not authorize this server`, `that server may not be sent to through this relay` | Fabricated, revoked, expired, or someone else's handle; relay capability off |
| 404 | `that installation was not found` | The gateway lost or forgot the enrolment; the phone enrols again |
| 429 | `too many requests` | Back off; the next committed update is the retry |
| 503 | `the relay cannot send right now` | Outage, rejected target, or no Firebase credential yet; retryable |

A `202 accepted` means Firebase took the message, not that a phone was woken. Nothing here fails a request.

## Execution provider refusals (phone)

`ProviderRegistry.resolve` refuses before anything is prepared, in this order: `no_provider`, `contract_unsupported`, `action_unsupported`, `schema_unsupported`, `network_unsupported` (the wallet's cluster), `environment_unsupported` (the connection's promise), `asset_unsupported`. An eighth, `name_mismatch`, is answered when a legacy plugin name (`jupiter.prediction`) contradicts the action asked for. Manifest refusals (`ManifestProblem`) and support states are on [Manifest contract](/docs/manifest-contract); none of them crashes, and an unsupported request stays readable and rejectable.

## Demo API errors

JSON with `error`, an optional `term`, and a `detail`: `bad_request` (unknown field, including `amount`), `unknown_term`, `missing`, `bad_expiry`, `not_json`, `key_reused`, `cancelled`, `no_such_signal`, `written_by_discovery` (Prediction refuses caller writes, 403), and one 401 for every authentication failure. A refused publication is reported as `"publication":"refused"` with the gateway problem; `POST /v1/requests/{id}/retry` only when the cause was transient.

## Pairing page and app copy

The HTTPS pairing page refuses two things and pairs nothing either way: a truncated fragment ("This pairing link is damaged or incomplete. Ask your agent for a new one.") and a code for another origin ("This pairing code is for a different server. This page will not open it."). In the app, a used, expired, or replaced code, a code for a different address, an untrusted certificate, an unreachable server, and a plain-HTTP address are each named on **Add connection**; a retired gateway invitation is explained and offers a fresh direct pairing. See [User troubleshooting](/docs/user-troubleshooting).
