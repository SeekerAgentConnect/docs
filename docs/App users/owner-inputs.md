---
title: Owner inputs
excerpt: Amount, slippage, side, and stake are chosen on the phone. Servers declare the controls, never the answers.
hidden: false
---

A request may declare **owner inputs**: controls already compiled into the app. The declaration is the field’s shape and bounds. It never contains your answer.

You fill those controls under **Your part** before the phone prepares bytes.

## Swap

How much to swap is yours alone. You also set slippage in whole basis points, within the publisher’s ceiling (`max_slippage_bps`).

Typical fields:

- **Amount** (`OWNER_INPUT_KIND_AMOUNT`)
- **Slippage (bps)** (`OWNER_INPUT_KIND_COUNT`)

Neither value is sent to a public publisher or the shared feed. On a **private** gateway request, the declared choices and the final outcome return only to the authenticated server that created the request.

Flow:

1. Enter amount and slippage.
2. Tap **Get a quote and prepare**. Changing a field throws away the old preparation.
3. Review what the phone read in the transaction.
4. Production: **Approve and swap**, then confirm in the wallet. Sandbox: **Simulate**.

A preparation is good for about **one minute** (quote freshness and blockhash). After that, prepare again.

## Prediction

There is no default side. You choose **Yes** or **No** and a stake. The publisher names a market; the phone reads whether it is open, prices, and rules from the provider at the moment you look.

The provider’s minimum stake is a floor (five dollars of the deposit mint). Buying only is supported. Selling a position is out of scope.

## Acknowledgements, signatures, and transfers

Direct sidecar acknowledgements, message signatures, and transfers do not use this owner-input form. The request already names the message or the transfer amount. You still review and approve by hand.

## What is never an owner input

A server cannot declare a control that selects a wallet, pastes a seed, downloads a plugin, or skips review. Unknown envelope or capability versions stay readable and dismissible; they are not executable.
