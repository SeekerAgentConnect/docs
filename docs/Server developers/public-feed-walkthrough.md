---
title: Public feed sandbox
excerpt: Get registered, publish a manifest and a sandbox feed request with curl, add the feed in SAC, review it as Simulate, then update, withdraw, and heartbeat — without signing or sending.
hidden: false
---

This walkthrough builds a **public `gateway_feed`** with nothing but an HTTP client. Every subscriber receives the same document. Each owner's amount, approval, and signature stay on their phone, and nothing comes back to you.

**Sandbox is not a Solana network.** The phone fetches a real Jupiter quote and builds real bytes; the wallet is **not** opened and **nothing is sent**. Activity records **Simulated**.

## Prerequisites

- `curl`, `openssl`, `uuidgen`, and SAC on a phone that can reach the gateway.
- A gateway origin and a publisher credential from an operator, or your own local gateway (`deploy/feed`). TLS, DNS, and registration are [operator](/docs/shared-gateway) steps.

```sh
export PUBLIC_GATEWAY=https://feeds.example.com      # what your manifest names
export PUBLISH_URL=https://feeds.example.com         # where you send publications
export PUBLISHER_ID=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
export CHANNEL=server/$PUBLISHER_ID
export PUBLISHER_CREDENTIAL=replace-with-publisher-credential
export PROPOSAL_ID=$(uuidgen | tr 'A-Z' 'a-z')      # one per feed item
```

If the operator keeps publishing on a private address, `PUBLISH_URL` differs from `PUBLIC_GATEWAY`. A publication sent to the read origin answers 404, the one mistake the gateway cannot report.

## 1. Be registered

Give the operator a label, your host if you have one, and your server UUID (or let them generate one you then use exactly). They register you with `feed-gatewayctl register` or the admin page's **Add server** and hand back five values: server ID, channel, credential (shown once), public gateway origin, publisher API address. Keep the credential in backend secret storage and send it only as `Authorization: Bearer`.

## 2. Publish the manifest

```sh
curl -sS --fail-with-body "$PUBLISH_URL/seekervault.gateway.v1.PublisherService/PublishManifest" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $PUBLISHER_CREDENTIAL" \
  -d "{\"manifest\":{\"serverId\":\"$PUBLISHER_ID\",\"protocolVersion\":1,\"settingsRevision\":\"1\",
       \"mode\":\"CONNECTION_MODE_GATEWAY_FEED\",\"environments\":[\"SERVER_ENVIRONMENT_SANDBOX\"],
       \"displayName\":\"Example publisher\",
       \"feed\":{\"gatewayUrl\":\"$PUBLIC_GATEWAY\",\"channel\":\"$CHANNEL\"}}}"
# {"status":"PUBLISH_STATUS_STORED","settingsRevision":"1"}
```

A phone holds no feed without one. The environment set cannot change later on this server ID (`other_environment`); production is a second deployment with its own ID.

## 3. Share the reference and add the feed in SAC

The feed reference carries no secret; put it in a README, a QR code, or a message:

```text
seekervault://feed?v=1&gateway=https%3A%2F%2Ffeeds.example.com&server=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
```

There is no deep link. The owner opens **Add connection**, pastes or scans it, reads the confirmation (gateway origin, server ID, public broadcast, no credential, you are not contacted), and taps **Add feed**. The phone validates your manifest through the gateway, resolves plugin support, reads a snapshot, and streams while the app is open.

## 4. Publish a sandbox request

```sh
curl -sS --fail-with-body "$PUBLISH_URL/seekervault.gateway.v1.PublisherService/PublishProposal" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $PUBLISHER_CREDENTIAL" \
  -d "{\"proposal\":{\"serverId\":\"$PUBLISHER_ID\",\"channel\":\"$CHANNEL\",
       \"proposalId\":\"$PROPOSAL_ID\",\"revision\":\"1\",
       \"operation\":\"swap\",\"pluginId\":\"jupiter.swap\",
       \"status\":\"PROPOSAL_STATUS_OPEN\",
       \"createdAt\":\"2030-01-02T09:00:00Z\",\"updatedAt\":\"2030-01-02T09:00:00Z\",
       \"expiresAt\":\"2030-01-03T09:00:00Z\",
       \"publisherNote\":\"trimming SOL into USDC on the bounce\",
       \"values\":[{\"key\":\"input_mint\",\"text\":\"So11111111111111111111111111111111111111112\"},
                   {\"key\":\"input_decimals\",\"text\":\"9\"},
                   {\"key\":\"output_mint\",\"text\":\"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v\"},
                   {\"key\":\"output_decimals\",\"text\":\"6\"},
                   {\"key\":\"max_slippage_bps\",\"text\":\"50\"}]}}"
# {"status":"PUBLISH_STATUS_STORED","revision":"1","snapshotSequence":"2"}
```

