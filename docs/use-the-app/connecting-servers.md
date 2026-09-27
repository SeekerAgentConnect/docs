---
title: Connect a server or add a feed
description: "Pair with a direct server, or add a Public feed. Both start from Add connection on Home."
slug: /connecting-servers
sidebar_position: 2
---

Every connection starts from **Add connection** on **Home**. There are two kinds.

| | A direct server | A feed |
| --- | --- | --- |
| What you get | A pairing link from your agent, or a code from the server's terminal | A feed link from the publisher |
| What it does | Pairs this phone with that server. Its requests come only to you | Subscribes this phone. Every subscriber sees the same signals |
| Who can read it | This phone only | **Public** feed: anyone with the link. **Restricted** feed: only devices the publisher approved |
| Where your answer goes | Back to the server | Nowhere: it stays on your phone |
| Environment | Always production | Sandbox or production |

## Pair with a direct server {#pair-with-a-server}

**You need:** a pairing link or code from the server's owner, usually your own agent. The two supplied servers are the [general SAC MCP server](/docs/mcp-quickstart) and the [SKR Staking MCP server](/docs/skr-staking-server).

1. Open the link on the phone and tap **Open Seeker Agent Connect**. Or, in **Add connection**, tap **Scan QR code**, or paste the `seekervault://pair?…` line into **Pairing code** and tap **Continue**.
2. Check the server address on **Pair with this server?**
3. Tap **Pair**.

**Expected result:** the server appears under **Paired servers** on Home, and its requests arrive in the **Inbox**.

Opening a link does nothing by itself. A link works once and expires after ten minutes. A server has **one** paired phone: pairing again, from this phone or another, replaces the old pairing. The SKR Staking server is paired separately, with its own link. Details for developers are on [Pair your phone and enable push](/docs/pair-your-phone).

## Add a Public feed {#add-a-public-feed}

**You need:** a feed link from the publisher. It looks like `seekervault://feed?v=1&gateway=…&server=…` and carries no secret.

1. In **Add connection**, paste or scan the link.
2. Read **Add this public feed?**: it shows the gateway and the server ID.
3. Tap **Add feed**.

**Expected result:** **Feed added**, and the feed's signals appear in the Inbox. A feed that the publisher offers in sandbox starts in sandbox; its signals say **Sandbox · no funds will move**.

For a Public feed, the phone never contacts the publisher and creates no credential. The publisher is not told who subscribed or what you decided. The gateway, not the link, decides whether a feed is Public or Restricted.

## Join a Restricted feed {#join-a-restricted-feed}

A link that ends in `&access=restricted` is a subscriber-only feed: adding it starts an access request that the publisher decides. The whole journey, including every access state, is on [Join a Restricted feed](/docs/join-restricted-feed).

## Disconnect or remove {#remove}

Open the connection from **Paired servers** on Home.

- **Disconnect** a server: the server drops this phone and cancels its pending requests. To come back, pair again.
- **Remove** a feed: its signals leave the phone. Other feeds are untouched. For a Restricted feed, the app also forgets this device's access key; adding the feed again starts a new request.

Your **Activity** history stays either way. If a server ends the pairing itself, the app says **Disconnected · pair again to reconnect**.

A connection from a retired, older connection mode is shown as retired and cannot be used. Pair directly with that server instead.

## Next {#next}

- [Review requests and signals](/docs/reviewing-requests)
- [Rules and warnings](/docs/rules)
