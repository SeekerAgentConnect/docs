---
title: Troubleshooting for app users
excerpt: Reachability, pairing links, feeds, revoked pairings, wallet, transfers, staking, and notifications.
hidden: false
---

## Connections

| Symptom | What to try |
| --- | --- |
| **Couldn't reach the server** on a direct row | A real network failure: the server is not running or not reachable from the phone. Tap **Retry**. Over USB, run `adb reverse` again after reconnecting the cable |
| **No live updates · N pending** | Not an outage. The server answers but offers no update stream. **Refresh** works; new requests appear when you refresh. Its operator can turn live updates on. Do not pair again |
| **Upgrade for live updates** / **Live updates unavailable** | The server's update listener is too old, or advertises an address this build cannot use. Refresh works meanwhile; the operator upgrades or fixes the configuration |
| **Feed offline · N pending** | The gateway answers, but the publisher's own server has stopped checking in. What it already published is still here and reviewable; nothing new arrives until it is back. Refreshing the feed asks again at once |
| Direct stream stuck after a network interruption | Wait: it recovers on its own, with retries capped at 30 seconds plus, possibly, one 30-second handshake. What the server stored meanwhile arrives with the next snapshot. Re-pairing is not needed and would cancel the server's pending requests |
| **Disconnected · pair again to reconnect** | The server revoked this phone: `pair revoke`, another phone paired, or a reset database. Pair again with a fresh code, then **Remove** the old connection. See [Disconnecting](/docs/disconnecting) |
| **The server's certificate isn't trusted…** | The certificate must be trusted and match the host name. Self-signed certificates fail |
| **This build allows plain HTTP only to 127.0.0.1** | Release builds need HTTPS. Debug builds allow plain HTTP only to loopback over `adb reverse` |
| **This app doesn't have a client plugin this server needs…**, …not at a version it works with, …a newer version of the protocol, …doesn't serve the environment, or …refused this server's own description | Nothing from that server can be approved. Update the app, or ask the operator to fix the manifest |

## Pairing

| Symptom | What to try |
| --- | --- |
| The pairing page says the link is damaged or incomplete | The part after `#` was shortened or changed before it was opened. A link with `...` in it will not work. Open the whole `https_url`, or paste the whole `seekervault://pair` line under **Add connection** |
| **The pairing token in the code is incomplete or damaged. Copy the whole line again.** | Same cause, caught by the app. Copy the entire line, or scan the QR code |
| **The server refused the code…** | It was used, expired, or replaced. Generate a new code |
| **The server says this code was issued for a different address…** | Scan again, or have the operator check the server's public URL |
| **That isn't a pairing code…** | Paste the whole line that starts with `seekervault://pair` |
| You pasted an old invitation link | *Gateway invitations were retired.* Ask the server operator for a fresh direct pairing code |
| Camera access is off | Tap **Open settings** and allow the camera, or paste the code instead |

## Feeds

| Symptom | What to try |
| --- | --- |
| **Feed already added** | Open the existing connection; nothing new was stored |
| **The gateway returned a publisher description this phone refused** | The publisher's manifest is not one this build accepts. Nothing was saved; ask the publisher |
| **This app build has no feed gateway client** | This build cannot add feeds at all |
| The review says nothing on this phone serves the signal | One of these: this build lacks the execution provider the signal names; it has it at a version it cannot call; the provider does not do that action; the signal's action version is unknown; the provider does not serve your wallet's network; it does not serve this connection's environment; it does not take the asset named; or the signal names a capability published for something else. Update the app, connect a wallet on the right network, switch the feed's environment, or go back to the publisher. Nothing else is picked for you |
| Sandbox **Simulate** did not open the wallet | Expected. Sandbox never signs or sends |
| Jupiter refused a devnet wallet | Expected. Swap and prediction are mainnet or nothing, including in sandbox |

## Wallet, transfers, and staking

| Symptom | What to try |
| --- | --- |
| **Connect a wallet first**, or **Approve and sign** did not open a wallet | No wallet connected, the wallet changed mid-review, the request names another wallet, or the wallet does not serve that network |
| **The server has a newer transaction for this request…** | Review the version now on screen, then approve again. An old approval is never reused |
| Transfer failed and the reason mentions lamports | Not enough SOL for amount, fee, and rent for a new token account. The agent must ask again |
| **This phone never learned what the wallet did** / Outcome unknown | Check Seed Vault Wallet's history and an explorer. **Never** retry the same transfer from SAC |
| Agent still PROCESSING after you signed | **Refresh** or **Send again**. The signature may still be queued on the phone |
| **This phone could not read your staking position…** | The app has no Solana endpoint to read from. Give it one and prepare again |
| **The cooldown has not finished yet…** / **A finished cooldown has to be withdrawn before any more is unstaked.** | Read from the chain, not from the request. Wait it out, or withdraw first, then have the agent ask again |
| A staking request on a devnet wallet | Staking is mainnet only. Connect a mainnet wallet |

## Notifications

| Symptom | What to try |
| --- | --- |
| No notifications | Enable app notifications and the **Requests waiting for review** or **Proposals waiting for review** channel. A build without Firebase, or a server without push, never posts. Streams and **Refresh** still work |
| A notification opens something that is no longer waiting | Expected. The app fetched current state first: *Nothing was approved or signed* |
| Background updates late | Open the app or tap **Refresh**. After **Force stop**, reopen the app |

For operator and developer failures, see [operator troubleshooting](/docs/operator-troubleshooting) and [Server developers](/docs/overview).
