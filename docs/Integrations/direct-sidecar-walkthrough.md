---
title: Direct MCP server walkthrough
excerpt: Run the self-hosted MCP server, pair the phone, send a request from an agent, review it on the phone, and read the result. Connecting still does not sign.
hidden: false
---

This walkthrough uses **direct** mode: the phone holds a credential the server issued at pairing, and an agent talks to `/mcp`. A direct connection is always production.

## Prerequisites

- Node.js **24.21.0** and pnpm **12.3.4** for a source or tarball start; Docker Engine with Compose v2 for the image.
- A checkout of the app repository.
- The app on the phone, and Seed Vault Wallet with an account ([Wallet setup](/docs/wallet-setup)).
- Two different secrets of at least 32 characters: `openssl rand -hex 32`, twice.

## 1. Start the server

Three supported starts run the same application with the same kind of state.

**From source**

```sh
pnpm install --frozen-lockfile
cp .env.example .env                         # replace MCP_TOKEN and PHONE_TOKEN
pnpm dev:mcp-server
curl --fail http://127.0.0.1:8080/healthz    # {"status":"ok"}
```

State lives in `~/.seeker-agent-connect/mcp-server/direct-server.db`.

**Packed tarball** (the package is not on npm)

```sh
pnpm run build
mkdir -p artifacts && npm pack --json --pack-destination ./artifacts ./mcp-server/package
npm install --global --prefix "$HOME/.local/seeker-agent-connect-mcp" \
  "$PWD/artifacts/seeker-vault-mcp-server-0.1.0.tgz"
mkdir -p "$HOME/.seeker-agent-connect/mcp-server"
cp mcp-server/.env.example "$HOME/.seeker-agent-connect/mcp-server/config.env"   # then edit it
"$HOME/.local/seeker-agent-connect-mcp/bin/seeker-agent-connect-mcp" start
```

`seeker-agent-connect-mcp start` is a long-running HTTP server, not an MCP stdio child. Never put it in an agent's `command` field.

**Docker** (`deploy/mcp`)

```sh
docker build -f mcp-server/Dockerfile -t seeker-agent-connect/mcp-server:local .
cp deploy/mcp/.env.example deploy/mcp/.env   # replace the tokens
docker compose --env-file deploy/mcp/.env -f deploy/mcp/compose.yaml up -d --build
curl --fail http://127.0.0.1:8080/healthz
```

The container is published on host loopback only and keeps `/data/sidecar.db` in a named volume.

## 2. Pair the phone

Issue a one-use code. It works once, for ten minutes:

```sh
pnpm pair                                                        # source
"$HOME/.local/seeker-agent-connect-mcp/bin/seeker-agent-connect-mcp" pair   # tarball
docker compose --env-file deploy/mcp/.env -f deploy/mcp/compose.yaml \
  exec mcp-server node mcp-server/dist/cli.js pair               # Docker
```

Each prints a QR code, the `seekervault://pair?…` line, and an HTTPS landing page `https://<origin>/pair#<fragment>` that this server serves. A connected agent gets the same two links from `vault_create_pairing_link`.

On the phone: **Home → Add connection**, then **Scan QR code**, or paste the line under **Pairing code or feed reference**. Check the address and server ID on **Pair with this server?** and tap **Pair**. Opening the HTTPS page or the deep link pairs nothing by itself.

The code carries `SIDECAR_PUBLIC_URL`:

- **USB, debug build:** leave it unset (loopback) and run `adb reverse tcp:8080 tcp:8080`. Only debug builds accept plain HTTP, and only to `127.0.0.1` or `localhost`.
- **Another network:** set it to a trusted `https://` origin. Self-signed certificates fail.

One phone per server: pairing again revokes the previous one. `pair status` shows it; `pair revoke` revokes it and cancels its pending requests.

## 3. Point an agent at `/mcp`

Streamable HTTP at `http://127.0.0.1:8080/mcp` with `Authorization: Bearer replace-with-mcp-token`. [Hermes](/docs/hermes) and [OpenClaw](/docs/openclaw) have version-pinned entries. The repository's test agent uses the same tools:

```sh
pnpm agent capabilities     # operations, limits, approval: manual
pnpm agent address          # WALLET_NOT_CONNECTED until the owner connects one
```

## 4. Create a request

A message signature moves no funds:

```sh
pnpm agent sign "Sign in to example.com
Nonce: 4711"
```

The answer is `PENDING` with a `request_id`. The wallet does not open. Repeating the command with the same `--key` returns the same request.

## 5. Review on the phone

Open **Inbox** and the request. Check the complete message, the byte count, and the wallet that signs. Tap **Approve and sign** and confirm in Seed Vault Wallet, or decline in either place to see `REJECTED`, which is not `FAILED`.

## 6. Read the result

```sh
pnpm agent get <request_id>
```

Look for `status: COMPLETED`, `signature`, `signed_message_base64`, and `signature_verified: true`; the test agent checks Ed25519 itself. `pnpm agent cancel <id>` withdraws a request that is still pending.

## Transfers

Only with `SOLANA_RPC_URL` set. The server checks the endpoint's genesis hash against the wallet's network. Amounts are whole base units.

```sh
pnpm agent transfer <recipient> <lamports> --wallet <address> --network devnet
```

On the phone: **Approve and send**, then the wallet. Poll until `CONFIRMED` or another terminal status. `SUBMITTED` is not success. Never retry `UNKNOWN`.

## Live updates

Without an update listener the phone refreshes by hand and Home says **No live updates**. The stream is gRPC over HTTP/2, so:

| Deployment | Setting |
| --- | --- |
| Loopback over USB | `SIDECAR_UPDATE_PORT=8081`, plus `adb reverse tcp:8081 tcp:8081` |
| Public host | Native TLS on 8443: add `-f deploy/mcp/compose.tls.yaml`, set `MCP_TLS_DIR`, `MCP_SERVER_BIND=0.0.0.0`, `MCP_SERVER_PORT=8443`, `SIDECAR_PUBLIC_URL=https://direct.example.com:8443`, `MCP_ALLOWED_HOSTS=direct.example.com` |
| TLS-terminating HTTP/2 platform | `SIDECAR_H2C=true`, with `SIDECAR_PUBLIC_URL` as the HTTPS origin |

Never put the update stream behind an HTTP/1 reverse proxy. The example direct ingress carries `/mcp` and unary phone calls only, and does not pass `/pair`. Details: [Direct ingress and native TLS](/docs/direct-sidecar-proxy).

## Revoke

`pnpm pair revoke` (or the tarball and Docker equivalents) revokes the phone's credential at once and cancels its pending requests. On the phone, **Disconnect** in the connection sheet does the same from the other side.
