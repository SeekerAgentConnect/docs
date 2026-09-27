---
title: Errors and limits
description: "The codes an agent or a publisher will actually meet, and the bounds behind them."
slug: /errors-and-limits
sidebar_position: 4
---

## Request errors (MCP servers and SDK) {#request-errors}

| Code | Meaning |
| --- | --- |
| `NOT_PAIRED` | No phone is paired |
| `WALLET_NOT_CONNECTED` | The owner has no wallet connected |
| `WALLET_MISMATCH` | The wallet or network is not the one the owner connected |
| `INVALID_PARAMETERS` | A field is missing or out of range; on the staking server, also a non-mainnet wallet |
| `IDEMPOTENCY_CONFLICT` | The key was used before with different parameters |
| `PENDING_LIMIT` | Too many requests are waiting |
| `INVALID_STATE` | The request is not in a state that allows this, for example cancelling one that is not pending |
| `NOT_FOUND` | No such request |
| `CHAIN_UNAVAILABLE` | No RPC endpoint, or it did not answer. Retry |
| `UNAUTHENTICATED` | Wrong, missing, or revoked credential |

`UNKNOWN` is a request state, not an error. It means the outcome is not known, and it must never be retried as a failure.

## Gateway refusals (feed servers) {#gateway-refusals}

| Problem | Meaning |
| --- | --- |
| `unauthenticated` | Wrong, missing, or revoked credential. One answer for all three |
| `other_server`, `foreign_channel` | Not your server ID or channel |
| `stale_revision`, `revision_conflict` | Your revision is behind; read `heldRevision` |
| `other_gateway`, `other_environment` | The manifest names another gateway, or changes the environment set |
| `unknown field` | The schema is strict; an `amount` on a signal is refused |
| `too_many_requests` | Slow down; the next publish is the retry |
| `too_many_proposals` | Withdraw some signals first |

## Restricted feeds {#restricted-feeds}

The gateway's access problems, numbered 47 to 54:

| Problem | Meaning |
| --- | --- |
| `ACCESS_REQUIRED` | Restricted, and no session, or one this gateway does not hold for that channel |
| `ACCESS_REVOKED` | The publisher revoked it. Final for that session |
| `ACCESS_EXPIRED` | The grant ran out without renewal. The same grant renewed works again |
| `ACCESS_MISMATCH` | A manifest claims a policy or origin the feed is not registered with. Usually `PUBLISHER_AUTH_ORIGIN` does not match the registered authentication origin exactly |
| `NOT_RESTRICTED` | A grant call from a publisher whose feed is registered Public, or a per-device push target set on a Public channel |
| `NO_SUCH_GRANT` | A grant this publisher does not hold |
| `GRANT_REVOKED` | A renewal of a grant the gateway already revoked. Final |
| `BAD_GRANT` | A grant with a malformed ID, reference, digest or lifetime |

The publisher library's own guard refuses to publish with `access_unconfirmed` until the gateway confirms the feed is Restricted at its origin. Signals wait in the publisher's database until then.

The publisher's `/access/v1` answers `{"error": "<code>", "detail": "…"}`:

| Code | Status | Meaning |
| --- | --- | --- |
| `unknown_feed` | 404 | This server decides access to another feed |
| `bad_wallet`, `bad_device_key`, `bad_label` | 400 | Not a Solana address, or a malformed device key or label |
| `unknown_challenge` | 404 | No challenge of that attempt was issued |
| `challenge_used` | 409 | Already answered. A failed verification spends it too |
| `challenge_expired` | 410 | Ask for another |
| `bad_signature` | 401 | The wallet's or the device key's signature did not verify |
| `stale_proof` | 401 | The signed moment is too far from the server's clock. Check the phone's clock |
| `unknown_request`, `unknown_invitation` | 404 | No such request, or no such invitation for this device |
| `invitation_used`, `invitation_superseded` | 409 | Already redeemed, or replaced by a reissue |
| `invitation_expired` | 410 | Reissue it |
| `not_approved` | 403 | This device is not approved, including one revoked before it redeemed |
| `wrong_state` | 409 | Not allowed in this state, for example reissuing for a device that is not approved |
| `too_many_requests` | 429 | Slow down |

Relay calls answer `401` for a bad credential, `403` for a handle that does not authorize this server, `429` for rate, and `503` when the gateway cannot send right now. None of them fails a request.

## Limits {#limits}

| Limit | Value |
| --- | --- |
| Pairing link lifetime | 10 minutes; a newer link voids the old one |
| Paired phones per direct server | One |
| Pending requests per server | 100 |
| Request lifetime | 24 hours by default, 1 minute to 7 days per request |
| Message to sign | 4096 bytes |
| Agent note | 1024 bytes |
| Required plugins per manifest | 16 |
| Signals held per feed | 200; withdrawals still allowed at the bound |
| Publish rate per feed server | 2 per second, bursts of 20 |
| Heartbeat interval; offline after | 30 seconds by default, as the heartbeat answer states; three missed intervals |
| Gateway retention after a signal ends | 7 days by default |
| Signal terms | 32 per signal, each value at most 512 bytes; publisher note at most 1024 bytes |
| Publisher call body | 64 KiB |
| Relay wake-ups per phone | One every two seconds; extra ones are merged |
| Prediction order minimum | Five dollars of the stake token |
| Swap or prediction preparation | Good for about a minute, then prepare again |
| Restricted feed: access grant | 6 hours by default (`PUBLISHER_ACCESS_GRANT_HOURS`, 1 to 720), renewed when a third is left |
| Restricted feed: longest grant the gateway honours | 24 hours by default; `DescribeAccess` reports it as `most_grant_seconds` |
| Restricted feed: access after the publisher loses the gateway | At most one grant lifetime for an approved device, at most what is left of its grant for a revoked one |
| Restricted feed: invitation | Single use, bound to one device, 5 minutes by default (`PUBLISHER_ACCESS_INVITATION_MINUTES`, 1 to 60) |
| Restricted feed: wallet challenge | Single use, 5 minutes |
| Restricted feed: clock skew on a signed step | 5 minutes |
| Restricted feed: challenges per client IP address | 60 per hour by default (`PUBLISHER_ACCESS_CHALLENGES_PER_HOUR`); status checks and redemptions get twenty times that |
| Restricted feed: device label | 64 printable bytes; a claim, never checked |
| Restricted feed: request body | 16 KiB |

The MCP servers' own bounds (`REQUEST_TTL_SECONDS`, `REQUEST_PENDING_LIMIT`, `PAIRING_TOKEN_TTL_SECONDS`, and their `SKR_STAKING_` equivalents) and a Restricted feed server's (`PUBLISHER_ACCESS_*`) are your configuration; the source repository's READMEs list every one. The gateway's bounds are set by the SAC team.
