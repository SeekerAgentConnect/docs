---
title: Supported actions
description: "A signal names an action and its terms. A plugin compiled into the app builds and checks the transaction on the phone. What you publish, what the subscriber chooses, and how a preview differs from an execution."
slug: /plugins-and-actions
sidebar_position: 6
---

A signal does not carry a transaction. It carries the **terms** of an action, and the phone builds and checks the transaction itself, at the moment the owner looks. That is what lets a publisher reach an audience without ever touching their wallets.

## How a signal becomes a transaction {#how-it-works}

1. Your manifest names the plugin your signals need, and your signal names the action, its terms and the Solana network it executes on.
2. The subscriber's phone checks that its build carries that plugin and that the signal names a network the feed declares. If not, the signal is readable but has no Approve button. Nothing is ever downloaded.
3. When the owner opens the signal, they enter what is theirs: the amount, or the side and the stake.
4. The plugin contacts the execution provider directly from the phone. Metis returns a quote and
   unsigned swap transaction. Jupiter Prediction returns current market/order/position data and an
   order transaction; a gasless transaction may already carry its provider fee payer's signature.
   The phone reads the bytes back and checks them against the terms.
5. The owner approves and the wallet adds the user's signature and sends. Or the owner taps
   **Preview without sending**: the wallet never opens, adds no signature, nothing is submitted,
   and the signal stays open.

## The plugins that ship today {#plugins}

One execution provider, **Jupiter**, serves two actions. Manifests and signals name it by the plugin IDs below, at plugin contract version 1.

| Plugin ID in the manifest | Action | Shown to the owner as | The owner chooses | Runs on |
| --- | --- | --- | --- | --- |
| `jupiter.swap` | `swap` | **Metis · Powered by Jupiter** (Jupiter's v1 Swap API) | The amount, and slippage within your ceiling | Mainnet only |
| `jupiter.prediction` | `prediction.buy` | **Jupiter Prediction · Powered by Jupiter** | Yes or No, and the stake | Mainnet only |

## Execution provider and publisher {#provider-and-publisher}

You, the feed publisher, and the execution provider are separate parties, and the review shows them apart:

| | Feed publisher (you) | Execution provider (Jupiter) |
| --- | --- | --- |
| Role | Proposes the terms: a pair and a ceiling, or a market | Metis quotes, routes and builds an unsigned swap; Jupiter Prediction provides market/order/position state and builds an order transaction |
| What the phone gets from it | Your signals, delivered through the SAC gateway | The applicable quote or market state and transaction; a gasless Prediction transaction may already carry the provider fee payer's signature |
| Learns about the trade | SAC sends you no subscriber decision, amount, side or result | The mints, amount or stake, outcome and owner's public address needed for the applicable calls; SAC sends no feed or publisher identifier |
| Endorses SAC | No | No |

For a prediction, the market's own source (Polymarket, Kalshi, …) is a third name, shown apart from both.

## Fees are not yours to set {#fees}

A signal cannot carry a fee. Fee policy belongs to the SAC gateway's client configuration, which its operator sets:

- **Swaps.** The SAC service fee is zero unless the gateway's operator configures one. A configured fee is taken from the swap's output and shown to the owner before signing; see [SAC swap service fee](/docs/swap-service-fee). No manifest field, signal term, direct request or QR code can set, raise or redirect it, and you receive none of it. Network, priority and pool costs always apply.
- **Prediction orders.** SAC adds no fee. Jupiter charges its own trading fee, included in the quoted cost.

A transaction carrying any fee other than the one the owner was shown is a finding, and a finding means no Approve button.

Both run on Mainnet only. A feed that publishes them declares `SOLANA_NETWORK_MAINNET` in `feed.supportedNetworks`, each signal names it in `action.network`, and subscribers execute it with a Mainnet wallet they choose on the phone.

| The owner taps | What the phone does |
| --- | --- |
| **Preview without sending** | Fetches the real quote or market, builds and checks the real transaction, then stops. The user's wallet adds no signature and nothing is submitted; a gasless Prediction transaction may already contain the provider fee payer's signature. The signal stays open |
| The approve button | Opens the wallet with exactly the checked transaction. The owner confirms there, and the wallet sends it |

Both are offered for every signal; you publish nothing different for either. See [Preview or execute](/docs/feed-gateway#sandbox-and-production).

## Swap terms {#swap-terms}

| Term | Required | Meaning |
| --- | --- | --- |
| `input_mint`, `output_mint` | Yes | The pair, as mints. They must differ |
| `input_decimals`, `output_decimals` | Yes | For display |
| `max_slippage_bps` | Yes | The most the price may move, 1 to 10000 |
| `least_input`, `most_input` | No | Bounds on the owner's amount, in base units |
| `input_symbol`, `output_symbol` | No | Labels, not verified |

There is no `amount`. A signal with one is refused.

**What the subscriber chooses:** the amount to swap, within `least_input` and `most_input`, and the slippage, up to `max_slippage_bps`.

## Prediction terms {#prediction-terms}

| Term | Required | Meaning |
| --- | --- | --- |
| `market_id` | Yes | The market at the venue |
| `provider`, `event_id` | No | Cross-checked against the venue |
| `deposit_mint`, `deposit_decimals` | Yes | The stake token. Jupiter accepts its dollar token and USDC |
| `least_deposit`, `most_deposit` | No | Bounds on the stake |

There is no side. A `side`, `recommendation`, or any other unknown term is ignored. The phone reads the market's prices and status from the venue when the owner looks, not from you. Orders have a five-dollar minimum at the venue.

**What the subscriber chooses:** the side, **Yes** or **No**, and the stake, within `least_deposit` and `most_deposit`.

## What the phone verifies {#verification}

For a swap: the owner is the authority, the source and destination are the owner's own token accounts, the amount is exactly what the owner entered, the route is a direct one, and the service fee is exactly the decided rate, recipient and token from the gateway's configuration, or absent. For a prediction order: the market, the side, the cost, and that the owner is the fee payer and the only missing signer. Anything else in the transaction is a finding, and a finding means no Approve button.

## Other actions {#other-actions}

Plugins are compiled into the app; there is no plugin download and no third-party plugin API. A signal that names a plugin the subscriber's app build does not carry is readable but has no Approve button. If your signals need an action the app does not carry, talk to the SAC team: the way in is a new provider bundled in the app.

The full signal fields are on [Protocol](/docs/protocol#requests-and-signals).
