---
title: Troubleshooting
description: "What the most common messages mean, and what to do."
slug: /user-troubleshooting
sidebar_position: 5
---

| The app says | What it means | What to do |
| --- | --- | --- |
| **Couldn't reach the server** | Your server is not running or not reachable from the phone | Start it, or check the address. Over USB, run `adb reverse` again |
| **No live updates** | The server answers, but does not stream. Not an outage | Refresh by hand. The server's operator can turn live updates on |
| **Feed offline** | The gateway answers, but the publisher's own server stopped | What was published is still here. Nothing new arrives until it is back |
| **Disconnected · pair again to reconnect** | The server ended the pairing | Get a new link and pair again, then remove the old connection |
| The pairing link is damaged or incomplete | The link was shortened or changed before you opened it | Open the whole link, or paste the whole `seekervault://pair` line |
| The server refused the code | The link was already used, expired, or replaced | Ask for a new link |
| The certificate isn't trusted | The server has no valid HTTPS certificate | The operator needs a real certificate. Self-signed ones do not work |
| Nothing on this phone serves this signal | The feed asks for something this app build or this wallet cannot do | Update the app, or connect a wallet on the right network. Nothing is picked for you |
| Connect a wallet first. A restricted feed grants access to a wallet, not to a phone. | You added a Restricted feed with no wallet connected | Connect a wallet, open the feed, and tap **Send access request** |
| The wallet didn't sign, so nothing was sent. | You closed the wallet, or its answer did not match your address | Open the feed and tap **Send access request** to try again |
| The publisher asked this phone to sign something it didn't recognise, so nothing was signed. | The publisher's challenge did not match what SAC expects | Nothing was signed. Tell the publisher; do not look for a way around it |
| Couldn't reach the publisher. Nothing changed — try again. | The Restricted feed's access address did not answer | Try again later. If it persists, the publisher's server is down |
| The publisher refused the request. | The publisher's server turned the request down, for example because the phone's clock is far off or the invitation was used or expired | Check the phone's date and time, then tap **Refresh**. If it persists, ask the publisher |
| Waiting for the publisher to approve this device. | A Restricted feed; your request is with the publisher | Wait. Open the feed or tap **Refresh** to check. See [where your access stands](/docs/connecting-servers#where-your-access-stands) |
| The publisher didn't approve this device. | Rejected | Tap **Send access request** to ask again, or ask the publisher |
| The publisher revoked this device's access to the feed. | Your access ended | Signals you already have stay. Ask the publisher; to ask again, remove the feed and add it again |
| This device's access to the feed has run out. | The access was not renewed in time | Tap **Refresh**. If it stays, ask the publisher |
| This feed reference asks for an access policy this version of the app doesn't know | The link names an access type this build does not support | Update the app, or ask the publisher for a current link |
| **Approve and sign** did not open the wallet | No wallet is connected, or it is on the wrong network | Connect a wallet on the network the request names |
| **Outcome unknown** | The wallet never reported what it did | Check the wallet's history or an explorer. Never retry from SAC |
| Staking says the cooldown has not finished, or withdraw first | Read from the chain, not from the request | Wait, or withdraw first, then ask again |
| No notifications | Notifications are off, or the server has no push | Enable them in Android settings. Refresh still works |
