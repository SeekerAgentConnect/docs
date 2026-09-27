---
title: History and results
description: "Where your answers are recorded, what each outcome means, and how to check a transaction on the explorer."
slug: /history-and-results
sidebar_position: 7
---

SAC keeps two views of what you answered:

- the **History** tab of the **Inbox**: requests and signals you already answered, next to the ones still pending;
- the **Activity** tab: a record of every request you answered, which stays after the request itself is gone, including after it expires and after you remove its connection.

Both live only on this phone. Neither is a server-side log, and a feed publisher never sees them.

## Outcomes {#outcomes}

| Activity says | What happened |
| --- | --- |
| **Acknowledged** | You acknowledged a message. Nothing was signed |
| **Message signed** | The wallet signed a message. No transaction exists |
| **Rejected** | You rejected it in SAC |
| **Declined in the wallet** | You approved in SAC, then declined in the wallet |
| **Answered, waiting to be sent** | You answered, and the answer has not been sent on yet |
| **Sent, not confirmed yet** | The wallet sent the transaction; the network has not confirmed it |
| **Confirmed on the network** | The transaction landed |
| **Failed on the network** | The transaction was included but failed |
| **Expired, never landed** | The transaction expired before it was included |
| **Sent, network status unresolved** | SAC could not establish the result from the network |
| **Simulated** | A sandbox signal: nothing was signed or sent |
| **Outcome unknown** | The wallet never reported what it did |
| **The request had already ended** | It had expired or been cancelled before your answer arrived |

:::warning[Outcome unknown]
**Outcome unknown** means nobody knows whether a transaction was sent. Check the wallet's own history or an explorer before doing anything again. Never retry from SAC: the transaction may already be on chain.
:::

A feed signal's History row can also say **Dismissed on this phone**, **Cancelled by the publisher** or **Expired**.

## Transaction links {#explorer-links}

For a transaction the wallet sent, the record shows its signature and **View on Solana Explorer**, which opens `explorer.solana.com` on the right cluster (Mainnet, Devnet or Testnet). There is no explorer link for a signed message, an acknowledgement or a simulation, because no transaction exists. If no app on the phone can open the link, the signature is shown so you can paste it into any explorer.

SAC submits through the wallet and then stops: it reports what the wallet and the network said, and does not retry.

## What the sender learns {#what-the-sender-learns}

- A **direct server** reads your answer and its outcome, including the transaction signature, through its own API. Your agent sees the same states on [MCP tools](/docs/mcp-tools).
- A **feed publisher** learns nothing: not whether you acted, your amount, or the result.

## Clear the history {#clear}

**Clear** on the Activity tab removes every record on this phone. It changes nothing on any network or server: a transaction that went through stays on the network, and the explorer still has it.

## Next {#next}

- [Troubleshooting](/docs/user-troubleshooting)
