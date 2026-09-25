---
title: Rules
excerpt: Global rules and per-connection overrides are advisory notes on this phone. They never approve or sign.
hidden: false
---

**Global rules** is a row on Home. Each connection's sheet has a **Rules** card, which starts as **Uses global rules**. Both open as sheets.

Rules live only on this phone. They are never sent to a server, publisher, gateway, or agent. They are not backed up and do not travel to a new phone.

## What rules are not

- They **approve nothing** and **refuse nothing**. The card says so: *Rules highlight requests that need attention. You still approve every request.*
- *Within the rules you set* is not an approval. You still tap, and the wallet still asks.
- They never create or remove the Approve button that inspection already decided.
- Daily totals count what **this app** recorded in Activity. They are not an on-chain spending cap and they do not see wallet-direct transfers.

Review heading: **What your rules make of this**. Footer: *Advisory only. You approve by hand, and your wallet still asks separately.*

## Sections

- **Actions** — **Acknowledge text**, **Sign a message**, **Transfer funds**, **SKR staking**, **Swap**, **Prediction order**
- **Assets and thresholds** — **Only these assets may move**, **Most per request**, **Most across all connections per day** (global only), **Additional most for this connection per day**
- **Recipients** — **Only these wallets may receive funds**
- **Programs** — **Only these programs may be called**. Every program the transaction calls is checked, the compute budget program included

SOL is typed in SOL. A token is typed in that mint's **base units**, and every field shows the exact base-unit number it will store. SKR is a token: its thresholds are typed in base units, for the SKR mint on mainnet.

## How staking counts

Staking is one action in the list, **SKR staking**, for all four operations: a rule is about whether this agent may touch your position at all. What each operation does to your wallet is a fact of the review, and the other checks read it:

| Operation | What moves | What the asset, recipient, and threshold checks see |
| --- | --- | --- |
| Stake | SKR leaves your wallet for the vault | Outgoing: the SKR amount, on mainnet, with your own wallet as the established recipient |
| Start unstaking | Nothing. A position changes and a cooldown starts | *Nothing moves*: those checks pass, and only the action list applies |
| Cancel unstaking | Nothing | *Nothing moves* |
| Withdraw | SKR comes back into your wallet | Incoming: the amount, with your own wallet as the recipient |

Nobody else can be reached by any of the four. The recipient is established from the transaction, not assumed.

Acknowledgements and message signatures move nothing either, so for them the same checks pass as *nothing moves*. A swap spends what leaves your wallet; a prediction order spends the stake, and its recipient is the order's own account.

## Inheritance

| Choice | Meaning |
| --- | --- |
| **Use global** | Inherit. If global has no rule, the check is **Not configured** |
| **Override** + Off | Explicitly no check |
| **Override** + On + a list | Replace the whole global list |
| **Override** + On + empty | **Nothing passes** that check |

Lists do not merge. An absent list is not an empty list: the first configures no check, the second allows nothing. A global daily threshold counts every connection and cannot be raised or removed locally; a connection can only add a tighter one of its own.

**Reset connection overrides** returns that connection to inheritance without changing global rules. **Start over from no rules** and **Clear all global rules** are recovery actions for documents this app cannot read.

## On the review sheet

Each check shows its source: **Global**, **Connection override**, or **Not configured**. **Global daily** and **Connection daily** are separate lines, each with confirmed, not yet settled, and projected totals.

Verdicts: **Within the rules you set** or **Outside your rules**. Per check: **Matched**, **Outside the rules**, **Could not be checked**, **No rule set**. Checks nothing covers are named: *Nothing was checked for: …*

If the verdict is outside the rules, tick **I have read the warnings above and want to go ahead anyway** to enable **Approve despite warnings**. **Reject** never waits. A connection with no rules at all does not ask for a tick.

A global edit, a local reset, a new preparation, or an Activity change that affects the counters refreshes the sheet. A stale tick does not survive.
