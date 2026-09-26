---
title: Copy trading for your audience
excerpt: You have followers. Run the CopyTrading demo, share one link, and every signal you post reaches all of them. Each one decides on their own phone.
hidden: false
---

**The idea.** You trade, and people want to follow your moves. Instead of a chat with screenshots, you publish each trade as a signal. Everyone who added your feed sees it in SAC within seconds, enters the amount they want, and swaps from their own wallet. You never touch their funds and never learn what they did.

## 1. Get registered

Send us your server's address and get your three values: server ID, credential, gateway address ([the flow](/docs/how-it-works#registering-a-server-with-the-gateway)).

## 2. Run the demo

`demo-copytrading/` in the repository is a complete feed server: it publishes your manifest, keeps every signal in its own database, retries when the gateway is unreachable, and checks in so your feed reads as online.

```sh
cd demo-copytrading
PUBLISHER_SERVER_ID=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d \
PUBLISHER_GATEWAY_URL=https://feeds.example.com \
PUBLISHER_PUBLISH_URL=https://feeds.example.com \
PUBLISHER_ENVIRONMENT=sandbox \
PUBLISHER_DATABASE_PATH=./copytrading.db \
BROADCAST_CREDENTIAL=replace-with-publisher-credential \
PUBLISHER_API_TOKEN=$(openssl rand -hex 32) \
go run ./cmd/copytrading
```

Or with Docker: `deploy/copytrading`. At startup it prints your feed link.

## 3. Share the link

```text
seekervault://feed?v=1&gateway=https://feeds.example.com&server=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
```

Put it wherever your audience is. Anyone who pastes it into **Add connection** in SAC is subscribed. No sign-up, no account, no secret in the link.

## 4. Post a signal

From your own script or bot, through the demo's API:

```sh
curl -sS http://127.0.0.1:8092/v1/requests \
  -H "Authorization: Bearer $PUBLISHER_API_TOKEN" -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: desk-1-sol-usdc' \
  -d '{"expires_at":"2030-01-01T00:00:00Z","note":"trimming SOL into USDC",
       "terms":{"input_mint":"So11111111111111111111111111111111111111112","input_decimals":"9",
                "output_mint":"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v","output_decimals":"6",
                "max_slippage_bps":"50"}}'
```

Or from a browser: the demo ships a password-protected **trader page** at `/trader` where you post, update, and withdraw signals by hand. Docker starts it with `--profile admin`.

You name the pair and the slippage ceiling. Never the amount: that is each follower's choice.

## 5. What your audience sees

A **Swap signal** in the Inbox with your note. They enter an amount, get a quote, and either **Approve and swap** in production or **Simulate** in sandbox. Their decision, their amount, and their signature stay on their phone.

## Going to production

Sandbox lets your followers rehearse with real quotes and no risk. When you are ready, register a second server ID for production, run the demo with `PUBLISHER_ENVIRONMENT=production`, and share its link. Details and every setting: `demo-copytrading/README.md`.
