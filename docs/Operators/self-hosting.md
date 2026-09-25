---
title: Self-hosting
excerpt: Three supported shapes, one Compose project per application, separate ingress projects, and App Platform specs as the hosted alternative.
hidden: false
---

The canonical runbook is `deploy/README.md` in the [SeekerAgentConnect](https://github.com/BrRenat/SeekerAgentConnect) repository. This page is the map.

## Three shapes

| Shape | Compose projects | Public address |
| --- | --- | --- |
| Direct only | `deploy/mcp` with `compose.tls.yaml` | `https://direct.example.com:8443` |
| Feeds only | `deploy/feed` and `deploy/ingress/feed`; demos optional | `https://feeds.example.com` |
| Everything | feed, feed ingress, MCP, CopyTrading, Prediction, optionally SKR staking | both origins |

There is no all-in-one project and no Tailscale dependency. Each project owns its process, credentials, database, volume, restart and rollback. Starting or replacing one must not recreate another.

## What each project owns

| Project | Runs | Database and volume |
| --- | --- | --- |
| `deploy/mcp` | The MCP server on host loopback 8080 by default; `compose.tls.yaml` mounts `MCP_TLS_DIR` read-only for native TLS | `/data/sidecar.db` in `seeker-agent-connect-mcp_mcp-data` |
| `deploy/skr-staking` | The SKR staking server on loopback 8090 by default | `/data/skr-staking-server.db` in `seeker-agent-connect-skr-staking_skr-data` |
| `deploy/feed` | `feed-gateway`, Centrifugo, Redis and the `gateway-ctl` operator profile; `compose.push.yaml` mounts the Firebase credential; `compose.combined.yaml` adds the private demo-to-gateway network | `/data/broadcast.db` in `seeker-broadcast_broadcast-data`, or Postgres |
| `deploy/ingress/feed` | Caddy with ACME on 80/443 for `feeds.example.com` | Certificates in `seeker-broadcast_proxy-data` and `-config` |
| `deploy/ingress/direct` | Optional Caddy for `/mcp` and unary phone calls only | `seeker-agent-wallet_gateway-data` and `-config` |
| `deploy/copytrading` | The CopyTrading demo with `ctl` and `copytrading-admin` profiles | `/data/publisher.db` in `seeker-publisher_publisher-data` |
| `deploy/prediction` | The Prediction demo with `ctl` and `prediction-admin` profiles | `/data/prediction.db` in `seeker-prediction_prediction-data` |
| `deploy/operators/tailscale` | An isolated Funnel example, not a default | none |

Every `docker compose` call names its env file and compose files:

```sh
docker compose --env-file deploy/feed/.env -f deploy/feed/compose.yaml up -d --build
docker compose --env-file deploy/ingress/feed/.env -f deploy/ingress/feed/compose.yaml up -d
docker compose --env-file deploy/mcp/.env \
  -f deploy/mcp/compose.yaml -f deploy/mcp/compose.tls.yaml up -d --build
```

Start an application before its ingress. Containers run as `10001:10001`, and a restored file must keep that ownership. SQLite belongs on local storage, never NFS or SMB. Copy each `.env.example` to `.env`, `chmod 600` it, and generate every secret with `openssl rand -hex 32`; never reuse one across roles.

## Host ports

| Host port | Owner | Reachability |
| --- | --- | --- |
| 80, 443 | Feed Caddy | Public |
| 8443 | MCP native TLS (container 8080) | Public |
| 8090 | Feed read API | Loopback |
| 8091 | Feed publisher API | Loopback |
| 8092 | Feed admin listener; answers only once a password hash is set | Loopback |
| 8092 | CopyTrading API | Loopback |
| 8094 | Prediction API | Loopback |
| 8096 | Optional CopyTrading or Prediction admin UI | Loopback |
| 8090 | SKR staking server | Loopback |

Centrifugo 8000/11000 and Redis 6379 stay on the container network. Two defaults collide on a combined host: the feed admin port and the CopyTrading API both publish on `127.0.0.1:8092`, and the SKR staking server and the feed read API both on `127.0.0.1:8090`. Set `BROADCAST_ADMIN_PORT` or `SKR_STAKING_SERVER_PORT` before starting both.

## App Platform specs

`deploy/seeker-mcp.yaml`, `deploy/seeker-gateway.yaml`, `deploy/seeker-skr-staking-mcp.yaml`, `deploy/signals-demo.yaml` and `deploy/prediction-demo.yaml` are DigitalOcean App Platform specs for the same applications. The direct servers run h2c behind the platform's HTTP/2 (`SIDECAR_H2C=true`, `SKR_STAKING_H2C=true`) with a TCP health check. The gateway app uses managed Postgres through `BROADCAST_DATABASE_URL`, because the platform has no disk, and a Caddy `edge` service routes `FeedService`, `PublisherService`, `/relay/v1` and `/admin`. The specs pull pinned tags (`gateway-0.1.7`, `mcp-0.1.7`, `skr-staking-mcp-0.1.2`, `copytrading-0.1.4`, `prediction-0.1.7`) from a Docker Hub repository the maintainers operate for their hosted deployment; pulling needs their registry credentials, so they are not a public release.

## What is not published

The repository publishes no npm package and no container image. `@seeker-vault/server-sdk`, `@seeker-vault/mcp-server` and `@seeker-vault/skr-staking-server` install from the checkout or a locally packed tarball, and the Compose presets build `:local` images. Keep the checkout on the host, or replace the image names with artifacts you build and store yourself.

## What you need from outside

DNS names and normally trusted certificates for every origin the phone uses; open TCP ports; a Solana RPC endpoint for direct transfers or SKR staking (mainnet-beta only); an OAuth issuer only for hosted MCP clients; a Firebase project only for wake-ups. See [TLS](/docs/tls), [Configuration](/docs/configuration) and [Firebase](/docs/firebase).
