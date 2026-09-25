---
title: MCP adapter
excerpt: The self-hosted MCP server is one direct server built on the Direct Server SDK. MCP is its agent adapter, not the phone's contract, and not how publishers reach the app.
hidden: false
---

`mcp-server/` is the self-hosted server for one owner, one paired phone, and that owner's agents. It ships as the npm package `@seeker-vault/mcp-server` (executable `seeker-agent-connect-mcp`) and as a Docker image built from the checkout; neither is published to a registry yet. It embeds the [Direct Server SDK](/docs/direct-server-sdk), which owns pairing, the request lifecycle, storage, and the phone API. MCP is the adapter on top: an agent calls a tool on `/mcp`, and the SDK turns it into a request the owner answers on the phone.

The server holds no key, cannot approve a request, and never signs.

## Two legs, two credentials

| Leg | Endpoint | Credential |
| --- | --- | --- |
| Agent | `/mcp`, MCP Streamable HTTP with sessions | `Authorization: Bearer` with `MCP_TOKEN`, or an OAuth access token when `MCP_OAUTH_ISSUER` is set |
| Phone | The Connect phone API at `SIDECAR_PUBLIC_URL` | The credential pairing issued to that phone |

The MCP token never opens the phone API, and the phone credential never opens `/mcp`. An agent reaching `127.0.0.1` says nothing about whether a phone can: the phone needs the origin in `SIDECAR_PUBLIC_URL`, over trusted HTTPS off loopback, with HTTP/2 end to end for live updates.

MCP is **not** the phone-to-server contract. The phone speaks the Connect protocol from `proto/`. A direct server written on the SDK needs no MCP at all, and public publishers never speak it. `MCP_ENABLED=false` removes `/mcp` (404, not 401) and leaves pairing, the phone API and updates exactly as they are.

## Tools

| Tool | What it does |
| --- | --- |
| `vault_get_capabilities` | What this server serves: `approval: manual`, `signing: wallet`, `operations`, `wallet_connected`, the limits, and `confirmed_with` when a chain endpoint is set. Never fails |
| `vault_get_address` | The wallet and network the owner connected. `NOT_PAIRED` or `WALLET_NOT_CONNECTED` otherwise; it never invents an address |
| `vault_sign_message` | Queues a text message for the owner's wallet to sign. Returns `PENDING` at once |
| `vault_transfer` | Queues a SOL or classic SPL transfer, amount in base units. Served only with `SOLANA_RPC_URL` |
| `vault_get_request` | Reads a request by `request_id`; for a `SUBMITTED` transfer it asks the chain |
| `vault_cancel_request` | Withdraws a `PENDING` request |
| `vault_create_pairing_link` | Issues a one-use pairing code and returns `pairing_uri` and `https_url` |
| `vault_display_command` | Live diagnostic for the app's live-test screen. Not queued: it fails `OFFLINE` when nobody is watching |
| `vault_request_ack` | Wallet-free acknowledgement. Demo only, served with `MCP_DEMO_TOOLS=true` |

There is no swap, prediction or staking tool on this server. Swaps and predictions arrive over public feeds and run on the phone; a direct-mode swap request is not executable. Staking has [its own server](/docs/skr-staking).

Every durable tool answers at once. `PENDING` means stored: not seen, not approved. Poll `vault_get_request` until `terminal` is true. Do not treat `SUBMITTED` as success, and never retry `UNKNOWN`. The same `idempotency_key` with the same parameters returns the same request; different parameters under a used key are `IDEMPOTENCY_CONFLICT`.

## The pairing link

`vault_create_pairing_link` takes no input and returns:

| Field | Meaning |
| --- | --- |
| `https_url` | `https://<origin>/pair#<fragment>`, a page this server serves at `/pair`. Its button opens the app |
| `pairing_uri` | The `seekervault://pair?…` deep link: the copy-and-paste fallback under **Add connection** |
| `server_url`, `expires_at` | The origin the phone will call, and when the code stops working |
| `replaces`, `warning` | Present when a phone is already paired. Show the warning next to the link |

Show the whole `https_url` and the whole `pairing_uri`. A label such as "Connect your phone" is fine when the link target is the entire string. Do not shorten, wrap, escape, or replace any part with `...`: the page refuses a damaged fragment rather than pairing something else. The token travels in the fragment, so it is not in the request the server logs, but the link is still a secret. Opening the page pairs nothing; the owner confirms on the phone. A newer code voids an unused one, and issuing one disconnects nobody.

## Configuration in brief

| Setting | Meaning |
| --- | --- |
| `MCP_TOKEN` | Agent bearer token, at least 32 characters; must differ from `PHONE_TOKEN` |
| `MCP_ALLOWED_HOSTS` | Extra Host and Origin names `/mcp` accepts besides loopback, without scheme or port. The hostname of `SIDECAR_PUBLIC_URL` is allowed implicitly |
| `MCP_OAUTH_ISSUER` | Validate access tokens from an external authorization server instead ([Claude](/docs/claude)) |
| `SOLANA_RPC_URL` | Adds `vault_transfer` and on-chain confirmation |
| `MCP_DEMO_TOOLS` | Adds `vault_request_ack` |
| `MCP_SERVER_DATA_DIR` | Data home for source and npm runs, default `~/.seeker-agent-connect/mcp-server` |
| `DATABASE_PATH` | The SQLite file, default `direct-server.db` under the data directory. Docker pins `/data/sidecar.db` |

The database holds the server ID, the pairing credential, requests, results, the wallet binding, and update state. One running server owns a database; a second launch against the same file is refused. Full reference: [Configuration](/docs/configuration).

## What this is not

- Not the phone's protocol, and not something a publisher needs.
- Not a plugin marketplace or a runtime extension point.
- Not a way to approve anything. An agent can only ask.

Run it end to end: [Direct MCP server walkthrough](/docs/direct-sidecar-walkthrough). Clients: [Hermes](/docs/hermes), [OpenClaw](/docs/openclaw), [Claude](/docs/claude).
