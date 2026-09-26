---
title: Protocol
excerpt: The request, its lifecycle, the manifest, and which credential guards which door. The short version.
hidden: false
---

Contracts live in `proto/seekervault/` in the repository. This page is the reader's summary.

## A request

A direct request (`seekervault.request.v1.ActionRequest`) is one action, its state, and its outcome. A feed signal (`seekervault.request.v2.Request`) is the same idea published once for many readers: identity, revision, presentation, the action and its terms, and the declaration of what the owner chooses. Neither has a field for a wallet key, an owner's answer, or a subscriber.

| Action | Fields | Ends as |
| --- | --- | --- |
| `ack` | `text` | `COMPLETED` |
| `sign_message` | `wallet`, `text` or `data` | `COMPLETED`, with the signature |
| `transfer` | `wallet`, `network`, `recipient`, `asset`, `amount` | `CONFIRMED` |
| `swap` | `wallet`, `network`, the two assets, `input_amount`, `slippage_bps` | `CONFIRMED` |
| `staking` | `wallet`, `network`, `operation`, `amount` | `CONFIRMED` |

Amounts are base units as decimal strings. `staking.operation` is stake, unstake, cancel unstake, or withdraw; the last two carry no amount. Staking is mainnet only.

## Lifecycle

| State | Terminal | Meaning |
| --- | --- | --- |
| `PENDING` | No | Waiting for the owner |
| `PROCESSING` | No | Approved; the wallet is being asked |
| `SUBMITTED` | No | Sent; not yet confirmed |
| `CONFIRMED`, `COMPLETED` | Yes | Done |
| `REJECTED`, `CANCELLED`, `EXPIRED`, `FAILED` | Yes | Not done, and why |
| `UNKNOWN` | No | The wallet never reported. Never retry it |

Approval is the commit point: the phone names the exact prepared version it reviewed, and an older one is refused. A feed signal has revisions instead: a higher revision replaces, a cancelled status withdraws, and the same revision resent changes nothing.

## The manifest

Every server publishes `seekervault.server.v1.ServerManifest`: `server_id`, `protocol_version` (1), `settings_revision`, `mode` (`CONNECTION_MODE_DIRECT` or `CONNECTION_MODE_GATEWAY_FEED`), `required_plugins` (at most 16), `environments`, an optional `display_name`, and one reference: `direct { url }` or `feed { gateway_url, channel }`. A manifest cannot install code, ask for a permission, or name a wallet. A retired third mode keeps its numbers reserved.

## Services

| Who calls | Service | Guarded by |
| --- | --- | --- |
| Agent | `/mcp` on your MCP server | `MCP_TOKEN`, or an OAuth access token |
| Phone | `PairingService`, `RequestService`, `UpdateService` on a direct server | A one-use pairing token, then the phone credential issued at pairing |
| Feed server | `PublisherService` on the gateway | The publisher credential |
| Phone | `FeedService` on the gateway | Nothing. Reads are anonymous |
| MCP server | `/relay/v1/notify` on the gateway | The relay credential |
| Operator | The gateway's `/admin` | A password hash in configuration |

Credentials are stored as hashes and are never interchangeable: an MCP token opens no phone route, a publisher credential cannot relay, a relay credential cannot publish.
