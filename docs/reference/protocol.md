---
title: Protocol
description: "The request, its lifecycle, the manifest, Restricted feed access, and which credential guards which door. The short version."
slug: /protocol
sidebar_position: 1
---

Contracts live in `proto/seekervault/` in the repository. This page is the reader's summary.

## A request

A direct request (`seekervault.request.v1.ActionRequest`) is one action, its state, and its outcome. A feed signal (`seekervault.request.v2.Request`) is the same idea published once for many readers: identity, revision, presentation, the action and its terms, and the declaration of what the owner chooses. Neither has a field for a wallet key, an owner's answer, or a subscriber. A Restricted feed publishes the same signals; access is decided around them, not inside them.

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

Every server publishes `seekervault.server.v1.ServerManifest`: `server_id`, `protocol_version` (1), `settings_revision`, `mode` (`CONNECTION_MODE_DIRECT` or `CONNECTION_MODE_GATEWAY_FEED`), `required_plugins` (at most 16), `environments`, an optional `display_name`, and one reference: `direct { url }` or `feed { gateway_url, channel, access }`. A manifest cannot install code, ask for a permission, or name a wallet. A retired third mode keeps its numbers reserved.

`feed.access` is `FeedAccess { policy, auth_origin }`, with `policy` `FEED_ACCESS_POLICY_PUBLIC` or `FEED_ACCESS_POLICY_RESTRICTED`. An absent `access` means Public. The gateway **stamps** this field from the operator's registration on every manifest it serves, and refuses a published manifest that claims another policy or origin (`ACCESS_MISMATCH`). A Restricted feed must state the policy and the registered origin; a Public feed may say nothing. The phone sends a wallet proof only to the stamped `auth_origin`, never to an address from a link.

## Services

| Who calls | Service | Guarded by |
| --- | --- | --- |
| Agent | `/mcp` on your MCP server | `MCP_TOKEN`, or an OAuth access token |
| Phone | `PairingService`, `RequestService`, `UpdateService` on a direct server | A one-use pairing token, then the phone credential issued at pairing |
| Feed server | `PublisherService` on the gateway | The publisher credential |
| Phone | `FeedService` on the gateway | Public feed: nothing, reads are anonymous. Restricted feed: the manifest is open; every other read needs a live grant's session |
| Phone | `/access/v1` on a Restricted feed's server, at its authentication origin | A wallet signature once, then the device key's signature on every call |
| Feed server | `DescribeAccess`, `GrantAccess`, `RevokeAccess` on the gateway | The publisher credential |
| Publisher's operator | `/v1/access/...` on the feed server | The feed server's API token |
| MCP server | `/relay/v1/notify` on the gateway | The relay credential |
| Operator | The gateway's `/admin` | A password hash in configuration |

Credentials are stored as hashes and are never interchangeable: an MCP token opens no phone route, a publisher credential cannot relay, a relay credential cannot publish.

## Restricted feeds

A Restricted feed adds one decision, who may read, made by the publisher and enforced by the gateway. The flow:

```text
feed link → challenge → one wallet signature + device-key signature → pending
          → publisher's decision → single-use invitation → redemption (device key)
          → publisher grants at the gateway → session → reads and live updates
```

**The publisher's endpoint.** Public, credential-free, signature-checked, at the registered authentication origin. Bodies are strict JSON of at most 16 KiB.

| Call | Body | Answer |
| --- | --- | --- |
| `POST /access/v1/challenges` | `feed`, `wallet`, `device_key`, `label` | `attempt`, `nonce`, `issued_at`, `expires_at`, `auth_origin`, `feed`, `installation`, `message` |
| `POST /access/v1/requests` | `attempt`, `wallet_signature`, `device_signature` | `request_id`, `state` |
| `POST /access/v1/requests/{id}/status` | `at`, `device_signature` | `request_id`, `state`, `connected`, and `invitation` while one is live |
| `POST /access/v1/redeem` | `feed`, `invitation`, `at`, `device_signature` | `request_id`, `session`, `grant_id`, `until`, `gateway` |

**Two keys.** The wallet (Ed25519) signs exactly one thing: the challenge `message`, plain ASCII that names the authentication origin, the feed, the wallet, the device key, the attempt, a nonce and two timestamps, and says *This is not a transaction. Signing it moves no funds and approves nothing.* The phone rebuilds that text from the fields and compares it before the wallet opens. The **device key** (P-256, generated in the Android Keystore for this feed, sent as X.509 SubjectPublicKeyInfo) signs the same bytes, which binds the request to this installation, and then signs every status check and redemption. `installation` is the hex of the first 10 bytes of the device key's SHA-256.

**What the gateway is told.** `GrantAccess` carries a grant ID, an opaque subscriber reference (one per wallet), an opaque device reference (one per device), the SHA-256 of the session, and a lifetime. Renewal is the same call. `RevokeAccess` takes grant IDs. The gateway never receives a wallet address or a wallet signature.

**What the phone presents.** A `session` on `ListRequests`, `ListProposals` (every page), `GetRequest`, `GetProposal`, `GetFeedStatus`, `GetStreamTicket`, and `SetFeedPushTarget`. A Restricted channel never appears in `GetFeedTopics`; each approved device registers its own push target under its grant instead. After a revocation, the gateway moves the channel's stream name, so a listener attached under the old one receives nothing more; it gets one field-less `AccessChanged` event and must ask for a new ticket.

The operator's routes are listed on [Run a Restricted feed](/docs/restricted-feeds#4-approve-devices). Refusal codes are on [Errors and limits](/docs/errors-and-limits#restricted-feeds).
