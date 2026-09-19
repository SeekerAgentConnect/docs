---
title: Shared gateway
excerpt: Deploy the broadcast gateway phones read and publishers write. Registration is a local operator act.
hidden: false
---

The shared gateway holds public feed documents, fans them out, and (separately) creates private invitations and device bindings. It does not create SAC users or see wallets.

## Local development

```sh
cd broadcast
cp .env.example .env
# set CENTRIFUGO_API_KEY and CENTRIFUGO_TOKEN_KEY (openssl rand -base64 32 each)
docker compose up -d --build
docker compose run --rm ctl register --server 3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
```

Internet-facing:

```sh
docker compose -f compose.yaml -f compose.public.yaml up -d --build
docker compose -f compose.yaml -f compose.public.yaml -f compose.push.yaml up -d --build
```

Four services: gateway, Centrifugo, Redis, proxy. Only the proxy port is published. Starting the stack creates **no** publisher.

Without Docker:

```sh
BROADCAST_PUBLIC_URL=http://127.0.0.1:8090 BROADCAST_DATABASE_PATH=./broadcast.db \
  go run ./cmd/broadcast
```

Native listeners (defaults):

| Variable | Default | Audience |
| --- | --- | --- |
| `BROADCAST_READ_ADDRESS` | `127.0.0.1:8090` | Phones, anonymous feed reads |
| `BROADCAST_PUBLISHER_ADDRESS` | `127.0.0.1:8091` | Authenticated publishers |
| `BROADCAST_CLIENT_ADDRESS` | `127.0.0.1:8092` | Invitations and device credentials |

`BROADCAST_PUBLIC_URL` is the origin every published manifest must name. Phones compare it with the feed or invitation they added. Wrong origin → a feed nobody can read.

`BROADCAST_STREAM_URL` plus broker keys turn the live stream on. Without them the gateway still serves unary reads and tells a phone there is no stream.

## Register a publisher

There is no network signup. `broadcastctl register` writes the database:

```
publisher    <uuid>
channel      server/<uuid>
credential   <8-character handle>
<43-character secret, shown once>
```

Rotate with `rotate`, then `revoke --credential <id>`. `forget --server <uuid> --yes` removes a publisher and what it published. Revoking stops future publications; it does not unpublish what phones already stored.

## Packaged one-server layout

From `deploy/server/`:

| Compose files | What runs |
| --- | --- |
| `-f compose.yaml` | Gateway, HTTPS/HTTP2 proxy, Centrifugo, Redis |
| `+ compose.demos.yaml` | CopyTrading and Prediction demos |
| `+ compose.tailscale.yaml` | MagicDNS + Funnel |
| `-f compose.direct.yaml` | Optional owner sidecar (independent project and volume) |

Public phones: `https://feeds.example.com:443`. Publisher ingress stays on a private Docker network. Demo control APIs bind `127.0.0.1:8092` and `127.0.0.1:8094`.

Never `docker compose down -v` casually: `-v` deletes SQLite volumes that hold identities, publications, requests, and pairing.

Copy `.env.template` to `.env`, chmod `0600`, generate Centrifugo keys, set `BROADCAST_DOMAIN` and `ACME_EMAIL` with **no** scheme. Compose derives `https://<domain>`. Secrets directories belong to uid `10001`.
