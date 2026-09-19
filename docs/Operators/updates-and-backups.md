---
title: Updates and backups
excerpt: Migrate on start. Back up SQLite volumes. A backup does not restore wallet keys or phone Activity.
hidden: false
---

## Owner sidecar

```sh
git pull
docker compose up -d --build
```

The sidecar migrates its database when it opens. A downgrade is refused if the database is newer than the binary.

Hot backup example (shape only — keep the exact Node snippet from your checkout’s operator guide):

```sh
docker compose exec sidecar node -e '/* VACUUM INTO backup path */'
docker compose cp sidecar:/data/backup.db ./sidecar-$(date +%F).db
```

Restore: stop the container, copy into the volume, `chown 10001:10001`, remove stale `-wal`/`-shm`.

A sidecar backup restores **request history and the credential hash**. It does not restore:

- Seed Vault Wallet keys
- SAC Activity on the phone
- Android Keystore-wrapped credentials

After restore, the phone may need to pair again.

## Shared gateway

Stop broadcast and proxy. Archive `broadcast-data` and `gateway-caddy-data`. Update with `--no-deps` for those services. Demo publishers separately with `--no-deps`.

Redis is not durable by design. Stream recovery uses the broker cache; unary reads still have SQLite.

Never `docker compose down -v` unless you intend to destroy identities, publications, and pairing.

## Image-only hosts

Build `linux/amd64` images on a machine with Docker, `rsync -avL` the `deploy/server` directory **excluding** `.env*`, `tls`, `secrets`, and `backups`, then `docker compose pull` and `up -d --no-build`. A copy that keeps dangling symlinks fails the Centrifugo and Caddy mounts.
