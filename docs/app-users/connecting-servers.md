---
title: Connect servers and feeds
description: "A server you pair with, or a feed you subscribe to, Public or Restricted. All start from Add connection."
slug: /connecting-servers
sidebar_position: 2
---

Tap **Add connection** on Home. There are two kinds of connection.

| | Your own server | A feed |
| --- | --- | --- |
| What you get | A link from your agent, or a code from the server's terminal | A feed link from the publisher |
| What it does | Pairs this phone with that server. Its requests come only to you | Subscribes this phone. Every subscriber sees the same signals |
| Who can read it | This phone only | **Public** feed: anyone with the link. **Restricted** feed: only devices the publisher approved |
| Environment | Always production | Sandbox or production |

## Pair with your own server

Your agent gives you the link. It calls `vault_create_pairing_link` on your MCP server and hands you an `https://…/pair` link. If you are at the server's terminal instead, `pnpm pair` prints the same thing as a QR code.

1. Open the link on the phone, or scan the QR code, or paste the `seekervault://pair` line into **Add connection**.
2. Check the server address on **Pair with this server?**
3. Tap **Pair**.

Opening the link does nothing by itself. The link works once and expires after ten minutes. A server has **one** paired phone: pairing again, from this phone or another, replaces the old pairing.

The SKR staking server is a second server of the same kind, with its own link.

## Add a feed

The publisher shares a link that looks like `seekervault://feed?…`. It carries no secret. A feed is either **Public** or **Restricted**; the gateway's description of the feed decides which, not the link.

### A Public feed

1. Paste or scan the link in **Add connection**.
2. Read **Add this public feed?** and tap **Add feed**.

For a Public feed, the phone never contacts the publisher and creates no credential. The publisher is never told who subscribed or what you decided. A feed starts in sandbox when the publisher offers it; you can switch it to production in the feed's own screen.

### Join a Restricted feed

A Restricted feed is subscriber-only: a paid community, an invite-only group, a service your subscription unlocks. The publisher decides which wallets may read it. Its link ends in `&access=restricted`.

Connect your wallet first ([Connect your wallet](/docs/wallet-setup)). Access is granted to a wallet, not to a phone.

1. **Add the link.** Paste or scan it in **Add connection**. The confirmation says *This feed is restricted*, and that the publisher will ask you to prove you control your wallet. (In the current app the screen's title still reads **Add this public feed?**; the text below it is what tells you the feed is restricted.) Tap **Add feed**.
2. **Sign one message.** Seed Vault Wallet opens once, with a message that starts *Seeker Agent Connect feed access v1* and names the publisher's address, the feed, your wallet and this device. It says **This is not a transaction. Signing it moves no funds and approves nothing.** Sign it. SAC checks the text before it opens the wallet, and sends the proof only to the address the gateway lists for this feed.
3. **Wait for the publisher's decision.** The feed says *Waiting for the publisher to approve this device.* That is normal, not a problem. Some publishers approve by hand; others approve automatically, for example when your wallet holds their membership.
4. **Connect.** While the app is open, it checks for the decision every few seconds, and again when you open the feed or tap **Refresh** on it. It does not check while the app is closed. Once you are approved, the check picks up your invitation and connects this device by itself; you do not need a link or code from the publisher. Signals start to arrive.

You sign in the wallet once. Checking your status, connecting, and reconnecting later use a key the app keeps for this feed on this phone, never your wallet. That key cannot move funds or sign transactions.

**Your invitation and your access are different clocks.** The invitation you receive on approval is single use and lasts a few minutes (five by default). Once your device has redeemed it, your access keeps going: the publisher renews it in the background for as long as you stay approved. If the invitation expired before your phone used it, ask the publisher to reissue it, then open the feed.

**What the publisher sees.** Your wallet address, a fingerprint of this device's key, and your phone's name. Never your amounts, decisions, signatures on transactions, or results: those stay on the phone, as with any feed. The gateway sees none of your wallet details.

#### Where your access stands

| The feed says | What it means | What to do |
| --- | --- | --- |
| Not connected. This phone hasn't sent an access request… | You added the feed but did not sign, for example with no wallet connected, or you switched to a wallet that has not asked yet | Connect a wallet, open the feed, and tap **Send access request** |
| Waiting for the publisher to approve this device. | Your request is with the publisher | Wait with the app open, or open the feed or tap **Refresh** later |
| Approved. Finishing the connection… | Approved; the publisher is still setting up your access at the gateway | Wait a moment, then open the feed or tap **Refresh** |
| The publisher didn't approve this device. Ask again to make a new request. | Rejected | Tap **Send access request** to ask again. Your wallet signs once more |
| The publisher revoked this device's access to the feed. Signals already on this phone stay. | The publisher ended your access, for example when a membership ended | Ask the publisher. To ask again, remove the feed and add it again |
| This device's access to the feed has run out. Check again to renew it. | The publisher's renewal did not reach the gateway in time | Tap **Refresh**. If it stays, ask the publisher |

Signals you already received stay on the phone after a revocation. Nothing is erased remotely.

#### Another phone, or another wallet

Each phone asks on its own. Adding the same feed on a second phone sends a second request, signed by your wallet on that phone, and the publisher approves it separately. Access belongs to the wallet you proved it with; switching wallets does not carry it over. To use another wallet with this feed, connect that wallet, open the feed, and tap **Send access request**. That wallet signs a new request, and the old access on this phone is dropped. A phone restored from a backup counts as a new device and has to ask again.

## Remove

Open the connection from **Paired servers**.

- **Disconnect** a server: the server drops this phone and cancels its pending requests. To come back, pair again.
- **Remove** a feed: its signals leave the phone. Other feeds are untouched. For a Restricted feed, the app also forgets this device's key and access; adding the feed again starts a new request.

Your **Activity** history stays either way. If a server ends the pairing itself, the app says **Disconnected · pair again to reconnect**.

A connection from a retired, older connection mode is shown as retired and cannot be used. Pair directly with that server instead.
