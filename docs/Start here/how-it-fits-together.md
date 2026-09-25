---
title: How the pieces fit
excerpt: SAC, the wallet, a direct server, a public publisher, the shared feed gateway, and the external providers each have one job.
hidden: false
---

Seeker Agent Connect sits between **servers that propose work** and **the wallet that can sign**. Nothing in the middle holds your keys.

## The parts

```
Agent --MCP--> Direct server <-- pairing, requests, results --> SAC on the phone
                   |                                                  ^    |
                   +-- optional content-free wake-up via the relay ---+    |
                                                                           |
Publisher backend --publish once--> Shared feed gateway --snapshots------> (same phone)
                                                                           |
                                                                           v
                                                                 Seed Vault Wallet --> Solana
```

| Part | Owns | Never does |
| --- | --- | --- |
| **Seeker Agent Connect** | Connections, review, owner inputs, advisory rules, delivering a result the owner already recorded | Hold keys, sign, or send funds |
| **Seed Vault Wallet** | Keys, signing, and broadcasting | Know about SAC, rules, or servers |
| **Direct server** — the MCP server, the SKR staking server, or any server built on the Direct Server SDK (`server-sdk/`) | Pairing, its private request queue, the results a request declared, optional live updates | Hold keys or decide for you |
| **Public publisher** — the CopyTrading and Prediction demos, or your own backend publishing over the gateway's API | One feed of requests | Learn who subscribed, what they chose, or what they signed |
| **Shared feed gateway** (`feed-gateway/`) | Fan-out for feeds, publisher registration, an optional push relay for direct servers | Create a SAC user, pick a wallet, approve, or learn a subscriber's decision |
| **External providers** — Jupiter, Solana RPC, Firebase | Execution data, chain reads, best-effort wake-ups | Approve or sign |

## Who talks to whom

- A **direct** phone calls the server itself, with a credential the server issued at pairing. Requests and results travel only between those two.
- A **feed** phone calls the shared gateway only. It never contacts the publisher. The publisher never learns that phone exists, and the gateway never learns what the phone decided.
- A direct server hosted without its own Firebase project can ask the gateway's **push relay** to wake a backgrounded phone. What is relayed is a fixed, content-free `request_invalidation`: the phone then reads the server itself. The relay carries no request, no result, and no credential.

Agents that speak MCP talk to a direct server's `/mcp` endpoint. Publishers do **not** speak MCP. They publish manifests and requests as plain Connect JSON over HTTPS to the gateway's publisher API, with a credential the gateway operator issued.

## Approval is always two steps

1. **Review in SAC.** The phone inspects what it can prove — for a transfer, swap, or staking operation, the transaction bytes — applies your [rules](/docs/rules), and waits for a tap.
2. **Confirm in the wallet.** Only then does Seed Vault Wallet open. Declining there is a rejection. Nothing is signed until that second confirmation.

Sandbox feed reviews stop after step 1: the phone records **Simulated** and never opens the wallet. See [environments](/docs/environments).

## What connecting does not do

Scanning a pairing code, opening a `seekervault://pair` link or a server's pairing page, or adding a feed does **not**:

- select or share a wallet
- grant signing authority
- approve a request
- open the wallet
- sign or send anything
- upload Activity history

Those actions only let a server **send you something to review**.
