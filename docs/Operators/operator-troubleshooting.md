---
title: Troubleshooting for operators
excerpt: Health checks, the Live state, feed ingress paths, presence, the relay, push credentials, h2c probes, ownership locks and host lists.
hidden: false
---

## Health checks

| Component | Check | Expect |
| --- | --- | --- |
| MCP server, native TLS | `docker compose … exec mcp-server node mcp-server/dist/healthcheck.js`, then `docker inspect --format '{{json .State.Health}}' <container>` | Exit 0 and `healthy`. A public `curl https://direct.example.com:8443/healthz` prints `404`: `/healthz` answers loopback only |
| MCP server, loopback development | `curl --fail http://127.0.0.1:8080/healthz` | `{"status":"ok"}` |
| Feed gateway | `curl --fail http://127.0.0.1:8090/healthz` | `{"status":"ok"}`, and the ingress container reports healthy |
| SKR staking server | Container health (a Node probe) and the startup log | `healthy`; the log says `live updates are served as gRPC over HTTP/2 at …` or `… are not served` |

## Symptoms

| Symptom | What to try |
| --- | --- |
| The phone never shows **Live** for a direct server | Live is the HTTP/2 proof. `curl --http2 -sS -o /dev/null -w '%{http_version}'` against `/seekervault.request.v1.UpdateService/Sync` must print `2`. Remove any HTTP/1 proxy; use native TLS, a raw TCP forward, or `SIDECAR_H2C=true` behind an HTTP/2 platform |
| Home says "No live updates" or "Upgrade for live updates" | The server advertises no update endpoint. Configure the TLS listener, `SIDECAR_H2C`, or `SKR_STAKING_H2C`, and let the phone refresh the connection |
| Phones cannot read a feed through the ingress | The rule must match the full `/seekervault.gateway.v1.FeedService` path and preserve it. A prefix of `/seekervault.gateway.v1` does not match: the next character is `.`, not `/` |
| The phone shows "Feed offline · N pending" | The gateway is reachable; the publisher has not checked in within 3 × `BROADCAST_HEARTBEAT_SECONDS`. Start the publisher, or make your own publisher call `PublisherService.Heartbeat` on the interval the gateway names. Published items stay readable |
| `GetFeedStatus` returns 404 | The gateway predates presence. Phones show the feed as Connected (unknown, never online). Upgrade the gateway; publishers resume check-ins on their own |
| Feed snapshot works but Live does not | Compare the three `BROADCAST_STREAM_*` values with Centrifugo's keys and inspect Centrifugo health. Leave the stream URL empty without an ingress |
| A publication gets 404 | `PUBLISHER_PUBLISH_URL` points at the read listener. Use the combined overlay or the authenticated publisher origin |
| Publisher `other_gateway`, or phones refuse the manifest | `PUBLISHER_GATEWAY_URL` must equal `BROADCAST_PUBLIC_URL` character for character, port included |
| A relay wake-up never arrives | In order: the server logs `gateway push relay is configured`; the registration has `relay` enabled (`feed-gatewayctl list`, then `capabilities`) and the credential was issued `--for relay`; the phone build was configured with this gateway's origin (`-Pseekervault.relayUrl`), the only relay it honours; the gateway has `BROADCAST_PUSH_CREDENTIALS`; the app is not force-stopped. Above the per-device rate the gateway answers that the device is already being woken |
| The gateway exits on push settings | `BROADCAST_PUSH_CREDENTIALS` is a path unless it starts with `{`, which is parsed as the JSON document; `\n` inside the PEM is accepted. Otherwise mount a file with `compose.push.yaml`. `BROADCAST_PUSH_ENDPOINT` and `BROADCAST_PUSH_ENVIRONMENT` must be set with it |
| h2c container unhealthy, or a platform health check fails | With `SIDECAR_H2C=true` the probe speaks HTTP/2 cleartext and refuses `SIDECAR_H2C` beside TLS paths. On App Platform use a TCP health check; HTTP/1 checks fail against h2c |
| `the direct store is already in use`, `database is already owned` | Another MCP server holds the ownership transaction. Stop it. Do not delete `*.mcp-server-owner.sqlite`; pairing commands still work meanwhile |
| `SKR_STAKING_ALLOWED_HOSTS contains "…", which is not a host name or address` | The list is comma-separated host names or addresses with no scheme, port or wildcard. Startup stops rather than dropping the entry |
| Agent `Host` or `Origin` rejected with 403 | Add the hostname to `MCP_ALLOWED_HOSTS` (no scheme or port); the hostname of `SIDECAR_PUBLIC_URL` is allowed already. HTTP/2 `:authority` is accepted in place of `Host` |
| `address already in use` | Compare `docker compose config` with the port table. Feed admin and the CopyTrading API both default to loopback 8092; SKR staking and feed read to 8090 |
| A certificate never issues | DNS, ports 80/443 free for the ingress project, domain match; read Caddy logs. Use a DNS challenge for the direct certificate when feed Caddy owns port 80 |
| The admin page is absent | Set `BROADCAST_ADMIN_PASSWORD_HASH` from `feed-gatewayctl password` and `BROADCAST_ADMIN_ADDRESS=0.0.0.0:8092`. The startup log says `serving operator administration` or `no operator password is configured` |
| A volume naming warning | Stop and inspect both volumes. Never delete one to silence Compose |

App-user symptoms: [Troubleshooting for app users](/docs/user-troubleshooting).
