---
title: Direct sidecar and MCP
excerpt: Pair the owner sidecar, submit a supported request from an agent, and read the result. Connecting still does not sign.
hidden: false
---

This walkthrough uses **`direct`** mode: the phone holds a credential the sidecar issued, and an agent talks to `/mcp`.

## Prerequisites

- Node.js **24.21.0** and pnpm (see the wallet repository `.nvmrc`).
- A checkout of [SeekerAgentWallet](https://github.com/BrRenat/SeekerAgentWallet).
- SAC installed on the phone.
- Seed Vault Wallet with an account.
- Two distinct secrets, each at least 32 characters.

```sh
cp .env.example .env
openssl rand -hex 32   # MCP_TOKEN
openssl rand -hex 32   # PHONE_TOKEN  — must differ
```

`.env` is gitignored. The sidecar rejects placeholder or short tokens, identical MCP and phone tokens, and non-loopback binds in development.

Optional:

- `SIDECAR_PUBLIC_URL` — URL the pairing code carries. Default is loopback for `adb reverse`.
- `MCP_DEMO_TOOLS=true` — serves `vault_request_ack`. Leave it off outside development.
- `SOLANA_RPC_URL` — required before `vault_transfer` exists. Empty means no transfer tool.
- `MCP_ENABLED=true` — default. Set `false` to omit `/mcp`.

## 1. Start and pair

```sh
pnpm install --frozen-lockfile
pnpm dev:sidecar
# another terminal:
curl -s http://127.0.0.1:8080/healthz   # {"status":"ok"}
pnpm pair
```

`pnpm pair` prints a QR code and a `seekervault://pair?` line. The code works once, for about ten minutes.

On the phone:

1. **Connections → Add connection**.
2. Scan or paste the pairing line.
3. Confirm **Pair with this server?**
4. Tap **Pair**.

Over USB with a debug build, leave `SIDECAR_PUBLIC_URL` unset and run `adb reverse tcp:8080 tcp:8080`. Only debug builds accept plain HTTP, and only to `127.0.0.1` or `localhost`.

From another network, put a trusted HTTPS endpoint in front of the sidecar and set `SIDECAR_PUBLIC_URL` to that `https://` URL. Self-signed certificates fail.

`pnpm pair status` shows the paired phone. `pnpm pair revoke` revokes it.

Pairing does not select a wallet and does not approve a request.

## 2. Connect the wallet

Follow [Connect your wallet](/docs/wallet-setup). Pick the network the wallet actually serves (devnet is fine for message signing and for transfers pointed at a devnet RPC).

```sh
pnpm agent address
# WALLET_NOT_CONNECTED until the owner connects
```

## 3. Submit a supported request

Message signing moves no funds:

```sh
pnpm agent sign "Sign in to example.com
Nonce: 4711"
```

The tool returns `PENDING` and a `request_id`. **The wallet does not open yet.**

Hermes uses the same MCP tools. Merge `examples/hermes.config.yaml` as described in [Hermes](/docs/hermes).

## 4. Review on the phone

1. Open **Requests** or tap **Refresh**.
2. Open the request. Check the complete message, byte count, and **Signs with**.
3. Tap **Approve and sign**. Seed Vault Wallet opens. Confirm there too.
4. Decline in the wallet instead to exercise **Rejected** — that is not `FAILED`.

## 5. Read the result

```sh
pnpm agent get <request_id>
```

Look for `status: COMPLETED`, `signature`, `signed_message_base64`, and `signature_verified: true`. The test agent verifies Ed25519 itself against the exact signed bytes.

`pnpm agent cancel <id>` withdraws a still-pending request.

## Transfers (optional)

Only when `SOLANA_RPC_URL` is set. Amounts are whole base units.

```sh
pnpm agent transfer <recipient> <lamports> --wallet <address> --network devnet
```

On the phone: **Approve and send**, then confirm in the wallet. Poll `pnpm agent get` until `CONFIRMED` or another terminal status. **Never retry `UNKNOWN`.**

Nothing in this repository’s default configuration points at mainnet. A mainnet RPC is the operator’s deliberate choice.

## Packaged sidecar

```sh
cd gateway
cp .env.example .env
# fill MCP_TOKEN and PHONE_TOKEN
docker compose up -d --build
curl -fsS http://127.0.0.1:8080/healthz
docker compose exec sidecar node sidecar/dist/pairing/cli.js
```

The HTTP/1.1 reverse proxy in `gateway/` does **not** carry the production HTTP/2 update stream. For live updates on a public host, use the [direct sidecar reverse proxy](/docs/direct-sidecar-proxy).

## Capabilities check

```sh
pnpm agent capabilities
```

Reports `approval: manual`, the operations this sidecar implements, and limits. If `vault_transfer` is missing, `SOLANA_RPC_URL` is unset.
