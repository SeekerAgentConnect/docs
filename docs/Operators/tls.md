---
title: TLS
excerpt: Phones verify certificates the normal way. Self-signed certificates fail. HTTP/2 for sidecar updates must terminate on the sidecar.
hidden: false
---

| Deployment | How TLS is obtained |
| --- | --- |
| Shared gateway public overlay | Caddy ACME (Let’s Encrypt / ZeroSSL). DNS A/AAAA already pointing at the host; ports **80** and **443** reachable; `BROADCAST_DOMAIN` + `ACME_EMAIL` |
| Owner `gateway/` public overlay | Same pattern with `GATEWAY_DOMAIN` + `ACME_EMAIL`; volume `gateway-data` |
| Direct sidecar / Tailscale Funnel | `tailscale cert` via `tls-from-tailscale.sh`; Funnel **TCP** mode; refresh on a weekly cron |
| Local development | Plain HTTP on loopback / `adb reverse` only |

Never tell a phone to ignore certificate warnings.

`BROADCAST_PUBLIC_URL` / pairing `SIDECAR_PUBLIC_URL` must match the certificate’s host, including port if it is not 443.

Public private-gateway (owner) routes typically include `/mcp`, pairing, and `RequestService`. They do **not** expose `LiveCommandService` or a public `/healthz` on the internet-facing Caddy.

The shared gateway’s public Caddy does **not** expose `PublisherService`, health, or administration.
