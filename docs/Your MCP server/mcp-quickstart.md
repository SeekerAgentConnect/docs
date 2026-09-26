---
title: Quickstart
excerpt: Run the MCP server on your machine, let your agent hand you a pairing link, and get your first reviewed request.
hidden: false
---

Your MCP server is the piece between your agent and your phone. The agent asks over MCP; the server stores the request and shows it to your paired phone; you approve; the result goes back to the agent. The server holds no key and cannot approve anything itself.

## 1. Run it

From the repository checkout, with Node 24.21 and pnpm:

```sh
git clone https://github.com/BrRenat/SeekerAgentConnect
cd SeekerAgentConnect
pnpm install --frozen-lockfile
cp .env.example .env        # set MCP_TOKEN and PHONE_TOKEN: openssl rand -hex 32, twice
pnpm dev:mcp-server
curl http://127.0.0.1:8080/healthz   # {"status":"ok"}
```

Prefer Docker? One project, on loopback:

```sh
cp deploy/mcp/.env.example deploy/mcp/.env   # same two tokens
docker compose --env-file deploy/mcp/.env -f deploy/mcp/compose.yaml up -d --build
```

## 2. Connect your agent

Point it at `http://127.0.0.1:8080/mcp` with `Authorization: Bearer <MCP_TOKEN>`. Ready-made configurations for Hermes, OpenClaw, and Claude are on [Connect your agent](/docs/connect-your-agent).

## 3. Connect the phone

The main way is through the agent: it calls **`vault_create_pairing_link`** and gets back `https_url` and `pairing_uri`. Hand the owner the whole `https_url`. They open it on the phone, tap the button, check the server address, and tap **Pair**. From a terminal, `pnpm pair` prints the same link as a QR code.

The phone must be able to reach the server. Over USB with a debug build, run `adb reverse tcp:8080 tcp:8080`. For a hosted server, set `SIDECAR_PUBLIC_URL` to its HTTPS address before creating the link.

A server has one paired phone. Pairing again replaces the previous one.

## 4. First request

```sh
pnpm agent sign "hello"      # prints the request as PENDING
pnpm agent get <request_id>  # COMPLETED with the signature once the owner approved
```

Your agent does the same with `vault_sign_message` and `vault_get_request`. See [Tools](/docs/mcp-tools) for all of them.

## 5. Wake the phone when the app is closed

While the app is open it receives requests live. To wake it when it is not, register your server with the gateway ([the flow](/docs/how-it-works#registering-a-server-with-the-gateway)) and set the three values you get:

```sh
RELAY_URL=https://feeds.example.com
RELAY_SERVER_ID=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
RELAY_CREDENTIAL=replace-with-relay-credential
```

The gateway sends only a content-free wake-up; the phone then reads your server directly.

## Hosting it

A hosted server needs public HTTPS with HTTP/2 end to end, because live updates are a stream. The `deploy/mcp` project with `compose.tls.yaml` terminates TLS in the server itself on port 8443. Behind a platform that terminates HTTP/2 for you, set `SIDECAR_H2C=true` instead. The full runbook is `deploy/README.md` in the repository.
