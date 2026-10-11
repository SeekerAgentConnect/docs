---
title: SAC swap service fee
description: "The optional service fee SAC can add to feed swaps routed through Metis: what you see before signing, when it is charged, where it is configured, and how to check a fee on mainnet."
slug: /swap-service-fee
sidebar_position: 5
---

SAC can add a **SAC service fee** to feed swaps routed through **Metis**, Jupiter's v1 Swap API. **The fee is zero unless the operator of the app's SAC gateway configures one.** When one applies, every swap review says so before anything is signed.

The app ships with one trusted SAC gateway, and reads the fee, together with the Solana RPC endpoint for each network, from that gateway ([Where it is configured](#settings)). There is no RPC or fee setting in the app for users.

## What the fee is {#what-it-is}

- A share of the swap's **output**, taken **in the output token** by the swap program, and credited to a public token account owned by the fee wallet the gateway's operator configured.
- Charged only on **feed swaps**, on the network the fee is configured for. **Direct operations never carry a SAC service fee.** **Prediction orders carry no SAC fee**: Jupiter Prediction's order has no integrator fee, and Jupiter charges its own trading fee, included in the quoted cost.
- Set **only in the gateway's client configuration**. A feed publisher, a manifest, a signal, a direct server's request, a QR code or Jupiter's answer cannot set, raise or redirect it.
- Separate from what a swap always costs: the network fee, the priority fee and the pools' own costs apply with or without it. A swap with no service fee is not "free".

## What you see before signing {#what-you-see}

The swap review lists, next to what the phone read out of the transaction:

| Row | What it tells you |
| --- | --- |
| **Swap routing** | `Metis · Powered by Jupiter`: the routing engine that quoted and built the transaction |
| **SAC service fee, taken from what you receive** | The rate, for example `0.2%` |
| **SAC service fee, estimated** | The provider's estimate of the fee, in the output token |
| **SAC service fee recipient** | The token account the fee is credited to, in full |
| **Priority fee (SOL)** | Shown separately; it is a network cost, not the service fee |
| **Quoted now, after fees** / **You receive at least** | The quote and the minimum you receive, both already net of every fee |

When no fee applies, one row says why instead:

| The review says | Value | Meaning |
| --- | --- | --- |
| **SAC service fee (network and pool costs still apply)** | `0%` | No service fee is configured for this swap's network |
| **SAC service fee (not charged on this pair)** | `0%` | A fee is configured, but not in this swap's output token |
| **SAC service fee (not charged: its fee account could not be verified)** | `0%` | The receiving account failed the check below, so the swap carries no fee |

None of these is an error: the swap goes ahead normally, without a fee.

The fee is fixed when the swap is prepared. If the gateway's fee settings change before you sign, the review stops with *The service fee configured for this app changed after this was prepared*: prepare it again and review the new terms. If SAC cannot get usable settings from its gateway, it prepares nothing rather than assume a zero fee.

**Afterwards.** The last screen before the wallet opens repeats the routing and the fee. The History item keeps the routing, the rate, **SAC service fee, estimated at review**, the fee token and the recipient. It is an estimate: the chain takes the rate of the route's actual output, which can differ slightly and which SAC does not read back. To see the exact amount, open the transaction on the explorer and look at the recipient's token balance change.

## When it is charged {#policy}

1. **One receiving account per output token.** The configuration lists a token account for each output mint it charges in. A swap whose output mint has no account carries no fee (*not charged on this pair*). A wallet address is never used as a catch-all fee account.
2. **Checked on chain before quoting.** The phone reads the account through the Solana RPC endpoint the gateway configures for the swap's network. It must exist, belong to the classic SPL Token program (Token-2022 is not supported), hold the swap's output mint, be owned by the configured fee wallet, and be initialized and not frozen. If the read fails or any of that is false, the swap is prepared **without** a fee (*could not be verified*).
   The History record keeps why, as a stable code: `fee_account_no_rpc` (no Solana RPC endpoint is configured for the network), `fee_account_unreadable` (the endpoint did not answer), `fee_account_missing` (never created), `fee_account_not_token_account` (another program, or Token-2022), `fee_account_other_mint`, `fee_account_other_owner`, or `fee_account_not_usable` (not initialized, or frozen).
3. **Quoted and built with exactly that fee.** The phone asks Metis for the configured rate on that pair and names the verified account when building. An answer with no fee, another rate, or an amount that does not match the rate is refused.
4. **Inspected in the bytes.** Before any Approve button appears, the phone checks the transaction carries exactly the decided fee, or none when none was decided.

| Finding | What it means | Outcome |
| --- | --- | --- |
| `platform_fee` | A fee in a swap that should have none: *Someone would take a share of what you receive.* | No Approve button |
| `fee_rate_mismatch` | The rate in the transaction is not the rate shown | No Approve button |
| `fee_account_mismatch` | The fee goes to another account than the verified recipient, or is missing | No Approve button |
| `fee_mint_mismatch` | The fee would be taken in another token than the one shown | No Approve button |
| `provider_unusable` | Metis answered with a fee nobody asked for, or at another rate | Nothing is prepared; prepare again |

Everything else the swap inspection checks is unchanged: you are the signer and fee payer, the source and destination are your own token accounts, the input is exactly your amount (the fee does not change what you spend, so your rules see the same amount), slippage, the minimum output, a single direct route, and no extra transfers. See [What the phone verifies](/docs/plugins-and-actions#verification).

## Where it is configured {#settings}

The app is built with one trusted SAC gateway address. From that gateway it reads two things that apply to every copy of the app that trusts it:

- the **Solana RPC endpoint** for each network (Mainnet, Devnet, Testnet), through which the phone checks fee accounts, reads prediction lookup tables and follows the transactions you sent;
- the **SAC swap service fee**: a rate from `0` to `100` basis points (1%) of the swap's output, the network it applies to, the fee wallet, and one receiving token account per output mint.

The gateway's operator sets both with the gateway admin's **Client configuration** setting, and a change reaches the app without a rebuild or reinstall. There are no Gradle properties, build environment variables or in-app settings for RPC endpoints or the fee. Everything in the configuration is public, so it never contains a secret key. Operators: fields, validation and the receiving accounts are described in the [SAC client configuration guide](https://github.com/SeekerAgentConnect/sac/blob/develop/docs/wiki/client-config.md).

## Verify a fee on mainnet {#verify-on-mainnet}

Automated checks never spend anything, so a build, a test or an unsigned transaction is not evidence that a fee is collected. This opt-in check is, and **it spends real funds**:

1. Use an app built for a gateway whose client configuration sets a small rate (for example `20`)
   with a USDC receiving account.
2. Note the fee account's balance: `spl-token balance --address <FEE_USDC_ACCOUNT>`.
3. From a separate wallet holding a little SOL, act on a SOL → USDC swap signal for a small amount. On the review, note the rate, the estimated fee and the recipient, then approve and sign.
4. When History shows **Confirmed on the network**, open the transaction on the explorer and check the token balance changes: the fee account's USDC rises by about the estimated fee.
5. Read the balance again to confirm the difference.

## Jupiter terms and attribution {#jupiter}

Jupiter's [API & SDK License Agreement](https://developers.jup.ag/docs/legal/sdk-api-license-agreement) asks an integrator to name the API it uses and to display "Powered by Jupiter". SAC shows **Metis · Powered by Jupiter** on every swap surface and **Jupiter Prediction · Powered by Jupiter** on prediction orders, as text only: no logo, and no partnership or endorsement implied. Metis is not Jupiter Ultra, and a swap in SAC is not the same as trading on jup.ag.

- [Metis Swap API](https://developers.jup.ag/docs/swap) and [adding fees to a swap](https://developers.jup.ag/docs/swap/v1/add-fees-to-swap)
- [Terms of use](https://developers.jup.ag/docs/legal/terms-of-use) and [privacy policy](https://developers.jup.ag/docs/legal/privacy-policy)
- [API plans and rate limits](https://developers.jup.ag/docs/portal/plans)

Using the API is not legal approval of a particular fee. Whoever configures a fee is responsible for its terms with Jupiter.

## Next {#next}

- [Review requests and signals](/docs/reviewing-requests#swap-review)
- [Errors and limits](/docs/errors-and-limits#swaps-and-predictions)
- [Source mapping](/docs/source-mapping)
