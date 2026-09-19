---
title: How the pieces fit
excerpt: SAC, the wallet, the owner sidecar, independent servers, and the shared gateway each have one job.
hidden: false
---

Seeker Agent Connect sits between **servers that propose work** and **the wallet that can sign**. Nothing in the middle holds your keys.

## The parts

```
Agent or backend  -->  your sidecar or an independent server
                              |
                    shared gateway (feeds and private invitations)
                              |
                         SAC on the phone
                              |
                    Seed Vault Wallet  -->  Solana
```

| Part | Owns | Never does |
| --- | --- | --- |
| **Seeker Agent Connect** | Connections, review, owner inputs, advisory rules, delivering a result the owner already recorded | Hold keys, sign, or send funds |
| **Seed Vault Wallet** | Keys, signing, and broadcasting | Know about SAC, policies, or servers |
| **Owner sidecar** (`sidecar/`) | Your private request queue, pairing, optional MCP, optional live updates | Hold keys or decide for you |
| **Independent server** (Go Server SDK) | Invitations, private requests, and the results that request declared | See other devices, wallets, or feed subscribers |
| **Public publisher** (CopyTrading / Prediction templates) | One feed of requests | Learn who subscribed, what they chose, or what they signed |
| **Shared broadcast gateway** (`broadcast/`) | Fan-out for feeds; temporary invitations and device bindings | Create a SAC user, pick a wallet, or approve |

Two directories in the source repository both mention “gateway” and they are different services:

- **`broadcast/`** is the **shared gateway** phones and publishers talk to.
- **`gateway/`** is an optional **reverse proxy in front of one owner’s sidecar**. It is not the feed gateway.

## Who talks to whom

- A **direct** phone calls the sidecar itself, with a credential the sidecar issued at pairing.
- A **feed** phone calls the shared gateway only. It never contacts the publisher. The publisher never learns that phone exists.
- A **private gateway** phone also calls the shared gateway, with a device credential issued after you confirm an invitation. The originating server never receives that credential.

Agents that speak MCP talk to the sidecar’s `/mcp` endpoint. Publisher templates and independent servers do **not** speak MCP. They use the Go Server SDK and, for public feeds, a small JSON HTTP API on the template.

## Approval is always two steps

1. **Review in SAC.** The phone inspects what it can prove — for a transfer or swap, the transaction bytes — applies your [rules](/docs/rules), and waits for a tap.
2. **Confirm in the wallet.** Only then does Seed Vault Wallet open. Declining there is a rejection. Nothing is signed until that second confirmation.

Sandbox feed and gateway-plugin reviews stop after step 1: the phone records **Simulated** and never opens the wallet. See [environments](/docs/environments).

## What connecting does not do

Creating an invitation, opening its hosted page, scanning a QR code, adding a feed, or pairing a sidecar does **not**:

- select or share a wallet
- grant signing authority
- approve a request
- open the wallet
- sign or send anything
- upload Activity history

Those actions only let a server **send you something to review**.
