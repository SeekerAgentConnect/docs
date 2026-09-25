---
title: Notifications and live updates
excerpt: Content-free wake-ups, in-app banners while the app is open, and live streams that never approve or open the wallet.
hidden: false
---

## System notifications

A system notification is posted when a sync discovers something new for you while the app is not being looked at, if Android permission and the channel are enabled.

Channels: **Requests waiting for review** and **Proposals waiting for review**.

Titles: **Acknowledgement requested**, **Signature requested**, **Transfer requested**, **Stake requested**, **Unstake requested**, **Cancel unstaking requested**, **Withdrawal requested**, **Swap requested**, **Swap signal**, **Prediction signal**, and a generic **Review requested** or **Signal ready for review**. Under the title: **From** and your local name for the connection, plus one fixed sentence, such as *Review the amount and recipient before deciding whether to send.*

A notification never contains the message, the amount, the recipient, the note, the bytes, a request ID, or anything that could approve something. It is only a reminder.

### What wakes the phone

| Route | Who sends | What arrives |
| --- | --- | --- |
| Direct FCM | A direct server with its own Firebase project | A fixed `request_invalidation`: no request identity, no content |
| Feed topic push | The feed gateway, when a publisher publishes | A fixed `feed_invalidation` on that feed's topic |
| Gateway push relay | The feed gateway, on behalf of a direct server that has no Firebase project | The same `request_invalidation`, byte for byte |

All three are content-free wake-ups: the phone then reads the server, authenticated, and renders what the server says. For the relay, the app honours only the relay origin its build was configured with; a server advertising another address gets nothing. Delivery can be delayed, collapsed, expired, throttled, or dropped, and Firebase is optional: **Refresh**, the foreground streams, and the periodic job continue without it. **Force stop** in Android Settings stops everything until you reopen the app.

### Opening one

A tap opens the item after a current-state fetch: *Fetching the current request from the paired sidecar…* Until it succeeds, no answer, approval, or wallet control is shown. Gone, removed, revoked, and unavailable are each stated, and unavailable offers **Try again**. An answer already stored on this phone opens its existing record. A tap never chooses an answer, approves, signs, or opens a wallet.

## In-app banners

While the app is open, the same events are told inside it, as one banner at a time over whatever is on screen, sheets included.

| Banner | Title | Sub-line | Stays for |
| --- | --- | --- | --- |
| Request | the request's own words | **New request · server · detail** | six seconds |
| Signal | the signal's own words | **New signal · source · detail** | six seconds |
| Disconnected | **server disconnected** | none | until you tap or swipe it |

The words are the same ones a system notification uses. A tap dismisses the banner and opens the review, or, for a disconnection, **Add connection**, because pairing again is the only way back. Swiping dismisses it; TalkBack users get a **Dismiss** action.

No banner is raised for an item whose review is already on screen, or for anything that arrived while the app was away: that was the system notification's to tell. A dropped Wi-Fi connection raises no banner either; only a server refusing this phone's credential counts as disconnected.

## Live updates while the app is open

Each usable direct connection keeps one stream, and each feed reads its gateway, streaming where the gateway offers it. New requests, signals, and outcome changes appear on Home, in the Inbox, and in Activity without **Refresh**. Leaving for the wallet closes the streams without cancelling the wallet action; coming back reconciles first, then live delivery resumes.

| Home says | Meaning |
| --- | --- |
| **Connected · N pending** | Reachable, and streaming where the server offers it |
| **No live updates · N pending** | The server answers but offers no update stream. Refresh works; nothing to retry, nothing to pair again |
| **Upgrade for live updates · N pending** | Its update listener is too old |
| **Live updates unavailable · N pending** | It advertised an address this build cannot use |
| **Couldn't reach the server** | A real network failure only. **Retry** is offered |
| **Feed offline · N pending** | The publisher behind the feed stopped checking in. Its signals are still readable |

A direct stream that drops recovers on its own: retries back off to at most 30 seconds, and what the server stored during the outage arrives with the next snapshot. The first retry after the network returns can still wait out a 30-second handshake, so recovery is not instant. No re-pairing is needed.

## In the background

With at least one usable connection, Android keeps one periodic job at its 15-minute minimum. That is not a promise: Doze, battery restrictions, and device policy can delay a run. A background run fetches a snapshot, retries an answer you already recorded, and saves requests, Activity outcomes, and last-sync time. It never prepares a transaction, answers a request, approves, opens the wallet, signs, or sends.
