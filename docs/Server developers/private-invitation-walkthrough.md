---
title: Private invitations (retired)
excerpt: The gateway-private mode — invitations, device bindings, and gateway-routed private requests — was retired. What it was, what a stored connection became, and what replaces it.
hidden: false
---

**This mode is retired.** Do not build on it. This page exists so that older links and stored connections make sense.

## What it was

`gateway_private` let an independent server invite one phone through the shared gateway: the server published a private manifest, created an invitation (`seekervault://invite?…` links and hosted pages), the phone redeemed it for a device credential, and private requests and their results were routed through the gateway's `InvitationService` and `DeviceService`.

All of that is gone: the two services, the `gateway_private` manifest branch, the invitation links, the device credentials, and the private request and result routing. Their wire identifiers are reserved so an old serialized value can never acquire a new meaning: manifest field 10, connection-mode value 3, and gateway problems 35–46. An old invitation URL or removed RPC answers 404. The gateway accepts only feed audiences with `DEVICE_LOCAL` results and has no endpoint that takes a subscriber result.

## What a stored connection became

On the phone, a stored gateway-private connection is now an inert **retired** record: its credential is deleted, its history is kept, and it can fetch, execute, or return nothing. Its detail sheet says why it is inert and offers **Pair directly**, which opens the blank direct pairing flow. No direct URL or credential is derived from the old record. An old invitation link pasted into SAC only explains the retirement.

On the gateway, the first start after the upgrade migrated the database in one transaction, removing private routing data and keeping every public feed, publisher, and credential.

## What replaces it

| You want | Use |
| --- | --- |
| A request addressed to one owner, with a declared result back | A **direct server**: pair the phone with a one-use `seekervault://pair` code, QR, or HTTPS pairing link — [Build a direct server](/docs/direct-server-walkthrough) |
| The same document to many subscribers, decisions staying on each phone | A **public feed** through the gateway — [Public feed sandbox](/docs/public-feed-walkthrough) |

There is no credential conversion: an owner who still needs addressed requests receives a fresh pairing code from a direct server.
