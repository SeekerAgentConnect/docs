---
title: Direct sidecar reverse proxy
excerpt: Terminate TLS on the sidecar so the HTTP/2 update stream survives. This is separate from the shared feed gateway.
hidden: false
---

The owner sidecar’s production `UpdateService` needs HTTP/2 (TLS/ALPN, or a development h2c port). An HTTP/1.1 reverse proxy in front of it will not carry the bidirectional subscribe stream.

`deploy/server/compose.direct.yaml` is that path. It can run beside the shared gateway and keeps the original Compose project name and `sidecar-data` volume.

```sh
cd deploy/server
cp direct.env.template .env.direct
chmod 600 .env.direct
mkdir -p tls secrets/sidecar
chmod 0755 tls
chmod 0700 secrets/sidecar
sudo chown 10001:10001 secrets/sidecar
./tls-from-tailscale.sh
docker compose -f compose.direct.yaml up -d sidecar
tailscale funnel --bg --tcp=10000 tcp://localhost:8443
```

Agents use the sidecar origin, **not** the feed domain: `https://<node>:10000/mcp` with `Authorization: Bearer <MCP_TOKEN>`. Pairing codes must carry that same origin as `SIDECAR_PUBLIC_URL`.

`network_mode: host`. TLS material mounts at `/run/tls`. Funnel must be **TCP** mode so HTTP/2 ends in the container.

Typical ports in the template: sidecar `8443`, public `10000`.

A Tailscale Funnel already serving web on 443 needs a different public port (`GATEWAY_PUBLIC_PORT=8443` for the feed side, `10000` for the sidecar).
