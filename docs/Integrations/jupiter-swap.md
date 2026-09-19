---
title: Jupiter swap
excerpt: jupiter.swap is a bundled phone plugin. The owner chooses the amount. Sandbox uses live mainnet data and does not sign.
hidden: false
---

`jupiter.swap` is compiled into SAC. A publisher (or a private server) names a spot pair. Each owner chooses an amount on their phone. The plugin requests a route and a legacy transaction from Jupiter, the phone reads those bytes, and — in production — the wallet signs once.

The plugin receives no credential, no wallet authorization token, and no approval power.

## Signal terms

| Term | Required | Rule |
| --- | --- | --- |
| `input_mint` / `output_mint` | Yes | Exact base58 mints. Native SOL is the wrapped mint spelled out. They must differ |
| `input_decimals` / `output_decimals` | Yes | 0–18, display only |
| `max_slippage_bps` | Yes | 1–10000 |
| `least_input` / `most_input` | No | Whole base units |
| `input_symbol` / `output_symbol` | No | At most 16 characters, unverified |

An asset is a mint, never a ticker. There is no side field: direction is the ordered pair. There is **no amount** on a public signal.

Unknown terms are ignored, not refused, and never consulted during prepare.

## Owner inputs

Amount and slippage (within the publisher ceiling). Neither leaves the phone for a public feed. On a private request they may return with the declared result.

Default slippage is half a percent, or the publisher ceiling when that is tighter.

## What the phone verifies

The plugin asks Jupiter for `asLegacyTransaction=true` and `onlyDirectRoutes=true` so every account is in the message. If `asLegacyTransaction` stops being served, this plugin **stops preparing** rather than signing what it cannot read.

It reads compute budget, wrap/unwrap, associated token account creation, and the Jupiter route instruction. It checks authority, source, destination, input amount, quoted output, slippage floor, absent platform fee, and a one-hop route plan. It does **not** decode every pool in the route plan; the program still enforces the bounds.

Anything else in the transaction (plain token transfer, `Approve`, unknown aggregator instruction) is a finding. None of those is approvable.

## Environments

The plugin does **not** read sandbox versus production. It prepares the same quote and bytes either way. Core decides whether to open the wallet.

**Mainnet or nothing**, in both environments. There is no Jupiter on Solana devnet. A wallet selected for another network is refused before a quote. Do not describe Jupiter sandbox as devnet trading.

Sandbox: **Simulate**, no signature, Activity **Simulated**. Production: **Approve and swap**, then the wallet.

## Limits

- Direct routes only. Some pairs have no route at some sizes.
- About one minute of freshness.
- Keyless Jupiter allowance is about 0.5 requests per second, 30 per minute. The plugin does not poll.
- A submitted swap is submitted, not confirmed. There is no positions screen.
- **Direct-mode MCP / `ActionRequest` swap is not executable.** Bundling this plugin did not resurrect that path.

Private servers send the same capability with `sdk.Gateway.SendRequest` and declare owner inputs. Public publishers use `POST /v1/requests` without an amount.
