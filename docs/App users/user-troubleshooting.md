---
title: Troubleshooting
excerpt: What the most common messages mean, and what to do.
hidden: false
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
| **Approve and sign** did not open the wallet | No wallet is connected, or it is on the wrong network | Connect a wallet on the network the request names |
| **Outcome unknown** | The wallet never reported what it did | Check the wallet's history or an explorer. Never retry from SAC |
| Staking says the cooldown has not finished, or withdraw first | Read from the chain, not from the request | Wait, or withdraw first, then ask again |
| No notifications | Notifications are off, or the server has no push | Enable them in Android settings. Refresh still works |
