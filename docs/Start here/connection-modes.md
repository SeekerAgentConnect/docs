---
title: Connection modes
excerpt: direct, gateway_feed, and gateway_private are three different ways a server reaches the phone.
hidden: false
---

Every connection has a **mode**. It comes from the server’s validated [manifest](/docs/manifest-contract), not from how you typed the code. A connection cannot change mode later.

## Comparison

| | `direct` | `gateway_feed` | `gateway_private` |
| --- | --- | --- | --- |
| Whose server | The sidecar you run | A public publisher | An independent backend |
| How you add it | Pairing code `seekervault://pair?…` | Feed reference `seekervault://feed?v=1&gateway=…&server=…` | Invitation page or `seekervault://invite?…` |
| Credential on the phone | Issued by the sidecar | **None** | Issued by the gateway after **Connect** |
| Who sees a request | Only the paired phone | Every subscriber of that channel | One confirmed device binding |
| Who the phone calls | The sidecar | The shared gateway | The shared gateway |
| What the server learns | That one phone paired | Nothing about any phone | Invitation completion and declared results |
| Where a result goes | Back to the sidecar | Nowhere — it stays on the device | Only through the authenticated origin, and only when the request declared `RETURN_TO_ORIGIN` |

You add all three from **Connections → Add connection**. The app tries a pairing code first, then an invitation, then a feed reference.

## `direct`

Use this when **you** run the sidecar the agent talks to.

1. On the computer that runs the sidecar, generate a one-use pairing code (`pnpm pair` in development, or the packaged pairing CLI).
2. In SAC, tap **Add connection**, scan or paste the `seekervault://pair?` line, and confirm **Pair with this server?**
3. Tap **Pair**.

A sidecar accepts **one paired phone at a time**. Pairing again revokes the previous connection, on this phone or another one. Results return to that sidecar so an agent can poll them. Direct connections are always **production**: there is no sandbox simulation for an agent waiting on a signature.

See the [direct sidecar walkthrough](/docs/direct-sidecar-walkthrough).

## `gateway_feed`

Use this when a developer publishes the same request to everyone who added the feed.

The reference carries **no secret**:

```text
seekervault://feed?v=1&gateway=https://feeds.example.com&server=<lowercase-uuid>
```

SAC shows **Add this public feed?** and explains that the phone creates no credential and does not contact the publisher. Tap **Add feed**.

There is no Android intent filter for `seekervault://feed`. A link in a browser does not open the app. Scan or paste the reference while **Add connection** is open.

Feed decisions are **device-local**. The publisher is not told the amount you chose, whether you approved, or the signature. See the [public feed walkthrough](/docs/public-feed-walkthrough).

## `gateway_private`

Use this when an independent server should send **private** requests to **this device**.

The server creates a temporary invitation. You open the hosted page or scan:

```text
seekervault://invite?v=1&gateway=<origin>&token=<temporary-token>
```

SAC shows **Connect to this server?** Connecting lets that server send private requests through the gateway. It does not share a wallet, grant signing, approve a request, or expose history.

Opening the page, loading the QR, or cancelling confirmation does **not** consume the invitation. Only **Connect** does. Each extra device needs a **fresh** invitation and gets its own connection ID. The server must name that exact binding on every request; the gateway never falls back to a sibling phone.

See the [private invitation walkthrough](/docs/private-invitation-walkthrough).

## Mixing modes

Home, **Requests**, and **Activity** collect work from every connection. A feed’s **Signals** row and a private server’s **Requests** row are filters over that same list. Removing one connection never touches another.
