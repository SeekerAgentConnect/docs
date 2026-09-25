---
title: SKR staking
excerpt: A second direct MCP server lets an agent ask the owner to stake, unstake, cancel an unstake, or withdraw SKR. Mainnet only. The phone reads the program itself; the wallet signs.
hidden: false
---

`skr-staking-server/` is a standalone MCP server for one owner's SKR staking position: npm package `@seeker-vault/skr-staking-server`, executable `seeker-skr-staking-mcp`, Docker preset `deploy/skr-staking`. It is a **second, independent direct server** on the same [Direct Server SDK](/docs/direct-server-sdk): its own database, token, listener, pairing, and connection on the phone. Pairing the general MCP server does not pair this one, and revoking either leaves the other alone.

It builds unsigned transactions from fresh chain state. It never signs, never sends, holds no key, keeps no staking database of its own, and implements no staking contract: the program on chain is the only authority on shares, prices and cooldowns.

## Connecting

The server serves `/mcp` over Streamable HTTP on `SKR_STAKING_PORT` (8090 by default), authenticated with `SKR_STAKING_MCP_TOKEN`:

```json
{
  "mcpServers": {
    "skr-staking": {
      "type": "http",
      "url": "http://127.0.0.1:8090/mcp",
      "headers": { "Authorization": "Bearer ${SKR_STAKING_MCP_TOKEN}" }
    }
  }
}
```

Pair the phone once. From the agent, `skr_create_pairing_link` (no arguments) returns `pairing_uri`, `https_url`, `server_url`, `expires_at`, and `replaces` plus `warning` when a phone is already paired. From a shell on the host, `seeker-skr-staking-mcp pair` prints the same code as QR, deep link and HTTPS link; `pair status` and `pair revoke` work as on the general server. The HTTPS link is `https://<origin>/pair#<fragment>` on this server's own origin, `SKR_STAKING_PUBLIC_URL`, and the page says it is the staking server. Show the whole link: a shortened one is refused as damaged. Opening it pairs nothing; the owner confirms under **Add connection**.

Until a phone is paired and has published a wallet, the tools refuse with `NOT_PAIRED` or `WALLET_NOT_CONNECTED`.

## The six tools

| Tool | Input | What it does |
| --- | --- | --- |
| `get_staking_status` | none | Reads the position from the chain. Creates no request |
| `request_stake` | `amount`, `idempotency_key`, `note?`, `expires_in_seconds?` | Asks to stake SKR |
| `request_unstake` | the same | Asks to start unstaking. Starts a cooldown; moves nothing |
| `request_cancel_unstake` | `idempotency_key`, `note?`, `expires_in_seconds?` | Asks to put the whole pending unstake back to work |
| `request_withdraw` | the same | Asks to withdraw what a finished cooldown released |
| `skr_create_pairing_link` | none | Issues a one-use pairing code |

The wallet is never a parameter: it is the connection's own binding. `amount` is SKR base units as a decimal integer string; SKR has 6 decimals, so 1 SKR is `"1000000"`. Cancel and withdraw take no amount because the program acts on the whole pending unstake; an amount there is refused, not ignored.

`get_staking_status` returns `wallet`, `network`, `available_skr`, `staked_skr`, `shares`, `unstaking_skr`, `withdrawable`, `withdrawable_at`, `cooldown_seconds`, `minimum_stake_skr`, `share_price`, `sol_lamports`, `program`, `mint`, `stake_account`, `token_account`, and `display`, a one-sentence summary.

A creating tool returns the request, never an execution: `request_id`, `operation`, `status`, `terminal`, `wallet`, `network`, `amount` when there is one, timestamps, and once settled `signature`, `detail`, `confirmation`, `slot`, `chain_error`, `checked_at`, `checked_with`. Statuses run from `PENDING` to the terminal ones, including `UNKNOWN`, which is never retried. Call the same tool again with the same `idempotency_key` to follow a request to its end; a new key creates a new request.

## The four operations

| Operation | What the program does | Moves tokens? |
| --- | --- | --- |
| Stake | SKR leaves the wallet for the vault; shares are minted | Out |
| Unstake | Shares burn, their value is recorded, a cooldown starts | No |
| Cancel unstake | The whole pending amount goes back to work; the cooldown clears | No |
| Withdraw | The recorded amount is paid back into the wallet | In |

The cooldown is read from the program's configuration (48 hours today), never assumed. Unstaking again while a cooldown runs adds to the pending amount and **restarts** it; once the cooldown has finished the program refuses and so does the server: withdraw first. A withdrawal before the cooldown ends is refused, and `withdrawable_at` says when.

The chain is checked before the owner is asked: below the minimum stake, insufficient balance, nothing staked, nothing pending, cooldown not finished. An unreachable endpoint is `CHAIN_UNAVAILABLE` and creates nothing.

## Mainnet only

The staking program exists on mainnet-beta and nowhere else. `SKR_STAKING_RPC_URL` is required; the server compares genesis hashes at startup and refuses to start against any other cluster. A connection bound to devnet is refused with `INVALID_PARAMETERS` before anything is read.

## What the phone does

A request lands in **Inbox** like any other direct request. When the owner opens it, the phone reads the position from its own endpoint first, asks the server to prepare, and decodes the bytes itself: the fee payer and only signer are the connected wallet, the program and mint are the ones compiled into the app, the derived accounts match, the instruction is the named operation, the amounts match what was approved, and nothing else is in the transaction. Each operation has its own review and its own button (**Approve and stake**, **Approve and start unstaking**, **Approve and cancel unstaking**, **Approve and withdraw**). The owner's `staking` rule counts a stake as outgoing, a withdrawal as incoming, and the other two as moving nothing ([Rules](/docs/rules)). Only then does the wallet sign. See [Reviewing requests](/docs/reviewing-requests).

## Configuration

Every setting is prefixed `SKR_STAKING_`, so the two servers can share a host and one `.env`. `SKR_STAKING_MCP_TOKEN` and `SKR_STAKING_RPC_URL` are required; `SKR_STAKING_HOST`, `SKR_STAKING_PORT`, `SKR_STAKING_PUBLIC_URL`, `SKR_STAKING_ALLOWED_HOSTS`, `SKR_STAKING_DATA_DIR` (default `~/.seeker-agent-connect/skr-staking-server`), `SKR_STAKING_DATABASE_PATH`, the request and pairing lifetimes, and `SKR_STAKING_GUARDIAN` have defaults. Live updates: `SKR_STAKING_H2C=true` behind a TLS-terminating HTTP/2 platform, or `SKR_STAKING_UPDATE_PORT` on loopback, never both. Waking a backgrounded phone: `SKR_STAKING_RELAY_URL`, `SKR_STAKING_RELAY_SERVER_ID`, `SKR_STAKING_RELAY_CREDENTIAL`, all three or none ([Push relay](/docs/push-relay)). Full list: [Configuration](/docs/configuration).

```sh
cp deploy/skr-staking/.env.example deploy/skr-staking/.env   # fill in the two required values
docker compose --env-file deploy/skr-staking/.env -f deploy/skr-staking/compose.yaml up --build
```

## What is not here

No dashboard, no background monitoring, no withdrawal reminders, no shared staking feed, no automatic approval, and no sandbox: a direct connection is always production.
