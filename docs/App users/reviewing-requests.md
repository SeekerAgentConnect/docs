---
title: Review requests
excerpt: Home browses waiting work. Request details is where you answer. The wallet is a second confirmation.
hidden: false
---

Home, **Requests**, and each connection’s **Pending requests**, **Signals**, or **Requests** row share one collection. **Signal** is a small label plus the feed’s local name. It is not a different lifecycle.

The Home carousel only browses. Its hint: *The carousel only browses — nothing is answered here.* Tap a card to open **Request details**.

## The list

**Requests** has up to three parts:

- **Waiting for you** — not answered yet. Each row shows the connection, the action, age, and expiry.
- **Waiting to be sent** — your answer is stored on the phone and has not reached the server.
- **Answered** — the server confirmed it.

A connection the phone could not reach is named at the top. The list then shows what the phone already had.

## Review versus final approval

| Step | What happens | Wallet? |
| --- | --- | --- |
| 1. A server creates a request | It waits as pending | No |
| 2. You open it | The phone prepares and inspects what it can prove | No |
| 3. You tap Approve / Acknowledge / Simulate | SAC records the decision. For wallet actions the server must accept the approval first | Still no |
| 4. Seed Vault Wallet opens | You confirm there | Only here, and only in production |
| 5. You decline in the wallet | Treated as rejection | Nothing signed |

If the phone cannot read a transaction whole, or the bytes disagree with the request, **there is no Approve button**. Rules never put that button back.

For a transfer, **Approve and send** binds the preparation’s version, content hash, wallet, network, and exact bytes. Those stored bytes are what the wallet is handed — never a copy fetched again.

## What you tap

| Kind | Primary actions |
| --- | --- |
| Acknowledgement | **Acknowledge** / **Reject** |
| Sign message | **Approve and sign** / **Reject** |
| Transfer | **Approve and send** / **Reject**, plus **Read it again** and **Check status** |
| Swap (production) | Enter amount → **Get a quote and prepare** → **Approve and swap** |
| Swap (sandbox) | Same review, then **Simulate**. The wallet is not opened |
| Prediction | Choose side and stake → prepare → approve or **Simulate** |

Publisher or agent **notes** are shown separately from facts the phone established. Notes are unverified.

When [rules](/docs/rules) warn, you must tick **I have read the warnings above and want to go ahead anyway**. The button becomes **Approve despite warnings** (or the send/acknowledge variant). **Reject** never waits for a tick.

## Message signing

The complete message is on the phone, with invisible characters marked (`␊` for a line break). **Signs with** names the connected wallet. A signature moves no funds.

## Transfers

The phone reads amount, recipient, token, signers, and instructions out of the bytes. Token-2022 mints, NFTs, and token accounts given as recipients are refused by name. Amounts are whole base units.

**Check status** is a read-only chain lookup. It does not reopen the wallet. If the wallet never returned, the outcome is **UNKNOWN** — do not retry from the app. Check the wallet history or an explorer.

## After you answer

The phone **saves the answer before sending it**. If the server is unreachable, it sits under **Waiting to be sent**. **Send again** and **Refresh** retry the same answer. Sending twice is safe.

A cancelled or expired request cannot be answered. An answer already stored on this phone opens its existing record.

Tapping a [notification](/docs/notifications) never chooses an answer. It only opens the named request after a current-state fetch.
