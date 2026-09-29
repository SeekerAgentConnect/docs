---
title: SAC swap service fee
description: "The optional service fee a SAC build can add to swaps routed through Metis: what you see before signing, when it is charged, the build settings, and how to check a fee on mainnet."
slug: /swap-service-fee
sidebar_position: 5
---

A SAC build can add a **SAC service fee** to swaps routed through **Metis**, Jupiter's v1 Swap API. **The default build charges no service fee** and needs no configuration. A build that charges one says so on every swap review, before anything is signed.

This page is for both sides: what a user sees and can check, and how whoever builds the app configures the fee.

## What the fee is {#what-it-is}

- A share of the swap's **output**, taken **in the output token** by the swap program, and credited to a public token account controlled by whoever built the app.
- Charged only on swaps. **Prediction orders carry no SAC fee**: Jupiter Prediction's order has no integrator fee, and Jupiter charges its own trading fee, included in the quoted cost.
- Set **by the app build only**. A feed publisher, a direct server's request, a QR code or Jupiter's answer cannot set, raise or redirect it.
- Separate from what a swap always costs: the network fee, the priority fee and the pools' own costs apply with or without it. A build with no service fee is not "free".

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
| **SAC service fee (network and pool costs still apply)** | `0%` | This build charges no service fee |
| **SAC service fee (not charged on this pair)** | `0%` | This build charges one, but not in this swap's output token |
| **SAC service fee (not charged: its fee account could not be verified)** | `0%` | The receiving account failed the check below, so the swap carries no fee |

None of these is an error: the swap goes ahead normally, without a fee.

**Afterwards.** The last screen before the wallet opens repeats the routing and the fee. The History item keeps the routing, the rate, **SAC service fee, estimated at review**, the fee token and the recipient. It is an estimate: the chain takes the rate of the route's actual output, which can differ slightly and which SAC does not read back. To see the exact amount, open the transaction on the explorer and look at the recipient's token balance change.

## When it is charged {#policy}

1. **One receiving account per output token.** The build lists a token account for each output mint it charges in. A swap whose output mint has no account carries no fee (*not charged on this pair*). A wallet address is never used as a catch-all fee account.
2. **Checked on chain before quoting.** The phone reads the account through the build's own Solana endpoint. It must exist, belong to the classic SPL Token program (Token-2022 is not supported), hold the swap's output mint, be owned by the build's configured fee wallet, and be initialized and not frozen. If the read fails or any of that is false, the swap is prepared **without** a fee (*could not be verified*).
   The History record keeps why, as a stable code: `fee_account_no_rpc` (the build has no Solana endpoint), `fee_account_unreadable` (the endpoint did not answer), `fee_account_missing` (never created), `fee_account_not_token_account` (another program, or Token-2022), `fee_account_other_mint`, `fee_account_other_owner`, or `fee_account_not_usable` (not initialized, or frozen).
3. **Quoted and built with exactly that fee.** The phone asks Metis for the build's rate on that pair and names the verified account when building. An answer with no fee, another rate, or an amount that does not match the rate is refused.
4. **Inspected in the bytes.** Before any Approve button appears, the phone checks the transaction carries exactly the decided fee, or none when none was decided.

| Finding | What it means | Outcome |
| --- | --- | --- |
| `platform_fee` | A fee in a swap that should have none: *Someone would take a share of what you receive.* | No Approve button |
| `fee_rate_mismatch` | The rate in the transaction is not the rate shown | No Approve button |
| `fee_account_mismatch` | The fee goes to another account than the verified recipient, or is missing | No Approve button |
| `fee_mint_mismatch` | The fee would be taken in another token than the one shown | No Approve button |
| `provider_unusable` | Metis answered with a fee nobody asked for, or at another rate | Nothing is prepared; prepare again |

