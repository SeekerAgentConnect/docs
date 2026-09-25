---
title: Configuration
excerpt: The important environment variables per component, with placeholders. Generate secrets locally. Never commit them.
hidden: false
---

Copy the matching `.env.example` to a gitignored `.env`, `chmod 600` it, and fill placeholders with `openssl rand -hex 32`. Each component validates every variable at once and names the variable, never the value. An empty optional value counts as unset.

## MCP server (`deploy/mcp/.env`, `mcp-server/.env.example`)

| Variable | Role |
| --- | --- |
| `SIDECAR_HOST`, `SIDECAR_PORT` | Bind; loopback, or `0.0.0.0` only with an explicit public URL. Docker pins `0.0.0.0:8080` and maps host `MCP_SERVER_BIND`:`MCP_SERVER_PORT` |
| `SIDECAR_PUBLIC_URL` | Origin in pairing codes. HTTPS off loopback |
| `MCP_ENABLED`, `MCP_TOKEN` | `/mcp` and its agent bearer token, at least 32 characters |
| `PHONE_TOKEN` | Stage 1 live-diagnostic token; must differ from `MCP_TOKEN` |
| `MCP_ALLOWED_HOSTS` | Extra `Host`/`Origin` names for `/mcp`; no scheme, port or wildcard |
| `MCP_DEMO_TOOLS` | Serves `vault_request_ack` |
| `LIVE_COMMAND_TIMEOUT_SECONDS` | Required, 1-3600 |
| `MCP_SERVER_DATA_DIR`, `MCP_SERVER_CONFIG`, `DATABASE_PATH` | Data home (`~/.seeker-agent-connect/mcp-server`), optional env file, SQLite path (Docker `/data/sidecar.db`) |
| `REQUEST_TTL_SECONDS`, `REQUEST_PENDING_LIMIT`, `PAIRING_TOKEN_TTL_SECONDS` | Defaults 86400, 100, 600 |
| `SOLANA_RPC_URL`, `SOLANA_RPC_TIMEOUT_MS` | Enables transfers; the server never chooses a network |
| `FCM_PROJECT_ID` | Own push sender, with `GOOGLE_APPLICATION_CREDENTIALS` in the environment |
| `RELAY_URL`, `RELAY_SERVER_ID`, `RELAY_CREDENTIAL` | Gateway push relay; all three or none, and never beside `FCM_PROJECT_ID` |
| `SIDECAR_TLS_CERT_PATH`, `SIDECAR_TLS_KEY_PATH` | Native TLS listener; the Compose overlay sets them from `MCP_TLS_DIR` |
| `SIDECAR_H2C` | h2c main listener behind an HTTP/2-terminating proxy |
| `SIDECAR_UPDATE_PORT` | Loopback-only cleartext HTTP/2 development port |
| `SIDECAR_HEALTH_CA_CERT_PATH` | Private CA for the container health probe only |
| `MCP_OAUTH_ISSUER`, `MCP_OAUTH_RESOURCE`, `MCP_OAUTH_JWKS_URL`, `MCP_OAUTH_SCOPE` | Optional OAuth resource-server profile |
| `MCP_VOLUME_NAME`, `DIRECT_INGRESS_NETWORK` | Compose volume and network names |

## SKR staking server (`deploy/skr-staking/.env`, `skr-staking-server/.env.example`)

Every name is prefixed `SKR_STAKING_` so both servers can share one host and one `.env`.

