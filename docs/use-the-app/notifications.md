---
title: Notifications and live updates
description: "How new requests and signals reach you: live while SAC is open, an in-app banner, and a push notification when it is closed. What each one needs."
slug: /notifications
sidebar_position: 6
---

SAC tells you something is waiting in three ways. None of them approves anything, and none carries the amount or the message: you always open the request and read the review.

| While… | You get | It needs |
| --- | --- | --- |
| SAC is open on the screen | **Live updates**: new requests and signals appear in the Inbox as they arrive, and a short in-app banner such as **New request** or **New signal** | A server or gateway that streams updates |
| SAC is closed or in the background | A **push notification** from Android | The sender to support push, and notifications allowed for SAC |
| Neither works | Nothing arrives by itself | Open the connection or refresh; requests are still there |

## Live updates {#live-updates}

While SAC is open it keeps a stream to each direct server and to the gateway for your feeds. A connection that answers but does not stream shows **No live updates**: that is not an outage, only that you need to refresh to see new requests. A direct server needs HTTP/2 end to end to stream; that is its operator's setup.

## In-app banners {#in-app-banners}

While you are in the app, a short banner replaces the system notification: a new request, a new signal, or a change on a connection, for example a server that ended the pairing (*Server name* **disconnected**) or a Restricted feed whose publisher approved or revoked this device. Tap it to open the item, or **Dismiss** it. A disconnection banner stays until you tap it.

## Push notifications {#push-notifications}

SAC uses two Android notification channels, **Requests waiting for review** (direct servers) and **Proposals waiting for review** (feeds). A notification names the kind of request and where it came from, such as *Transfer requested* or *Swap signal*. Tapping it opens SAC, which fetches the current state from the server first; if the request has meanwhile expired, been cancelled or answered, SAC says so, and nothing was approved or signed.

For a notification to arrive, all of these must hold:

1. **Notifications are allowed for SAC.** On Android 13 and later, SAC asks for permission once you have a connection that can use it. You can change this at any time in Android **Settings**; SAC has no notification settings screen of its own.
2. **The sender supports push.**
   - A **feed**: the SAC gateway sends a content-free wake-up when the publisher posts. For a Restricted feed this works only while your device's access is live.
   - A **direct server**: its operator has enabled push, usually through the SAC relay ([Enable push](/docs/pair-your-phone#enable-push)). A server without push still works; you just see its requests only when you open SAC.
3. **Android delivers it.** Battery optimisation and Do Not Disturb can delay or hide notifications. A push is a best-effort wake-up, not a guaranteed delivery; the request itself stays on the server or gateway until you read it or it expires.

## If nothing arrives {#troubleshooting}

| Symptom | What to do |
| --- | --- |
| No notifications at all | Allow notifications for SAC in Android **Settings**, then check that the connection's sender supports push |
| Notifications for feeds but not for your own server | Your server has no push configured. Ask its operator, or open SAC to check |
| **No live updates** on a connection | Refresh by hand; the server's operator can turn streaming on |
| **Feed offline** | The publisher's server stopped checking in. What was already published is still readable; new signals arrive when it is back |
| A notification opens to "no longer pending" | It expired, was cancelled, or was already answered. Nothing was approved |

## Next {#next}

- [History and results](/docs/history-and-results)
- [Troubleshooting](/docs/user-troubleshooting)
