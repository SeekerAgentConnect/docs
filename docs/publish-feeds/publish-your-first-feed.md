---
title: Publish your first feed
description: "A Public feed with nothing but curl: a manifest, a signal, an update, a withdrawal and a heartbeat, then preview the signal in the app."
slug: /publish-your-first-feed
sidebar_position: 3
---

This walkthrough publishes a **Public** feed with `curl`, so you can see every call your own backend will make. For a subscriber-only feed, finish this page first, then follow [Run a Restricted feed](/docs/restricted-feeds): publishing works the same way.

## Prerequisites {#prerequisites}

- A feed registration and its values: server ID, publisher credential, gateway address and publisher API address ([Connect to the SAC gateway](/docs/connect-to-gateway)).
- `curl` and `uuidgen`.
- SAC on a phone. Adding a Public feed needs no wallet; to prepare and preview the swap, save a Mainnet wallet ([Connect your wallets](/docs/wallet-setup)).

## Set up your shell {#setup}

```sh
export GATEWAY=https://gateway.example.com        # the gateway address
export PUBLISH=https://gateway.example.com        # the publisher API address
export SERVER_ID=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
export CHANNEL=server/$SERVER_ID
export CREDENTIAL=replace-with-publisher-credential
export SIGNAL_ID=$(uuidgen | tr 'A-Z' 'a-z')
```

Every call is `POST $PUBLISH/seekervault.gateway.v1.PublisherService/<Method>` with a JSON body and `Authorization: Bearer $CREDENTIAL`. The schema is strict: an unknown field is refused, not ignored.

## Step 1: Publish the manifest {#manifest}

```sh
curl -sS --fail-with-body "$PUBLISH/seekervault.gateway.v1.PublisherService/PublishManifest" \
  -H 'Content-Type: application/json' -H "Authorization: Bearer $CREDENTIAL" \
  -d "{\"manifest\":{\"serverId\":\"$SERVER_ID\",\"protocolVersion\":1,\"settingsRevision\":\"1\",
       \"mode\":\"CONNECTION_MODE_GATEWAY_FEED\",\"displayName\":\"Example feed\",
       \"requiredPlugins\":[{\"pluginId\":\"jupiter.swap\",\"minContract\":1,\"maxContract\":1}],
       \"feed\":{\"gatewayUrl\":\"$GATEWAY\",\"channel\":\"$CHANNEL\",
                \"supportedNetworks\":[\"SOLANA_NETWORK_MAINNET\"]}}}"
```

**Expected result:** a JSON answer with `PUBLISH_STATUS_STORED`.

The manifest's `protocolVersion` stays `1`. It is not the signal's `contractVersion` in Step 3.

