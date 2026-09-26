---
title: How it works
excerpt: >-
  One diagram, the two connection modes, Public and Restricted feeds, and the
  registration flow that a feed server and an MCP server share.
hidden: false
---
![](https://files.readme.io/cc6239d02f5d013d27a09e7378b91b7ae29f5e01aae5c0de731eaded9b891e9a-SAC_Architecture_Diagram-selection_1.png)

<br />

| Part | Job | Never does |
| --- | --- | --- |
| **SAC** on the phone | Holds your connections, shows each request, records your decision. For a Restricted feed, keeps a per-feed device key that proves this phone was approved | Hold wallet keys or sign transactions |
| **Seed Vault Wallet** | Signs and sends what you approved; for a Restricted feed, also signs one access message that moves no funds | Know about servers |
| **Your MCP server** | Takes your agent's requests, hands them to your phone, returns the result to the agent | Hold keys or decide for you |
| **Your feed server** | Publishes signals once, to the gateway. For a Restricted feed, also decides which wallets and devices may read | Learn what a subscriber decided, their amount, or their result |
| **The gateway** | Stores each publication and delivers it to every subscriber the feed's policy admits, streams updates, sends push wake-ups, and wakes phones for MCP servers that ask it to | Hold keys, approve, see a decision, or learn a subscriber's wallet |

## Two connection modes

|                         | Direct                                                              | Feed                             |
| ----------------------- | ------------------------------------------------------------------- | -------------------------------- |
| Whose server            | Your own MCP server, or the SKR staking server                      | A publisher's feed server        |
| How the phone connects  | A one-use pairing link from your agent, or a code from the terminal | A feed link the publisher shares |
| Who sees a request      | Only the one paired phone                                           | Public feed: everyone who added it. Restricted feed: only approved devices |
| Where the decision goes | Back to your server, so the agent can read it                       | Nowhere. It stays on the phone   |
| Environment             | Always production                                                   | Sandbox or production            |

An earlier third mode, where a server reached a phone through the gateway by invitation, was retired. Such a connection now shows as retired in the app; the way back is a direct pairing.

## Two access policies for a feed

A feed is **Public** or **Restricted**. This is a setting of the feed, not a third connection mode, and not the retired one above.

|  | Public | Restricted |
| --- | --- | --- |
| Audience | Open: anyone with the link | Private: subscribers the publisher approved |
| Reading the feed | Anonymous | Only with a device grant the gateway holds |
| What the subscriber does | Adds the link | Adds the link, proves wallet ownership by signing one message, waits for approval |
| Who decides who reads | Nobody; the link is enough | The publisher, per wallet, enforced per approved device |
| What the publisher learns | Nothing about subscribers | The wallet address and a device fingerprint, never amounts or decisions |
| Who sets the policy | The gateway operator, at registration | The gateway operator, with the publisher's authentication address |

Restricted is how a publisher runs a paid or invite-only audience. Payment, if any, happens in the publisher's own system; SAC controls delivery. See [Run a Restricted feed](/docs/restricted-feeds).

## Registering a server with the gateway

The gateway is the shared piece. A feed server needs it to publish. An MCP server uses it to wake the phone when the app is not open. Both go through the same flow:

1. You send us the address of your server.
2. We register it.
3. You get three values: a **server ID**, a **credential** (shown once), and the **gateway address**.

A feed server is registered as **Public** unless you ask for **Restricted**. For Restricted, you also give us your **authentication origin**, the HTTPS address where subscribers' phones prove their wallet to your server. The operator can switch a registered feed between Public and Restricted later.

|                                 | Your MCP server                                                                         | Your feed server                                                                                     |
| ------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Where the three values go       | `RELAY_URL`, `RELAY_SERVER_ID`, `RELAY_CREDENTIAL`                                      | `PUBLISHER_GATEWAY_URL`, `PUBLISHER_SERVER_ID`, `BROADCAST_CREDENTIAL`                               |
| What registration gives you     | Push wake-ups: the gateway wakes the phone when a request arrives and the app is closed | The right to publish, delivery to every subscriber the feed's policy admits, push, and an online/offline status for your feed |
| How a phone connects afterwards | Your agent calls `vault_create_pairing_link` and gives the owner the link               | Your server prints the feed link at startup; you share it with your audience. For a Restricted feed, you then approve each device |

A pairing between a phone and an MCP server works without registration. Registration is what adds the wake-ups. See [Quickstart](/docs/mcp-quickstart) and [What the gateway does](/docs/feed-gateway).

## Approval is always two steps

1. **Review in SAC.** The phone reads the request, for a transaction the exact bytes, applies your [rules](/docs/rules), and waits for your tap.
2. **Confirm in the wallet.** Only then does Seed Vault Wallet open. Declining there is a rejection.

A sandbox feed review stops after step 1 and records **Simulated**.

Joining a Restricted feed asks the wallet for one more thing, once: a signed message that proves you own the wallet. It is not a transaction and approves nothing.

<br />
