---
title: Direct server ingress
excerpt: Terminate TLS in the direct server itself so the HTTP/2 update stream survives. An HTTP/1 proxy carries MCP and unary calls only.
hidden: false
---

A direct server (`mcp-server/`, an SDK server, or the SKR staking server) serves `/mcp`, `/pair`, the phone's unary `PairingService` and `RequestService`, and `UpdateService` on one origin. `UpdateService.Subscribe` is bidirectional gRPC over HTTP/2. An HTTP/1 reverse proxy answers ordinary HTTPS requests but cannot carry that stream; the server then advertises no update endpoint and the phone refreshes by hand.

## Native TLS on 8443

The production path terminates TLS in the Node process. `deploy/mcp/compose.tls.yaml` mounts a read-only PEM directory; the certificate comes from your own ACME client (use a DNS challenge if feed Caddy owns port 80).

```sh
sudo install -d -o 10001 -g 10001 -m 0700 /srv/seeker-direct-tls
sudo install -o 10001 -g 10001 -m 0644 fullchain.pem /srv/seeker-direct-tls/fullchain.pem
sudo install -o 10001 -g 10001 -m 0600 privkey.pem /srv/seeker-direct-tls/privkey.pem
```

```dotenv
MCP_TOKEN=replace-with-mcp-token
PHONE_TOKEN=<a different random value>
MCP_ALLOWED_HOSTS=direct.example.com
SIDECAR_PUBLIC_URL=https://direct.example.com:8443
MCP_TLS_DIR=/srv/seeker-direct-tls
MCP_SERVER_BIND=0.0.0.0
MCP_SERVER_PORT=8443
```

`MCP_TLS_DIR` is the host directory; the overlay sets `SIDECAR_TLS_CERT_PATH` and `SIDECAR_TLS_KEY_PATH` to `/run/tls/fullchain.pem` and `/run/tls/privkey.pem`. `MCP_SERVER_BIND` and `MCP_SERVER_PORT` are the host mapping of container port 8080. For a private test CA, add its PEM to the directory and set `SIDECAR_HEALTH_CA_CERT_PATH=/run/tls/ca.pem`; the health probe then trusts it in addition to Node's roots. Verification is never disabled.

```sh
docker compose --env-file deploy/mcp/.env \
  -f deploy/mcp/compose.yaml -f deploy/mcp/compose.tls.yaml up -d --build
curl --http2 -sS -o /dev/null -w '%{http_version}\n' \
  https://direct.example.com:8443/seekervault.request.v1.UpdateService/Sync
```

It must print `2`. Pair with `node mcp-server/dist/cli.js pair` inside the container; the phone then shows the connection as Live. That state is the proof: an HTTP/1 downgrade passes an ordinary request but cannot produce it. The secure listener omits the Stage 1 `LiveCommandService` and answers `/healthz` only to loopback.

Run the two `install` commands and a restart of `mcp-server` from the ACME client's deploy hook. Do not mount the ACME account directory into the container.

## Why not an HTTP/1 proxy

Caddy, nginx or a load balancer that speaks HTTP/1.1 to the upstream carries `/mcp`, pairing and unary calls, but the server behind it speaks HTTP/1.1, configures no update endpoint, and pairing promises nothing it cannot deliver. Nothing fails visibly; the owner just never gets live updates. Preserve HTTP/2 end to end: native TLS, a raw TCP forward, or an HTTP/2-terminating proxy with h2c.

## `deploy/ingress/direct`

An optional, independent Caddy project (`DIRECT_DOMAIN`, `ACME_EMAIL`, ports 80/443) on the `seeker-direct-ingress` network. It forwards `/mcp`, the OAuth protected-resource metadata, and `PairingService` and `RequestService`, each body capped at 64 KiB, and aborts everything else. It deliberately excludes `/healthz`, `LiveCommandService`, `UpdateService`, and `/pair` with its four assets, so a pairing page through it needs an operator-added route. Credentials pass through untouched and `Host` is not rewritten, so put the domain in `MCP_ALLOWED_HOSTS`. Use it for MCP-only or unary-only access, not as the complete direct path.

## Behind an HTTP/2-terminating platform

On DigitalOcean App Platform (`protocol: HTTP2`), or any proxy that terminates TLS and forwards HTTP/2 cleartext, set:

```dotenv
SIDECAR_HOST=0.0.0.0
SIDECAR_PORT=8080
SIDECAR_PUBLIC_URL=https://direct.example.com
SIDECAR_H2C=true
```

The main listener speaks h2c and advertises the HTTPS origin as the update endpoint. `SIDECAR_H2C` cannot be combined with the TLS paths or `SIDECAR_UPDATE_PORT`, and it requires an `https://` public URL. HTTP/1 health checks fail against h2c; use a TCP check. The staking server has `SKR_STAKING_H2C` with the same rules.

## Hosts and `:authority`

`/mcp` refuses a `Host` that is not loopback, an `MCP_ALLOWED_HOSTS` entry (no scheme, port or wildcard), or the hostname of `SIDECAR_PUBLIC_URL`, which is allowed implicitly. HTTP/2 clients send `:authority` and often omit `Host`; the check accepts either. The staking server reads `SKR_STAKING_ALLOWED_HOSTS`.

## Tailscale

`deploy/operators/tailscale/` is an isolated example, not a default. For a direct server, use the native-TLS overlay with the node's certificate in `MCP_TLS_DIR`, `SIDECAR_PUBLIC_URL=https://<node-name>`, `MCP_SERVER_BIND=127.0.0.1`, `MCP_SERVER_PORT=8443`, then `tailscale funnel --bg --tcp=443 tcp://localhost:8443`. Funnel forwards raw TCP, so the server's own TLS identity and HTTP/2 survive. The feed example (`compose.feed.yaml`, `Caddyfile.feed`) terminates TLS in Caddy on `127.0.0.1:9443` for `FeedService` and the Centrifugo stream only.
