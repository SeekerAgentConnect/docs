---
title: Prediction markets, your way
description: "A Public feed. Run the Prediction demo with your own filters, or curate markets for your own audience. Subscribers pick the side and the stake."
slug: /recipe-prediction
sidebar_position: 3
---

**The idea.** Prediction markets move fast and there are thousands of them. The Prediction demo watches the listing for you, publishes the ones that match your filters as signals, and everyone who added your feed can take a position from their own wallet in two taps. You publish the market; each subscriber chooses Yes or No and how much.

This demo publishes a **Public** feed: anyone with the link can read it, and nobody has to prove a wallet or wait for approval. It is unchanged by Restricted feeds. To limit a feed to subscribers you approve, see [Run a Restricted feed](/docs/restricted-feeds) and the [CopyTrading recipe](/docs/recipe-copytrading).

Two ways to use it.

## A. Your own filters

Run the demo with the filters you care about. It polls the provider, publishes matching markets, and withdraws them when they close.

```sh
cd demo-prediction
PUBLISHER_SERVER_ID=<your server ID> \
PUBLISHER_GATEWAY_URL=https://feeds.example.com \
PUBLISHER_PUBLISH_URL=https://feeds.example.com \
PUBLISHER_ENVIRONMENT=sandbox \
PUBLISHER_DATABASE_PATH=./prediction.db \
BROADCAST_CREDENTIAL=replace-with-publisher-credential \
PUBLISHER_API_TOKEN=$(openssl rand -hex 32) \
PREDICTION_CATEGORIES=crypto \
PREDICTION_KEYWORDS=bitcoin,solana \
PREDICTION_MOST_OPEN=5 \
go run ./cmd/prediction
```

The `PREDICTION_*` settings are the filters: categories, keywords, how soon a market closes, the deposit range, how many stay open at once, and how often to poll. Or with Docker: `deploy/prediction`. Get registered first ([the flow](/docs/how-it-works#registering-a-server-with-the-gateway)); the demo prints your feed link at startup.

## B. Your own audience

Same server, but you pick the markets instead of a filter. The demo's **trader page** at `/trader` (Docker: `--profile admin`) searches the live listing and lets you publish a market to your feed with one click. Share the feed link with your audience:

```text
seekervault://feed?v=1&gateway=https://feeds.example.com&server=<your server ID>
```

Anyone who adds it sees every market you publish, as a **Prediction signal** in the Inbox, with your note. The feed is Public, so there is nobody to approve.

## What a subscriber does

They open the signal, see the market's current prices and status read from the venue at that moment, choose **Yes** or **No**, enter a stake, and either approve or **Simulate**. You never set a side and never see theirs. The order is placed from their wallet; you are not in the transaction.

## What the demo takes care of

- Publishing once and retrying when the gateway is unreachable.
- Withdrawing a market when it closes at the venue.
- Checking in, so the feed reads as online.
- Keeping every published market in its own database, so a restart changes nothing.

Every setting, the discovery API, and the trader page are described in `demo-prediction/README.md`. Production is a second registration with `PUBLISHER_ENVIRONMENT=production`.
