---
title: Outcomes and Activity
excerpt: Activity is your local record of what this phone answered. It outlives the request a server was owed.
hidden: false
---

Open the **Activity** tab. Its footer: *Every request you answer is recorded here, and the record stays after the request itself is gone.* Each record keeps who asked, the terms you reviewed, the network, the outcome, the rules assessment you read (**Your rules when you answered**), and — for a sent transaction — its ID and an explorer link on that cluster.

Records come in kinds: **Acknowledgement**, **Message signature**, **Transfer**, **SKR staking**, and **Operation** (a swap or prediction order from a feed).

Activity remains after a request expires and after you remove the connection. **Clear** asks **Clear the activity history?** and removes local records only: *It changes nothing on any network and nothing on any server.*

The Inbox's **History** tab is different: it lists answered, dismissed, expired, and cancelled items while they are still held. Activity is the durable record.

## Outcome labels

| Label | Meaning |
| --- | --- |
| Answered, waiting to be sent | Your answer is stored on this phone and has not reached the server |
| Acknowledged | You acknowledged a message |
| Rejected | You rejected in SAC |
| Declined in the wallet | You said no in Seed Vault Wallet |
| Message signed | The wallet signed a message. That is **not** a payment; no explorer can show it |
| Sent, not confirmed yet | Submitted; the chain has not settled it |
| Confirmed on the network | The server verified the exact approved bytes on chain |
| Failed on the network | The chain executed those bytes and they failed |
| Not signed | No signature |
| **Simulated** | Sandbox: nothing was signed and nothing was sent. No explorer link |
| Outcome unknown | The wallet never returned a result. Do **not** retry from the app |
| Never reached the server | Your answer could not be delivered |
| The request had already ended | Cancelled or expired before the answer landed |

## Transfers and staking

**Check status** asks the direct server to read the transaction on chain. It opens no wallet and sends nothing again. The answer says which host looked (**Checked with …**), and *a confirmed or failed result is what that one server read from the network.* The server compares what it found with the bytes you approved; a signature whose transaction is not the approved one settles nothing.

Staking transactions are confirmed the same way: the staking server checks when the agent polls the request or when you tap **Check status**. There is no background watcher.

**View on Solana Explorer** opens a browser. *The explorer opens in your browser. This app makes no connection to it.* A message signature is never shown as a payment.

## Uncertain submissions

**Outcome unknown** means the app closed, or the wallet never came back, while the transaction was with it. It may have been sent, or not. No signature reached this phone, so there is nothing to look up. Check the wallet's own history, or your address on an explorer for that network. Neither the app nor the server ever hands the transaction to the wallet again.

A submitted swap or prediction order is different again: *The wallet signed and sent it. Whether it succeeded on chain is a separate question, and this app does not follow it.* The record keeps the transaction ID and links under **Where to look now**; fills, positions, and settlement are not tracked.

## Sandbox

Sandbox records **Simulated**, beside the network the operation was bound to, with no signature and no explorer link. The review still used live data and real prepared bytes. See [environments](/docs/environments).

One execution attempt is recorded before a wallet opens. **Simulate** spends that attempt for that signal on this device: the same signal is not then executable as a real send on this phone.

## Feeds versus direct servers

- A **public feed** decision stays on this device. The publisher and the gateway are not told.
- A **direct** server's result returns to that server so the agent can read it.
- Removing a feed takes its signals out of the Inbox and off Home at once. Activity survives it.
