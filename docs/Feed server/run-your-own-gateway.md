---
title: Run your own gateway
excerpt: One Docker Compose project, one command to register a publisher. You only need this if you do not want to use the shared gateway.
hidden: false
---

Most feed servers publish to the shared gateway and never run one. Run your own when you want your own domain, your own registrations, or a private deployment.

## Start it

```sh
cp deploy/feed/.env.example deploy/feed/.env            # set BROADCAST_PUBLIC_URL and the two keys it names
docker compose --env-file deploy/feed/.env -f deploy/feed/compose.yaml up -d --build
curl --fail http://127.0.0.1:8090/healthz               # {"status":"ok"}
```

The project starts the gateway and the streaming components it needs. For a public address, start the separate ingress project with your domain:

```sh
cp deploy/ingress/feed/.env.example deploy/ingress/feed/.env   # FEED_DOMAIN, ACME_EMAIL
docker compose --env-file deploy/ingress/feed/.env -f deploy/ingress/feed/compose.yaml up -d
```

It obtains the certificate itself and exposes only the feed API, the publisher API, and the stream.

## Register a publisher

```sh
docker compose --env-file deploy/feed/.env -f deploy/feed/compose.yaml \
  --profile operator run --rm gateway-ctl register \
  --server 3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d --label "copy trading" --host https://copytrading.example.com
```

It prints the server ID, the channel, and the credential, once. Hand the publisher those, plus your public gateway address. To let an MCP server wake phones through your gateway, register it with `--for relay` instead. `rotate` adds a second credential, `revoke` ends one, `list` shows what is registered.

Prefer a browser? Set `BROADCAST_ADMIN_PASSWORD_HASH` (print one with `gateway-ctl password`) and the same operations appear on `/admin`.

## Push wake-ups

Point `BROADCAST_PUSH_CREDENTIALS` at a Firebase service-account file, with `BROADCAST_PUSH_ENDPOINT` and `BROADCAST_PUSH_ENVIRONMENT`, and start with the `compose.push.yaml` overlay. Without it, everything works except wake-ups while the app is closed.

## Storage

The preset keeps a SQLite file in a named volume. On a platform without a disk, set `BROADCAST_DATABASE_URL` to a Postgres database instead. Back up the volume while the gateway is stopped; never run an older image against a newer database.

Everything else, from every variable to the hosted DigitalOcean specs, is in `feed-gateway/README.md` and `deploy/README.md` in the repository.
