---
title: Environments and networks
excerpt: Sandbox and production are an execution promise. Mainnet, devnet, and testnet are a wallet cluster. They are declared, checked, and refused separately.
hidden: false
---

## Execution environment

| | Production | Sandbox |
| --- | --- | --- |
| Market data | Live from the provider | **The same live data** |
| Prepared bytes | Built by the execution provider on the phone | **The same bytes** |
| Review and rules | Full | Full |
| Wallet | Opened after you approve | **Never opened** |
| Network send | The signed transaction | **Nothing** |
| Record | `Sent`, with a signature and explorer link | `Simulated`, no signature, no link |

A manifest lists the environments a server **serves** (`SERVER_ENVIRONMENT_PRODUCTION`, `SERVER_ENVIRONMENT_SANDBOX`). A connection records the one the **owner keeps**. A feed starts in sandbox when its publisher offers it; only the owner switches, and switching drops the preparation in hand. A rehearsal spends the proposal: one execution per proposal per device.

**Direct connections are always production.** An agent that asked for a signature can be told no, but it cannot be handed a simulation. The MCP server and the SKR staking server declare production and keep it.

A publisher deployment has exactly one `PUBLISHER_ENVIRONMENT`. Two environments are two deployments with their own server IDs, credentials, and databases; the gateway refuses a manifest that changes a server ID's environment set (`other_environment`).

## Solana cluster

The cluster is the network the owner's wallet is selected for on **Wallet**: `NETWORK_MAINNET`, `NETWORK_DEVNET`, or `NETWORK_TESTNET`. It is checked separately and always, and no environment changes it.

On the phone, an execution provider makes two separate declarations:

- `ActionCapability.networks`: the clusters it serves an action on. The `jupiter` provider declares mainnet only, in both environments, for `swap` and `prediction.buy`.
- `ProviderCapabilities.environments`: which of sandbox and production it serves the action in at all.

They produce two separate refusals before anything is prepared: `NetworkUnsupported` when the wallet is on a cluster the provider does not serve, `EnvironmentUnsupported` when the connection keeps a promise the provider cannot. A provider with no devnet is not a provider with no sandbox, and the app tells you which setting to change. There is no Jupiter sandbox-as-devnet trading path: the bytes are mainnet bytes either way.

Direct `vault_transfer` follows the wallet cluster: the request names `wallet` and `network`, and the server refuses `WALLET_MISMATCH` when they are not the published binding. A `sign_message` request names the wallet only; nothing about it reaches a cluster. The MCP server never chooses a network; `SOLANA_RPC_URL` must match the cluster the owner selected.

## Staking is mainnet only

The SKR staking program is deployed on mainnet-beta and nowhere else. The staking server compares genesis hashes at startup and refuses any other cluster; a devnet or testnet wallet binding is refused with `INVALID_PARAMETERS` before anything is read. `StakingAction.network` is therefore always mainnet. See [SKR staking](/docs/skr-staking).

## Push topic label

`BROADCAST_PUSH_ENVIRONMENT` (`production` or `sandbox`) is one label inside a topic name, `feed.<environment>.<server_id>`, so one Firebase project can serve two gateway deployments without a sandbox publication waking a production subscriber. It is not the execution promise and not a cluster. See [Firebase](/docs/firebase).
