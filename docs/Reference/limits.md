---
title: Limits
excerpt: Timeouts, sizes, rates, and one-attempt rules the implementation enforces, with the setting that changes each one.
hidden: false
---

## Direct servers

| Limit | Value | Setting |
| --- | --- | --- |
| Pairing code lifetime | 600 s; a newer code voids unused ones | `PAIRING_TOKEN_TTL_SECONDS` 60–3600 (`SKR_STAKING_PAIRING_TOKEN_TTL_SECONDS`) |
| Paired phones | One per direct server; pairing again revokes the previous one | — |
| Pending requests per connection | 100 | `REQUEST_PENDING_LIMIT` 1–10000 (`SKR_STAKING_PENDING_LIMIT`) |
| Request lifetime | 86400 s | `REQUEST_TTL_SECONDS` 60–604800; `expires_in_seconds` 60–604800 per request |
| Prepared transaction validity | The blockhash window, roughly a minute or two; then prepare again | `last_valid_block_height` |
| `/mcp` body | 64 KiB, else 413 | — |
| Phone API request | 64 KiB, else `resource_exhausted` | — |
| Update stream message | 65,536 bytes; cursors and tokens 256 bytes | — |
| Update heartbeat | 15–60 s, default 30; three unanswered intervals close the stream | — |
| Message to sign, ack text | 1–4096 bytes | — |
| Agent note, outcome detail | 1024 UTF-8 bytes | — |
| Idempotency key | 1–128 characters from `A-Z a-z 0-9 . _ : -` | — |
| Device name at pairing | 128 UTF-8 bytes | — |
| FCM target | 1–4096 visible ASCII bytes | — |
| Relay handle | 1–256 visible ASCII bytes | — |
| `ListPending` page | 1–100, default 50 | — |
| Transfer assets | SOL and classic SPL tokens; a Token-2022 mint is refused | — |
| RPC call timeout | 10 s | `SOLANA_RPC_TIMEOUT_MS` 1000–20000 |

## Manifests and documents

| Limit | Value |
| --- | --- |
| Required plugins per manifest | 16 |
| Plugin ID | 128 bytes |
| Display name | 64 UTF-8 bytes |
| Proposal terms | 32; key 64 bytes; value 512 UTF-8 bytes |
| Publisher note | 1024 UTF-8 bytes |
| Revision | Positive, at most 2⁶³−1 |

## Feed gateway

| Limit | Default | Setting |
| --- | --- | --- |
| Request body | 64 KiB | — |
| Retention past expiry or withdrawal | 168 h | `BROADCAST_RETENTION_HOURS` 1–8760 |
| Held items per channel | 200; updates and withdrawals still allowed at the bound | `BROADCAST_MAX_PROPOSALS` 1–10000 |
| Read page | 1–200 | — |
| Reads per address | 20/s, burst 60 | `BROADCAST_READ_RATE`, `BROADCAST_READ_BURST` |
| Publications per publisher | 2/s, burst 20 | `BROADCAST_PUBLISH_RATE`, `BROADCAST_PUBLISH_BURST` |
| Rate-limit memory | 16384 callers; a full table refuses new ones | — |
| Stream ticket lifetime | 60 min | `BROADCAST_TICKET_MINUTES` 1–1440 |
| Channels per ticket or topic request | 32 | `BROADCAST_MAX_CHANNELS` 1–128 |
| Channels per `GetFeedStatus` | 32 (`MostStatusChannels`, fixed) | — |
| Heartbeat interval; presence window | 30 s; 3 × interval (90 s) | `BROADCAST_HEARTBEAT_SECONDS` 5–3600 |
| Push hints per topic | 0.1/s, burst 5; excess dropped | `BROADCAST_PUSH_RATE`, `BROADCAST_PUSH_BURST` |
| Push hint TTL | 300 s, one collapse key | — |
| Relay sends per server | 2/s, burst 20 | `BROADCAST_RELAY_SERVER_RATE`, `_BURST` |
| Relay wake-ups per device | 0.5/s, burst 5; excess answered `coalesced` | `BROADCAST_RELAY_DEVICE_RATE`, `_BURST` |
| Relay sends, whole deployment | 50/s, burst 200 | `BROADCAST_RELAY_GLOBAL_RATE`, `_BURST` |
| Relay enrolments per address | 1/s, burst 10 | `BROADCAST_RELAY_ENROLL_RATE`, `_BURST` |
| Relay body | 4 KiB | — |
| Relay binding; idle installation; unbound enrolment | 30 days; 60 days; 24 h | `BROADCAST_RELAY_BINDING_HOURS`, `_IDLE_HOURS`, `_UNBOUND_HOURS` |
| Admin session; login attempts | 60 min; 0.1/s, burst 5 | `BROADCAST_ADMIN_SESSION_MINUTES` 5–1440, `BROADCAST_ADMIN_LOGIN_RATE`, `_BURST` |
| Broker channels per connection; queue; recovery | 32; 64 KiB; 256 publications or 1 h, 300 replayed at most | `deploy/server/centrifugo.yaml` |

## Demos and the app

| Limit | Value |
| --- | --- |
| Demo `Idempotency-Key` | 1–200 printable characters |
| Demo publication timeout | 10 s (`PUBLISHER_PUBLISH_TIMEOUT_SECONDS` 1–120); retry doubles from 1 s to 1 min |
| New signals per hour | `PUBLISHER_CREATE_LIMIT`, 0 for unlimited |
| CopyTrading Go client timeout | 10 s unless you pass an `http.Client` |
| Jupiter keyless rate | 0.5 requests/s, 30/min |
| Prediction order floor | 5,000,000 base units of a six-decimal dollar token |
| Connection rename | 64 characters, local to the phone |
| Background sync interval | 15 minutes minimum, never a deadline |
| Presence poll while the app is open | One pass per gateway every 30 s, in batches of 32 channels |

One execution attempt per feed proposal per device, including a sandbox **Simulate**. One wallet interaction at a time. A retry of a creation call with the same key returns the original request; a new attempt is a new key.
