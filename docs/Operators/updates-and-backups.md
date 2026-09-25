---
title: Updates and backups
excerpt: Each component has its own files and schema. Back up while stopped, upgrade the gateway before publishers, never roll a binary back onto a newer schema.
hidden: false
---

## What each component keeps

| Component | Data | Schema |
| --- | --- | --- |
| MCP server | `DATABASE_PATH` SQLite (`~/.seeker-agent-connect/mcp-server/direct-server.db`; Docker `/data/sidecar.db` in `seeker-agent-connect-mcp_mcp-data`) plus a sibling `*.mcp-server-owner.sqlite` lock: server ID, pairing and phone credential hash, requests, results, wallet binding, update state, FCM target or relay handle | `PRAGMA user_version`, currently 7 |
| SKR staking server | `SKR_STAKING_DATABASE_PATH` (`/data/skr-staking-server.db` in `seeker-agent-connect-skr-staking_skr-data`), the same SDK store | Same |
| Feed gateway | `BROADCAST_DATABASE_PATH` (`/data/broadcast.db` in `seeker-broadcast_broadcast-data`) or Postgres `BROADCAST_DATABASE_URL`: registrations, credential hashes, manifests, documents, sequences, outbox, relay installations and bindings | SQLite v6, Postgres v2 |
| Feed ingress | ACME certificates in `seeker-broadcast_proxy-data` and `-config` | none |
| CopyTrading demo | `/data/publisher.db` in `seeker-publisher_publisher-data`: identity, proposals, revisions, outbox | Stamped; sharing a file between demos is refused |
| Prediction demo | `/data/prediction.db` in `seeker-prediction_prediction-data` | Same |
| Centrifugo, Redis | Recovery cache only; nothing to back up | none |
| Android | App-private files: connection metadata, Keystore-encrypted credentials, sync cache, answers, Activity, the wallet session. `allowBackup="false"`; nothing is backed up or transferred between devices | none |

Outside every database: agent tokens, TLS keys, OAuth settings, Firebase credentials, the admin password hash, and publisher credentials (the gateway stores only hashes).

## Back up while stopped

Stop the one writer, archive the exact volume, start it again. SQLite keeps `-wal` and `-shm` beside the file while it runs; copy all three, or copy after a clean stop when none remain.

```sh
docker volume ls
docker compose --env-file deploy/feed/.env -f deploy/feed/compose.yaml stop feed-gateway
docker run --rm -v seeker-broadcast_broadcast-data:/from:ro \
  -v "$PWD/backups:/to" alpine:3.22 tar -C /from -czf /to/feed-gateway-data.tgz .
docker compose --env-file deploy/feed/.env -f deploy/feed/compose.yaml start feed-gateway
```

The MCP server also supports a hot backup with SQLite `VACUUM INTO` from a read-only connection. Restore only while stopped, keep ownership `10001:10001`, remove stale `-wal` and `-shm` files, run `PRAGMA integrity_check`, and confirm the server or publisher ID before resuming traffic. Protect backups as credentials. A Postgres gateway is backed up by the database service.

Never merge two SQLite files; two non-empty volumes are two identities. Never `docker compose down -v`, and never use a wildcard prune or `--remove-orphans` to silence a naming warning.

## Upgrade

Record the image or tarball version, back up, then replace one service: `up -d --build --no-deps <service>`. Every component migrates its schema forward transactionally on first open.

Upgrade the gateway before its publishers. A newer publisher against a gateway without `Heartbeat` keeps retrying its check-in on a slow backoff (a minute, doubling to an hour) and resumes on the gateway's interval once it is upgraded; phones show its feed as Connected (unknown), never offline, in the meantime. Nothing needs restarting in step. Direct servers upgrade independently of the gateway; pairings, credentials and requests stay compatible across source, Docker and npm launches.

MCP ownership is an exclusive SQLite transaction in the lock file; a second live process fails closed. Stop every older process before the first start of a new binary. The lock file persists and must not be deleted.

## Roll back

Rollback is the old image plus its matching pre-upgrade archive. Never point a downgraded binary at a schema a newer binary migrated: the SDK refuses a newer database and exits, and the gateway does the same. Restore the archive into the same empty volume, then start the old image.

## What a backup does not restore

A direct-server backup restores request history and the phone credential hash. It does not restore Seed Vault Wallet keys, SAC Activity, or the Keystore-wrapped credentials on the phone. After a restore the phone may need to pair again; a phone whose data was cleared must pair with every server again.

## If the gateway database is lost

Registrations, credential hashes and relay state go with it. Log in to the admin page (the password is configuration, not a row) or use `feed-gatewayctl`, register every publisher again and hand out new credentials; old secrets cannot be recovered from hashes. For the relay, every installation and binding is gone: a still-paired phone re-enrols and re-authorises on its next reconciliation, but the direct server needs its new relay credential first, and until then its wake-ups are refused. Documents phones already read stay on the phones.