`feed.supportedNetworks` declares the Solana networks your signals may execute on. It does not bind the feed to one network: each signal names one of the declared networks, and the gateway refuses a signal for any other. Jupiter swaps run only on Mainnet, so this feed declares Mainnet. To change the list later, publish the manifest again with a higher `settingsRevision`. The rules are on [Declare the Solana networks you run on](/docs/direct-or-feed#supported-networks).

Publish the manifest before your first signal: until the gateway holds a manifest, it has no declared network to accept a signal for.

## Step 2: Share the feed link {#share-the-link}

```text
seekervault://feed?v=1&gateway=https://gateway.example.com&server=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
```

Use the gateway address the SAC team gave you. The app reads feeds only from the gateway it was built for, and refuses a link or manifest that names another.

Add it on your own phone: **Add connection**, paste the link, **Add feed**. Because this feed is Public, that is all a subscriber does: no wallet is needed to subscribe or read.

## Step 3: Publish a signal {#signal}

A signal is a `seekervault.request.v2.Request` at `contractVersion` `2`. It names a swap pair and the network it executes on, with no amount: each subscriber chooses their own. The function below sends the whole document, so Step 4 can send it again with a new revision.

```sh
publish_signal() {
  curl -sS --fail-with-body "$PUBLISH/seekervault.gateway.v1.PublisherService/PublishRequest" \
    -H 'Content-Type: application/json' -H "Authorization: Bearer $CREDENTIAL" -d @- <<EOF
{"request":{
  "contractVersion":2,
  "identity":{"sourceId":"$SERVER_ID","scope":"$CHANNEL","requestId":"$SIGNAL_ID"},
  "lifecycle":{"revision":"$REVISION","status":"REQUEST_STATUS_OPEN",
    "createdAt":"2030-01-02T09:00:00Z","updatedAt":"$UPDATED_AT","expiresAt":"2030-01-03T09:00:00Z"},
  "presentation":{"title":"Swap","description":"$NOTE","category":"PRESENTATION_CATEGORY_SIGNAL"},
  "action":{"capabilityId":"swap","capabilityVersion":1,"pluginId":"jupiter.swap",
    "network":"SOLANA_NETWORK_MAINNET",
    "parameters":[{"key":"input_mint","text":"So11111111111111111111111111111111111111112"},
                  {"key":"input_decimals","text":"9"},
                  {"key":"output_mint","text":"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"},
                  {"key":"output_decimals","text":"6"},
                  {"key":"max_slippage_bps","text":"$MAX_SLIPPAGE_BPS"}]},
  "ownerInputs":[
    {"key":"input_amount","label":"Amount","kind":"OWNER_INPUT_KIND_AMOUNT","required":true,"minimum":"1"},
    {"key":"slippage_bps","label":"Slippage","kind":"OWNER_INPUT_KIND_COUNT","required":true,
     "minimum":"1","maximum":"$MAX_SLIPPAGE_BPS"}],
  "audience":{"feed":{"channel":"$CHANNEL"}},
  "resultHandling":{"mode":"RESULT_MODE_DEVICE_LOCAL"}}}
EOF
}

REVISION=1 UPDATED_AT=2030-01-02T09:00:00Z MAX_SLIPPAGE_BPS=50 NOTE='trimming SOL into USDC'
publish_signal
```

**Expected result:** `PUBLISH_STATUS_STORED`. Calling `publish_signal` again unchanged answers `PUBLISH_STATUS_UNCHANGED`.

- `action.network` is required. It must be one of your manifest's `supportedNetworks`; nothing infers it from the manifest or from a subscriber's wallet.
- `ownerInputs` declares what each subscriber fills in on their phone, within your bounds. Their answers are never sent back.
- `audience.feed.channel` and `identity.scope` are your channel, and `resultHandling.mode` is always `RESULT_MODE_DEVICE_LOCAL` for a feed.

## Step 4: Update and withdraw {#update-and-withdraw}

To update a signal, send the whole document again with the next revision, a later `updatedAt` and your changes:

```sh
REVISION=2 UPDATED_AT=2030-01-02T10:00:00Z MAX_SLIPPAGE_BPS=90 NOTE='widening the slippage'
publish_signal
```

Keep `createdAt` and `action.network` as they were. To execute the same terms on another network, withdraw this signal and publish a new one there.

To withdraw it, cancel with the revision after that:

```sh
curl -sS --fail-with-body "$PUBLISH/seekervault.gateway.v1.PublisherService/CancelRequest" \
  -H 'Content-Type: application/json' -H "Authorization: Bearer $CREDENTIAL" \
  -d "{\"requestId\":\"$SIGNAL_ID\",\"revision\":\"3\"}"
```

A withdrawal is final. The revision is your idempotency key: after a lost response, resend the same revision; never invent a higher one.

## Step 5: Send a heartbeat {#heartbeat}

```sh
curl -sS "$PUBLISH/seekervault.gateway.v1.PublisherService/Heartbeat" \
  -H 'Content-Type: application/json' -H "Authorization: Bearer $CREDENTIAL" -d '{}'
# {"intervalSeconds":30}
```

Every publish counts as a check-in too. Send a heartbeat at the interval the answer names when you have nothing else to publish. After three missed intervals, subscribers see **Feed offline**; what you published stays readable.

## Step 6: Verify in the app {#verify-in-the-app}

Before withdrawing, check the signal on your phone:

1. The feed appears on Home with your display name.
2. The Inbox shows a **Swap signal** with your note.
3. Open it. The review shows **Network**, *Mainnet · from this signal*, and the **Wallet** that will be used. With one Mainnet wallet saved, it is used; otherwise tap **Choose wallet**, or **Connect a wallet on Mainnet** if you have none.
4. Enter an amount, tap **Get a quote and prepare**, then **Preview without sending**. Nothing is signed or sent, the signal stays open, and History shows *Previewed on this phone · nothing sent*. You, the publisher, are told nothing.
5. After your update, the signal shows the new terms; after your withdrawal, it is no longer offered.

## When something is refused {#troubleshooting}

The answer is JSON with a code and a problem name. `unauthenticated`: wrong or revoked credential. `other_server` or `foreign_channel`: not your server ID. `stale_revision` or `revision_conflict`: read `heldRevision` and republish higher. `other_protocol`: the signal's `contractVersion` is not `2`. `bad_network`: `supportedNetworks` names an unknown network or one twice, or the signal's `action.network` is missing or unknown. `other_network`: the signal's network is not in the manifest the gateway holds, or you have not published a manifest yet. `unknown field`: the schema is strict; an `amount` on a signal is refused, not dropped. Retry only network failures, with the same revision.

**A signal published without a network** (before networks were required, or through the older `PublishProposal` call) stays readable in SAC but can never be executed. Withdraw it with `CancelRequest`, then publish its terms again as a new signal, with a new `requestId`, through `PublishRequest` with an `action.network`.

Every code is on [Errors and limits](/docs/errors-and-limits#gateway-refusals).

## Next {#next}

- Build it into your backend, or start from a demo: [Copy trading](/docs/recipe-copytrading), [Prediction markets](/docs/recipe-prediction).
- Limit who may read: [Run a Restricted feed](/docs/restricted-feeds).
- What else a signal can ask for: [Supported actions](/docs/plugins-and-actions).
