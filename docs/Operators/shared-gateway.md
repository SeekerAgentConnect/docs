---
title: Shared gateway
excerpt: Deploy the feed gateway phones read and publishers write. Registration is an operator act, on the CLI or the admin page.
hidden: false
---

The feed gateway (`feed-gateway/`, Go) stores public manifests and feed documents from authenticated publishers and serves them to anonymous phones. It never routes a private request, never learns a subscriber's decision, and never contacts a publisher. It can also wake phones: topic push for feeds, and a relay for direct servers you do not host.

## Listeners

| Variable | Default | Serves |
| --- | --- | --- |
| `BROADCAST_READ_ADDRESS` | `127.0.0.1:8090` | Anonymous `FeedService`, the phone-facing `/relay/v1/installations` routes, `/healthz` |
| `BROADCAST_PUBLISHER_ADDRESS` | `127.0.0.1:8091` | Authenticated `PublisherService`, `/relay/v1/notify`, `/healthz` |
| `BROADCAST_ADMIN_ADDRESS` | `127.0.0.1:8092` | The admin page under `BROADCAST_ADMIN_PATH` (`/admin`); exists only when `BROADCAST_ADMIN_PASSWORD_HASH` is set |

The three addresses must differ. `BROADCAST_PUBLIC_URL` is the origin every published manifest must name and every phone compares with its feed reference: HTTPS with no path, or loopback HTTP for development. A wrong origin has no error on the gateway; publications succeed and every phone refuses the manifest.

## Storage

Exactly one of the two, with no default; setting both is refused at startup.

| Variable | Store | For |
| --- | --- | --- |
| `BROADCAST_DATABASE_PATH` | A SQLite file (`/data/broadcast.db` in the preset) | A host with a disk. Local storage only |
| `BROADCAST_DATABASE_URL` | Postgres | A diskless platform such as App Platform. Tables live in a `gateway` schema with row-level security on |

Eight tables: publisher, credential hashes, manifest, proposals, channel sequence, outbox, and the relay's installation and binding. No table names a subscriber.

## Start

```sh
cp deploy/feed/.env.example deploy/feed/.env   # set CENTRIFUGO_API_KEY and CENTRIFUGO_TOKEN_KEY
docker compose --env-file deploy/feed/.env -f deploy/feed/compose.yaml up -d --build
curl --fail http://127.0.0.1:8090/healthz
# {"status":"ok"}
```

Public HTTPS is the separate `deploy/ingress/feed` project (`FEED_DOMAIN`, `ACME_EMAIL`); start the gateway first. Starting the stack creates no publisher.

## Register a publisher

`feed-gatewayctl` writes the database directly; in Compose it is the `gateway-ctl` operator profile. It reads `BROADCAST_DATABASE_PATH` or `BROADCAST_DATABASE_URL`, or `--database`.

```sh
docker compose --env-file deploy/feed/.env -f deploy/feed/compose.yaml \
  --profile operator run --rm gateway-ctl register \
  --server 3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d --label "copy trading" \
  --host https://copytrading.example.com
```

It prints the server ID, the channel `server/<uuid>`, an 8-character credential handle and the secret, once. Only the SHA-256 is stored. Give the publisher those values plus the public origin and the publisher API address.

| Command | Does |
| --- | --- |
| `register --server <uuid> --label <note> [--host <url>] [--for publish, relay or both]` | Registers and issues one credential. Refuses an existing ID. `--for` defaults to `publish` |
| `capabilities --server <uuid> --for publish, relay, both or none` | Turns a capability on or off. Revokes nothing; a disabled capability refuses its credentials until enabled again |
| `rotate --server <uuid> [--for publish or relay]` | Adds a second credential so the first can be retired without downtime |
| `revoke --credential <id>`, `revoke --server <uuid> --all` | Ends one credential, or all of a publisher's. Its documents stay |
| `list [--server <uuid>]` | What is registered, and which credentials exist |
| `forget --server <uuid> --yes` | Removes the publisher and everything it published |
| `password` | Reads a password on stdin and prints the `BROADCAST_ADMIN_PASSWORD_HASH` line |

A credential works for one capability. `--host` is administrative metadata: the gateway never fetches it and it grants nothing.

## The admin page

The same operations in a browser, through the same database; each surface sees the other's work at once, with no restart. It exists only when `BROADCAST_ADMIN_PASSWORD_HASH` is set. Set `BROADCAST_ADMIN_ADDRESS=0.0.0.0:8092` so the ingress can reach it; the feed Caddyfile routes `/admin` to it, and you can delete that block and use an SSH forward to `127.0.0.1:8092` instead.

Protections: a PBKDF2 hash compared in constant time, server-side sessions in an `HttpOnly`, `SameSite=Strict` cookie with an absolute lifetime (`BROADCAST_ADMIN_SESSION_MINUTES`), a CSRF token on every mutation, login rate limiting, and `Content-Security-Policy: default-src 'none'`. A publisher credential is never an admin credential. Sessions end on restart. The page never claims a publisher is online and counts no subscribers.

## Publisher presence

Every authenticated publisher call is a check-in; `PublisherService.Heartbeat` is for a quiet publisher. Phones ask `FeedService.GetFeedStatus` and see a feed online until three `BROADCAST_HEARTBEAT_SECONDS` (default 30, so 90 s) pass without a check-in. The demos run the loop. Your own publisher must call `Heartbeat` on the interval the gateway answers with, or its feed reads offline.

## Push

`BROADCAST_PUSH_CREDENTIALS` is a service-account file path or, on a platform with no file mount, the JSON document itself. With `BROADCAST_PUSH_ENDPOINT` and `BROADCAST_PUSH_ENVIRONMENT` (all three or none) it turns on topic push for feeds and the relay for direct servers. `deploy/feed/compose.push.yaml` mounts `BROADCAST_PUSH_CREDENTIALS_FILE` read-only into the gateway alone.

For the relay the gateway stores an installation ID it minted, the hash of the installation secret, the device's current FCM registration, and which servers the device authorized. Never a request or a decision. `BROADCAST_RELAY_*` set the rates and the three lifetimes. See [Firebase](/docs/firebase).

## Centrifugo and Redis

`BROADCAST_STREAM_URL`, `BROADCAST_STREAM_API_KEY` and `BROADCAST_STREAM_TOKEN_KEY` turn on the live stream, all three or none. Centrifugo fans documents out and verifies the listener tickets the gateway mints; Redis is Centrifugo's bounded recovery cache and never gateway storage. Leave the stream URL empty until the feed ingress runs, because a ticket for an unrouted stream helps nobody. The database stays the authority; a listener that cannot recover reads a snapshot.

## Trusted proxies

`BROADCAST_TRUSTED_PROXIES` is the exact CIDR whose `X-Forwarded-For` may key read and login rate limits; the preset sets it to the ingress subnet, and loopback is always trusted. Publishers never join that network.
