---
title: Rules
excerpt: Rules warn you. They never approve, and they never sign.
hidden: false
---

Rules are notes you write for yourself on this phone. When a request breaks one, the review shows a warning. You can still approve, and you still have to tap. Rules never approve anything on their own, and they are never sent to a server.

## Where

- **Global rules** on Home apply to every connection.
- Each connection's screen has a **Rules** card. It starts as **Uses global rules**; you can override any rule for that connection alone.

## What you can set

| Section | Rule |
| --- | --- |
| Actions | Which kinds a connection may ask for: acknowledge, sign a message, transfer, swap, prediction order, SKR staking |
| Assets and thresholds | Which assets may move, the most per request, and the most per day |
| Recipients | Which wallets may receive funds |
| Programs | Which programs a transaction may call |

Daily totals count what this phone recorded in Activity. They are not an on-chain limit.

Staking is one rule for all four operations. A stake counts as SKR leaving the wallet; a withdrawal as SKR coming back; unstaking and cancelling move nothing.

## Overrides

A connection override replaces the global rule; lists do not merge. Turning an override on with an empty list means nothing passes that check. **Reset connection overrides** returns to the global rules. A global daily limit cannot be raised for one connection, only tightened.

## On the review

The review says **Within the rules you set** or **Outside your rules**, and names which check failed. To go ahead anyway, tick **I have read the warnings above and want to go ahead anyway**; the button becomes **Approve despite warnings**. **Reject** never asks for a tick.
