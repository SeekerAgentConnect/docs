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
| **Venue** | Jupiter Prediction, shown as **Jupiter Prediction · Powered by Jupiter**. Real markets on Solana mainnet. The market's own source (Polymarket, Kalshi, …) and you, the feed publisher, are shown apart from the venue |

To limit a feed to subscribers you approve instead, see [Copy trading](/docs/recipe-copytrading).

## Prerequisites {#prerequisites}

- A **Public** sandbox registration and its values ([Connect to the SAC gateway](/docs/connect-to-gateway)).
- A checkout of the source repository with Go, or Docker.
- SAC on a phone with a Mainnet wallet saved, to test as a subscriber. You choose it for the feed right after adding it. Sandbox signals and dismissing a signal spend nothing; a real order needs what is listed under [Before a real trade](#real-trade).

## Step 1: Run the demo with your filters {#run-with-filters}

It polls the provider, publishes matching markets, and withdraws them when they close.

```sh
cd examples/demo-prediction
PUBLISHER_SERVER_ID=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d \
PUBLISHER_GATEWAY_URL=https://gateway.example.com \
PUBLISHER_PUBLISH_URL=https://gateway.example.com \
PUBLISHER_ENVIRONMENT=sandbox \
PUBLISHER_SUPPORTED_NETWORKS=mainnet \
PUBLISHER_DATABASE_PATH=./prediction.db \
BROADCAST_CREDENTIAL=replace-with-publisher-credential \
PUBLISHER_API_TOKEN=$(openssl rand -hex 32) \
PREDICTION_CATEGORIES=crypto \
PREDICTION_KEYWORDS=bitcoin,solana \
PREDICTION_MOST_OPEN=5 \
go run ./cmd/prediction
```

`PUBLISHER_SUPPORTED_NETWORKS` is `mainnet` by default and may only be narrowed to `none`: Jupiter's prediction markets settle on Mainnet only, so the demo refuses `devnet` or `testnet`.

The `PREDICTION_*` settings are the filters: categories, keywords, how soon a market closes, the deposit range, how many stay open at once, and how often to poll. Or with Docker: the public image `ghcr.io/seekeragentconnect/demo-prediction` (the `compose/prediction` project in the separate [`do-deploy`](https://github.com/SeekerAgentConnect/do-deploy) repository runs it with the same values).

**Expected result:** the demo prints your feed link at startup and begins publishing matching markets.

## Step 2 (optional): Curate markets by hand {#curate}

Same server, but you pick the markets. The demo's **trader page** at `/trader` (Docker: `--profile admin`) searches the live listing and publishes a market to your feed with one click.

## Step 3: Share the link {#share-the-link}

```text
seekervault://feed?v=1&gateway=https://gateway.example.com&server=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
```

Anyone who adds it sees every market you publish. The feed is Public, so there is nobody to approve.

## Expected result {#expected-result}

A subscriber sees a **Prediction signal** in the Inbox with your note. They open it, see the market's current prices and status read from the venue at that moment, choose **Yes** or **No** and a stake, and either **Approve and trade** in production or **Simulate the trade** in sandbox. You never set a side and never see theirs; the order is placed from their wallet. Before they commit, the review says what Jupiter Prediction is: mainnet, real funds, Jupiter's own fees, region limits, and what happens after the order.

Testing your feed does not require a trade. A subscriber, you included, can read a signal and tap **Dismiss** without spending anything.

What the demo takes care of:

- publishing once and retrying when the gateway is unreachable;
- withdrawing a market when it closes at the venue;
- checking in, so the feed reads as online;
- keeping every published market in its own database, so a restart changes nothing.

## Before a real trade {#real-trade}

What your subscribers should know, and what you should say in your own channel:

- **Real markets, real funds.** Orders are placed on Jupiter Prediction on Solana mainnet. There is no Jupiter test network; sandbox only rehearses the review.
- **A separate wallet is wise.** Use a wallet meant for this, holding enough USDC or Jupiter's dollar token (JupUSD) for the stake, plus a little SOL for transaction costs.
- **Fees.** Jupiter charges its own trading fee, included in the quoted cost, and the network charges for the transaction. SAC adds no fee to prediction orders.
- **Minimum.** Jupiter's minimum order is currently $5 and may change.
- **Regions.** Jupiter restricts some regions, currently including the United States and South Korea. See [Jupiter's prediction docs](https://developers.jup.ag/docs/prediction).
- **Order is not position.** Approving submits an **order**, which may fill fully, partly or not at all. What fills becomes a **position**: the wallet's holding of that side of that market.
- **No refund.** A filled position cannot be cancelled for a refund. While the market is open it can be sold from its History item with **Sell position**, at the current best bid (the whole position is sold, possibly at a loss), or held until the market settles. A settled position is claimed in Jupiter. Nothing guarantees getting the stake back.
- **Jupiter's own view.** The review offers **This market on Jupiter**, and after an order **Open order on Jupiter**, which opens the Jupiter portfolio. These `jup.ag` links open the Jupiter app if it is installed, otherwise the browser. See [how Jupiter Prediction works](https://docs.jup.ag/user-docs/trade/predict/how-it-works).

## Going to production {#production}

Ask for a production registration, run the demo with `PUBLISHER_ENVIRONMENT=production` and the new server ID, and share its link. Every setting, the discovery API and the trader page are described in `examples/demo-prediction/README.md`.

## Next {#next}

- [Supported actions](/docs/plugins-and-actions#prediction-terms): the prediction terms you publish.
- [History and results](/docs/history-and-results#prediction-positions): what a subscriber sees after an order.
- [Run a Restricted feed](/docs/restricted-feeds), to make it subscriber-only.
