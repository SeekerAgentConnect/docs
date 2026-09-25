---
title: Disconnect, revoke, and remove
excerpt: Removing a direct connection revokes it at the server. Removing a feed deletes its signals. Nothing is backed up to a new phone.
hidden: false
---

## Direct server

In the connection sheet, **Disconnect** explains itself: *The server revokes this phone's credential and cancels its pending requests. To connect again, pair with a new code.* Confirm **Disconnect from …?** The connection, its requests, its rules overrides, and its cached server state leave the phone at once. Activity is kept.

If the server cannot be reached, the app says **Couldn't tell the server** and offers **Remove anyway**. The credential then keeps working on the server until its operator runs `pnpm pair revoke` (or the packaged server's `pair revoke`).

A direct server has one paired phone. Pairing another phone, or pairing this one again, revokes the previous connection. For a lost phone, the operator revokes on each server it was paired with: the credential stops immediately and its pending requests are cancelled.

## When the server ends it

A server can revoke the phone first: the operator ran `pair revoke`, another phone paired, or its database was reset. The moment the server refuses this phone's credential, or the update stream says the pairing is revoked:

- the Home row says **Disconnected · pair again to reconnect**;
- the sheet says *The server no longer accepts this phone. Pair again to reconnect.*;
- an in-app banner, **… disconnected**, stays until you tap or swipe it. Tapping opens **Add connection**;
- the credential is deleted, the pending requests are dropped, and answers still waiting to be sent become undeliverable (**Never reached the server** in Activity).

A server that is merely unreachable is not this. A dropped connection shows **Couldn't reach the server** and raises no banner.

The sheet's button is then **Remove**. Confirm **Remove … from this phone?** — *The server no longer accepts this phone, so there's nothing left to revoke.* Pair again with a fresh code; the new pairing is a new connection.

## Public feed

A feed holds no credential, so there is nothing to revoke. Its sheet's button is **Remove**, with the same **Remove … from this phone?** dialog. Removing it stops the gateway stream and the push topic subscription, and deletes the feed's signals from this phone: they leave the Inbox and Home immediately, and a review of one of them closes. Another feed's signals are untouched. Activity records survive.

**Hide this signal** on a single signal is final for that signal on this device, across later revisions.

## Retired private connections

A connection made through the retired private gateway mode cannot be disconnected, because its credential was already deleted when the mode was retired. Its sheet says: *This gateway connection was retired. It cannot sync, open requests, or send results. Ask the operator for a fresh direct pairing code.* It offers **Pair directly**, which opens **Add connection**, and **Remove**, which deletes the record. Its Activity is kept either way.

## Wallet versus servers

**Disconnect wallet** on the Wallet tab is independent of removing servers or feeds. See [Connect your wallet](/docs/wallet-setup).

## A new phone or a reinstall

Nothing is backed up or moved: not credentials, not rules, not feeds, not Activity unless you still have this installation. Pair each direct server again, which revokes the old phone's connection, and add feeds again. Rules start empty.