Everything else the swap inspection checks is unchanged: you are the signer and fee payer, the source and destination are your own token accounts, the input is exactly your amount (the fee does not change what you spend, so your rules see the same amount), slippage, the minimum output, a single direct route, and no extra transfers. See [What the phone verifies](/docs/plugins-and-actions#verification).

## Build settings {#settings}

For whoever builds the APK. An APK carries only a rate and public addresses. Never put a seed phrase, a private key or an API key in these settings: anyone with the APK can read them.

| Gradle property | Environment variable | Default | Meaning |
| --- | --- | --- | --- |
| `seekervault.swapFee.bps` | `SEEKERVAULT_SWAP_FEE_BPS` | `0` | Whole basis points of the swap's output, `0` to `100` (1%). `20` is 0.2%. `0` turns the fee off |
| `seekervault.swapFee.owner` | `SEEKERVAULT_SWAP_FEE_OWNER` | empty | The public wallet address that owns every receiving token account |
| `seekervault.swapFee.accounts` | `SEEKERVAULT_SWAP_FEE_ACCOUNTS` | empty | Comma-separated `<mint>=<token account>` pairs: the account that receives the fee in that mint |
| `seekervault.solanaRpc` | none | empty | The app's read-only Solana endpoint. **Required when the rate is not zero**: the phone verifies each fee account through it |

**Precedence.** A Gradle property (`-P…`, `gradle.properties`, or `ORG_GRADLE_PROJECT_…`) wins over its environment variable. An empty value counts as unset.

**Validation.** The build stops with `Invalid SAC swap fee configuration: …` when:

- the rate is not a whole number from 0 to 100;
- a nonzero rate has no owner, no accounts, or no `seekervault.solanaRpc`;
- an address is not a base58 public key, or an entry is not `mint=account`;
- a mint is listed twice;
- an account is the owner wallet itself, or the mint itself.

Anything set is validated even at rate 0, so a half-finished setting fails early. The swap program would accept up to 255 bps; the app's bound is 100.

**Which mints.** List the output tokens your users receive most, typically USDC and wrapped SOL (`So11111111111111111111111111111111111111112`, which also covers swaps into native SOL). Only classic SPL Token accounts are supported.

## Prepare the receiving accounts {#accounts}

Once, before shipping a fee build, create the fee wallet's token account for each mint you list, with the Solana CLI's `spl-token` or any wallet that creates token accounts:

```sh
# USDC
spl-token create-account EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --owner <FEE_WALLET>
# Wrapped SOL
spl-token create-account So11111111111111111111111111111111111111112 --owner <FEE_WALLET>
# Print the account address to put in seekervault.swapFee.accounts
spl-token address --token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --owner <FEE_WALLET> --verbose
```

Users are never charged for creating these accounts, and the app cannot create or fund them. Do not close them while fee builds are in use: a closed account fails the check, and those swaps carry no fee.

## Build commands {#build}

Values in angle brackets are placeholders; substitute your own public addresses.

A default build, with no service fee:

```sh
apps/android/gradlew -p apps/android :app:assembleRelease
```

A fee-enabled build:

```sh
apps/android/gradlew -p apps/android :app:assembleRelease \
  -Pseekervault.solanaRpc=https://<your-mainnet-rpc> \
  -Pseekervault.swapFee.bps=20 \
  -Pseekervault.swapFee.owner=<FEE_WALLET> \
  -Pseekervault.swapFee.accounts=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v=<FEE_USDC_ACCOUNT>,So11111111111111111111111111111111111111112=<FEE_WSOL_ACCOUNT>
```

The same with environment variables:

```sh
export SEEKERVAULT_SWAP_FEE_BPS=20
export SEEKERVAULT_SWAP_FEE_OWNER=<FEE_WALLET>
export SEEKERVAULT_SWAP_FEE_ACCOUNTS=<MINT>=<ACCOUNT>,<MINT>=<ACCOUNT>
apps/android/gradlew -p apps/android :app:assembleRelease -Pseekervault.solanaRpc=https://<your-mainnet-rpc>
```

An explicit zero-fee build, overriding anything in the environment:

```sh
apps/android/gradlew -p apps/android :app:assembleRelease -Pseekervault.swapFee.bps=0
```

## CI {#ci}

The source repository's `.github/workflows/release.yml` builds the unsigned release APK on a manual dispatch with `component: android`. It reads:

| Name | Kind | Why |
| --- | --- | --- |
| `SEEKERVAULT_SWAP_FEE_BPS`, `SEEKERVAULT_SWAP_FEE_OWNER`, `SEEKERVAULT_SWAP_FEE_ACCOUNTS` | Repository **variables** | Public values, not secrets. Unset means no fee |
| `SEEKERVAULT_SOLANA_RPC` | Repository **secret** | An RPC URL can carry a provider key |

The run summary records the fee configuration, and the APK is uploaded as a workflow artifact. The workflow signs and publishes nothing. `pnpm check:swap-fee-build`, run in the Android CI job, checks the default, both ways of configuring a fee, the precedence and every validation error.

## Verify a fee on mainnet {#verify-on-mainnet}

Automated checks never spend anything, so a build, a test or an unsigned transaction is not evidence that a fee is collected. This opt-in check is, and **it spends real funds**:

1. Build a fee APK as above with a small rate (for example `20`) and a USDC account, and install it.
2. Note the fee account's balance: `spl-token balance --address <FEE_USDC_ACCOUNT>`.
3. From a separate wallet holding a little SOL, act on a SOL → USDC swap signal for a small amount. On the review, note the rate, the estimated fee and the recipient, then approve and sign.
4. When History shows **Confirmed on the network**, open the transaction on the explorer and check the token balance changes: the fee account's USDC rises by about the estimated fee.
5. Read the balance again to confirm the difference.

## Jupiter terms and attribution {#jupiter}

Jupiter's [API & SDK License Agreement](https://developers.jup.ag/docs/legal/sdk-api-license-agreement) asks an integrator to name the API it uses and to display "Powered by Jupiter". SAC shows **Metis · Powered by Jupiter** on every swap surface and **Jupiter Prediction · Powered by Jupiter** on prediction orders, as text only: no logo, and no partnership or endorsement implied. Metis is not Jupiter Ultra, and a swap in SAC is not the same as trading on jup.ag.

- [Metis Swap API](https://developers.jup.ag/docs/swap) and [adding fees to a swap](https://developers.jup.ag/docs/swap/v1/add-fees-to-swap)
- [Terms of use](https://developers.jup.ag/docs/legal/terms-of-use) and [privacy policy](https://developers.jup.ag/docs/legal/privacy-policy)
- [API plans and rate limits](https://developers.jup.ag/docs/portal/plans)

Using the API is not legal approval of a particular build's fee. Whoever ships a fee build is responsible for its terms with Jupiter.

## Next {#next}

- [Review requests and signals](/docs/reviewing-requests#swap-review)
- [Errors and limits](/docs/errors-and-limits#swaps-and-predictions)
- [Source mapping](/docs/source-mapping)
