---
title: Publish your first feed
description: "A Public feed with nothing but curl: a manifest, a sandbox signal, an update, a withdrawal and a heartbeat, then check it in the app."
slug: /publish-your-first-feed
sidebar_position: 3
---

This walkthrough publishes a **Public** sandbox feed with `curl`, so you can see every call your own backend will make. For a subscriber-only feed, finish this page first, then follow [Run a Restricted feed](/docs/restricted-feeds): publishing works the same way.

## Prerequisites {#prerequisites}

- A sandbox feed registration and its values: server ID, publisher credential, gateway address and publisher API address ([Connect to the SAC gateway](/docs/connect-to-gateway)).
- `curl` and `uuidgen`.
- SAC on a phone, with a Mainnet wallet saved if you want to prepare the swap.

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
       \"mode\":\"CONNECTION_MODE_GATEWAY_FEED\",\"environments\":[\"SERVER_ENVIRONMENT_SANDBOX\"],
       \"displayName\":\"Example feed\",
       \"requiredPlugins\":[{\"pluginId\":\"jupiter.swap\",\"minContract\":1,\"maxContract\":1}],
       \"feed\":{\"gatewayUrl\":\"$GATEWAY\",\"channel\":\"$CHANNEL\",
                \"supportedNetworks\":[\"SOLANA_NETWORK_MAINNET\"]}}}"
```

**Expected result:** a JSON answer with `PUBLISH_STATUS_STORED`. The environment set is fixed for this server ID; production is a second registration.

`feed.supportedNetworks` declares the Solana networks your signals execute on. Jupiter swaps run only on Mainnet, so this feed says Mainnet, even in sandbox: sandbox is not Devnet. Subscribers are offered only their Mainnet wallets for this feed, and a feed that declares no network is readable but nothing from it is signed. To change the list later, publish the manifest again with a higher `settingsRevision`. The rules are on [Declare the Solana networks you run on](/docs/direct-or-feed#supported-networks).

## Step 2: Share the feed link {#share-the-link}

```text
seekervault://feed?v=1&gateway=https://gateway.example.com&server=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
```

Add it on your own phone: **Add connection**, paste the link, **Add feed**, then choose a Mainnet wallet for the feed and tap **Use this wallet**. Because this feed is Public, that is all a subscriber does.

## Step 3: Publish a signal {#signal}

A swap pair, with no amount. Each subscriber chooses their own.

```sh
curl -sS --fail-with-body "$PUBLISH/seekervault.gateway.v1.PublisherService/PublishProposal" \
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

**Expected result:** `PUBLISH_STATUS_STORED`. Resending the same revision answers `PUBLISH_STATUS_UNCHANGED`.

## Step 4: Update and withdraw {#update-and-withdraw}

To update a signal, send the whole document again with the next revision, `"revision":"2"`, and the changed fields. To withdraw it, cancel with the revision after that:

```sh
curl -sS --fail-with-body "$PUBLISH/seekervault.gateway.v1.PublisherService/CancelProposal" \
  -H 'Content-Type: application/json' -H "Authorization: Bearer $CREDENTIAL" \
  -d "{\"proposalId\":\"$SIGNAL_ID\",\"revision\":\"3\"}"
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

1. The feed appears on Home with your display name and **Sandbox**.
2. The Inbox shows a **Swap signal** with your note, marked **Sandbox · no funds will move**.
3. Open it, enter an amount, tap **Get a quote and prepare**, then **Simulate**. The History records **Simulated**. You, the publisher, are told nothing.
4. After your update, the signal shows the new terms; after your withdrawal, it is no longer offered.

## When something is refused {#troubleshooting}

The answer is JSON with a code and a problem name. `unauthenticated`: wrong or revoked credential. `other_server` or `foreign_channel`: not your server ID. `stale_revision` or `revision_conflict`: read `heldRevision` and republish higher. `bad_network`: `supportedNetworks` names an unknown network or one twice. `unknown field`: the schema is strict; an `amount` on a signal is refused, not dropped. Retry only network failures, with the same revision.

Every code is on [Errors and limits](/docs/errors-and-limits#gateway-refusals).

## Next {#next}

- Build it into your backend, or start from a demo: [Copy trading](/docs/recipe-copytrading), [Prediction markets](/docs/recipe-prediction).
- Limit who may read: [Run a Restricted feed](/docs/restricted-feeds).
- What else a signal can ask for: [Supported actions](/docs/plugins-and-actions).
