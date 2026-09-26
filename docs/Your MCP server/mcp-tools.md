---
title: Tools, and the SKR staking server
excerpt: The nine tools of the MCP server, and the second server that manages one owner's SKR staking position.
hidden: false
---

Every tool answers at once. `PENDING` means stored, not seen and not approved. Poll `vault_get_request` until `terminal` is true. `SUBMITTED` is not success. Never retry a request in `UNKNOWN`: the transaction may already be on chain.

## MCP server

| Tool | What it does |
| --- | --- |
| `vault_get_capabilities` | What this server serves and its limits. Always answers |
| `vault_get_address` | The wallet and network the owner connected |
| `vault_sign_message` | Asks the owner to sign a text message |
| `vault_transfer` | Asks the owner to send SOL or an SPL token. Needs `SOLANA_RPC_URL` |
| `vault_get_request` | Reads a request and its result |
| `vault_cancel_request` | Withdraws a request that is still `PENDING` |
| `vault_create_pairing_link` | A one-use link for the owner to pair the phone (`https_url`, `pairing_uri`) |
| `vault_request_ack` | A wallet-free acknowledgement. Development only, with `MCP_DEMO_TOOLS=true` |
| `vault_display_command` | A live diagnostic for the app's test screen |

There is no swap or staking tool on this server. Swaps and prediction orders come through feeds; staking has its own server below.

Every creating tool takes an `idempotency_key`. The same key returns the same request, so a retry never creates two.

## The SKR staking server

A second, independent server for one owner's SKR staking position. Same kind of connection, its own pairing, its own token, its own database. Pairing it does not touch the general server. It builds unsigned transactions from the chain and never signs. SKR staking exists on **mainnet-beta only**; the server refuses any other cluster at startup.

Run it from the same checkout:

```sh
# in .env: SKR_STAKING_MCP_TOKEN and SKR_STAKING_RPC_URL (a mainnet endpoint)
pnpm --filter @seeker-vault/skr-staking-server run dev     # /mcp on port 8090
```

Or with Docker: `deploy/skr-staking`. Pair the phone the same way, through the agent: `skr_create_pairing_link`. Wake-ups through the gateway use `SKR_STAKING_RELAY_URL`, `SKR_STAKING_RELAY_SERVER_ID`, `SKR_STAKING_RELAY_CREDENTIAL`.

| Tool | What it does |
| --- | --- |
| `get_staking_status` | Reads the position: staked, unstaking, withdrawable, cooldown. Creates nothing |
| `request_stake` | Asks the owner to stake `amount` |
| `request_unstake` | Asks to start unstaking `amount`. Starts the cooldown; moves nothing yet |
| `request_cancel_unstake` | Asks to put the whole pending unstake back. No amount |
| `request_withdraw` | Asks to withdraw what a finished cooldown released. No amount |
| `skr_create_pairing_link` | The pairing link for this server |

`amount` is SKR base units as a string; SKR has six decimals, so one SKR is `"1000000"`. The wallet is never a parameter: it is the one the owner connected. The cooldown is read from the chain each time. On the phone each operation has its own review and its own button, and the phone verifies the transaction against the staking program itself before the wallet opens.
