---
title: Working examples
excerpt: Copy-pasteable SDK, CLI, and template commands. Credentials stay in environment variables.
hidden: false
---

These examples are the ones shipped in [SeekerAgentWallet](https://github.com/BrRenat/SeekerAgentWallet) under `publisher/examples/` and `publisher/cmd/`. Run them from that module so generated protobuf clients resolve.

Replace every secret with a value you generated. Do not commit credentials.

## Private CLI (no website)

```sh
cd publisher
GATEWAY_URL=https://gateway.example.com \
GATEWAY_TOKEN="$GATEWAY_TOKEN" \
SERVER_ID=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d \
go run ./examples/gateway-onboarding --kind trading --environment sandbox \
  --user onboarding-session-42 --wait --send
```

It publishes a private manifest, prints the hosted page and `seekervault://invite` URI, waits for **Connect**, then sends a sample swap request.

Other profiles:

```sh
go run ./examples/gateway-onboarding --kind prediction --user account-42 --wait --send
go run ./examples/gateway-onboarding --kind mcp --user account-42 --wait --send
```

Trading/MCP sample parameters (wrapped SOL → USDC, owner amount + slippage):

- `input_mint` `So11111111111111111111111111111111111111112`
- `input_decimals` `9`
- `output_mint` `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- `output_decimals` `6`
- `max_slippage_bps` `50`

Prediction sample parameters use a placeholder `market_id`. For a real review, publish a market the provider currently lists; SAC reads that market before preparing.

## Private website

```sh
GATEWAY_URL=https://gateway.example.com \
GATEWAY_TOKEN="$GATEWAY_TOKEN" \
SERVER_ID=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d \
SERVER_KIND=trading SERVER_ENVIRONMENT=sandbox LISTEN_ADDR=127.0.0.1:8090 \
go run ./examples/gateway-website
```

Open `http://127.0.0.1:8090`. The form submits only an opaque `user_ref`. The process calls the SDK and embeds the gateway page/QR. The publisher credential never appears in HTML.

## CopyTrading template

```sh
PUBLISHER_SERVER_ID=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d \
PUBLISHER_GATEWAY_URL=http://127.0.0.1:8090 \
PUBLISHER_PUBLISH_URL=http://127.0.0.1:8091 \
PUBLISHER_ENVIRONMENT=sandbox \
PUBLISHER_DATABASE_PATH=./copytrading.db \
BROADCAST_CREDENTIAL="$BROADCAST_CREDENTIAL" \
PUBLISHER_API_TOKEN="$PUBLISHER_API_TOKEN" \
go run ./cmd/copytrading
```

Create:

```sh
export PUBLISHER_API_URL=http://127.0.0.1:8092
publishctl create --in 2h --note "demo signal" \
  --term input_mint=So11111111111111111111111111111111111111112 \
  --term input_decimals=9 \
  --term output_mint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v \
  --term output_decimals=6 \
  --term max_slippage_bps=50
```

## Prediction template

Use a **second** server ID and credential.

```sh
PUBLISHER_SERVER_ID=aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee \
PUBLISHER_GATEWAY_URL=http://127.0.0.1:8090 \
PUBLISHER_PUBLISH_URL=http://127.0.0.1:8091 \
PUBLISHER_ENVIRONMENT=sandbox \
PUBLISHER_DATABASE_PATH=./prediction.db \
PUBLISHER_API_ADDRESS=127.0.0.1:8094 \
BROADCAST_CREDENTIAL="$BROADCAST_CREDENTIAL_PREDICTION" \
PUBLISHER_API_TOKEN="$PUBLISHER_API_TOKEN_PREDICTION" \
PREDICTION_CATEGORIES=crypto PREDICTION_MOST_OPEN=3 \
go run ./cmd/prediction
```

```sh
export PUBLISHER_API_URL=http://127.0.0.1:8094
publishctl poll
publishctl discovery
```

Writable create/update/cancel endpoints return `403 written_by_discovery`.
