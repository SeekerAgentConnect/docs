---
title: Working examples
excerpt: The two public-feed demos, the two direct servers built on the SDK, the SDK's minimal host, and the test agent. Credentials stay in environment variables.
hidden: false
---

Everything here ships in [SeekerAgentConnect](https://github.com/BrRenat/SeekerAgentConnect). Replace every secret with a value you generated. Do not commit credentials.

## Public feed: the CopyTrading demo

`demo-copytrading/` is an independent Go module with its own image, database, `/v1` operator API, and `/trader` admin UI. A trader posts a swap signal; it publishes one feed request to the gateway. It needs a registered server ID and credential, and nothing else: no broker, no Firebase, no provider account.

```sh
cd demo-copytrading
PUBLISHER_SERVER_ID=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d \
PUBLISHER_GATEWAY_URL=https://feeds.example.com \
PUBLISHER_PUBLISH_URL=https://feeds.example.com \
PUBLISHER_ENVIRONMENT=sandbox \
PUBLISHER_DATABASE_PATH=./copytrading.db \
BROADCAST_CREDENTIAL=replace-with-publisher-credential \
PUBLISHER_API_TOKEN=$(openssl rand -base64 32) \
go run ./cmd/copytrading
```

It publishes the manifest, prints the `seekervault://feed?…` reference, and listens on `127.0.0.1:8092`. Create a request (primary `POST /v1/requests`; `/v1/signals` is a compatibility alias):

```sh
curl -sS http://127.0.0.1:8092/v1/requests \
  -H "Authorization: Bearer $PUBLISHER_API_TOKEN" \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: desk-1-sol-usdc-demo' \
  -d '{"expires_at":"2030-01-01T00:00:00Z","note":"trimming SOL into USDC",
       "terms":{"input_mint":"So11111111111111111111111111111111111111112","input_decimals":"9",
                "output_mint":"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v","output_decimals":"6",
                "max_slippage_bps":"50"}}'
```

Or the CLI, which is the same HTTP call: `go run ./cmd/publishctl create --in 2h --note "…" --term input_mint=… --term max_slippage_bps=50`, then `update <id>`, `cancel <id>`, `status`, `reference`. `demo-copytrading/sdk/` is a small Go client of this API.

Compose preset: `deploy/copytrading/compose.yaml` (`ctl` under `--profile operator`, the trader UI under `--profile admin`; `ADMIN_PASSWORDS` holds a bcrypt password file's contents). App Platform spec: `deploy/signals-demo.yaml`, which serves the UI at `/trader`.

## Public feed: the Prediction demo

`demo-prediction/` discovers Jupiter prediction markets through operator filters and publishes one request per match, with no side. Its own module, image, database, server ID, and credential; provider access is keyless by default.

```sh
cd demo-prediction
PUBLISHER_SERVER_ID=<a second server ID, registered separately> \
PUBLISHER_GATEWAY_URL=https://feeds.example.com \
PUBLISHER_PUBLISH_URL=https://feeds.example.com \
PUBLISHER_ENVIRONMENT=sandbox \
PUBLISHER_DATABASE_PATH=./prediction.db \
PUBLISHER_API_ADDRESS=127.0.0.1:8094 \
BROADCAST_CREDENTIAL=replace-with-publisher-credential \
PUBLISHER_API_TOKEN=$(openssl rand -base64 32) \
PREDICTION_CATEGORIES=crypto PREDICTION_MOST_OPEN=3 \
go run ./cmd/prediction
```

```sh
export PUBLISHER_API_URL=http://127.0.0.1:8094
go run ./cmd/publishctl poll             # POST /v1/discovery/poll
go run ./cmd/publishctl discovery        # GET  /v1/discovery
go run ./cmd/publishctl create --in 2h   # 403 written_by_discovery
```

Compose preset: `deploy/prediction/compose.yaml`; App Platform: `deploy/prediction-demo.yaml` (`/trader`). Both demos share `publisher-support/`, a source library with no command or image; copy it out beside the demo.

## Direct server: the MCP server

`mcp-server/` (`@seeker-vault/mcp-server`, executable `seeker-agent-connect-mcp`, Docker image) is the SDK with an MCP host: `/mcp` for the owner's agents, the phone API on the same listener, `/pair` for the HTTPS pairing page. Tools: `vault_get_address`, `vault_get_capabilities`, `vault_sign_message`, `vault_transfer`, `vault_get_request`, `vault_cancel_request`, `vault_create_pairing_link`, `vault_display_command`, and `vault_request_ack` with `MCP_DEMO_TOOLS=true`.

```sh
pnpm install --frozen-lockfile
cp .env.example .env        # MCP_TOKEN=replace-with-mcp-token, PHONE_TOKEN, SIDECAR_PUBLIC_URL
pnpm dev:mcp-server
pnpm pair                   # QR, seekervault://pair URI, and HTTPS link
pnpm pair status
```

Data defaults to `~/.seeker-agent-connect/mcp-server/direct-server.db` (Docker: `/data/sidecar.db`). Compose preset `deploy/mcp` (+ `compose.tls.yaml`); App Platform `deploy/seeker-mcp.yaml`. See the [Direct MCP server walkthrough](/docs/direct-sidecar-walkthrough).

## Direct server: the SKR staking server

`skr-staking-server/` (`@seeker-vault/skr-staking-server`, executable `seeker-skr-staking-mcp`) is a second, independent direct server on the same SDK, for one owner's SKR staking position: `get_staking_status`, `request_stake`, `request_unstake`, `request_cancel_unstake`, `request_withdraw`, `skr_create_pairing_link`. Mainnet-beta only; it refuses any other cluster at startup. Own database, token, listener, and pairing.

```sh
cp skr-staking-server/.env.example .env     # SKR_STAKING_MCP_TOKEN, SKR_STAKING_RPC_URL
pnpm --filter @seeker-vault/skr-staking-server run dev
node --env-file-if-exists=.env skr-staking-server/src/cli.ts pair
```

Compose preset `deploy/skr-staking`; App Platform `deploy/seeker-skr-staking-mcp.yaml`. See [SKR staking](/docs/skr-staking).

## The SDK's minimal host

`server-sdk/examples/minimal.ts` opens a server, starts the phone API, prints a pairing URI, creates an acknowledgement request, and observes it, with public imports only. It is the [SDK page](/docs/direct-server-sdk)'s example and the [walkthrough](/docs/direct-server-walkthrough)'s starting point.

## The test agent

`test-agent/` is a minimal MCP client with no LLM, for demos and regression tests against a direct server. It reads `MCP_URL` and `MCP_TOKEN`:

```sh
pnpm --silent agent capabilities
pnpm --silent agent ack "Deploy finished" --key deploy-42 --demo   # needs MCP_DEMO_TOOLS=true
pnpm --silent agent sign "Prove you hold this wallet" --wait
pnpm --silent agent transfer <recipient> <lamports> --wallet <address> --network mainnet
pnpm --silent agent status <request_id>     # exit 0 settled as asked, 10 unsettled, 11 otherwise
pnpm --silent agent cancel <request_id>
```

`status` and `wait` treat `UNKNOWN` as unsettled, never as failure, so a script never pays twice.

The Go Server SDK and the gateway-onboarding examples no longer exist; the private mode they served is [retired](/docs/private-invitation-walkthrough).
