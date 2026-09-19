---
title: Public feed sandbox
excerpt: Publish a manifest, add the feed in SAC, publish revise and cancel a request, and review it as Simulate — without signing or sending.
hidden: false
---

This walkthrough builds a **public `gateway_feed`** using the CopyTrading template. Every subscriber receives the same document. Each owner’s amount, approval, and signature stay on their phone.

**Sandbox is not a Solana network.** The template publishes real mint pairs and the phone builds a real Jupiter route. The wallet is **not** opened and **nothing is sent**. Activity records **Simulated**.

## Prerequisites

- Go 1.27.1 or newer.
- `curl` and `openssl`.
- A broadcast gateway origin and a publisher credential from an operator (or your own local gateway).
- SAC on a phone that can reach that gateway origin.

This is the **developer** path. Gateway TLS, DNS, and registration are [operator](/docs/shared-gateway) steps. The owner’s taps are called out explicitly.

Placeholders:

```sh
export PUBLISHER_SERVER_ID=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
export PUBLISHER_GATEWAY_URL=http://127.0.0.1:8090
export PUBLISHER_PUBLISH_URL=http://127.0.0.1:8091
export BROADCAST_CREDENTIAL=replace-with-publisher-credential
export PUBLISHER_API_TOKEN=replace-with-at-least-32-characters
```

`BROADCAST_CREDENTIAL` is how the **gateway** knows you. `PUBLISHER_API_TOKEN` is how **your** strategy process talks to the template. Do not mix them.

If the gateway’s publish listener is a different origin than the public read origin, you must set `PUBLISHER_PUBLISH_URL`. A publish aimed at the read port returns 404.

## 1. Be registered

```sh
cd broadcast
go run ./cmd/broadcastctl register --database ./broadcast.db \
  --server 3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d --label "copy trading"
```

Save the 43-character secret as `BROADCAST_CREDENTIAL`.

## 2. Start the CopyTrading template in sandbox

Both example env files ship as sandbox. A deployment that omits `PUBLISHER_ENVIRONMENT` does not start.

```sh
cd publisher
PUBLISHER_SERVER_ID=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d \
PUBLISHER_GATEWAY_URL=http://127.0.0.1:8090 \
PUBLISHER_PUBLISH_URL=http://127.0.0.1:8091 \
PUBLISHER_ENVIRONMENT=sandbox \
PUBLISHER_DISPLAY_NAME="Copy trading demo" \
PUBLISHER_DATABASE_PATH=./copytrading.db \
BROADCAST_CREDENTIAL="$BROADCAST_CREDENTIAL" \
PUBLISHER_API_TOKEN="$PUBLISHER_API_TOKEN" \
go run ./cmd/copytrading
```

On start it publishes a `gateway_feed` manifest, then prints a reference with **no secret**:

```text
seekervault://feed?v=1&gateway=http%3A%2F%2F127.0.0.1%3A8090&server=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
```

You can put that line in a README. Holding it grants nothing.

`GET /v1/manifest` on the template API returns the same reference.

## 3. Add the feed in SAC

There is no deep link. The owner must be on **Add connection**.

1. **Connections → Add connection**.
2. Paste the `seekervault://feed?…` line (or scan a QR of it).
3. Confirm **Add this public feed?** — gateway origin, server ID, public broadcast, no credential, publisher is not contacted.
4. Tap **Add feed**.

The new connection opens with display name, **Sandbox**, and required plugin `jupiter.swap`. Snapshot and live stream start without restarting the app.

## 4. Publish a request

Primary path: `POST /v1/requests` with `Idempotency-Key`. `/v1/signals` is a compatibility alias.

```sh
curl -sS http://127.0.0.1:8092/v1/requests \
  -H "Authorization: Bearer $PUBLISHER_API_TOKEN" \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: desk-1-sol-usdc-demo' \
  -d '{
    "expires_at": "2030-01-01T00:00:00Z",
    "note": "trimming SOL into USDC on the bounce",
    "terms": {
      "input_mint": "So11111111111111111111111111111111111111112",
      "input_decimals": "9",
      "output_mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "output_decimals": "6",
      "max_slippage_bps": "50"
    }
  }'
```

Or `sdk.Client.CreateRequest`, or:

```sh
publishctl create --in 2h --note "trimming SOL into USDC on the bounce" \
  --term input_mint=So11111111111111111111111111111111111111112 \
  --term input_decimals=9 \
  --term output_mint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v \
  --term output_decimals=6 \
  --term max_slippage_bps=50
```

There is **no amount** and no side. Amount is chosen on each phone.

Unknown JSON fields are refused. A body that includes `amount` is a 400, not a silent drop.

Status codes: **201** created and published, **202** stored and not yet published, **502** created and gateway-refused, **200** idempotent replay.

## 5. Review in sandbox

1. Open the signal from Home or the feed’s **Signals** row.
2. Under **Your part**, enter an amount (and slippage if shown).
3. Tap **Get a quote and prepare**. The phone fetches a live quote and reads the bytes.
4. Read the facts, then the rules panel.
5. Tap **Simulate** (not **Approve and swap**).

Expected Activity: **Simulated. This feed is a sandbox, so nothing was signed and nothing was sent.** No explorer link.

The publisher is **not** notified. Feed result handling is `DEVICE_LOCAL`.

Simulate spends the proposal on this device. The same request is not then executable as a real send on this phone.

## 6. Revise and cancel

Replace the whole statement (revision bumps only if content changed):

```sh
curl -sS -X PUT http://127.0.0.1:8092/v1/requests/$ID \
  -H "Authorization: Bearer $PUBLISHER_API_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "expires_at": "2030-01-01T00:00:00Z",
    "note": "Tightening the slippage cap to 0.3%.",
    "terms": {
      "input_mint": "So11111111111111111111111111111111111111112",
      "input_decimals": "9",
      "output_mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "output_decimals": "6",
      "max_slippage_bps": "30"
    }
  }'
```

Withdraw:

```sh
curl -sS -X POST http://127.0.0.1:8092/v1/requests/$ID/cancel \
  -H "Authorization: Bearer $PUBLISHER_API_TOKEN"
```

Broadcast cancellation changes the source document for everyone. One subscriber’s hide or simulate changes only that device.

Retry a refused publication: `POST /v1/requests/{id}/retry`.

## Prediction template (read-only writes)

`cmd/prediction` discovers markets itself. `POST /v1/requests`, `PUT`, and cancel answer **403 `written_by_discovery`**. Use `GET /v1/discovery` and `POST /v1/discovery/poll`. It needs its **own** server ID and credential.

It publishes no side. The phone reads the market from the provider when the owner looks.

## Promoting to production

Production is a **new deployment promise**: a different `PUBLISHER_ENVIRONMENT`, typically a different server ID. The gateway refuses changing environments on an existing server ID. On the phone, only the owner switches a connection from Sandbox to Production when the manifest serves both.

Do not describe that switch as “point it at devnet.”
