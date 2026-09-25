---
title: TLS
excerpt: Phones verify certificates the normal way. Feed ingress gets certificates from ACME; a direct server terminates TLS itself on 8443 so HTTP/2 survives.
hidden: false
---

| Deployment | How TLS is obtained |
| --- | --- |
| Feed ingress (`deploy/ingress/feed`) | Caddy ACME. DNS for `FEED_DOMAIN` pointing at the host, ports **80** and **443** reachable, `ACME_EMAIL` set. Certificates persist in `seeker-broadcast_proxy-data` |
| Direct server, native TLS (`deploy/mcp` with `compose.tls.yaml`) | Your ACME client issues for `direct.example.com`; you install `fullchain.pem` and `privkey.pem` into `MCP_TLS_DIR` and restart `mcp-server` from its deploy hook. Public port **8443** |
| Direct server behind an HTTP/2-terminating platform | The platform's certificate; the server runs h2c (`SIDECAR_H2C=true`, `SKR_STAKING_H2C=true`) |
| Direct ingress (`deploy/ingress/direct`) | Caddy ACME like the feed ingress. MCP and unary calls only; no update stream |
| Tailscale Funnel | The node's certificate in `MCP_TLS_DIR` (direct) or `TAILSCALE_TLS_DIR` (feed Caddy). Funnel forwards raw TCP |
| Local development | Plain HTTP on loopback over `adb reverse` only |

Never tell a phone to ignore certificate warnings. The app keeps Android's normal certificate and hostname checks, with no pinning, custom CA or trust-all; a self-signed certificate fails. There is no insecure mode to turn on anywhere.

## HTTP/2 for the stream

`UpdateService.Subscribe` is gRPC over HTTP/2. The direct server's TLS listener negotiates `h2` and `http/1.1` on one origin; `/mcp`, pairing and unary calls work over either. Anything in front of it must preserve HTTP/2 to the server: native TLS, a raw TCP forward, or an HTTP/2-terminating proxy with `SIDECAR_H2C`. A TLS-terminating HTTP/1 proxy passes an HTTPS request and silently loses the stream. Check with:

```sh
curl --http2 -sS -o /dev/null -w '%{http_version}\n' \
  https://direct.example.com:8443/seekervault.request.v1.UpdateService/Sync
```

It must print `2`, and the phone must show the connection as Live.

The feed stream is different: Caddy terminates TLS for `feeds.example.com` and proxies the Centrifugo unidirectional stream over h2c to `centrifugo:11000`, so the ingress Caddyfile keeps HTTP/2 to the broker.

## Origins must match

`SIDECAR_PUBLIC_URL` (in pairing codes), `SKR_STAKING_PUBLIC_URL` and `BROADCAST_PUBLIC_URL` (in manifests and feed references) must match the certificate's host, port included when it is not 443. The `/mcp` Host check also needs the public hostname in `MCP_ALLOWED_HOSTS` when it differs from `SIDECAR_PUBLIC_URL`.

## Private CA

`SIDECAR_HEALTH_CA_CERT_PATH` adds a CA PEM to the container health probe's trust, for a private test CA. It extends Node's roots and never disables hostname or chain verification. It changes nothing about what the phone trusts: a phone still needs a publicly trusted certificate.

## What the public edge does not expose

The feed ingress exposes `FeedService`, `PublisherService` (a block you may delete), the Centrifugo stream path and, if you keep the block, `/admin`. No health, operator CLI, broker API, Redis, database or demo route. The direct server's native listener answers `/healthz` only to loopback and omits `LiveCommandService`; `deploy/ingress/direct` aborts both, plus `UpdateService` and `/pair`.
