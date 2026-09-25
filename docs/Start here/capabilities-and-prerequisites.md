---
title: Capabilities and prerequisites
excerpt: What SAC can review today, what you need on the phone, and what is out of scope.
hidden: false
---

## On the phone

- A **Solana Seeker** (or another Android device with a Mobile Wallet Adapter wallet).
- **Seed Vault Wallet** set up with an account. SAC never asks for a seed phrase.
- The **Seeker Agent Connect** app. The installed label is **Seeker Agent Connect**. The Android application ID is `io.github.brrenat.seekervault`.
- Something to connect: a **direct server** you can pair with (the MCP server, the SKR staking server, or one built on the Direct Server SDK), or a **feed reference** from a publisher.

Connect the wallet from the **Wallet** tab (**Connect wallet**). Until you do, agents get `WALLET_NOT_CONNECTED` for anything that needs one. Connecting the wallet does not require a server.

## What servers can ask for

| Action | Comes from | What you tap | Moves funds? |
| --- | --- | --- | --- |
| Acknowledge text | The MCP server's demo tool (`MCP_DEMO_TOOLS=true`) | **Acknowledge** or **Reject** | No |
| Sign a message | The MCP server (`vault_sign_message`) | **Approve and sign**, then confirm in the wallet | No |
| Transfer SOL or a classic SPL token | The MCP server with `SOLANA_RPC_URL` (`vault_transfer`) | **Approve and send**, then confirm in the wallet | Yes |
| Swap (`swap`, prepared by `jupiter`) | A public feed signal | Enter an amount → **Get a quote and prepare** → **Approve and swap** or **Simulate** | Yes in production; no in sandbox |
| Prediction order (`prediction.buy`, prepared by `jupiter`) | A public feed signal | Choose a side and a stake → prepare → approve or simulate | Yes in production; no in sandbox |
| Stake, unstake, cancel an unstake, or withdraw SKR | The SKR staking server (`request_stake`, `request_unstake`, `request_cancel_unstake`, `request_withdraw`) | **Approve and stake**, **Approve and start unstaking**, **Approve and cancel unstaking**, or **Approve and withdraw**, then confirm in the wallet | Stake: out of the wallet. Withdraw: into it. Unstake and cancel: nothing moves |

The `jupiter` execution provider is **compiled into the app**. A feed manifest names it by the legacy plugin names `jupiter.swap` and `jupiter.prediction` at contract version 1, and both `prediction` and `prediction.buy` are accepted for the order action. The phone never downloads provider code; a provider this build does not carry is reported as missing, not fetched. A refusal — no provider, wrong network, wrong environment, unsupported asset, and the rest — is decided before anything is prepared.

Staking is **mainnet-beta only**. The phone reads the staking program itself, recomputes the accounts the transaction should name, and verifies the prepared bytes before it offers an Approve button. Four operations, four distinct reviews.

## Direct server tools (MCP)

When the MCP adapter is on, agents on the MCP server may call:

| Tool | Served when |
| --- | --- |
| `vault_get_capabilities`, `vault_get_address` | MCP is on |
| `vault_sign_message` | MCP is on |
| `vault_transfer` | `SOLANA_RPC_URL` is set |
| `vault_get_request`, `vault_cancel_request` | MCP is on |
| `vault_create_pairing_link` | MCP is on |
| `vault_request_ack` | `MCP_DEMO_TOOLS=true` (development) |
| `vault_display_command` | Live diagnostic only, while the live-test screen is open |

The SKR staking server serves `get_staking_status`, the four `request_*` tools, and `skr_create_pairing_link`.

`vault_swap` is **not** an executable MCP tool in this release. Swap execution is the bundled phone provider on feed signals.

## Sandbox and production

- **Sandbox** applies to feed signals. The phone fetches the same market data and builds the same bytes as production, applies your rules, and then stops: nothing is signed, nothing is sent, and Activity says **Simulated**.
- **Production** opens the wallet after you approve.
- Neither is a Solana network. Jupiter builds mainnet transactions in both, so there is no devnet trading rehearsal. The network is the one your wallet is connected for.
- **Direct connections are always production.** The MCP server and the staking server never receive a simulated result.

## What you need as a developer

- **Node 24.21.0** and **pnpm** for the MCP server, the staking server, and the Direct Server SDK (`server-sdk/`, a private package installed from a packed tarball, not from a registry).
- **Go 1.27.1 or newer** to build the feed gateway or copy a feed demo.
- For a public feed: a feed gateway origin and a publisher credential from its operator (`feed-gatewayctl register`). There is no self-signup. See the [public feed walkthrough](/docs/public-feed-walkthrough).
- For your own direct server: the [Direct Server SDK](/docs/direct-server-sdk) and the [direct server walkthrough](/docs/direct-server-walkthrough).
- For an agent on the MCP server: the [direct MCP server walkthrough](/docs/direct-sidecar-walkthrough).

## Out of scope in this release

- Creating a wallet, or holding a seed phrase. SAC asks the wallet you already have.
- Automatic approval. Rules are advisory. You tap, and the wallet still asks.
- Opening the app from a `seekervault://feed` link (no intent filter; only `seekervault://pair` has one).
- Fill monitoring, positions, settlement, or profit and loss for Jupiter orders.
- A staking dashboard or positions screen, and background monitoring of a staking position.
- Direct-mode swap execution over MCP.
- Embedding SAC screens in another app (no client-app SDK), and downloading plugins.
- Backing up connections, credentials, or rules to a new phone.
