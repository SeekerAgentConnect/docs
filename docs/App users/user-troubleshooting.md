---
title: Troubleshooting for app users
excerpt: Reachability, pairing, invitations, wallet, transfers, and notifications.
hidden: false
---

| Symptom | What to try |
| --- | --- |
| **Couldn't reach the server** | Confirm the sidecar or gateway is running. On USB debug, run `adb reverse` again after reconnecting the cable |
| Certificate / HTTPS errors | The certificate must be trusted and match the host name. Self-signed certificates fail |
| **This build allows plain HTTP only to 127.0.0.1** | Release builds need HTTPS. Debug builds allow plain HTTP only to loopback |
| Pairing code refused | It was used, expired, or replaced. Generate a new code |
| Invitation expired or already used | Ask the server for a **new** invitation. Do not recycle the old link |
| Feed already present | Open the existing connection; nothing new was stored |
| Live status stuck on connecting | **Refresh** still works. The update endpoint or proxy may be wrong |
| Background updates late | Open the app or tap **Refresh**. After **Force stop**, reopen the app |
| No notifications | Enable app notifications and the **Requests waiting for review** channel. Firebase-off builds never post |
| **Approve and sign** did not open a wallet | No wallet connected, the wallet changed mid-review, or the wallet does not serve that network |
| Stale transfer preparation | Review the new version on screen, then approve again. An old approval is never reused |
| Transfer failed (lamports) | Not enough SOL for amount, fee, and rent for a new token account. The agent must ask again |
| Outcome unknown | Check Seed Vault Wallet history and an explorer. **Never** retry the same transfer from SAC |
| Agent still PROCESSING after you signed | **Refresh** or **Send again**. The signature may still be queued on the phone |
| Sandbox **Simulate** did not open the wallet | Expected. Sandbox never signs or sends |
| Jupiter refused a devnet wallet | Expected. Swap and prediction plugins are mainnet or nothing, including in sandbox |

Camera access denied: tap **Open settings** and allow the camera, or paste the code instead.

For operator and developer failures, see [operator troubleshooting](/docs/operator-troubleshooting) and the walkthroughs under [Server developers](/docs/overview).
