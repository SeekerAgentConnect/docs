---
title: Errors
excerpt: Gateway problem codes, template JSON errors, and agent-facing sidecar failures.
hidden: false
---

## Private invitation and binding

| Code | Meaning |
| --- | --- |
| `INVITATION_EXPIRED` | Create a new invitation |
| `INVITATION_USED` | Already redeemed; poll by ID |
| `INVALID_INVITATION` | Unknown, revoked, or malformed |
| `NO_BINDING` | Named connection missing, revoked, or belongs to another user/server |
| `RESULT_CONFLICT` | A terminal outcome already stands |
| `REQUEST_SETTLED` | Source request is no longer open |

## Manifest / publication

| Code | Meaning |
| --- | --- |
| `other_server` / `bad_server_id` | Manifest identity mismatch |
| `other_endpoint` / `bad_endpoint` | Origin mismatch |
| `other_mode` / `no_mode` | Mode missing or would change |
| `foreign_channel` | Channel is not `server/<this id>` |
| `stale_revision` / `changed_without_revision` | Revision rules |
| `other_environment` | Environment set cannot change |
| `bad_plugin` / `duplicate_plugin` / `too_many_plugins` | Plugin list |

## Template JSON

| `error` | Meaning |
| --- | --- |
| `bad_request` | Unknown field (including `amount` on a signal) |
| `unknown_term` | Term this kind does not know |
| `key_reused` | Idempotency key reused with a different body |
| `written_by_discovery` | Prediction template refuses caller writes |
| `401` | Same answer for every auth failure |

Publication: `"publication":"refused"` with the gateway problem code; retry with `POST /v1/requests/{id}/retry` only when the cause is transient.

## Sidecar / MCP

Common agent-facing codes include `WALLET_NOT_CONNECTED`, `STALE_PREPARATION`, `OFFLINE`, `BUSY`, `TIMEOUT`, and request lifecycle failures (`EXPIRED`, `CANCELLED`, `FAILED`). `UNKNOWN` after a send is not a retry signal.

## Phone copy

Pairing, invitation, and feed failures are mapped to owner-facing sentences on **Add connection**. Manifest problems are shown as support states, not as a crash.
