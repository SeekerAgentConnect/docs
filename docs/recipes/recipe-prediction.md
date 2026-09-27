---
title: Prediction markets, your way
description: "A Public feed. Run the Prediction demo with your own filters, or curate markets for your audience by hand. Subscribers pick the side and the stake."
slug: /recipe-prediction
sidebar_position: 3
---

**Use case.** Prediction markets move fast and there are thousands of them. The Prediction demo watches the listing for you, publishes the ones that match your filters as signals, and everyone who added your feed can take a position from their own wallet. You publish the market; each subscriber chooses Yes or No and how much.

| | |
| --- | --- |
| **Integration mode** | Feed, **Public** access policy: anyone with the link can read, nobody has to prove a wallet or wait |
| **Starting point** | The Prediction demo feed server, `examples/demo-prediction` in the [source repository](https://github.com/SeekerAgentConnect/sac) |
| **Action** | `jupiter.prediction`: you name the market, each subscriber chooses the side and the stake |

To limit a feed to subscribers you approve instead, see [Copy trading](/docs/recipe-copytrading).

## Prerequisites {#prerequisites}

- A **Public** sandbox registration and its values ([Connect to the SAC gateway](/docs/connect-to-gateway)).
- A checkout of the source repository with Go, or Docker.
- SAC on a phone with a Mainnet wallet, to test as a subscriber.

## Step 1: Run the demo with your filters {#run-with-filters}

It polls the provider, publishes matching markets, and withdraws them when they close.

```sh
cd examples/demo-prediction
PUBLISHER_SERVER_ID=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d \
PUBLISHER_GATEWAY_URL=https://gateway.example.com \
PUBLISHER_PUBLISH_URL=https://gateway.example.com \
PUBLISHER_ENVIRONMENT=sandbox \
PUBLISHER_DATABASE_PATH=./prediction.db \
BROADCAST_CREDENTIAL=replace-with-publisher-credential \
PUBLISHER_API_TOKEN=$(openssl rand -hex 32) \
PREDICTION_CATEGORIES=crypto \
PREDICTION_KEYWORDS=bitcoin,solana \
PREDICTION_MOST_OPEN=5 \
go run ./cmd/prediction
```

The `PREDICTION_*` settings are the filters: categories, keywords, how soon a market closes, the deposit range, how many stay open at once, and how often to poll. Or with Docker: the `deploy/prediction` Compose project.

**Expected result:** the demo prints your feed link at startup and begins publishing matching markets.

## Step 2 (optional): Curate markets by hand {#curate}

Same server, but you pick the markets. The demo's **trader page** at `/trader` (Docker: `--profile admin`) searches the live listing and publishes a market to your feed with one click.

## Step 3: Share the link {#share-the-link}

```text
seekervault://feed?v=1&gateway=https://gateway.example.com&server=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
```

Anyone who adds it sees every market you publish. The feed is Public, so there is nobody to approve.

## Expected result {#expected-result}

A subscriber sees a **Prediction signal** in the Inbox with your note. They open it, see the market's current prices and status read from the venue at that moment, choose **Yes** or **No** and a stake, and either **Approve and trade** in production or **Simulate the trade** in sandbox. You never set a side and never see theirs; the order is placed from their wallet.

What the demo takes care of:

- publishing once and retrying when the gateway is unreachable;
- withdrawing a market when it closes at the venue;
- checking in, so the feed reads as online;
- keeping every published market in its own database, so a restart changes nothing.

## Going to production {#production}

Ask for a production registration, run the demo with `PUBLISHER_ENVIRONMENT=production` and the new server ID, and share its link. Every setting, the discovery API and the trader page are described in `examples/demo-prediction/README.md`.

## Next {#next}

- [Supported actions](/docs/plugins-and-actions#prediction-terms): the prediction terms you publish.
- [Run a Restricted feed](/docs/restricted-feeds), to make it subscriber-only.
