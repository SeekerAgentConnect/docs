---
title: Limits
excerpt: Timeouts, sizes, rates, and one-attempt rules that the implementation actually enforces.
hidden: false
---

| Limit | Value |
| --- | --- |
| Pairing code lifetime | About 10 minutes; newer code replaces it |
| Invitation lifetime | Default 15 minutes; allowed 1 minute–24 hours |
| Direct sidecar phones | One paired phone per sidecar |
| Pending requests per sidecar | `REQUEST_PENDING_LIMIT` default 100 |
| Default request TTL | `REQUEST_TTL_SECONDS` default 86400 |
| MCP body | 64 KiB |
| Signal / request JSON | 64 KiB; note ≤ 1024 bytes; ≤ 32 terms; term value ≤ 512 bytes |
| Manifest plugins | 16 |
| Manifest display name | 64 UTF-8 bytes |
| Connection rename | 64 characters, local |
| Quote / preparation freshness | About 1 minute |
| Jupiter keyless rate | About 0.5 rps / 30 rpm |
| WorkManager interval | 15 minutes minimum, eventual |
| FCM invalidation TTL | 5 minutes, collapsed |
| Gateway retention | `BROADCAST_RETENTION_HOURS`, default one week past expiry |
| Prediction minimum stake | Provider five-dollar floor |
| Transfer tokens | SOL and classic SPL; not Token-2022, not NFTs |
| SDK HTTP timeout | 10 seconds unless you pass a client |

One execution attempt per feed proposal per device, including sandbox **Simulate**. One wallet interaction at a time. One pairing phone at a time per sidecar. Extra private devices are extra invitations, never a silent replace.
