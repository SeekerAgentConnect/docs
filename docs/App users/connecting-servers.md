---
title: Connect servers and feeds
excerpt: A server you pair with, or a feed you subscribe to. Both start from Add connection.
hidden: false
---

Tap **Add connection** on Home. There are two kinds of connection.

| | Your own server | A public feed |
| --- | --- | --- |
| What you get | A link from your agent, or a code from the server's terminal | A feed link from the publisher |
| What it does | Pairs this phone with that server. Its requests come only to you | Subscribes this phone. Everyone with the link sees the same signals |
| Environment | Always production | Sandbox or production |

## Pair with your own server

Your agent gives you the link. It calls `vault_create_pairing_link` on your MCP server and hands you an `https://…/pair` link. If you are at the server's terminal instead, `pnpm pair` prints the same thing as a QR code.

1. Open the link on the phone, or scan the QR code, or paste the `seekervault://pair` line into **Add connection**.
2. Check the server address on **Pair with this server?**
3. Tap **Pair**.

Opening the link does nothing by itself. The link works once and expires after ten minutes. A server has **one** paired phone: pairing again, from this phone or another, replaces the old pairing.

The SKR staking server is a second server of the same kind, with its own link.

## Add a feed

The publisher shares a link that looks like `seekervault://feed?…`. It carries no secret.

1. Paste or scan it in **Add connection**.
2. Read **Add this public feed?** and tap **Add feed**.

The phone never contacts the publisher and creates no credential. The publisher is never told who subscribed or what you decided. A feed starts in sandbox when the publisher offers it; you can switch it to production in the feed's own screen.

## Remove

Open the connection from **Paired servers**.

- **Disconnect** a server: the server drops this phone and cancels its pending requests. To come back, pair again.
- **Remove** a feed: its signals leave the phone. Other feeds are untouched.

Your **Activity** history stays either way. If a server ends the pairing itself, the app says **Disconnected · pair again to reconnect**.

A connection from a retired, older connection mode is shown as retired and cannot be used. Pair directly with that server instead.