| Variable | Role |
| --- | --- |
| `SKR_STAKING_MCP_TOKEN` | Required agent token |
| `SKR_STAKING_RPC_URL`, `SKR_STAKING_RPC_TIMEOUT_MS` | Required mainnet-beta endpoint; the genesis hash is checked at startup |
| `SKR_STAKING_HOST`, `SKR_STAKING_PORT`, `SKR_STAKING_PUBLIC_URL` | Bind (default port 8090) and the origin in pairing codes |
| `SKR_STAKING_DATA_DIR`, `SKR_STAKING_DATABASE_PATH` | Data home and SQLite path (Docker `/data/skr-staking-server.db`) |
| `SKR_STAKING_REQUEST_TTL_SECONDS`, `SKR_STAKING_PENDING_LIMIT`, `SKR_STAKING_PAIRING_TOKEN_TTL_SECONDS` | Defaults 86400, 100, 600 |
| `SKR_STAKING_ALLOWED_HOSTS` | Extra `/mcp` hosts; a non-hostname stops startup |
| `SKR_STAKING_GUARDIAN` | Which guardian's pool; empty means the official one |
| `SKR_STAKING_H2C`, `SKR_STAKING_UPDATE_PORT` | Live updates behind an HTTP/2 proxy, or on loopback; never both |
| `SKR_STAKING_RELAY_URL`, `SKR_STAKING_RELAY_SERVER_ID`, `SKR_STAKING_RELAY_CREDENTIAL` | Gateway push relay, all three or none |
| `SKR_STAKING_SERVER_BIND`, `SKR_STAKING_SERVER_PORT`, `SKR_STAKING_VOLUME_NAME` | Compose host mapping and volume |

## Feed gateway (`deploy/feed/.env`, `feed-gateway/.env.example`)

| Variable | Role |
| --- | --- |
| `BROADCAST_PUBLIC_URL` | Required. The origin phones compare and manifests must name |
| `BROADCAST_DATABASE_PATH` or `BROADCAST_DATABASE_URL` | Exactly one: SQLite file or Postgres URL |
| `BROADCAST_READ_ADDRESS`, `BROADCAST_PUBLISHER_ADDRESS`, `BROADCAST_ADMIN_ADDRESS` | Three distinct listeners (8090, 8091, 8092) |
| `BROADCAST_ADMIN_PASSWORD_HASH`, `BROADCAST_ADMIN_PATH`, `BROADCAST_ADMIN_SESSION_MINUTES`, `BROADCAST_ADMIN_LOGIN_RATE`, `BROADCAST_ADMIN_LOGIN_BURST`, `BROADCAST_ADMIN_PUBLISHER_URL` | The admin page; only the hash brings it into existence |
| `BROADCAST_HEARTBEAT_SECONDS` | Publisher check-in interval, default 30, range 5-3600 |
| `BROADCAST_RETENTION_HOURS`, `BROADCAST_MAX_PROPOSALS` | Defaults 168 and 200 |
| `BROADCAST_READ_RATE`, `BROADCAST_READ_BURST`, `BROADCAST_PUBLISH_RATE`, `BROADCAST_PUBLISH_BURST` | Defaults 20/60 and 2/20 |
| `BROADCAST_TRUSTED_PROXIES` | Exact CIDR allowed to supply `X-Forwarded-For` |
| `BROADCAST_STREAM_URL`, `BROADCAST_STREAM_API_KEY`, `BROADCAST_STREAM_TOKEN_KEY` | Centrifugo; all three or none |
| `BROADCAST_TICKET_MINUTES`, `BROADCAST_MAX_CHANNELS` | Defaults 60 and 32 |
| `BROADCAST_PUSH_CREDENTIALS`, `BROADCAST_PUSH_ENDPOINT`, `BROADCAST_PUSH_ENVIRONMENT` | Push; all three or none. The credential is a path or the JSON itself; `compose.push.yaml` mounts `BROADCAST_PUSH_CREDENTIALS_FILE` |
| `BROADCAST_PUSH_RATE`, `BROADCAST_PUSH_BURST` | Defaults 0.1 and 5 per topic |
| `BROADCAST_RELAY_SERVER_RATE`, `_SERVER_BURST`, `_DEVICE_RATE`, `_DEVICE_BURST`, `_GLOBAL_RATE`, `_GLOBAL_BURST`, `_ENROLL_RATE`, `_ENROLL_BURST` | Relay rate bounds, all with defaults |
| `BROADCAST_RELAY_BINDING_HOURS`, `BROADCAST_RELAY_IDLE_HOURS`, `BROADCAST_RELAY_UNBOUND_HOURS` | Relay lifetimes; idle must be at least binding |
| `BROADCAST_BIND`, `BROADCAST_PORT`, `BROADCAST_PUBLISH_BIND`, `BROADCAST_PUBLISH_PORT`, `BROADCAST_ADMIN_BIND`, `BROADCAST_ADMIN_PORT`, `BROADCAST_VOLUME_NAME` | Compose host mappings and volume |

