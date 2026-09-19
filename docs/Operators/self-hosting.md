---
title: Self-host the owner sidecar
excerpt: Run the private sidecar the phone pairs with. This is not the shared feed gateway.
hidden: false
---

This page is for the **owner** of one paired phone. For feeds and invitations, see [Shared gateway](/docs/shared-gateway).

## Local Compose

From a [SeekerAgentWallet](https://github.com/BrRenat/SeekerAgentWallet) checkout:

```sh
cd gateway
cp .env.example .env
openssl rand -hex 32   # MCP_TOKEN
openssl rand -hex 32   # PHONE_TOKEN
docker compose up -d --build
docker compose ps
curl -fsS http://127.0.0.1:8080/healthz
docker compose exec sidecar node sidecar/dist/pairing/cli.js
```

Needs Docker Engine 24+ and Compose v2.

Default `GATEWAY_PORT` is **8080** on the host. The sidecar itself is not published; Caddy in the compose network proxies to it.

Persistence: volume `sidecar-data` → `/data/sidecar.db`. `docker compose down` keeps it. `down -v` wipes pairing, requests, and (on the public overlay) certificates.

## Without Docker

```sh
cp .env.example .env
pnpm dev:sidecar
pnpm pair
```

See [Direct sidecar and MCP](/docs/direct-sidecar-walkthrough).

## After the first start

Pair the phone, connect the wallet, optionally point Hermes at `/mcp`. Operating tasks — logs, credential rotation, re-pairing, updates, backups — are in [Updates and backups](/docs/updates-and-backups).

The HTTP/1.1 Caddy in this stack does **not** carry `UpdateService.Subscribe`. Foreground live updates on a public host need the [direct sidecar reverse proxy](/docs/direct-sidecar-proxy).
