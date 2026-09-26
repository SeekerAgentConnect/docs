---
title: Errors and limits
excerpt: The codes an agent or a publisher will actually meet, and the bounds behind them.
hidden: false
---

## Request errors (MCP server and SDK)

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

## Gateway refusals (feed servers)

| Problem | Meaning |
| --- | --- |
| `unauthenticated` | Wrong, missing, or revoked credential. One answer for all three |
| `other_server`, `foreign_channel` | Not your server ID or channel |
| `stale_revision`, `revision_conflict` | Your revision is behind; read `heldRevision` |
| `other_gateway`, `other_environment` | The manifest names another gateway, or changes the environment set |
| `unknown field` | The schema is strict; an `amount` on a signal is refused |
| `too_many_requests` | Slow down; the next publish is the retry |
| `too_many_proposals` | Withdraw some signals first |

Relay calls answer `401` for a bad credential, `403` for a handle that does not authorize this server, `429` for rate, and `503` when the gateway cannot send right now. None of them fails a request.

## Limits

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
| Heartbeat interval; offline after | 30 seconds; 90 seconds without a check-in |
| Relay wake-ups per phone | One every two seconds; extra ones are merged |
| Prediction order minimum | Five dollars of the stake token |
| Swap or prediction preparation | Good for about a minute, then prepare again |

The MCP server's own bounds (`REQUEST_TTL_SECONDS`, `REQUEST_PENDING_LIMIT`, `PAIRING_TOKEN_TTL_SECONDS`) and the gateway's (`BROADCAST_*`) are configuration; the repository READMEs list every one.
