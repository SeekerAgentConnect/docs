---
title: Optional Firebase
excerpt: Content-free invalidation pings. Foreground streams and periodic sync work with Firebase off. A ping authorizes nothing.
hidden: false
---

Firebase Cloud Messaging is **optional**. Leave `FCM_PROJECT_ID` empty and omit `google-services.json` for a build that never registers or posts.

Physical-device delivery, Doze timing, and real token refresh are **not** inferred from automated tests. Record those separately if you run them.

## Owner sidecar (private requests)

- Android: operator-supplied `google-services.json` for application ID `io.github.brrenat.seekervault`.
- Sidecar: `FCM_PROJECT_ID` plus Application Default Credentials. The process logs neither project nor credential data.
- App-visible payload: only `kind=request_invalidation` and `version=1`. No request id, no content.
- New pending requests use high priority; later changes use normal. Five-minute TTL and a collapse key.
- Android accepts only that map and enqueues unique WorkManager Sync.

Permission denial suppresses **presentation** only. Registration, streams, and Sync continue.

## Shared gateway (feeds)

- Same Firebase project as the APK.
- `BROADCAST_PUSH_CREDENTIALS_FILE` (preferred) mounted into the gateway only.
- Payload `kind=feed_invalidation`.
- `BROADCAST_PUSH_ENVIRONMENT` is a **topic label** (`feed.<environment>.<server_id>`), not the Solana cluster and not sandbox-versus-production execution. See [environments](/docs/environments).

Empty credentials → `no_push`. Snapshot, stream, and manual reads continue.

**Publishers must never mount FCM credentials.** Topic push is a side effect of publishing on the gateway.

## What Firebase does not do

It does not approve, sign, open a wallet, bypass Force stop, or replace Stage 5.2 foreground and periodic paths when a ping is delayed or dropped.
