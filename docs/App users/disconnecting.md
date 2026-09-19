---
title: Disconnect, revoke, and extra devices
excerpt: Each mode revokes a different thing. Sibling devices stay independent. Nothing is backed up to a new phone.
hidden: false
---

## Direct sidecar

**Disconnect** asks the sidecar to revoke this phone’s credential and cancel that connection’s pending requests, then removes the connection. If the sidecar cannot be reached, the app says **Couldn't tell the server** and offers **Remove anyway**. The credential may still work on the sidecar until the operator runs `pnpm pair revoke` (or the packaged equivalent).

**Remove from this phone** is for a connection the sidecar already rejects.

A sidecar has one paired phone. Pairing a new phone revokes the old one.

A lost phone: revoke on each sidecar it was paired with. Its credential stops immediately and pending requests are cancelled.

## Public feed

Removing a feed stops the stream and topic subscription. There is no credential to revoke. **Hide this signal** is final across later revisions of that request on this device.

## Private gateway

SAC **Disconnect** revokes **this device binding** only, then deletes the local credential.

The server can revoke the same binding independently. Sibling devices for the same server user reference stay active. Each extra device needs a **fresh** invitation and its own connection ID.

The server must send each request to the exact `(user reference, connection ID)` pair. The gateway never routes to another device.

Publisher credential rotation does not revoke device bindings.

## Wallet versus servers

**Disconnect wallet** is independent of disconnecting servers. See [Connect your wallet](/docs/wallet-setup).

## A new phone or a reinstall

Nothing is backed up or moved: not credentials, not rules, not Activity unless you still have this installation. Pair, add feeds, and confirm invitations again. Rules start empty.
