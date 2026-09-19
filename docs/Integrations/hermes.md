---
title: Hermes
excerpt: Point Hermes at the owner sidecar’s /mcp endpoint with a bearer token. Hermes is not an approval surface.
hidden: false
---

Hermes Agent talks to the sidecar as an MCP client. The owner still reviews every durable request in SAC and confirms in Seed Vault Wallet.

This path has been exercised against a sidecar with a bearer token. Driving Hermes through the packaged Docker stack is not recorded as run.

## Setup

1. Sidecar up, phone paired, wallet connected. You need `MCP_TOKEN`, not `PHONE_TOKEN`.
2. Merge the `seeker_vault` MCP server from `examples/hermes.config.yaml` in the wallet repository into `~/.hermes/config.yaml`. Do not replace the whole file.
3. Put the token only in `~/.hermes/.env`:

```sh
printf 'MCP_SEEKER_VAULT_API_KEY=%s\n' "$MCP_TOKEN" >> ~/.hermes/.env
chmod 600 ~/.hermes/.env
```

4. Local URL: `http://127.0.0.1:8080/mcp`. Use a long tool timeout (the example uses 90 seconds).
5. Check with `hermes mcp list` / `hermes mcp test seeker_vault`. Reload MCP after config changes.

Treat the token like a password. Do not expose plain HTTP on the public internet.

## What to allow

Durable tools: `vault_get_capabilities`, `vault_get_address`, `vault_sign_message`, `vault_get_request`, `vault_cancel_request`, and `vault_transfer` when the sidecar serves it.

`vault_display_command` is live-only: if nobody is watching the live-test screen, it fails `OFFLINE` and is not delivered later. `vault_request_ack` needs `MCP_DEMO_TOOLS=true`.

Hosted example `examples/hermes.config.hosted.yaml` points at `https://vault.example.com/mcp` and omits the live diagnostic and demo ack. Keep OAuth **off** when using a static bearer token.

## Remote Hermes

- SSH reverse tunnel: `-R 127.0.0.1:18080:127.0.0.1:8080`, then Hermes URL `http://127.0.0.1:18080/mcp`.
- Existing VPN: set `MCP_ALLOWED_HOSTS` to the sidecar’s VPN address.

## How to judge a round trip

The model saying it is “done” is not the tool result. Count a pass only when the phone shows the request, the tool JSON shows a terminal status, and the sidecar log agrees.

Statuses: wait on `PENDING` / `PROCESSING`; poll through `SUBMITTED`; never retry `UNKNOWN`.
