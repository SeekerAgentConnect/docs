---
title: Notifications and live updates
excerpt: Foreground streams, periodic sync, and optional content-free push never approve or open the wallet.
hidden: false
---

While SAC is open, each usable connection keeps one live stream. New requests and outcome changes appear on Home, **Requests**, request details, and **Activity** without tapping **Refresh**. Rotating the phone or moving between screens keeps the same stream.

Leaving for the wallet closes foreground streams without cancelling the wallet action. Coming back reconciles stored answers and missed server changes, then live delivery resumes.

## Status

Connection status can say connecting, live, reconnecting, unreachable, revoked, unsupported, or paused in the background. **Last synced** is separate: an older successful sync does not mean a stream is live. **Refresh** remains available.

## In the background

With at least one usable connection, Android keeps one periodic job. The configured interval is **15 minutes**, which is Android’s minimum — not a promise that every request appears within 15 minutes. Doze, battery restrictions, and device policy can delay a run. **Force stop** in Android Settings stops scheduled and push-triggered work until you reopen the app.

A background run reloads stored connections and encrypted credentials, fetches a snapshot, retries an answer you already recorded if needed, and saves requests, Activity outcomes, and last-sync time. It never prepares a transaction, answers a request, approves, opens the wallet, signs, or sends.

## Optional Firebase

If the build and sidecar (or gateway) are configured for Firebase, a content-free invalidation may prompt a sooner Sync. The ping carries no request identity or content and authorizes nothing. Delivery can be delayed, collapsed, expired, throttled, or dropped.

After Sync discovers a **new** pending request, the app may show a generic notification if Android permission and the channel are enabled.

Channels:

- **Requests waiting for review**
- **Proposals waiting for review**

Titles include Acknowledgement, Signature, Transfer, and Swap requested; Swap and Prediction signal.

Firebase is optional. Foreground streams, **Refresh**, and the periodic job continue without it.

## Opening a notification

A tap opens the connection and request named by its local route. The app fetches current state first. Until that fetch succeeds, the screen shows no answer, approval, or wallet controls.

Expired, cancelled, answered-elsewhere, removed, revoked, and unreachable cases are stated. An answer already stored on this phone opens its existing record.

The notification is only a reminder. Tapping it never chooses an answer, approves, signs, or opens a wallet.
