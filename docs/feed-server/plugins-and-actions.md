---
title: Plugins and actions
description: "A signal names an action. A plugin compiled into the app carries it out on the phone. You publish the terms, never the amount."
slug: /plugins-and-actions
sidebar_position: 4
---

A signal does not carry a transaction. It carries the **terms** of an action, and the phone builds and checks the transaction itself, at the moment the owner looks. That is what lets a publisher reach an audience without ever touching their wallets.

## How a signal becomes a transaction

1. Your manifest names the plugin your signals need, and your signal names the action and its terms.
2. The subscriber's phone checks that its build carries that plugin. If not, the signal is readable but has no Approve button. Nothing is ever downloaded.
3. When the owner opens the signal, they enter what is theirs: the amount, or the side and the stake.
4. The plugin fetches a quote or the market from the provider, builds the transaction, and the phone reads the bytes back and checks them against the terms.
5. Production: the owner approves and the wallet signs. Sandbox: **Simulate**, nothing signed.

## The plugin that ships today

One execution provider, **Jupiter**, serves two actions. Manifests and signals name it by the plugin IDs below at contract version 1.

| Plugin ID in the manifest | Action | The owner chooses | Runs on |
| --- | --- | --- | --- |
| `jupiter.swap` | `swap` | The amount, and slippage within your ceiling | Mainnet only |
| `jupiter.prediction` | `prediction.buy` | Yes or No, and the stake | Mainnet only |

Both work in sandbox and production. Neither is available on devnet: sandbox is not a Solana network.

## Swap terms

| Term | Required | Meaning |
| --- | --- | --- |
| `input_mint`, `output_mint` | Yes | The pair, as mints. They must differ |
| `input_decimals`, `output_decimals` | Yes | For display |
| `max_slippage_bps` | Yes | The most the price may move, 1 to 10000 |
| `least_input`, `most_input` | No | Bounds on the owner's amount, in base units |
| `input_symbol`, `output_symbol` | No | Labels, not verified |

There is no `amount`. A signal with one is refused.

## Prediction terms

| Term | Required | Meaning |
| --- | --- | --- |
| `market_id` | Yes | The market at the venue |
| `provider`, `event_id` | No | Cross-checked against the venue |
| `deposit_mint`, `deposit_decimals` | Yes | The stake token. Jupiter accepts its dollar token and USDC |
| `least_deposit`, `most_deposit` | No | Bounds on the stake |

There is no side. A `side`, `recommendation`, or any other unknown term is ignored. The phone reads the market's prices and status from the venue when the owner looks, not from you. Orders have a five-dollar minimum at the venue.

## What the phone verifies

For a swap: the owner is the authority, the source and destination are the owner's own token accounts, the amount is exactly what the owner entered, the route is a direct one. For a prediction order: the market, the side, the cost, and that the owner is the fee payer and the only missing signer. Anything else in the transaction is a finding, and a finding means no Approve button.

## Writing a plugin

Plugins are compiled into the app; there is no plugin download and no third-party plugin API yet. If your signals need an action the app does not carry, the way in is a new bundled provider in the app repository.
