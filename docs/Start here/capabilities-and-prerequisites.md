---
title: Capabilities and prerequisites
excerpt: What SAC can review today, what you need on the phone, and what is out of scope.
hidden: false
---

## On the phone

- A **Solana Seeker** (or another Android device with a Mobile Wallet Adapter wallet).
- **Seed Vault Wallet** set up with an account. SAC never asks for a seed phrase.
- The **Seeker Agent Connect** app. The installed label is **Seeker Agent Connect**. The Android application ID is `io.github.brrenat.seekervault`.

Connect the wallet from **Wallet** after at least one server is useful, so agents can read the address. Wallet connect itself does not require a sidecar.

## What servers can ask for

| Capability | Where it runs | What you do | Moves funds? |
| --- | --- | --- | --- |
| Acknowledge text | Direct sidecar (demo tool) | **Acknowledge** or **Reject** | No |
| Sign a message | Direct sidecar | **Approve and sign**, then confirm in the wallet | No |
| Transfer SOL or a classic SPL token | Direct sidecar with `SOLANA_RPC_URL` | **Approve and send**, then confirm in the wallet | Yes |
| Spot swap (`jupiter.swap`) | Feed or private gateway request | Enter amount → **Get a quote and prepare** → **Approve and swap** or **Simulate** | Yes in production; no in sandbox |
| Prediction order (`jupiter.prediction`) | Feed or private gateway request | Choose side and stake → prepare → approve or simulate | Yes in production; no in sandbox |

Plugins are **compiled into the app**. A manifest names `jupiter.swap` or `jupiter.prediction` at contract version 1. The phone never downloads plugin code.

## Direct sidecar tools (MCP)

When the optional MCP adapter is on, agents may call:

| Tool | Served when |
| --- | --- |
| `vault_get_capabilities` | MCP is on |
| `vault_get_address` | MCP is on |
| `vault_sign_message` | MCP is on |
| `vault_get_request` / `vault_cancel_request` | MCP is on |
| `vault_transfer` | `SOLANA_RPC_URL` is set |
| `vault_request_ack` | `MCP_DEMO_TOOLS=true` (development) |
| `vault_display_command` | Live diagnostic only, while the live-test screen is open |

`vault_swap` is **not** an executable MCP tool in this release. Swap execution is the bundled phone plugin on feed and private-gateway requests.

## What you need as a developer

- **Go** matching `publisher/go.mod` (1.27.1 or newer) to build the Server SDK and templates.
- A **broadcast gateway** origin and a publisher credential, issued by an operator with `broadcastctl register`. There is no self-signup.
- For public feeds: the template settings in [the public feed walkthrough](/docs/public-feed-walkthrough).
- For a private server: the same registration, plus [the invitation walkthrough](/docs/private-invitation-walkthrough).
- For an agent on your own sidecar: Node 24.21.0, pnpm, and [the direct sidecar walkthrough](/docs/direct-sidecar-walkthrough).

## Out of scope in this release

- Embedding SAC screens in another app (no client-app SDK).
- Downloading plugins or a plugin marketplace.
- Opening the app from a `seekervault://feed` link (no intent filter).
- Fill monitoring, positions, settlement, or profit and loss for Jupiter orders.
- Automatic approval. Rules are advisory. The wallet still asks.
- Backing up connections, credentials, or rules to a new phone.
