---
title: How it works
excerpt: One diagram, the two connection modes, and the registration flow that a feed server and an MCP server share.
hidden: false
---

```
Your agent --MCP--> Your MCP server <-- pairing, requests, results --> SAC on the phone
                          |                                                 |
                          +-- wake-up through the gateway ------------------+
                                                                            |
Your feed server --publish once--> Gateway --feed, live stream, push------->+
                                                                            |
                                                                            v
                                                              Seed Vault Wallet --> Solana
```

| Part | Job | Never does |
| --- | --- | --- |
| **SAC** on the phone | Holds your connections, shows each request, records your decision | Hold keys or sign |
| **Seed Vault Wallet** | Signs and sends what you approved | Know about servers |
| **Your MCP server** | Takes your agent's requests, hands them to your phone, returns the result to the agent | Hold keys or decide for you |
| **Your feed server** | Publishes signals once, to the gateway | Learn who subscribed or what they decided |
| **The gateway** | Stores each publication and delivers it to every subscriber, streams updates, sends push wake-ups, and wakes phones for MCP servers that ask it to | Hold keys, approve, or see a decision |

## Two connection modes

| | Direct | Feed |
| --- | --- | --- |
| Whose server | Your own MCP server, or the SKR staking server | A publisher's feed server |
| How the phone connects | A one-use pairing link from your agent, or a code from the terminal | A feed link the publisher shares |
| Who sees a request | Only the one paired phone | Everyone who added the feed |
| Where the decision goes | Back to your server, so the agent can read it | Nowhere. It stays on the phone |
| Environment | Always production | Sandbox or production |

An earlier third mode, where a server reached a phone through the gateway by invitation, was retired. Such a connection now shows as retired in the app; the way back is a direct pairing.

## Registering a server with the gateway

The gateway is the shared piece. A feed server needs it to publish. An MCP server uses it to wake the phone when the app is not open. Both go through the same flow:

1. You send us the address of your server.
2. We register it.
3. You get three values: a **server ID**, a **credential** (shown once), and the **gateway address**.

| | Your MCP server | Your feed server |
| --- | --- | --- |
| Where the three values go | `RELAY_URL`, `RELAY_SERVER_ID`, `RELAY_CREDENTIAL` | `PUBLISHER_GATEWAY_URL`, `PUBLISHER_SERVER_ID`, `BROADCAST_CREDENTIAL` |
| What registration gives you | Push wake-ups: the gateway wakes the phone when a request arrives and the app is closed | The right to publish, delivery to every subscriber, push, and an online/offline status for your feed |
| How a phone connects afterwards | Your agent calls `vault_create_pairing_link` and gives the owner the link | Your server prints the feed link at startup; you share it with your audience |

A pairing between a phone and an MCP server works without registration. Registration is what adds the wake-ups. See [Quickstart](/docs/mcp-quickstart) and [What the gateway does](/docs/feed-gateway).

## Approval is always two steps

1. **Review in SAC.** The phone reads the request, for a transaction the exact bytes, applies your [rules](/docs/rules), and waits for your tap.
2. **Confirm in the wallet.** Only then does Seed Vault Wallet open. Declining there is a rejection.

A sandbox feed review stops after step 1 and records **Simulated**.
