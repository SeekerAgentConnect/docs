---
title: Jupiter prediction
excerpt: The prediction.buy action, served by the jupiter execution provider. The owner picks side and stake. The app submits and stops. Sandbox does not sign.
hidden: false
---

`prediction.buy` is a provider-neutral, versioned action (schema 1); the bundled execution provider `jupiter` serves it. A publisher names a market. Each owner picks a side and a stake on their own phone. The phone reads the market from the provider, prepares an order, resolves its address lookup tables, inspects the bytes, and, in production, the wallet signs once. Then the app **stops**.

## Names on the wire

Manifests and signals still say `jupiter.prediction` at contract version 1; the phone resolves it to provider `jupiter`, action `prediction.buy`, schema 1. A publisher may spell the action `prediction` or `prediction.buy`; both mean the same order, and the phone re-emits the legacy spelling. Nothing on the wire changed.

Two things are called a provider. The **execution provider** is `jupiter`, who builds the order. The **market provider** is the venue whose market it is (Polymarket, Kalshi, or Jupiter's own Forecast): the publisher's `provider` term. Market provider plus market ID is the instrument pinned to the review; two venues' similarly named markets are never interchangeable.

## Signal terms

| Term | Meaning |
| --- | --- |
| `market_id` | The market provider's identifier, never a URL |
| `event_id` / `provider` | Optional; cross-checked against what the execution provider reports |
| `deposit_mint` / `deposit_decimals` | The stake token. Which mints are acceptable is the venue's rule |
| `least_deposit` / `most_deposit` | Optional bounds in base units |
| `deposit_symbol` | Optional unverified label |

The publisher publishes **no side**. `side`, `is_yes`, `outcome`, `direction`, `recommendation`, `confidence`, and every other unknown term are ignored and never consulted. Everything else about the market (open or closed, prices, rules, settlement) is read from the provider **when the owner looks**, and again inside prepare.

## Capabilities

| | `jupiter` serving `prediction.buy` |
| --- | --- |
| Clusters | Mainnet only, in both environments. There is no devnet prediction market |
| Environments | Production and sandbox |
| Stake tokens | Two: Jupiter's own dollar token and USDC. Another `deposit_mint` is refused as unsupported when the signal is read |
| Minimum | Five dollars (`5000000` base units), folded into the stake field beside the publisher's bounds |
| Status queries | None |

These are the venue's facts, not the action's: a second provider of `prediction.buy` would declare its own.

## Owner inputs

Side (yes or no) and stake. No default side. Buying only; selling a position is out of scope.

## Why the phone reads the chain

Prediction orders are versioned transactions with address lookup tables; there is no legacy option. The phone resolves the tables through one read-only `getMultipleAccounts` call on an endpoint the build configures (`-Pseekervault.solanaRpc=…`), empty by default: a build without one prepares no order and says so. A table that cannot be fetched or validated **blocks signing** with a stated reason. The review is only as accurate as that endpoint.

## What the phone verifies

From the bytes: the market hash the provider stated, the order identifier, **which side**, the contracts, the price ceiling, the cost, the slippage, and the order and position accounts; the owner pays, and the order is the owner's. The venue **co-signs**, so the rule is: one signature slot is still missing, it is the owner's, and the owner is the fee payer. A route instruction funding the stake by swap is read with the swap reader; an order staked directly in the venue's token has none, and then the stake must equal the cost. Anything else is a finding.

## After submit

The record can link the transaction on a block explorer and the market at `https://jup.ag/prediction/<marketId>`. There is **no** position link, because none can be verified. "Order submitted" means the wallet reported that it signed and sent. It does not mean the order filled or that a position will pay out. An answer the phone never received is recorded as unresolved, never as a failure, and a possibly dispatched order is **never repeated**.

## Environments

Same as swap: sandbox reads the market, builds and reviews the real order, and never opens the wallet (**Simulate**, Activity **Simulated**). Sandbox is not a Solana network, and Jupiter sandbox is not devnet trading. A direct connection is always production. See [Environments](/docs/environments).

## What is not there

- No fill monitoring, no positions screen, no settlement, no payout claim, no profit or loss.
- About one minute of freshness; at most four calls per order (three to the provider, one to the RPC endpoint for the tables), and nothing polls.
- Selling is out of scope.

The Prediction demo publisher discovers markets from the provider's public listing and places no orders: see [Examples](/docs/examples).