No publisher credential is ever configured; the gateway stores hashes only.

## Centrifugo, Redis and ingress

| Variable | Role |
| --- | --- |
| `CENTRIFUGO_API_KEY`, `CENTRIFUGO_TOKEN_KEY` | Broker secrets; copy them into the two `BROADCAST_STREAM_*` keys when the stream is on |
| `CENTRIFUGO_REDIS_URL`, `CENTRIFUGO_REDIS_PREFIX`, `CENTRIFUGO_REDIS_TLS_*`, `REDIS_MAX_MEMORY` | Redis as Centrifugo's recovery cache; a `rediss://` URL carries authentication |
| `FEED_INGRESS_NETWORK`, `FEED_INGRESS_SUBNET`, `FEED_PRIVATE_NETWORK`, `FEED_PUBLISH_NETWORK` | Named networks shared with the ingress and combined overlays |
| `FEED_DOMAIN`, `ACME_EMAIL`, `FEED_HTTP_BIND`, `FEED_HTTPS_BIND`, `FEED_CADDY_DATA_VOLUME`, `FEED_CADDY_CONFIG_VOLUME` | `deploy/ingress/feed` |
| `DIRECT_DOMAIN`, `ACME_EMAIL`, `DIRECT_HTTP_BIND`, `DIRECT_HTTPS_BIND`, `DIRECT_CADDY_DATA_VOLUME`, `DIRECT_CADDY_CONFIG_VOLUME` | `deploy/ingress/direct` |

## Demos (`deploy/copytrading/.env`, `deploy/prediction/.env`)

A setting with no default stops the process when it is missing.

| Variable | Role |
| --- | --- |
| `PUBLISHER_SERVER_ID` | Required. Registered lowercase UUID |
| `PUBLISHER_GATEWAY_URL` | Required. Public gateway origin, character for character |
| `PUBLISHER_PUBLISH_URL` | Where publications go; the combined overlay replaces it with `http://feed-gateway:8091` |
| `PUBLISHER_ENVIRONMENT` | Required. `sandbox` or `production` |
| `BROADCAST_CREDENTIAL` (or `BROADCAST_CREDENTIAL_FILE`) | Required. The gateway credential, `replace-with-publisher-credential` |
| `PUBLISHER_API_TOKEN` (or `PUBLISHER_API_TOKEN_FILE`) | Required. Grant for the demo's `/v1` API and `publishctl` |
| `PUBLISHER_API_ADDRESS`, `PUBLISHER_DATABASE_PATH` | Default `127.0.0.1:8092`; the SQLite file is required |
| `PUBLISHER_DISPLAY_NAME`, `PUBLISHER_PUBLISH_TIMEOUT_SECONDS`, `PUBLISHER_CREATE_LIMIT` | Optional |
| `PREDICTION_*` | Provider and filter settings of the Prediction demo; all have defaults |
| `ADMIN_LISTEN_ADDRESS`, `ADMIN_PUBLIC_PATH`, `ADMIN_API_URL`, `ADMIN_PASSWORDS` (or `_FILE`), `ADMIN_SESSION_SECRET` (or `_FILE`) | The optional `/trader` admin UI; `ADMIN_PASSWORDS` holds `name:bcrypt` lines |
| `PUBLISHER_BIND`, `PUBLISHER_PORT`, `PREDICTION_BIND`, `PREDICTION_PORT`, `COPYTRADING_VOLUME_NAME`, `PREDICTION_VOLUME_NAME` | Compose mappings (8092, 8094) and volumes |

Setting both a value and its `_FILE` is a configuration error. `PUBLISHER_ENVIRONMENT=sandbox` is a manifest label; the sandbox is not a Solana network.
