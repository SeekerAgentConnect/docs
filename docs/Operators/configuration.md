---
title: Configuration
excerpt: Environment variables with placeholders. Generate secrets locally. Never commit them.
hidden: false
---

Copy the matching example file to a gitignored `.env` and replace placeholders. Prefer `openssl rand -hex 32` or `openssl rand -base64 32`. chmod `0600` on env files.

## Owner sidecar

| Variable | Role |
| --- | --- |
| `SIDECAR_HOST` / `SIDECAR_PORT` | Listen address. Default `127.0.0.1:8080` |
| `MCP_ENABLED` | Optional MCP adapter |
| `MCP_TOKEN` / `PHONE_TOKEN` | Distinct, ≥32 characters |
| `MCP_ALLOWED_HOSTS` | Extra Host/Origin names |
| `MCP_DEMO_TOOLS` | Demo `vault_request_ack` |
| `MCP_OAUTH_ISSUER` | Hosted client profile |
| `DATABASE_PATH` | SQLite path |
| `REQUEST_TTL_SECONDS` | Default 86400 |
| `REQUEST_PENDING_LIMIT` | Default 100 |
| `SIDECAR_PUBLIC_URL` | URL inside pairing codes |
| `SIDECAR_TLS_CERT_PATH` / `SIDECAR_TLS_KEY_PATH` | Production HTTP/2 |
| `SOLANA_RPC_URL` | Enables transfers |
| `FCM_PROJECT_ID` | Optional; plus Application Default Credentials |

## Shared gateway

| Variable | Role |
| --- | --- |
| `BROADCAST_PUBLIC_URL` / `BROADCAST_DOMAIN` | Origin phones compare |
| `BROADCAST_READ_ADDRESS` | Anonymous feed reads |
| `BROADCAST_PUBLISHER_ADDRESS` | Authenticated publish |
| `BROADCAST_CLIENT_ADDRESS` | Invitations and devices |
| `BROADCAST_STREAM_URL` | Centrifugo |
| `CENTRIFUGO_API_KEY` / `CENTRIFUGO_TOKEN_KEY` | Broker secrets |
| `BROADCAST_PUSH_*` | Optional feed invalidation |
| `BROADCAST_RETENTION_HOURS` | Default one week past expiry |
| `ACME_EMAIL` | Public TLS |

## Publisher template

Six settings have **no default**; the process will not start without them:

| Variable | Role |
| --- | --- |
| `PUBLISHER_SERVER_ID` | Registered lowercase UUID |
| `PUBLISHER_GATEWAY_URL` | Gateway origin, character for character |
| `PUBLISHER_ENVIRONMENT` | `sandbox` or `production` |
| `PUBLISHER_DATABASE_PATH` | SQLite |
| `BROADCAST_CREDENTIAL` | Gateway grant |
| `PUBLISHER_API_TOKEN` | Template API grant, ≥32 characters |

`PUBLISHER_PUBLISH_URL` overrides where publications go when listeners are split. `_FILE` variants exist for mounted secrets. Setting both a value and a file is a configuration error.

## Direct sidecar template (`direct.env.template`)

`SERVER_DOMAIN`, `PUBLIC_PORT=10000`, `SIDECAR_PORT=8443`, `SIDECAR_PUBLIC_URL`, `MCP_TOKEN`, `PHONE_TOKEN`. Example `SOLANA_RPC_URL` may point at devnet for **direct transfers**. That is not a Jupiter sandbox setting.
