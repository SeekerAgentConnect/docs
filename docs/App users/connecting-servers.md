---
title: Connect servers and feeds
excerpt: Pair a direct server with its code, link, or pairing page, or add a public feed reference, from the Add connection screen.
hidden: false
---

There are two ways to connect, and both start from Home: tap **Add connection**. It is a full screen, with the tab bar still visible and no tab selected. Back, or a successful pairing, returns you to Home.

| Way | What you hold | What it creates |
| --- | --- | --- |
| **Direct server** (`direct`) | A one-use pairing code: a `seekervault://pair?…` link, its QR code, or the HTTPS pairing page the server serves | A private, credentialed connection. Always production |
| **Public feed** (`gateway_feed`) | A `seekervault://feed?…` reference. It carries no secret | A read-only subscription through the feed gateway. Sandbox or production, as the publisher serves it |

There are no invitations any more. If you paste an old `seekervault://invite` link, the screen says: *Gateway invitations were retired. Ask the server operator for a fresh direct pairing code, then scan or paste it here.* See [connection modes](/docs/connection-modes).

## The screen

The instructions read: *On the computer that runs the sidecar, run `pnpm pair`. Scan the QR code it shows, or type the code printed under it.* Tap **Scan QR code**, or paste into the **Pairing code** field and tap **Continue**. The field also accepts a feed reference. Under it: *Pair only with a server you run. Whoever controls it can send this phone requests to review.*

If camera access is off, the screen says so and offers **Open settings**; pasting still works.

A pairing code is tried first. Something that is recognizably a damaged pairing code is reported as a pairing problem, never treated as a feed.

## Pair a direct server

The server's operator, or an agent connected to it, creates the code (`pnpm pair`, `vault_create_pairing_link`, `skr_create_pairing_link`). It comes in three forms of the same thing:

- a `seekervault://pair?…` deep link, which opens SAC on Android;
- its QR code;
- an HTTPS page, `https://direct.example.com/pair#…`, served by the server itself, with an **Open Seeker Agent Connect** button, the QR code, and a copy fallback. The token is in the part after `#`, which never reaches the server.

Opening the link or the page pairs nothing. The code works once, for about ten minutes, and a newer code replaces it. A shortened or altered fragment is refused as damaged: open the whole `https_url`, or paste the whole `seekervault://pair` line.

1. Confirm **Pair with this server?** The sheet shows **Server** (the address) and **Server ID**. Over `adb reverse` it adds *This is a development address.* If you already have this server: *You already have a connection to this server: … Pairing again makes a new connection, and the server revokes the old one.*
2. Tap **Pair**. The app says **Paired with …** and returns to Home, where the server appears under **Paired servers**.

One paired phone per direct server. Pairing again, from this phone or another, revokes the previous connection.

| If the app says | Why |
| --- | --- |
| The server refused the code: it was already used, it expired, or a newer code replaced it | Run the pairing command again and use the new code |
| The server says this code was issued for a different address | The phone reached the server at another address than the code's |
| The server's certificate isn't trusted, or it's for another host name | TLS failed. Self-signed certificates do not work |
| This build allows plain HTTP only to 127.0.0.1 | Release builds need HTTPS |
| Couldn't reach … | The server is not running, or not reachable from this phone. **Try again** |

## Add a public feed

Paste a reference such as:

```text
seekervault://feed?v=1&gateway=https://feeds.example.com&server=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
```

1. Confirm **Add this public feed?** The sheet shows **Gateway** and **Server ID**, and says: *This is a public broadcast feed. The phone creates no credential, never contacts the publisher, and reads its manifest and proposals through the gateway shown above.*
2. Tap **Add feed**, or **Cancel** to write nothing.

**Feed added** means the feed is ready; **Open feed** shows its display name, **Sandbox** or **Production**, and required client plugins. **Feed already added** means nothing new was stored. The first snapshot, the live stream, and the optional push topic start without restarting the app.

A `seekervault://feed` URL in a browser does not open SAC. There is no feed deep link.

In the feed's sheet, **What this feed does when you approve** is **Sandbox** or **Production**. Where the publisher serves both, you can switch; switching drops anything already prepared. See [environments](/docs/environments).

## The colour marker

Every connection gets one of six colours — Tangerine, Sky, Violet, Teal, Rose, Sand — chosen by the phone when it is paired or added. It marks the server's avatar under **Paired servers** and the server pill on each **Waiting for you** card. The server never sends a colour and never learns yours.

Change it in the connection sheet's **Colour** card: the line reads *Name · marks this server everywhere*, and a swatch another connection uses is labelled *Name · used by that server*. It can still be chosen. Removing a connection frees its colour.

## The connection sheet

Tap a row under **Paired servers**. The sheet shows the status line, **Server**, **Server ID**, **Paired**, and **This phone's name there**; a **Rules** card (*Uses global rules*, or how many overrides); **Rename** (local, up to 64 characters; the server never sees it); **Its inbox**; and **Disconnect** or **Remove**. Tap the status card to refresh.

## Status lines

On Home, each row has one line:

| Row says | Meaning |
| --- | --- |
| **Connected · N pending** | The last check reached the server, or the feed's publisher is checking in |
| **No live updates · N pending** | A direct server that answers but offers no update stream. Refresh works |
| **Upgrade for live updates · N pending** / **Live updates unavailable · N pending** | Its update listener is too old, or advertised an address this build cannot use |
| **Feed offline · N pending** | The gateway answers, but the publisher behind the feed has stopped checking in. What it published is still readable |
| **Couldn't reach the server** | A real network failure. The row offers **Retry** |
| **Reconnecting · N pending** | The feed stream dropped and is coming back |
| **Disconnected · pair again to reconnect** | The server ended the pairing |

The sheet says the same in a sentence, plus **Connecting for live updates…**, **Live updates connected.**, **Live updates interrupted. Reconnecting…**, **Live updates paused while the app is in the background.**, **Not checked yet.**, and **Last sync found N pending requests.** **Checked** (when) is shown separately: an older successful check does not mean a stream is live.

## Retired private connections

A connection made through the retired private gateway mode is still listed, but inert. Its sheet says: *This gateway connection was retired. It cannot sync, open requests, or send results. Ask the operator for a fresh direct pairing code.* Its address is labelled **Former gateway**, the Rules card is gone, and the buttons are **Pair directly** and **Remove**. Its Activity is kept. The way back is a fresh direct pairing.