There is **no amount** and no side; both are chosen on each phone. The codec is strict: a field the contract does not have, such as `amount`, is refused, never dropped. `PublishRequest` and `CancelRequest` take the common envelope at the same paths; `PublishProposal` is a compatibility adapter over the same row, used here for its compact shape. Swap terms: [Jupiter swap](/docs/jupiter-swap).

## 5. Review in sandbox

The owner opens the signal, enters an amount, prepares, reads the facts and the rules panel, and simulates instead of approving. Activity shows **Simulated**, with no signature and no explorer link. You are not notified: feed result handling is `DEVICE_LOCAL`, and the gateway never learns a subscriber's decision.

## 6. Update and withdraw

Send the complete document again with `"revision":"2"` and a moved `updatedAt`; the identity and `createdAt` stay fixed. Identical content at the held revision answers `PUBLISH_STATUS_UNCHANGED` and wakes nobody. Withdraw with the next revision:

```sh
curl -sS --fail-with-body "$PUBLISH_URL/seekervault.gateway.v1.PublisherService/CancelProposal" \
  -H 'Content-Type: application/json' -H "Authorization: Bearer $PUBLISHER_CREDENTIAL" \
  -d "{\"proposalId\":\"$PROPOSAL_ID\",\"revision\":\"3\"}"
# {"status":"PUBLISH_STATUS_STORED","proposal":{…"status":"PROPOSAL_STATUS_CANCELLED"…},"snapshotSequence":"4"}
```

Withdrawal is final for that ID. A subscriber's own simulate or hide changes only that device.

## 7. Heartbeat

The gateway never contacts you. Every authenticated call is a check-in; between publications:

```sh
curl -sS "$PUBLISH_URL/seekervault.gateway.v1.PublisherService/Heartbeat" \
  -H 'Content-Type: application/json' -H "Authorization: Bearer $PUBLISHER_CREDENTIAL" -d '{}'
# {"intervalSeconds":30}
```

Call it on the interval the answer names. Three missed intervals and phones show "Feed offline · N pending"; what you published stays readable.

## 8. Read it back

```sh
curl -sS "$PUBLIC_GATEWAY/seekervault.gateway.v1.FeedService/ListRequests" \
  -H 'Content-Type: application/json' -d "{\"channel\":\"$CHANNEL\"}"
curl -sS "$PUBLIC_GATEWAY/seekervault.gateway.v1.FeedService/GetFeedStatus" \
  -H 'Content-Type: application/json' -d "{\"channels\":[\"$CHANNEL\"]}"
```

No credential: this is what every phone reads.

## Refusals

Every refusal is JSON with a Connect `code` and a `GatewayErrorDetail` naming the problem and, where it matters, `heldRevision`.

| Problem | Meaning |
| --- | --- |
| `unauthenticated` (401) | No, wrong, or revoked credential; one answer for all three |
| `other_server`, `foreign_channel` (403) | Not your server or channel |
| `stale_revision`, `revision_conflict`, `cancelled` | Read `heldRevision`; republish higher, or use a new ID |
| `other_gateway`, `other_environment` | Wrong origin, or a changed environment set |
| `unknown field "amount"` (400) | Strict codec |
| `too_many_requests` (429) | 2 per second with 20 in hand |
| `too_many_proposals` | 200 open per channel; withdraw some |

Retry transport failures with backoff, with the **same revision and content**, until you learn the outcome.

## Rotate before revoke

Ask the operator to **add** a credential (`rotate`), install it, confirm you publish with it, then have the old one revoked. The reverse order is an outage. A lost credential is the same procedure; it exists only as a hash.

## If the gateway loses its data

A self-hosted gateway on a lost volume forgets registrations: your feed reads as unknown and publications answer `unauthenticated`. Recovery is the onboarding conversation again under the **same server UUID**, so subscribers keep the feed they added. Nothing restores the old credential; republish your manifest and open items with the new one.

## Or start from a demo

`demo-copytrading/` and `demo-prediction/` do all of the above from configuration, with a durable outbox and heartbeat, and publish through their own `POST /v1/requests`. Copy one out beside `publisher-support/`. See [Examples](/docs/examples).
