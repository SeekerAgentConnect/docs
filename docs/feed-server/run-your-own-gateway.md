---
title: Run your own gateway
description: "One Docker Compose project, one command to register a publisher as Public or Restricted. You only need this if you do not want to use the shared gateway."
slug: /run-your-own-gateway
sidebar_position: 5
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

It prints the server ID, the channel, and the credential, once. Hand the publisher those, plus your public gateway address. To let an MCP server wake phones through your gateway, register it with `--for relay` instead. `rotate` adds a second credential, `revoke` ends one, `list` shows what is registered, and marks each Restricted publisher with its origin and live grant count.

Prefer a browser? Set `BROADCAST_ADMIN_PASSWORD_HASH` (print one with `gateway-ctl password`) and the same operations appear on `/admin`.

## Public or Restricted

A publisher is registered **Public** unless you say otherwise. To register a subscriber-only feed, add the policy and the publisher's authentication origin, its `PUBLISHER_AUTH_ORIGIN` character for character:

```sh
docker compose --env-file deploy/feed/.env -f deploy/feed/compose.yaml \
  --profile operator run --rm gateway-ctl register \
  --server 3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d --label "signals" \
  --access restricted --auth-origin https://auth.example.com
```

To switch an existing publisher, use `access --server <id> --access public|restricted` with the same `--auth-origin` rule. `--auth-origin` is required for Restricted and refused for Public. The origin must be HTTPS with no path, query or fragment; plain HTTP is accepted only on loopback.

You control only the policy. Which subscribers may read is the publisher's decision, made on its own server; your gateway enforces it on every read, stream ticket and push target, and never sees a wallet address. A policy change retires the live streams issued under the old policy but does not revoke grants already issued; ask the publisher to publish its manifest again afterwards. `BROADCAST_MAX_GRANT_HOURS` (default 24) caps how long any access grant lasts. The whole flow is on [Run a Restricted feed](/docs/restricted-feeds).

On `/admin`, **Add server** has a **Who may read its feed** choice, and each publisher's page has a **Who may read** form: choose **Restricted — only devices the publisher approved**, enter the **Authentication origin**, type the server ID to confirm a change, and **Save access**.

## Push wake-ups

Point `BROADCAST_PUSH_CREDENTIALS` at a Firebase service-account file, with `BROADCAST_PUSH_ENDPOINT` and `BROADCAST_PUSH_ENVIRONMENT`, and start with the `compose.push.yaml` overlay. Without it, everything works except wake-ups while the app is closed. A Public feed's wake-ups go to a shared topic. A Restricted feed has no topic: each approved device registers its own push target under its grant, and the target is dropped when the grant ends.

## Storage

The preset keeps a SQLite file in a named volume. On a platform without a disk, set `BROADCAST_DATABASE_URL` to a Postgres database instead. Back up the volume while the gateway is stopped; never run an older image against a newer database.

Everything else, from every variable to the hosted DigitalOcean specs, is in `feed-gateway/README.md` and `deploy/README.md` in the repository.
