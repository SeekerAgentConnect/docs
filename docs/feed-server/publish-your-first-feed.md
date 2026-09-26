---
title: Publish your first feed
description: "A Public feed with nothing but curl. A manifest, a sandbox signal, an update, a withdrawal, and a heartbeat."
slug: /publish-your-first-feed
sidebar_position: 2
---

This walkthrough publishes a **Public** feed: anyone with the link can read it. For a subscriber-only feed, finish this page first, then follow [Run a Restricted feed](/docs/restricted-feeds); publishing works the same way, and a Restricted feed adds wallet proof and device approval.

You need the three values from [registration](/docs/feed-gateway#getting-registered), `curl`, and SAC on a phone.

```sh
export GATEWAY=https://feeds.example.com
export SERVER_ID=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
export CHANNEL=server/$SERVER_ID
export CREDENTIAL=replace-with-publisher-credential
export SIGNAL_ID=$(uuidgen | tr 'A-Z' 'a-z')
```

Every call is `POST $GATEWAY/seekervault.gateway.v1.PublisherService/<Method>` with a JSON body and `Authorization: Bearer $CREDENTIAL`.

## 1. Manifest

```sh
curl -sS --fail-with-body "$GATEWAY/seekervault.gateway.v1.PublisherService/PublishManifest" \
  -H 'Content-Type: application/json' -H "Authorization: Bearer $CREDENTIAL" \
  -d "{\"manifest\":{\"serverId\":\"$SERVER_ID\",\"protocolVersion\":1,\"settingsRevision\":\"1\",
       \"mode\":\"CONNECTION_MODE_GATEWAY_FEED\",\"environments\":[\"SERVER_ENVIRONMENT_SANDBOX\"],
       \"displayName\":\"Example feed\",
       \"requiredPlugins\":[{\"pluginId\":\"jupiter.swap\",\"minContract\":1,\"maxContract\":1}],
       \"feed\":{\"gatewayUrl\":\"$GATEWAY\",\"channel\":\"$CHANNEL\"}}}"
```

The environment set is fixed for this server ID. Production is a second registration.

## 2. Share the feed link

```text
seekervault://feed?v=1&gateway=https://feeds.example.com&server=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
```

A subscriber pastes it into **Add connection** and taps **Add feed**. Because this feed is Public, that is all they do.

## 3. A signal

A swap pair, with no amount. Each subscriber chooses their own.

```sh
curl -sS --fail-with-body "$GATEWAY/seekervault.gateway.v1.PublisherService/PublishProposal" \
  -H 'Content-Type: application/json' -H "Authorization: Bearer $CREDENTIAL" \
  -d "{\"proposal\":{\"serverId\":\"$SERVER_ID\",\"channel\":\"$CHANNEL\",
       \"proposalId\":\"$SIGNAL_ID\",\"revision\":\"1\",
       \"operation\":\"swap\",\"pluginId\":\"jupiter.swap\",\"status\":\"PROPOSAL_STATUS_OPEN\",
       \"createdAt\":\"2030-01-02T09:00:00Z\",\"updatedAt\":\"2030-01-02T09:00:00Z\",
       \"expiresAt\":\"2030-01-03T09:00:00Z\",
       \"publisherNote\":\"trimming SOL into USDC\",
       \"values\":[{\"key\":\"input_mint\",\"text\":\"So11111111111111111111111111111111111111112\"},
                   {\"key\":\"input_decimals\",\"text\":\"9\"},
                   {\"key\":\"output_mint\",\"text\":\"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v\"},
                   {\"key\":\"output_decimals\",\"text\":\"6\"},
                   {\"key\":\"max_slippage_bps\",\"text\":\"50\"}]}}"
```

The subscriber opens the signal, enters an amount, prepares, and taps **Simulate** in sandbox. You are told nothing.

## 4. Update and withdraw

Send the same document again with `"revision":"2"` to update it. Withdraw with the next revision:

```sh
curl -sS --fail-with-body "$GATEWAY/seekervault.gateway.v1.PublisherService/CancelProposal" \
  -H 'Content-Type: application/json' -H "Authorization: Bearer $CREDENTIAL" \
  -d "{\"proposalId\":\"$SIGNAL_ID\",\"revision\":\"3\"}"
```

The revision is your idempotency key: resend the same revision after a lost response, never invent a higher one.

## 5. Heartbeat

```sh
curl -sS "$GATEWAY/seekervault.gateway.v1.PublisherService/Heartbeat" \
  -H 'Content-Type: application/json' -H "Authorization: Bearer $CREDENTIAL" -d '{}'
# {"intervalSeconds":30}
```

Every publish counts as a check-in too. After three missed intervals, subscribers see **Feed offline**; what you published stays readable.

## When something is refused

The answer is JSON with a code and a problem name. `unauthenticated`: wrong or revoked credential. `other_server` or `foreign_channel`: not your server ID. `stale_revision` or `revision_conflict`: read `heldRevision` and republish higher. `unknown field`: the schema is strict; an `amount` on a signal is refused, not dropped. Retry only network failures, with the same revision.

To rotate the credential, ask for a second one, switch to it, then have the old one revoked. Never the other way round.
