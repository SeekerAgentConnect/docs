---
title: Request contract
excerpt: The direct ActionRequest and its five action kinds, the request lifecycle, the common v2 envelope, and the Connect services a paired phone calls.
hidden: false
---

Two protobuf packages under `proto/seekervault/request/` describe a request:

| Package | Used by | What it is |
| --- | --- | --- |
| `seekervault.request.v1` | Direct servers and the phone | `ActionRequest`: one proposed action, its state, and its outcome |
| `seekervault.request.v2` | The feed gateway; direct adapters expose the same shape | `Request`: the source-authored envelope every subscriber reads |

## `ActionRequest` (direct)

```text
message ActionRequest {
  RequestRef ref = 1;            // connection_id + request_id, both UUIDs the server assigns
  Action action = 2;             // exactly one kind; never changes after storage
  string agent_note = 3;         // unverified display text, at most 1024 UTF-8 bytes
  RequestState state = 4;
  google.protobuf.Timestamp created_at = 5;
  google.protobuf.Timestamp expires_at = 6;   // bounds the owner's decision while PENDING
  google.protobuf.Timestamp updated_at = 7;
  Outcome outcome = 8;           // approval, signature, detail, chain confirmation
}
```

A request ID is unique only within its connection, so every reference carries both IDs.

### Action kinds

| `Action.kind` | Fields | Succeeds as |
| --- | --- | --- |
| `ack` | `text` (1–4096 bytes; development and demo only) | `COMPLETED` |
| `sign_message` | `wallet`, and `text` or `data` (1–4096 bytes, signed exactly as sent) | `COMPLETED`, with the signature |
| `transfer` | `wallet`, `network`, `recipient`, `asset`, `amount` | `CONFIRMED` |
| `swap` | `wallet`, `network`, `input_asset`, `output_asset` (different), `input_amount`, `slippage_bps` (1–10000) | `CONFIRMED` |
| `staking` | `wallet`, `network`, `operation`, `amount` | `CONFIRMED` |

- **Amounts are decimal integer strings in base units**: `1` to `18446744073709551615`, no sign, point, exponent, or leading zeros.
- **`Asset`** is `native_sol` or a `token_mint` (base58). Never implied.
- **`Network`** is `NETWORK_MAINNET`, `NETWORK_DEVNET`, or `NETWORK_TESTNET`. The phone signs only with the request's wallet on the request's network.

### `StakingAction`

```text
message StakingAction {
  string wallet = 1;
  Network network = 2;              // mainnet only: the staking program exists nowhere else
  StakingOperation operation = 3;
  string amount = 4;                // SKR base units
}
```

