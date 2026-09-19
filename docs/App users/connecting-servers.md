---
title: Connect servers and feeds
excerpt: Add a pairing code, a private invitation, or a public feed from the same Add connection screen.
hidden: false
---

Tap **Connections → Add connection**. The instructions read: *Scan or enter a direct pairing code, a private gateway invitation, or a public feed reference.*

The field is **Pairing code, invitation, or feed reference**. You can **Scan QR code** or paste and tap **Continue**.

The app routes in this order: a pairing code first, then an invitation, then a feed reference. A malformed pairing code is reported as a pairing problem and never treated as a feed.

## Pair a sidecar (`direct`)

Use a code that starts with `seekervault://pair?`. It works once, for about ten minutes. A newer code replaces it.

1. Confirm **Pair with this server?** The sheet shows the address and server ID. Pair only with a sidecar you run: whoever controls it can send this phone requests to review.
2. Tap **Pair**. Connection details open, named after the server’s host.

Pairing always creates a **new** connection. A sidecar has one paired phone at a time, so pairing again revokes the previous connection.

| Action | What it does |
| --- | --- |
| **Refresh** | Fetches pending requests. The app also does this when it opens |
| **Rename** | Local name, up to 64 characters. The sidecar never sees it |
| **Disconnect** | Revokes this phone on the sidecar, then removes the connection |
| **Remove from this phone** | For a connection the sidecar already rejects |

A feed row says: *A shared feed. This phone reads it through the gateway and holds no credential for it.* A private gateway row says: *Connected through the gateway. Requests still need your review and approval.*

## Add a public feed (`gateway_feed`)

Paste a reference such as:

```text
seekervault://feed?v=1&gateway=https://feeds.example.com&server=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
```

It carries no secret. Holding one grants nothing.

1. Confirm **Add this public feed?** The sheet shows the gateway origin, the server ID, that this is a public broadcast with no credential, and that adding it does not contact the publisher.
2. Tap **Add feed**, or **Cancel** to write nothing.

If it is already present, the app says so and offers to open it. A newly added feed shows its display name, **Sandbox** or **Production**, and required plugins. Snapshot, live stream, and optional topic subscription start without restarting the app.

There is **no** deep link. A `seekervault://feed` URL in a browser does not open SAC.

Feeds that serve sandbox start in **Sandbox**. Only you can switch to **Production**, and only if the publisher serves it. Switching drops the current preparation. See [environments](/docs/environments).

## Confirm a private invitation (`gateway_private`)

Open the hosted page or scan `seekervault://invite?v=1&gateway=…&token=…`.

1. SAC shows the server name, gateway, and expiry.
2. Confirm **Connect to this server?** Connecting lets this server send private requests to this device through the gateway. It does **not** share a wallet, grant signing, approve a request, or expose history.
3. Tap **Connect**.

Visiting the page, loading the QR, resolving metadata, or cancelling does **not** bind the device. Only **Connect** consumes the invitation.

Each additional device needs a new invitation. Sibling devices stay independent. The server must send each request to the exact connection ID this phone created.

## Status lines

| Status | Meaning |
| --- | --- |
| **Not checked yet.** | No refresh since it was added |
| **Last sync found N pending requests.** | The last fetch succeeded |
| **Couldn't reach the server.** | Sidecar or gateway unreachable |
| **The server's certificate isn't trusted…** | TLS failed |
| **This build allows plain HTTP only to 127.0.0.1.** | Use HTTPS, or loopback on a debug build |
| **The server no longer accepts this phone.** | Pair or invite again |
| **Connecting for live updates…** / **Live updates connected.** | Foreground stream |
| **Live updates paused while the app is in the background.** | Expected when you leave the app |

**Last synced** is shown separately from live status. An older successful sync does not mean a stream is live.
