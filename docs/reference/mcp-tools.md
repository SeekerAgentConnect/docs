---
title: MCP tools
description: "Every tool of the general SAC MCP server and the SKR Staking MCP server, with parameters, answers and request states."
slug: /mcp-tools
sidebar_position: 2
---

Setup is in the guides: [General SAC MCP server](/docs/mcp-quickstart) and [SKR Staking MCP server](/docs/skr-staking-server). This page is the exact surface.

Every tool answers at once. A creating tool stores a request in `PENDING`: stored, not seen, not approved. `SUBMITTED` is not success. Never retry a request in `UNKNOWN`: the transaction may already be on chain. States are on [Protocol](/docs/protocol#lifecycle).

## General SAC MCP server {#general-server}

| Tool | What it does | Parameters |
| --- | --- | --- |
| `vault_get_capabilities` | What this server serves and its limits. Always answers | None |
| `vault_get_address` | The wallet and network the owner connected, and when | None |
| `vault_sign_message` | Asks the owner to sign a UTF-8 text message | `wallet`, `message` (at most 4096 bytes), `idempotency_key`, optional `note`, `expires_in_seconds` |
| `vault_transfer` | Asks the owner to send SOL or a classic SPL token. Served only with `SOLANA_RPC_URL`; Token-2022 and NFTs are refused | `wallet`, `network`, `recipient`, `amount` (base units, string), optional `token_mint`, `idempotency_key`, optional `note`, `expires_in_seconds` |
| `vault_get_request` | Reads a request and its result; for a sent transfer, also checks the chain | `request_id` |
| `vault_cancel_request` | Withdraws a request that is still `PENDING`; otherwise `INVALID_STATE` | `request_id` |
| `vault_create_pairing_link` | A one-use pairing link: `https_url`, `pairing_uri`, `server_url`, `expires_at`, and `replaces` and `warning` when a phone is already paired | None |
| `vault_request_ack` | A wallet-free acknowledgement. Development only, served with `MCP_DEMO_TOOLS=true` | `text`, `idempotency_key`, optional `note`, `expires_in_seconds` |
| `vault_display_command` | A live diagnostic: shows text while the app is open and waits for **OK** | `text` |

There is no swap or staking tool on this server. Swaps and prediction orders come through feeds; staking has its own server below. The network is the one the owner's wallet is connected on; the server never chooses one.

## SKR Staking MCP server {#skr-staking-server}

| Tool | What it does | Parameters |
| --- | --- | --- |
| `get_staking_status` | Reads the position from the chain: available, staked, unstaking, withdrawable, cooldown, minimum stake. Creates nothing | None |
| `request_stake` | Asks the owner to stake `amount` | `amount`, `idempotency_key`, optional `note`, `expires_in_seconds` |
| `request_unstake` | Asks to start unstaking `amount`. Starts or restarts the cooldown; moves nothing yet | `amount`, `idempotency_key`, optional `note`, `expires_in_seconds` |
| `request_cancel_unstake` | Asks to put the whole pending unstake back | `idempotency_key`, optional `note`, `expires_in_seconds` |
| `request_withdraw` | Asks to withdraw what a finished cooldown released | `idempotency_key`, optional `note`, `expires_in_seconds` |
| `skr_create_pairing_link` | The pairing link for this server | None |

`amount` is SKR base units as a decimal integer string; SKR has six decimals, so 1 SKR is `"1000000"`. The wallet is never a parameter. There is no get or cancel tool: call the same creating tool again with the same `idempotency_key` and parameters to read the request as it stands now. A settled request carries `signature`, `detail` and, once the chain was read, `confirmation`, `slot`, `chain_error`, `checked_at` and `checked_with`. Mainnet-beta only.

## Shared rules {#shared-rules}

- `idempotency_key`: 1 to 128 characters from `A–Z a–z 0–9 . _ : -`. The same key returns the same request, so a retry never creates two. A new key creates a new request.
- `note`: at most 1024 bytes. The owner sees it apart from the verified details, marked as not verified.
- `expires_in_seconds`: 60 to 604800. The default is a day (`REQUEST_TTL_SECONDS`).

Error codes are on [Errors and limits](/docs/errors-and-limits#request-errors).
