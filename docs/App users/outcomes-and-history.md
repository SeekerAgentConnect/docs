---
title: Outcomes and Activity
excerpt: Activity is your local record of what this phone answered. It outlives the request a server was owed.
hidden: false
---

Open **Activity** from Home or **Connections**. Each record keeps who asked, the terms you reviewed, the network, the outcome, and — for a sent transfer — a signature and an explorer link on that cluster.

Activity remains after a request expires and after you remove the connection. **Clear** asks **Clear the activity history?** and removes local records only. The chain does not change.

## Outcome labels

| Label | Meaning |
| --- | --- |
| Acknowledged | You acknowledged a message |
| Rejected | You rejected in SAC |
| Declined in the wallet | You said no in Seed Vault Wallet |
| Message signed | The wallet signed a message. That is **not** a payment; no explorer can show it |
| Sent, not confirmed yet | Submitted; the chain has not settled it |
| Confirmed on the network | The sidecar verified the exact approved bytes on chain |
| Failed on the network | The chain executed those bytes and they failed |
| Not signed | No signature |
| **Simulated** | Sandbox: nothing was signed and nothing was sent. No explorer link |
| Outcome unknown | The wallet never returned a result. Do **not** retry from the app |
| Never reached the server | Your answer is still on the phone |
| The request had already ended | Cancelled or expired before the answer landed |

## Transfers

**Check status** asks the sidecar to read the signature. Confirmed copy: *This transfer went through on the network…* **View on Solana Explorer** opens a browser. The app does not talk to the explorer itself.

A message signature is never shown as a payment.

## Sandbox

Sandbox records **Simulated**, beside the network the operation was bound to, with no signature and no explorer link. The review still used live data and real prepared bytes. See [environments](/docs/environments).

## Feeds versus private results

- A **public feed** decision stays on this device. The publisher is not updated.
- A **private gateway** request may return only the declared owner inputs and final outcome to the authenticated originating server.
- A **direct** sidecar result returns to that sidecar so the agent can poll it.

One execution attempt is recorded before a wallet opens. Sandbox **Simulate** spends that attempt for that proposal on this device: the same signal is not then executable as a real send on this phone.
