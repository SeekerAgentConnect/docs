---
title: Your first request
excerpt: The fastest path to a reviewed request — run the MCP server, pair the phone, ask for a signature, approve it, and read the result back.
hidden: false
---

The shortest path from nothing to a reviewed result is a direct connection to the MCP server and one signed message. It needs no gateway, no publisher credential, no funds, and no Solana RPC endpoint.

## Before you start

- Node 24.21.0 and pnpm, or Docker.
- The SAC app on the phone, and a way for the phone to reach the server: `adb reverse tcp:8080 tcp:8080` over USB with a debug build, or a trusted HTTPS origin in `SIDECAR_PUBLIC_URL`. A self-signed certificate is refused.
- Seed Vault Wallet connected on the **Wallet** tab, so the request can name your address.

## 1. Run the MCP server

From a checkout:

```bash
pnpm install --frozen-lockfile
cp .env.example .env    # then replace both token placeholders
pnpm dev:mcp-server
```

Or with the Docker preset:

```bash
cp deploy/mcp/.env.example deploy/mcp/.env    # then replace the tokens
docker compose --env-file deploy/mcp/.env -f deploy/mcp/compose.yaml up -d --build
```

`curl -s http://127.0.0.1:8080/healthz` prints `{"status":"ok"}`. Until a phone pairs, the startup log says `no phone is paired`, and agents get `NOT_PAIRED`.

## 2. Create a pairing link

```bash
pnpm pair
```

In Docker: `docker compose --env-file deploy/mcp/.env -f deploy/mcp/compose.yaml exec mcp-server node mcp-server/dist/cli.js pair`.

Either prints a QR code, the `seekervault://pair?…` line, and an HTTPS pairing page on the server. A connected agent can do the same by calling `vault_create_pairing_link`, which returns `pairing_uri` and `https_url`. The code works once, for ten minutes, and a newer code replaces it. Keep it private: whoever pairs with it first becomes the paired phone.

## 3. Pair in Add connection

On the phone, open **Home → Add connection**. Scan the QR code, or paste the `seekervault://pair?…` line and tap **Continue**. Check the address and server ID on **Pair with this server?**, then tap **Pair**. On the server, `pnpm pair status` shows the paired phone.

## 4. Have an agent create a request

Any MCP client that holds `MCP_TOKEN` can call `vault_sign_message`. Without one, use the test agent from the same checkout:

```bash
pnpm agent address          # the wallet you connected, and its network
pnpm agent sign "hello"     # prints the request as PENDING
```

Nothing is signed yet. The request waits on the phone.

## 5. Review on the phone

The request appears on Home and in the **Inbox**: at once if the server serves live updates, otherwise when the app opens, when you open the connection, or when you pull to refresh. Open it, read the message, tap **Approve and sign**, and confirm in Seed Vault Wallet. Declining in the wallet is a rejection.

## 6. Read the result back

```bash
pnpm agent get <id>
```

Once you have answered, `status` is `COMPLETED` — with `signature`, `wallet`, `signed_message_base64`, and `signature_verified` — or `REJECTED`, and `terminal` is true. An MCP client reads the same through `vault_get_request`.

## Other first paths

- **A transfer.** Set `SOLANA_RPC_URL`, then `pnpm agent transfer <to> <amount> --wallet <address> --network <name>`. The review says **Approve and send**.
- **A public feed in sandbox.** Run a feed demo, add its `seekervault://feed?…` reference, and **Simulate** a signal. Nothing is signed. See the [public feed walkthrough](/docs/public-feed-walkthrough).
- **SKR staking.** Pair the staking server as a second connection and have the agent call `request_stake`. See [SKR staking](/docs/skr-staking).

## After the first request

- [Rules](/docs/rules) are optional notes on this phone. They never approve or block by themselves.
- [Notifications](/docs/notifications) can remind you that something is waiting. Tapping one never approves.
- [Activity](/docs/outcomes-and-history) is your local record. It outlives the request the server was owed.
