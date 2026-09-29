---
title: Protocol
description: "Requests and signals, their lifecycle, the manifest, the services and which credential guards each one."
slug: /protocol
sidebar_position: 1
---

Contracts live in `packages/protocol/proto/seekervault/` in the source repository. This page is the reader's summary. The Direct Server SDK exposes the generated types as `@seekeragentconnect/server-sdk/protocol`.

## Requests and signals {#requests-and-signals}

A direct request (`seekervault.request.v1.ActionRequest`) is one action, its state, and its outcome. A feed signal (`seekervault.request.v2.Request`) is the same idea published once for many readers: identity, revision, presentation, the action and its terms, and the declaration of what the owner chooses. Neither has a field for a wallet key, an owner's answer, or a subscriber. A Restricted feed publishes the same signals; access is decided around them, not inside them.

| Action | Fields | Ends as |
| --- | --- | --- |
| `ack` | `text` | `COMPLETED` |
| `sign_message` | `wallet`, `text` or `data` | `COMPLETED`, with the signature |
| `transfer` | `wallet`, `network`, `recipient`, `asset`, `amount` | `CONFIRMED` |
| `swap` | `wallet`, `network`, the two assets, `input_amount`, `slippage_bps` | `CONFIRMED` |
| `staking` | `wallet`, `network`, `operation`, `amount` | `CONFIRMED` |

Which server creates which: the general SAC MCP server creates `ack`, `sign_message` and `transfer`; the SKR Staking server creates `staking`; a direct server on the SDK creates any of them it has providers for. Swaps and prediction orders reach the phone as feed signals, whose terms are on [Supported actions](/docs/plugins-and-actions).

Amounts are base units as decimal strings. `staking.operation` is stake, unstake, cancel unstake, or withdraw; the last two carry no amount. Staking is mainnet only.

## Lifecycle {#lifecycle}

| State | Terminal | Meaning |
| --- | --- | --- |
| `PENDING` | No | Waiting for the owner |
| `PROCESSING` | No | Approved; the wallet is being asked |
| `SUBMITTED` | No | Sent; not yet confirmed |
| `CONFIRMED`, `COMPLETED` | Yes | Done |
| `REJECTED`, `CANCELLED`, `EXPIRED`, `FAILED` | Yes | Not done, and why |
| `UNKNOWN` | No | The wallet never reported. Never retry it |

Approval is the commit point: the phone names the exact prepared version it reviewed, and an older one is refused. A feed signal has revisions instead: a higher revision replaces, a cancelled status withdraws, and the same revision resent changes nothing.

## The manifest {#manifest}

Every server publishes `seekervault.server.v1.ServerManifest`: `server_id`, `protocol_version` (1), `settings_revision`, `mode` (`CONNECTION_MODE_DIRECT` or `CONNECTION_MODE_GATEWAY_FEED`), `required_plugins` (at most 16), `environments`, an optional `display_name`, and one reference: `direct { url, supported_networks }` or `feed { gateway_url, channel, access, supported_networks }`. A manifest cannot install code, ask for a permission, or name a wallet. A retired third mode keeps its numbers reserved.

`feed.access` is `FeedAccess { policy, auth_origin }`, with `policy` `FEED_ACCESS_POLICY_PUBLIC` or `FEED_ACCESS_POLICY_RESTRICTED`. An absent `access` means Public. The gateway **stamps** this field from the feed's registration on every manifest it serves, and refuses a published manifest that claims another policy or origin (`ACCESS_MISMATCH`). A Restricted feed must state the policy and the registered origin; a Public feed may say nothing. The phone sends a wallet proof only to the stamped `auth_origin`, never to an address from a link.

### Supported networks {#supported-networks}

`supported_networks` is a repeated `seekervault.server.v1.SolanaNetwork`: `SOLANA_NETWORK_MAINNET` (1), `SOLANA_NETWORK_DEVNET` (2) or `SOLANA_NETWORK_TESTNET` (3), the same numbers the request contract's `Network` uses. It sits inside the reference, `DirectServer` field 2 and `GatewayFeed` field 4, so that the reference stays the last thing in a serialized manifest in every runtime. In JSON it is `direct.supportedNetworks` or `feed.supportedNetworks`:

```json
"feed": {
  "gatewayUrl": "https://gateway.example.com",
  "channel": "server/3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
  "supportedNetworks": ["SOLANA_NETWORK_MAINNET", "SOLANA_NETWORK_DEVNET"]
}
```

- **Empty means no networks declared.** Never Mainnet, never every network. It is what a manifest from before the field existed reads as, and what a server whose requests never reach a wallet should publish. The phone shows such a connection but signs nothing for it.
- **Canonical order is ascending.** A list in another order is the same statement; the gateway stores and serves it sorted.
- **Refused:** `SOLANA_NETWORK_UNSPECIFIED`, a repeated value, and, at the gateway, a value it does not know (`bad_network`). The phone skips a value from a later version of the format that it does not know, and refuses a list longer than eight.
- **It may change on a higher revision**, unlike `environments`. The same `settings_revision` with a different list is a conflict.
- **It is not the environment.** `SERVER_ENVIRONMENT_PRODUCTION` is not Mainnet, and `SERVER_ENVIRONMENT_SANDBOX` is not Devnet or Testnet.

What each server sets, and the deployment order, are on [Declare the Solana networks you run on](/docs/direct-or-feed#supported-networks).

A direct server still holds **one wallet binding** per paired phone: the address and network of the wallet the owner chose for that connection. The phone publishes it only to that server, and a new binding cancels that server's `PENDING` requests it no longer fits. A feed receives no binding: the wallet a subscriber chose for a feed stays on the phone.

## Services {#services}

| Who calls | Service | Guarded by |
| --- | --- | --- |
| Agent | `/mcp` on your MCP server | `MCP_TOKEN`, or an OAuth access token |
| Phone | `PairingService`, `RequestService`, `UpdateService` on a direct server | A one-use pairing token, then the phone credential issued at pairing |
| Feed server | `PublisherService` on the gateway | The publisher credential |
| Phone | `FeedService` on the gateway | Public feed: nothing, reads are anonymous. Restricted feed: the manifest is open; every other read needs a live grant's session |
| Phone | `/access/v1` on a Restricted feed's server, at its authentication origin | A wallet signature once, then the device key's signature on every call |
| Feed server | `DescribeAccess`, `GrantAccess`, `RevokeAccess` on the gateway | The publisher credential |
| Publisher's administrator | `/v1/access/...` on a feed server built on the publisher library | The feed server's API token |
| MCP server | `/relay/v1/notify` on the gateway | The relay credential |

Credentials are stored as hashes and are never interchangeable: an MCP token opens no phone route, a publisher credential cannot relay, a relay credential cannot publish.

## Restricted feeds {#restricted-feeds}

A Restricted feed adds one decision, who may read, made by the publisher and enforced by the gateway:

```text
feed link → challenge → one wallet signature + device-key signature → pending
          → publisher's decision → single-use invitation → redemption (device key)
          → publisher grants at the gateway → session → reads and live updates
```

The publisher's `/access/v1` endpoint, the gateway's `GrantAccess`, `RevokeAccess` and `DescribeAccess`, the session a phone presents, and the access states are specified on [Restricted access reference](/docs/restricted-access-reference). Refusal codes are on [Errors and limits](/docs/errors-and-limits#restricted-feeds).
