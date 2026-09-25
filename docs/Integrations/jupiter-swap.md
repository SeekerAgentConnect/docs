---
title: Jupiter swap
excerpt: The swap action, served on the phone by the bundled jupiter execution provider. The owner chooses the amount. Sandbox prepares real mainnet bytes and does not sign.
hidden: false
---

`swap` is a provider-neutral, versioned action (schema 1). On the phone, one bundled **execution provider**, `jupiter`, serves it. A publisher names a spot pair; each owner chooses an amount on their own phone; the provider gets a route and a legacy transaction from Jupiter; the phone reads those bytes back; and, in production, the wallet signs once.

The provider receives no credential, no wallet authorization token, and no approval power. Nothing here downloads code: a provider is compiled into the app.

## Names on the wire

Manifests and signals still say `jupiter.swap` at contract version 1. The phone looks that name up in one table, never parses it, and resolves it to provider `jupiter`, action `swap`, schema 1. A manifest requiring `jupiter.swap` at `1..1` resolves exactly as before, and the phone re-emits the legacy spelling. Nothing on the wire changed. See [Manifests](/docs/manifests).

Refusals are decided before anything is prepared: no such provider in this build, an unsupported contract, action, schema, network, environment, or asset, and a legacy name paired with an action it was not published for. Each is reported by name.

## Signal terms

| Term | Required | Rule |
| --- | --- | --- |
| `input_mint` / `output_mint` | Yes | Exact base58 mints. Native SOL is the wrapped mint spelled out. They must differ |
| `input_decimals` / `output_decimals` | Yes | 0–18, display only |
| `max_slippage_bps` | Yes | 1–10000 |
| `least_input` / `most_input` | No | Whole base units; a floor above the ceiling is refused |
| `input_symbol` / `output_symbol` | No | At most 16 characters, unverified |

An asset is a mint, never a ticker. Direction is the ordered pair; there is no side field. There is **no amount** on a public signal. Core reads the terms once, against the action's own schema, before any provider is consulted. Unknown terms are ignored and never consulted.

## Capabilities

| | `jupiter` serving `swap` |
| --- | --- |
| Clusters | Mainnet only, in both environments. There is no devnet Jupiter |
| Environments | Production and sandbox, the same work in each |
| Assets | No floor or ceiling of the venue's own; the publisher's bounds bind |
| Status queries | None. `status` answers unsupported, and nothing polls it |

## Owner inputs

The amount, and slippage within the publisher's ceiling. Default slippage is half a percent, or the ceiling when that is tighter. Neither leaves the phone: a feed connection has no outbox and no per-subscriber state.

## What the phone verifies

The provider asks for `asLegacyTransaction=true` and `onlyDirectRoutes=true`, so every account is in the message. If legacy transactions stop being served, the action **stops preparing** rather than signing what it cannot read.

The phone reads compute budget, wrap and unwrap, associated token account creation, and the Jupiter route instruction, and checks: the authority is the owner; source and destination are the owner's own token accounts for the two mints; the input amount is exactly what the owner entered; the quoted output and slippage floor are the offer's; there is no platform fee; the route plan has one hop. It does not decode every pool in the route plan; the program enforces the bounds either way.

Anything else (a plain token transfer, an `Approve`, an unknown instruction) is a finding, and none is approvable. Before the wallet opens, the binding pins the bytes' hash, the revision, the choice, the wallet, the cluster, the environment, the provider, the action, its schema, and the pair; any change is refused by name.

## Environments

The provider does not read the environment. Sandbox and production get the same quote, build and review; core decides whether the wallet opens. Sandbox is not a Solana network, and Jupiter sandbox is not devnet trading: a wallet selected for another cluster is refused before a quote in both. Sandbox: **Simulate**, no signature, Activity **Simulated**. Production: **Approve and swap**, then the wallet. A direct connection is always production. See [Environments](/docs/environments).

## What is not there

- Direct routes only; some pairs have no route at some sizes.
- About one minute of freshness; after that, prepare again.
- The keyless allowance is about 0.5 requests per second, 30 per minute. Nothing polls.
- A submitted swap is submitted, not confirmed. No fill monitoring, no positions screen.
- A direct-mode MCP swap request is not executable. Swaps arrive over public feeds.

Publishers name the pair without an amount: see the [Public feed walkthrough](/docs/public-feed-walkthrough).
