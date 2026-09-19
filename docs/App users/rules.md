---
title: Rules
excerpt: Global rules and per-connection overrides are advisory notes on this phone. They never approve or sign.
hidden: false
---

**Global rules** is a row on **Connections**. Each connection also has **Rules**, which start as **Use global**.

Rules live only on this phone. They are never sent to a sidecar, publisher, gateway, or agent. They are not backed up and do not travel to a new phone.

## What rules are not

- They **approve nothing** and **refuse nothing**.
- “Within the rules you set” is not an approval. You still tap, and the wallet still asks.
- They never create or remove the Approve button that inspection already decided.
- Daily totals count what **this app** recorded in Activity. They are not an on-chain spending cap and they do not see wallet-direct transfers.

Review copy: **What your rules make of this**. Footer: *Advisory only. You approve by hand, and your wallet still asks separately.*

## Sections

- **Actions** — Acknowledge text, Sign a message, Transfer funds, Swap, Prediction order
- **Assets and thresholds** — **Only these assets may move**, **Most per request**, **Most across all connections per day** (global), **Additional most for this connection per day**
- **Recipients** — **Only these wallets may receive funds**
- **Programs** — **Only these programs may be called** (include compute-budget programs you intend to allow)

SOL is typed in SOL. A token is typed in that mint’s **base units**. Every field shows the exact base-unit number it will store.

## Inheritance

| Choice | Meaning |
| --- | --- |
| **Use global** | Inherit. If global has no rule, the check is **Not configured** |
| **Override** + Off | Explicitly no check |
| **Override** + On + a list | Replace the whole global list |
| **Override** + On + empty | **Nothing passes** that check |

Lists do not merge. An absent list is not an empty list: the first configures no check, the second allows nothing.

**Reset connection overrides** returns that connection to inheritance without changing global rules. **Start over from no rules** / **Clear all global rules** are recovery actions for unreadable documents.

## On the review screen

Each check shows its source: **Global**, **Connection override**, or **Not configured**. Daily rows show confirmed, unresolved, and projected totals for both global and connection scopes.

Verdicts: **Within the rules you set** or **Outside your rules**. Per check: Matched, Outside the rules, Could not be checked, No rule set.

If the verdict is outside the rules, tick **I have read the warnings above and want to go ahead anyway** to enable **Approve despite warnings**. **Reject** never waits.

A global edit, a local reset, a new preparation, or an Activity change that affects the counters refreshes the screen. A stale tick does not survive.
