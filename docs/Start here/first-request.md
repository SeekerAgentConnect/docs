---
title: Your first request
excerpt: Pick one path, complete it end to end, and confirm the result landed where that mode says it should.
hidden: false
---

Use this page to choose a first path. Each walkthrough below is complete: prerequisites, commands, what you tap in SAC, and where the result goes.

## 1. Private independent server (invitation to result)

For a backend that should reach **one confirmed device** and read the declared outcome.

1. A gateway operator registers your server and gives you a publisher credential.
2. Your backend publishes a `gateway_private` manifest and creates an invitation with the Go Server SDK.
3. You share the hosted link or QR. The owner confirms **Connect** in SAC.
4. The backend stores the completed `connection_id` and sends a request to **that exact binding**.
5. The owner reviews it. In sandbox the phone records **Simulated** and does not open the wallet. In production they approve and the wallet signs.
6. The backend polls `Request` for the declared result.

Full steps: [Private invitation to result](/docs/private-invitation-walkthrough).

Opening the invitation does not authorize wallet operations.

## 2. Public feed in sandbox

For a publisher that broadcasts the same request to every subscriber.

1. Register as a publisher on a broadcast gateway.
2. Run the CopyTrading template with `PUBLISHER_ENVIRONMENT=sandbox`.
3. Add the printed `seekervault://feed?…` reference in **Add connection**.
4. Publish a request with `POST /v1/requests` (or `sdk.Client.CreateRequest`).
5. On the phone, open the signal, enter an amount, tap **Get a quote and prepare**, then **Simulate**.
6. Activity shows **Simulated**. Nothing was signed or sent. The publisher is not told what you did.

Full steps: [Public feed sandbox](/docs/public-feed-walkthrough).

Sandbox is not devnet. The quote and bytes are the live mainnet path; the wallet is not opened.

## 3. Direct sidecar and MCP

For an agent that talks to **your** sidecar.

1. Start the sidecar with `MCP_TOKEN` and a distinct `PHONE_TOKEN`.
2. Pair the phone with `pnpm pair` (or the packaged pairing CLI).
3. Connect Seed Vault Wallet on **Wallet**.
4. Ask the agent to call `vault_sign_message` (or `pnpm agent sign`).
5. In SAC, open the request, tap **Approve and sign**, and confirm in the wallet.
6. The agent reads the signature with `vault_get_request`.

Full steps: [Direct sidecar and MCP](/docs/direct-sidecar-walkthrough).

## After the first request

- [Rules](/docs/rules) are optional notes on this phone. They never approve or block by themselves.
- [Notifications](/docs/notifications) can remind you that something is waiting. Tapping one never approves.
- [Activity](/docs/outcomes-and-history) is your local record. It outlives the request the server was owed.
