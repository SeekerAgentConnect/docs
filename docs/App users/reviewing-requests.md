---
title: Review requests
excerpt: The Inbox lists requests and signals. A review sheet is where you answer. The wallet is a second confirmation.
hidden: false
---

Everything waiting for you is in one place: the **Inbox** tab. Requests from direct servers and signals from public feeds wait in one list, newest first. **Signal** is a label plus the feed's name, not a different lifecycle.

Home's **Waiting for you** carousel only browses. Its caption: *Swipe to browse, tap to review. The carousel only browses — nothing is answered here.*

## The Inbox

Two tabs: **Pending** and **History**. Each pending row shows what is asked, the source, when it arrived and when it expires, **Production** or **Sandbox · no funds will move**, the network, and a warning count from your [rules](/docs/rules). The footer reads: *Requests and signals wait in one list, newest first. Review opens the whole operation: a production request hands off to the wallet, a sandbox item is only simulated on this phone.*

**History** holds what you answered, dismissed, or that expired or was cancelled. A connection's own list opens from its sheet (**Its inbox**), in three parts: **Waiting for you**, **Waiting to be sent**, and **Answered**.

## Review sheets

Tapping a row opens a review sheet over the tab. Every kind uses the same sheet: a headline, chips for the source, environment, and network, the facts the phone read for itself, **The agent's note · not verified** shown apart from them, the expiry, **What your rules make of this**, and two buttons.

| Kind | Primary actions |
| --- | --- |
| Acknowledgement | **Acknowledge** / **Reject**. *Nothing is signed and no funds move. Your answer is all the agent gets.* |
| Signature | **Approve and sign** / **Reject** |
| Transfer | **Approve and send** / **Reject**, plus **Read it again** and, once sent, **Check status** |
| Swap (signal) | **Amount to swap** and slippage → **Get a quote and prepare** → **Approve and swap**, or **Simulate** in sandbox. **Hide this signal** dismisses it for good |
| Prediction order (signal) | **Which side** (**Yes** / **No**) and **Amount to stake** → prepare → approve or **Simulate** |
| Stake SKR | **Approve and stake** / **Reject** |
| Start unstaking SKR | **Approve and start unstaking** / **Reject** |
| Cancel unstaking | **Approve and cancel unstaking** / **Reject** |
| Withdraw unstaked SKR | **Approve and withdraw** / **Reject** |

Amounts, sides, and slippage are [owner inputs](/docs/owner-inputs): the request declares the control, you fill it in.

## Two steps, then the wallet

| Step | What happens | Wallet? |
| --- | --- | --- |
| 1. A server or publisher creates it | It waits as pending | No |
| 2. You open it | The phone prepares the operation and reads the bytes itself | No |
| 3. You tap Approve / Acknowledge | SAC records the decision. A direct server must accept the approval, for the exact version and content hash you saw, before anything else happens | No |
| 4. The wallet hand-off sheet | **Approve a transaction**, with **Seed Vault Wallet**: **Sign and send**, **Decline**, or **Leave without answering** (the request stays pending) | Only here, and only in production |
| 5. You decline in the wallet | Recorded as a rejection | Nothing signed |

If the phone cannot read a transaction whole, or the bytes disagree with the request, **there is no Approve button**. Rules never put it back. What the wallet is handed is the stored bytes you approved, never a copy fetched again.

When the rules warn, tick **I have read the warnings above and want to go ahead anyway** (on a signal: *… and mean to go ahead*). The button becomes **Approve despite warnings**, **Approve and send despite warnings**, or **Acknowledge despite warnings**. **Reject** never waits for a tick.

## Sandbox means Simulated

A sandbox item shows: *Sandbox. Everything above is real — the live market, the exact transaction and this phone's reading of it. The last step is not: no funds will move, nothing is signed and nothing is sent.* **Simulate** records **Simulated** in [Activity](/docs/outcomes-and-history) and stops. The wallet is not opened. Sandbox is not a Solana network: the bytes are mainnet bytes, so the wallet must be a mainnet one. Direct connections are always production.

## Staking reviews

The four staking actions are four different reviews, because unstaking and withdrawing are easy to confuse: one starts a wait and moves nothing, the other returns the SKR. Each states its effect, for example: *Starts unstaking. No SKR reaches your wallet now: these tokens stop earning, wait out a cooldown, and then have to be withdrawn in a second, separate approval.* Facts include **Amount**, **Still staked afterwards**, **Withdrawable from**, **Cooldown finished**, **Also creates** (your SKR token account, when needed), and **Staking account**. If a cooldown is already running, an unstake warns that approving restarts it. Staking is mainnet only; the phone reads your position from its own Solana endpoint before checking the transaction. See [SKR staking](/docs/skr-staking).

## When nothing on this phone serves a signal

A signal is refused before anything is prepared when:

- this build does not carry the execution provider it names;
- it carries that provider, but at a version it cannot call;
- that provider does not do what the signal asks for;
- the signal states a version of its action this build does not read;
- the provider does not serve the network your wallet is selected for;
- the provider does not serve this connection's environment;
- the provider does not take the asset the signal names;
- the signal names a capability that was published for something other than what it asks for.

The signal stays readable and can be hidden. Nothing carries it out, and no other provider is picked instead.

## Message signing

The complete message is on the phone, with invisible characters marked (`␊` for a line break, a code point such as `U+200B` for the rest). **Signs with** names the connected wallet. A signature moves no funds.

## Transfers

The phone reads amount, recipient, token, signers, and instructions out of the bytes. Token-2022 mints, NFTs, and token accounts given as recipients are refused by name. Amounts are whole base units. A stale preparation is refused and read again for you; an old approval is never reused.

## After you answer

The phone saves the answer before sending it. If a direct server is unreachable, it sits under **Waiting to be sent**; **Send again** and **Refresh** retry the same answer, and sending twice is safe. A cancelled or expired request cannot be answered. A feed decision stays on this phone: the publisher and gateway are never told.

Tapping a [notification](/docs/notifications) never chooses an answer. It only opens the named item after a current-state fetch.
