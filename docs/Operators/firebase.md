---
title: Firebase
excerpt: Three content-free push paths. Foreground streams and periodic sync work with Firebase off. A wake-up authorizes nothing.
hidden: false
---

Firebase Cloud Messaging is optional everywhere. Every message is a fixed, content-free wake-up: the phone then reads its own server or the gateway for everything that matters. No request ID, document or decision travels in a push.

| Path | Who sends | Who holds the credential | Payload |
| --- | --- | --- | --- |
| Feed topic push | The feed gateway, after a publication commits | The gateway operator: `BROADCAST_PUSH_CREDENTIALS` | `kind=feed_invalidation`, `version=1`, to topic `feed.<environment>.<server_id>` |
| A direct server's own sender | The direct server, after a request change commits | That server's operator: `FCM_PROJECT_ID` plus Application Default Credentials | `kind=request_invalidation`, `version=1`, to the phone's registration |
| Gateway push relay | The feed gateway, on behalf of a direct server it does not host | The gateway operator's `BROADCAST_PUSH_CREDENTIALS`; the server holds only a relay credential | The same `request_invalidation`, to the one device that authorized that server |

The Android build must carry the same Firebase project's `google-services.json` (application ID `io.github.brrenat.seekervault`). Without it, registration is a no-op and nothing else changes.

## Feed topic push (gateway operator)

```dotenv
BROADCAST_PUSH_CREDENTIALS_FILE=/run/secrets/seeker-broadcast-fcm.json
BROADCAST_PUSH_ENDPOINT=https://fcm.googleapis.com
BROADCAST_PUSH_ENVIRONMENT=production
```

Start with `deploy/feed/compose.push.yaml`, which mounts the file read-only into the gateway alone as `BROADCAST_PUSH_CREDENTIALS`. On a platform with no file mount, `BROADCAST_PUSH_CREDENTIALS` may hold the service-account JSON itself: a value starting with `{` is parsed as the document. All three settings go together. `BROADCAST_PUSH_ENVIRONMENT` (`production` or `sandbox`) is a topic label, not a Solana cluster and not the execution environment; give two deployments on one project different values. Phones learn topic names from `FeedService.GetFeedTopics`; without a credential the gateway answers `NO_PUSH`. Publishers never mount FCM credentials.

## A direct server's own sender (direct-server operator)

Set `FCM_PROJECT_ID` and point `GOOGLE_APPLICATION_CREDENTIALS` at a service account mounted outside the image, or use an attached service account. The server logs `FCM sender is configured through Application Default Credentials` or `FCM sender is off`, never the project or the credential. A new pending request is high priority, later changes normal, with a five-minute TTL and a collapse key. The staking server has no sender of its own; it uses the relay.

## The gateway push relay (both operators)

A developer-hosted direct server wakes its paired phone through the gateway without a Firebase project of its own.

1. The gateway operator enables `relay` and issues a relay credential: `feed-gatewayctl register --server <uuid> --label "your server" --for relay`, or for an existing publisher `capabilities --server <uuid> --for both` then `rotate --server <uuid> --for relay`, or the relay box on the admin page. They hand back the gateway origin, the server ID and the credential, shown once.
2. The server operator sets `RELAY_URL`, `RELAY_SERVER_ID` and `RELAY_CREDENTIAL` (staking server: `SKR_STAKING_RELAY_URL`, `SKR_STAKING_RELAY_SERVER_ID`, `SKR_STAKING_RELAY_CREDENTIAL`). All three or none; a partial set stops startup. Configuring the relay beside `FCM_PROJECT_ID` is refused.
3. The server advertises the relay in `GetConnectionCapabilities`. The phone honours only the relay origin its build was configured with (`-Pseekervault.relayUrl=https://feeds.example.com`), enrols with that gateway, authorises a binding for the connection, and registers the handle with the server through `PairingService.SetRelayHandle`.
4. The server calls `POST /relay/v1/notify` on the publisher listener; the phone-facing routes live under `/relay/v1/installations` on the read listener. Neither exists on the other's listener.

The gateway needs `BROADCAST_PUSH_CREDENTIALS` to send. Without it a phone can still enrol, and a server asking for a wake-up is told the relay cannot send right now. `BROADCAST_RELAY_*` bound rates and lifetimes: a binding lasts `BROADCAST_RELAY_BINDING_HOURS` (default 720) unless renewed, an idle installation is forgotten after `BROADCAST_RELAY_IDLE_HOURS` (1440), and an enrollment that authorized nothing after `BROADCAST_RELAY_UNBOUND_HOURS` (24). Disabling the capability refuses every relay credential at once; enabling it again makes the same ones work.

## What the gateway holds for the relay

An installation ID it minted, the SHA-256 of the installation secret, the device's current FCM registration, and which servers the device authorized. The registration is never returned, rendered or logged. No request, approval, signature, wallet or decision is stored, and the admin page never says "online".

## What Firebase does not do

It does not approve, sign, open a wallet, or survive Force stop. A delayed or dropped push costs nothing: foreground streams, manual refresh and periodic sync remain the authoritative paths, and a push cannot select a request or reach wallet code.

## What is not verified live

The app repository treats physical-device delivery, Doze timing, token refresh and a real send as separate opt-in checks (a physical Seeker runbook, and `SEEKERVAULT_FCM_CREDENTIALS` for the gateway's relay test). Automated tests inject the sender and prove integration logic, not delivery. Record your own device run before relying on wake-ups.
