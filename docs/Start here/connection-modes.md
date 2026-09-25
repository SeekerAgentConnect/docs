---
title: Connection modes
excerpt: direct and gateway_feed are two different ways a server reaches the phone. The third mode, gateway_private, was retired.
hidden: false
---

Every connection has a **mode**. It comes from the server's validated [manifest](/docs/manifest-contract), not from how you typed the code. A connection cannot change mode later.

## Comparison

| | `direct` | `gateway_feed` |
| --- | --- | --- |
| Whose server | One you pair with: the MCP server, the SKR staking server, or a server built on the Direct Server SDK | A public publisher |
| How you add it | Pairing code, as a QR, a typed `seekervault://pair?…` line, the deep link, or the server's `https://…/pair#…` page | Feed reference `seekervault://feed?v=1&gateway=…&server=…` |
| Credential on the phone | Issued by the server at pairing | **None** |
| Who sees a request | Only the paired phone | Every subscriber of that channel |
| Who the phone calls | The server | The shared feed gateway |
| What the server learns | That one phone paired, and the results a request declared | Nothing about any phone |
| Where a result goes | Back to the server | Nowhere — it stays on the device |
| Environment | Always production | Sandbox or production, whichever the publisher serves and you keep |

You add both from **Home → Add connection**. The screen says: *Scan or enter a direct pairing code or a public feed reference.*

## `direct`

Use this when a server should send private requests to **this phone** and read back what you decided.

1. On the server, create a one-use pairing code: `pnpm pair` on the MCP server (or `seeker-agent-connect-mcp pair` from the packaged install), `seeker-skr-staking-mcp pair` on the staking server, or have a connected agent call `vault_create_pairing_link` or `skr_create_pairing_link`. Each gives the same code as a QR, as a `seekervault://pair?…` line, and as an HTTPS pairing page `https://<origin>/pair#<fragment>` served by that server.
2. In SAC, open **Add connection** and scan the QR code, paste the line and tap **Continue**, or open the link or the page on the phone. All of them land on **Pair with this server?**, which shows the address the phone is about to contact and the server's ID.
3. Tap **Pair**.

Opening the link or the page never pairs by itself. The page keeps the token in the URL fragment, sends it nowhere, and refuses a fragment that was shortened or damaged. The code works once, expires (ten minutes by default on the MCP server), and a newer code replaces it.

A direct server accepts **one paired phone at a time**. Pairing again revokes the previous connection, on this phone or another one. Results return to that server so an agent can poll them. Direct connections are always **production**: there is no sandbox simulation for an agent waiting on a signature.

See the [direct MCP server walkthrough](/docs/direct-sidecar-walkthrough) and, for your own server, the [direct server walkthrough](/docs/direct-server-walkthrough).

## `gateway_feed`

Use this when a developer publishes the same request to everyone who added the feed.

The reference carries **no secret**:

```text
seekervault://feed?v=1&gateway=https://feeds.example.com&server=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
```

SAC shows **Add this public feed?** and explains that the phone creates no credential, never contacts the publisher, and reads the feed through the gateway shown. Tap **Add feed**.

There is still no Android intent filter for `seekervault://feed`; only `seekervault://pair` has one. A feed link in a browser does not open the app. Scan or paste the reference while **Add connection** is open.

Feed decisions are **device-local**. Neither the publisher nor the gateway is told the amount you chose, whether you approved, or the signature. A feed starts in sandbox whenever its publisher serves one, and only you move it to production, from the connection's own screen. See the [public feed walkthrough](/docs/public-feed-walkthrough).

## Retired: `gateway_private`

Earlier releases had a third mode, in which an independent server reached one phone through the gateway after you confirmed an invitation. It was retired. The manifest keeps its value reserved so it can never return under another meaning, and the gateway no longer stores invitations, device bindings, or private requests.

A connection this phone made that way is now an inert **retired** record: its credential was deleted, its history in Activity is kept, and the app says it *cannot sync, open requests, or send results*. Pasting an old invitation link into **Add connection** gets the same answer: *Gateway invitations were retired. Ask the server operator for a fresh direct pairing code.* To work with that server again, its operator runs a direct server and you pair with it as above. Nothing is converted automatically.

## Mixing modes

Home, **Inbox**, and **Activity** collect work from every connection. A feed's **Signals** row is a filter over that same list. Removing one connection never touches another, and removing a feed takes its signals out of Home and the Inbox at once.
