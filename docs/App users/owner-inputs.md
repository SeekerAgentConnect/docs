---
title: Owner inputs
excerpt: Amount, slippage, side, and stake are chosen on the phone. Servers declare the controls, never the answers.
hidden: false
---

A request may declare **owner inputs**: controls already compiled into the app. The declaration is the field's shape and bounds. It never contains your answer, and nothing on the wire has a field for one.

You fill those controls under **Your part** on the review sheet before the phone prepares bytes. The note there: *How much to swap is yours alone. It stays on this phone: the publisher and the shared gateway are never told the amount, your wallet, or whether you acted.*

## Swap

How much to swap is yours alone. You also set how far the price may move, in whole basis points, within the publisher's ceiling.

| Field | Declared as |
| --- | --- |
| **Amount to swap** | `OWNER_INPUT_KIND_AMOUNT`, between the smallest and largest amount the signal is for, in the asset's own units. Nothing is rounded |
| **Most the price may move (basis points)** | `OWNER_INPUT_KIND_COUNT`, up to the signal's ceiling |

Flow:

1. Enter the amount and the slippage.
2. Tap **Get a quote and prepare**. Changing a field throws away the old preparation; **Get a fresh quote and prepare again** does the same on purpose.
3. Review **What this phone read in the transaction**: what you spend, who pays and signs, the least you receive, the priority fee, any new token account.
4. Production: **Approve and swap**, then confirm in the wallet. Sandbox: **Simulate**.

A preparation is good for **60 seconds** (quote freshness and blockhash). After that the sheet says the quote and the transaction have expired, and you prepare again. See [Jupiter swap](/docs/jupiter-swap).

## Prediction order

There is no default side. You choose **Which side** — **Yes** or **No** — and an **Amount to stake**. The publisher names a market; the phone reads whether it is open, the prices, and the rules from the provider at the moment you look, and shows what the order costs and what is paid out if that side wins.

The provider's minimum order is a floor (five dollars of the deposit token), and the deposit token has to be one the provider settles in. Buying only is supported; selling a position is out of scope. A prepared order is good for 60 seconds. See [Jupiter prediction](/docs/jupiter-prediction).

## What the provider says first

Before the form is usable, the phone works out who would prepare the operation. If no provider on this phone serves the signal — the wrong network, environment, asset, or action version, or a provider this build does not carry — the sheet says so instead of offering the form. The reasons are listed under [reviewing requests](/docs/reviewing-requests).

## Acknowledgements, signatures, transfers, and staking

Direct-server acknowledgements, message signatures, transfers, and the four SKR staking actions do not use this form. The request already names the message, the transfer amount, or the staking amount; a cancel or withdraw carries no amount at all, and one that does is refused. You still review and approve by hand, and your [rules](/docs/rules) still assess them.

## Where your answers go

- A **public feed** signal: your amount, side, and decision stay on this phone. Nothing is uploaded to the publisher or the gateway.
- A **direct** request: the outcome returns to the server that asked, so the agent can read it. The direct requests this release ships — acknowledgement, signature, transfer, staking — declare no owner inputs.

## What is never an owner input

A server cannot declare a control that selects a wallet, pastes a seed, downloads a plugin, or skips review. Unknown envelope or capability versions stay readable and dismissible; they are not executable.
