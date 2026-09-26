---
title: Review requests
excerpt: Everything waiting for you is in the Inbox. You tap, then the wallet asks again.
hidden: false
---

Requests from your servers and signals from feeds wait in one list on the **Inbox** tab. Tap one to open its review.

## What you can be asked

| Request | What you tap | Moves funds? |
| --- | --- | --- |
| Acknowledge a message | **Acknowledge** or **Reject** | No |
| Sign a message | **Approve and sign**, then confirm in the wallet | No |
| Transfer SOL or a token | **Approve and send**, then confirm in the wallet | Yes |
| Swap (feed) | Enter an amount, **Get a quote and prepare**, then **Approve and swap** or **Simulate** | In production |
| Prediction order (feed) | Choose Yes or No and a stake, then approve or **Simulate** | In production |
| Stake, unstake, cancel unstake, withdraw SKR | **Approve and …**, then confirm in the wallet | Stake and withdraw move SKR; the other two move nothing |

For a feed signal the publisher never sets your amount or side. You do, on the phone, and it stays there.

## Two steps

1. The review shows what the phone read for itself: the amount, the recipient, the transaction. The agent's note is shown apart, marked as not verified. Your [rules](/docs/rules) add warnings.
2. You tap Approve. Only then does Seed Vault Wallet open, and it asks again. Declining there is a rejection.

If the phone cannot read a transaction, or the bytes do not match the request, there is no Approve button.

## Sandbox

A sandbox signal says so on its review. **Simulate** records **Simulated** in Activity and stops. Nothing is signed, nothing is sent, the wallet never opens.

## Notifications

A notification tells you something is waiting. It never contains the amount or the message, and tapping it never approves anything. While the app is open, a short banner appears instead. If a server ends the pairing, the banner stays until you tap it.

## Activity

The **Activity** tab keeps every answer: acknowledged, signed, sent, confirmed, rejected, simulated. It stays after a request expires and after you remove a connection. **Outcome unknown** means the wallet never reported back; check the wallet's own history before doing anything again.