| `StakingOperation` | What it does | `amount` |
| --- | --- | --- |
| `STAKING_OPERATION_STAKE` | Moves SKR from the wallet into the stake vault | Required |
| `STAKING_OPERATION_UNSTAKE` | Burns shares and starts the cooldown; nothing moves | Required (at or above the position's value unstakes all of it) |
| `STAKING_OPERATION_CANCEL_UNSTAKE` | Puts the whole pending unstake back to work | Must be empty |
| `STAKING_OPERATION_WITHDRAW` | Pays out what a finished cooldown released | Must be empty |

An amount on cancel or withdraw is refused, not ignored. The message names no program, mint, pool, vault, or stake account: the phone verifies prepared bytes against the deployment compiled into it. See [SKR staking](/docs/skr-staking).

### Lifecycle

`RequestState` is the execution state only; the phone's policy assessment never moves a request.

| State | Terminal | Meaning |
| --- | --- | --- |
| `PENDING` | No | Stored, waiting for the owner until `expires_at` |
| `PROCESSING` | No | Approved; the phone is invoking the wallet |
| `SUBMITTED` | No | The wallet sent the transaction; awaiting confirmation |
| `CONFIRMED` | Yes | Succeeded on chain (transfer, swap, staking) |
| `COMPLETED` | Yes | Success without a transaction (ack, sign_message) |
| `REJECTED` | Yes | Rejected in the app or declined in the wallet |
| `CANCELLED` | Yes | Withdrawn before approval by the agent, or by revocation |
| `EXPIRED` | Yes | `expires_at` passed while PENDING |
| `FAILED` | Yes | The wallet failed, the transaction failed, or it never landed |
| `UNKNOWN` | No | Whether the wallet signed or sent is not known yet. Never retry it as a failure |

No state moves backward. Approval is the commit point: the phone reports `Approval { prepared_version, content_hash }` before opening the wallet, and opens it only if the server accepts. Expiry is applied before any other operation. The transition table is in [Request lifecycle](/docs/request-lifecycle).

## `Request` (common envelope, v2)

`Request` has eight parts: `contract_version` (1), `identity` (`source_id`, `scope`, `request_id`), `lifecycle` (`revision`, `status`, `created_at`, `updated_at`, `expires_at`), `presentation` (`title`, `description`, `REQUEST` or `SIGNAL`), `action` (`ActionCapability { capability_id, capability_version, plugin_id, parameters }`), `owner_inputs`, `audience` (`private { recipient_id }` or `feed { channel }`), and `result_handling`.

- `RequestStatus` is `OPEN` or `CANCELLED` for a feed. The direct statuses (`PROCESSING` … `UNKNOWN`) exist for direct adapters; a feed adapter refuses them.
- A parameter `Value` is a named `text`, `integer` (decimal string), `flag`, or `opaque`. An `OwnerInput` declares `key`, `label`, `kind` (`AMOUNT`, `COUNT`, `CHOICE`), `required`, bounds, `options`, and `help`; never the owner's answer.
- `RESULT_MODE_DEVICE_LOCAL` is required for a feed audience. `RESULT_MODE_RETURN_TO_ORIGIN` is a direct concept: the authenticated direct adapter returns decisions to the server that asked. The gateway accepts only a feed audience with `DEVICE_LOCAL` and exposes no endpoint that takes a result.
- `plugin_id` is a compatibility claim (`jupiter.swap`, `jupiter.prediction`), never a way to load code. `capability_id` names the action (`swap`, `prediction.buy`; `prediction` is accepted).

There is no field for a wallet, an owner's answer, a decision, prepared bytes, a signature, or a subscriber.

## Phone-facing services (direct)

Every call carries the phone credential as a bearer, except `Pair`, which carries the pairing token; every ID must name the caller's own connection. Errors carry a `RequestErrorDetail`; see [Errors](/docs/errors).

| Service | RPC | What it does |
| --- | --- | --- |
| `PairingService` | `Pair` | Exchanges a one-use pairing token for `connection_id`, `phone_token`, `server_id`, and an optional `UpdateCapability` |
| | `GetConnectionCapabilities` | `updates: UpdateCapability { protocol_version, grpc_url }` and `relay: RelayCapability { protocol_version, relay_url, server_id }`, each absent when not configured |
| | `GetServerManifest` | The direct server's own manifest; an older server answers `unimplemented` |
| | `SetFcmToken` | Registers a direct FCM target (`token`) or clears it (`clear_if_token`); 1–4096 visible ASCII bytes |
| | `SetRelayHandle` | Registers the gateway relay handle (`handle`) or clears it (`clear_if_handle`); 1–256 visible ASCII bytes. Never stored as an FCM target |
| | `RevokeConnection` | Ends the connection; PENDING requests become `CANCELLED` |
| `RequestService` | `ListPending` | PENDING requests, oldest first; `page_size` 1–100, default 50 |
| | `GetRequest` | One request in any state |
| | `PrepareRequest` | A fresh unsigned `PreparedTransaction`; each call is a new version |
| | `SubmitResult` | One of `acknowledgement`, `rejection`, `approval`, `message_signature`, `transaction_submission`, `execution_failure`, `unknown_outcome` |
| | `CheckStatus` | Asks the RPC endpoint about a submitted transaction; reaches no wallet |
| | `PublishWallet` | Tells the server the owner's selected `WalletBinding { wallet, network }`; absent clears it |
| `UpdateService` | `Subscribe` | Bidirectional gRPC over HTTP/2; events `ready`, `request_changed`, `request_removed`, `revoked`, `sync_required`, `heartbeat`, `replay_complete` |
| | `Sync` | A frozen, paginated snapshot of PENDING and named nonterminal requests |

`UpdateCapability.grpc_url` must share the paired host; `RelayCapability.relay_url` is honoured only when it equals the relay origin the app build was configured with. See [Push relay](/docs/push-relay).
