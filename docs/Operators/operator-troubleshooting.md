---
title: Troubleshooting for operators
excerpt: Tokens, Host headers, certificates, Funnel ports, publisher origins, and push.
hidden: false
---

| Symptom | What to try |
| --- | --- |
| Missing `MCP_TOKEN` / `PHONE_TOKEN` | Copy the env template; fill placeholders; they must differ |
| Agent Host header rejected | Add the name to `MCP_ALLOWED_HOSTS` or the public overlay domain |
| Port 8080 busy | Stop `pnpm dev:sidecar` or change `GATEWAY_PORT` |
| Certificate never issues | DNS, ports 80/443, domain match; read Caddy logs |
| Claude finds no authorization server | OAuth overlay + `MCP_OAUTH_ISSUER`; check well-known URLs |
| Test-agent fails under OAuth | Keep `AGENT_MCP_URL` on loopback, not the public domain |
| Funnel `already serving web on 443` | Use `GATEWAY_PUBLIC_PORT=8443` / `--tcp=8443` for the feed side |
| Publisher `other_gateway` | `PUBLISHER_GATEWAY_URL` must equal the public origin **including port** |
| Proxy unhealthy after restart | Restart the publisher **with** its proxy (`network_mode: service:…`) |
| Orphan sidecar warning | Expected when using `compose.direct.yaml`; do not `--remove-orphans` unless you mean to |
| Prediction publishes nothing | `prediction-ctl discovery` / `publishctl discovery` — check filters and `last_cycle` |
| Push `no_push` | Supported without Firebase; or fix the credential mount |
| Invitation page opens, SAC cannot connect | Manifest `gateway_url` must match the page origin |
| `NO_BINDING` on private requests | Use the `connection_id` returned for that invitation |
| Live updates missing behind `gateway/` Caddy | Use [direct sidecar reverse proxy](/docs/direct-sidecar-proxy) |

App-user symptoms: [Troubleshooting for app users](/docs/user-troubleshooting).
