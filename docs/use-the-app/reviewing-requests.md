---
title: Review requests and signals
description: "Everything waiting for you is in the Inbox. What each request asks, what you enter yourself, and when the wallet opens."
slug: /reviewing-requests
sidebar_position: 4
---

Requests from your servers and signals from feeds wait in one list: the **Pending** tab of the **Inbox**. Tap one to open its review. What you already answered moves to the **History** tab.

## What you can be asked {#request-types}

| Request | From | What you do | Does the wallet open? | Moves funds? |
| --- | --- | --- | --- | --- |
| Acknowledge a message | A direct server | **Acknowledge** or **Reject** | No | No |
| Sign a message | A direct server | **Approve and sign**, then confirm in the wallet | Yes, to sign a message | No |
| Transfer SOL or a token | A direct server | **Approve and send**, then confirm in the wallet | Yes | Yes |
| Stake, start unstaking, cancel unstaking, withdraw SKR | The SKR Staking server | **Approve and stake** (or the matching button), then confirm in the wallet | Yes | Stake and withdraw move SKR; the other two move none |
| Swap | A feed | Enter your part, **Get a quote and prepare**, then **Approve and swap**, or **Simulate** in sandbox | Production only | Production only |
| Prediction order | A feed | Choose your side and amount, then **Approve and trade**, or **Simulate the trade** in sandbox | Production only | Production only |

Every request is reviewed and signed with the wallet you chose for its connection, and the review names it. A request that needs another address or network is never signed with a different wallet: it cannot be approved until the connection's wallet matches ([Wallet status](/docs/connecting-servers#wallet-status)).

Not every request opens the wallet. An acknowledgement ends in SAC. A sandbox simulation stops before signing: *No wallet is opened, no transaction exists.* Everything else opens Seed Vault Wallet with exactly the transaction or message you reviewed.

## Step 1: Read what the phone checked {#read-the-review}

The review shows what the phone read for itself: the amount, the recipient, the program, the transaction's effect. Anything the sender wrote about it, such as an agent's note or a publisher's note, is shown apart and marked as not verified. Your [rules](/docs/rules) add a verdict: **Within the rules you set** or **Outside your rules**.

If the phone cannot read a transaction, or the bytes do not match the request, there is no Approve button.

## Step 2: Enter your part (feed signals) {#owner-inputs}

A feed signal never carries your amount or side. The publisher names the terms; you fill in **Your part** on the phone, and it stays there.

- **Swap:** the **Amount to swap**, within the publisher's bounds, and optionally **Most the price may move (basis points)**, up to the publisher's ceiling. Then **Get a quote and prepare**: the phone asks Metis, Jupiter's v1 Swap API, for a quote and an unsigned transaction, and reads the transaction back.
- **Prediction order:** **Your side and amount**: **Yes** or **No**, and how much. The phone reads the market's prices and rules from the venue at that moment, not from the publisher.

A prepared quote is good for about a minute. When it runs out, prepare again for a fresh one. If you change the feed's wallet while a review is open, what was prepared is dropped: prepare again for the new wallet.

SAC checks the connection's wallet once more just before the wallet app opens. If it changed, was removed, or needs reconnecting in the meantime, nothing is signed.

## Step 3: Decide {#decide}

1. Tap the approve button. If your rules flagged something, first tick **I have read the warnings above and want to go ahead anyway**.
2. The wallet app that holds the connection's wallet opens with exactly what you reviewed and asks again. Confirm there, or decline; declining in the wallet counts as a rejection.

Or tap **Reject** (direct requests), **Hide this signal** (swap signals) or **Dismiss** (prediction signals). For a feed signal, the publisher is never told either way.

**Expected result:** the request moves to **History** with its outcome, and the sender of a direct request can read your answer. See [History and results](/docs/history-and-results).

## What a swap review shows {#swap-review}

A **Who carries this out** card names the integration: **Swap routing: Metis · Powered by Jupiter**. Metis is not Jupiter Ultra, and a swap here is not the same as trading on jup.ag. Neither Jupiter nor the publisher endorses SAC. The card links Jupiter's docs, terms and privacy policy.

After **Get a quote and prepare**, the facts read from the transaction include:

| Row | What it is |
| --- | --- |
| **Swap routing** | `Metis · Powered by Jupiter` |
| **SAC service fee, taken from what you receive** | The rate this build charges, for example `0.2%` |
| **SAC service fee, estimated** | The provider's estimate of the fee, in the token you receive |
| **SAC service fee recipient** | The public token account that receives it |
| **Priority fee (SOL)** | A network cost, separate from the service fee |
| **Quoted now, after fees** | What the route pays at this moment, net of every fee |
| **You receive at least** | The quote less the price movement you allowed. The transaction fails rather than pay less |

The default SAC build charges no service fee: the row reads **SAC service fee (network and pool costs still apply)** `0%`. A swap is never free: network, priority and pool costs still apply. A build that charges a fee may still show `0%` with *not charged on this pair* or *not charged: its fee account could not be verified*; that swap carries no fee and is otherwise normal. Publishers and servers cannot set or change the fee. Details: [SAC swap service fee](/docs/swap-service-fee).

If the transaction carries any fee other than the one shown, whether another rate, another recipient or another token, the review shows a finding and there is no Approve button.

The last screen before the wallet opens repeats the routing and the service fee. The wallet then signs; SAC never holds your keys.

## What a prediction review shows {#prediction-review}

The venue is **Jupiter Prediction · Powered by Jupiter**, shown apart from the feed's publisher and from the market's own source (Polymarket, Kalshi, …). Before you commit, the review says:

- orders are placed on Solana mainnet with real funds; there is no test network for it;
- Jupiter's trading fee is included in the quoted cost, the network charges for the transaction, and SAC adds no fee; Jupiter's minimum order is currently $5;
- Jupiter restricts some regions, currently including the United States and South Korea;
- **Dismiss** spends nothing. An order may fill fully, partly or not at all, and a filled position cannot be cancelled for a refund: you can sell it at the current bid while the market is open, possibly at a loss, or hold it until it settles.

**This market on Jupiter** opens the market in the Jupiter app if it is installed, otherwise in the browser. What happens after an order is on [History and results](/docs/history-and-results#prediction-positions).

## Sandbox {#sandbox}

A sandbox signal says **Sandbox · no funds will move**. The phone fetches the same market data and builds the same transaction as in production, then **Simulate** records **Simulated** and stops. Nothing is signed, nothing is sent, the wallet never opens. Sandbox is not a Solana network: swaps and prediction orders need a **Mainnet** wallet chosen for the feed in both environments.

## Next {#next}

- [Rules and warnings](/docs/rules)
- [Notifications and live updates](/docs/notifications)
- [History and results](/docs/history-and-results)
- [SAC swap service fee](/docs/swap-service-fee)
