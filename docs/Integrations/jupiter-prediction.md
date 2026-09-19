---
title: Jupiter prediction
excerpt: jupiter.prediction names a market. The owner picks side and stake. The app submits and stops. Sandbox does not sign.
hidden: false
---

`jupiter.prediction` is the second bundled plugin. A publisher names a market. Each owner picks a side and a stake. The phone reads the market from Jupiter, prepares an order, inspects the bytes (including address lookup tables), and — in production — the wallet signs once. Then SAC **stops**.

## Signal terms

| Term | Meaning |
| --- | --- |
| `market_id` | Provider identifier, not a URL |
| `event_id` / `provider` | Optional; cross-checked against the provider |
| `deposit_mint` / `deposit_decimals` | Deposit token (provider dollar token or USDC) |
| `least_deposit` / `most_deposit` | Optional bounds; the provider’s five-dollar minimum is a floor |
| `deposit_symbol` | Optional unverified label |

The publisher publishes **no side**. Terms such as `side`, `is_yes`, `outcome`, `direction`, `recommendation`, and `confidence` are refused as unknown.

Everything else about the market — open or not, prices, rules, settlement — is read from the provider **when the owner looks**.

## Owner inputs

Side (`yes` / `no`) and stake. No default side. Buying only; selling a position is out of scope.

## Why the phone reads the chain

Prediction orders are versioned transactions with address lookup tables. There is no legacy option. The app resolves tables through a read-only `getMultipleAccounts` call on an endpoint **you** configure (`-Pseekervault.solanaRpc=…`). Empty by default: a build without one prepares no order and says so.

A table that cannot be fetched or validated **blocks signing** with a stated reason. The review is only as accurate as that endpoint.

The provider **co-signs**. The rule is: one signature slot is still missing, it is the owner’s, and the owner is the fee payer.

## After submit

The record can link the transaction on a block explorer and the market on Jupiter (`https://jup.ag/prediction/<marketId>`). There is **no** position URL. “Order submitted” means the wallet reported that it signed and sent. It does not mean the order filled or that a position will pay out.

A possibly dispatched order is **never repeated**.

## Environments

Same as swap: sandbox prepares the real order and does not open the wallet. **Mainnet or nothing.** There is no devnet prediction market. See [environments](/docs/environments).

## Publisher template

`cmd/prediction` discovers markets through operator filters. Its write API is `403 written_by_discovery`. Optional `PREDICTION_API_KEY` stays on the publisher host. Orders are never placed from the publisher.
