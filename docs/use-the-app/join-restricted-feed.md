---
title: Join a Restricted feed
description: "Add the link, prove which wallet you control with one message, wait for the publisher's decision, then connect. What each access state means and what you can do."
slug: /join-restricted-feed
sidebar_position: 3
---

A Restricted feed is subscriber-only: a paid community, an invite-only group, a service your subscription unlocks. The publisher decides which wallets may read it, and the SAC gateway delivers only to the devices they approved. Its link ends in `&access=restricted`.

## Before you start {#before-you-start}

- **Save the wallet you will use** in SAC ([Connect your wallets](/docs/wallet-setup)). Access is granted to a wallet, not to a phone, and each feed uses the wallet you choose for it.
- **Get the feed link** from the publisher. Holding the link grants nothing by itself.
- If the publisher sells membership, make sure they have the wallet address you will use. Checkout and billing happen in their system, not in SAC.

## Step 1: Add the link {#add-the-link}

1. Tap **Add connection** on Home and paste or scan the link.
2. The confirmation shows the gateway and the server ID and says *This feed is restricted*: after it is added, the publisher asks you to prove you control your wallet, by signing a message, not a transaction.
3. Tap **Add feed**.
4. The feed's page opens with the wallet picker. Choose the wallet this feed should use and tap **Use this wallet** ([Choose the connection's wallet](/docs/connecting-servers#choose-a-wallet)). The picker shows only wallets on the networks the feed declares. A feed that declares none shows all of them: the access proof does not depend on a network, but nothing is signed for that feed until it declares one.

:::note
In the current app the confirmation's title still reads **Add this public feed?** The text below the title is what tells you the feed is restricted.
:::

## Step 2: Prove your wallet {#prove-your-wallet}

As soon as the feed has a wallet, SAC asks for access with it. Seed Vault Wallet (or the wallet app that holds the chosen account) opens once with a message that starts *Seeker Agent Connect feed access v1* and names the publisher's authentication address, the feed, your wallet and this device. It says **This is not a transaction. Signing it moves no funds and approves nothing.** Sign it.

SAC checks the text before it opens the wallet, and sends the proof only to the authentication address the gateway lists for this feed, never to an address taken from the link.

If the wallet did not open, open the feed and tap **Send access request**.

## Step 3: Wait for the publisher's decision {#wait-for-approval}

The feed says **Waiting for the publisher to approve this device.** That is normal. Some publishers approve by hand; others approve automatically, for example when your wallet holds their membership.

While SAC is open it checks for the decision every few seconds, and again when you open the feed or tap **Refresh**. It does not check while the app is closed.

## Step 4: Connect {#connect}

Once you are approved, the next check picks up your invitation and connects this device by itself. You do not need a link or code from the publisher. Home shows **Approved · connecting**, then the feed's signals start to arrive.

**Expected result:** the feed's signals appear in the Inbox like any other feed's. Everything after this uses a key SAC keeps for this feed on this phone, never your wallet. That key cannot move funds or sign transactions.

## Where your access stands {#access-states}

| The feed says | Home says | What it means | What you can do |
| --- | --- | --- | --- |
| Not connected. This phone hasn't sent an access request… | Not paired · request access | You added the feed but did not sign, for example because it has no wallet yet, or you changed its wallet to another address | Choose the feed's wallet if it has none, then open the feed and tap **Send access request** |
| Waiting for the publisher to approve this device. | Waiting for approval | Your request is with the publisher | Wait with the app open, or open the feed or tap **Refresh** later |
| Approved. Finishing the connection… | Approved · connecting | Approved; the publisher is still setting up your access at the gateway | Wait a moment, then open the feed or tap **Refresh** |
| The publisher didn't approve this device. Ask again to make a new request. | Not approved | **Rejected** | Tap **Send access request** to ask again. Your wallet signs once more |
| The publisher revoked this device's access to the feed. Signals already on this phone stay. | Access revoked | **Revoked**: the publisher ended your access, for example when a membership ended | Ask the publisher. To ask again later, remove the feed and add it again |
| This device's access to the feed has run out. Check again to renew it. | Access expired | **Expired**: the publisher's renewal did not reach the gateway in time | Tap **Refresh**. If it stays, ask the publisher |

**Your invitation and your access are different clocks.** The invitation the publisher issues on approval is single use and short-lived (five minutes by default). Once your device has redeemed it, your access continues: the publisher renews it in the background for as long as you stay approved. If the invitation expired before your phone used it, ask the publisher to reissue it, then open the feed.

**Revocation is not deletion.** A revocation stops future signals and reconnections. Signals you already received stay on the phone; nothing is erased remotely. Removing the feed yourself deletes them.

## Another phone, or another wallet {#devices-and-wallets}

- **Each phone asks on its own.** Adding the same feed on a second phone sends a second request, signed by your wallet on that phone, and the publisher approves it separately. A phone restored from a backup counts as a new device and has to ask again.
- **Access belongs to the address you proved, for this feed.** Each Restricted feed uses its own wallet, so two feeds approved for two different addresses stay readable at the same time. Approving, rejecting or revoking one does not touch the other.
- **Changing the feed's wallet to another address** does not carry the access over. Tap the feed's **Wallet** row, choose the other wallet, then open the feed and tap **Send access request**. That wallet signs a new request, and the old access on this phone is dropped.
- **Changing it to the same address on another network** keeps the access. The proof is a signature over your address and names no network, so it is still the same address the publisher approved.
- **Your wallet app's own authorization is not feed access.** Reconnecting or reauthorizing a wallet in the wallet app neither grants nor ends access to a feed; only the publisher decides that.
- **Removing the wallet** a Restricted feed uses stops that feed's access on this phone until you choose a wallet for it and, if the address changed, ask again.

## What the publisher and the gateway see {#privacy}

The publisher sees your wallet address, a fingerprint of this device's access key, and your phone's name. Never your amounts, decisions, transaction signatures or results: those stay on the phone, as with any feed. The gateway sees none of your wallet details, only opaque references the publisher gives it.

## Troubleshooting {#troubleshooting}

| The app says | What to do |
| --- | --- |
| Choose a wallet for this feed first. A restricted feed grants access to a wallet, not to a phone. | Tap the feed's **Wallet** row and choose one. SAC then asks for access with it; if it does not, tap **Send access request** |
| The wallet didn't sign, so nothing was sent. | Open the feed and tap **Send access request** to try again |
| The publisher asked this phone to sign something it didn't recognise, so nothing was signed. | Nothing was signed. Tell the publisher; do not look for a way around it |
| Couldn't reach the publisher. Nothing changed — try again. | The publisher's authentication address did not answer. Try again later |
| The publisher refused the request. | Check the phone's date and time, then tap **Refresh**. If it persists, ask the publisher |
| This feed reference asks for an access policy this version of the app doesn't know | Update the app, or ask the publisher for a current link |

## Next {#next}

- [Review requests and signals](/docs/reviewing-requests)
- Publishers: [Run a Restricted feed](/docs/restricted-feeds)
