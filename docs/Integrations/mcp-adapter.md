---
title: MCP adapter
excerpt: MCP is an optional adapter on the owner sidecar. Public publishers and private gateway servers do not speak MCP.
hidden: false
---

The Node sidecar in `sidecar/` serves pairing, the phone API, durable requests, and optional live updates **whether or not** MCP is on. MCP is one adapter over that core.

A deployment that has never heard of `MCP_ENABLED` keeps the previous behavior: `/mcp` is served, tool names and contracts are unchanged.

## Two different servers

| | Owner sidecar | Publisher templates |
| --- | --- | --- |
| Who it is for | The owner’s own agents | A developer’s audience |
| How a request arrives | MCP tool on `/mcp` | Publish to the shared gateway |
| Needs MCP? | Only if `MCP_ENABLED` is on | **No** |
| Connection mode | `direct` | `gateway_feed` (or private via the SDK, still not MCP) |

A phone can hold a direct sidecar and a feed at the same time. A private request is never converted into a broadcast one.

## Turning MCP off

```sh
MCP_ENABLED=false pnpm dev:sidecar
```

- `/mcp` and OAuth metadata paths answer **404**, not 401.
- Leftover `MCP_TOKEN`, `MCP_ALLOWED_HOSTS`, and `MCP_DEMO_TOOLS` are ignored (named in the startup log).
- `MCP_OAUTH_*` with the adapter off is a configuration error.
- A typo such as `MCP_ENABLED=off` leaves the adapter **on**.

With MCP off, this sidecar has no other request source: the inbox stays empty unless you add a later adapter. Pairing, the phone API, updates, and stored identity still work.

## Tools

| Tool | When it is served |
| --- | --- |
| `vault_get_capabilities` | MCP on |
| `vault_get_address` | MCP on |
| `vault_sign_message` | MCP on |
| `vault_get_request` / `vault_cancel_request` | MCP on |
| `vault_transfer` | `SOLANA_RPC_URL` set |
| `vault_request_ack` | `MCP_DEMO_TOOLS=true` |
| `vault_display_command` | Live diagnostic; not queued |

There is **no** executable `vault_swap` MCP tool. Swaps run through the phone plugin on feed and private-gateway requests.

Agents send `Authorization: Bearer <MCP_TOKEN>` (or an OAuth access token when that profile is on). The MCP token never opens `RequestService`. The phone credential never opens `/mcp`.

## Result polling

Create a durable request → receive `request_id` and `PENDING` immediately → the owner acts on the phone → poll `vault_get_request` until `terminal: true`.

Do not treat `SUBMITTED` as success. Never retry `UNKNOWN`.

## What this is not

- Not a replacement protocol for publishers.
- Not a plugin marketplace.
- Not a migration of private agent traffic onto the shared gateway.
- Not a client-app SDK.

Complete pairing and a first signature: [Direct sidecar and MCP](/docs/direct-sidecar-walkthrough).
