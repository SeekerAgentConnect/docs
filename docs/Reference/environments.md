---
title: Environments and networks
excerpt: Sandbox and Production are an execution promise. Mainnet, Devnet, and Testnet are a wallet cluster. They are not the same.
hidden: false
---

## Execution environment

| | Production | Sandbox |
| --- | --- | --- |
| Market data | Live from the provider | **The same live data** |
| Prepared bytes | Built by the plugin | **The same bytes** |
| Review and rules | Full | Full |
| Wallet | Opened after you approve | **Never opened** |
| Network send | Possible | **Nothing** |
| Activity | Sent, with a signature when there is one | **Simulated**, no signature, no explorer link |

A manifest lists environments the **server serves**. A connection records the environment the **owner keeps**. Feeds start in sandbox when the publisher offers it. Only the owner switches. Switching drops the in-hand preparation.

Direct sidecar connections are **always production**. An agent cannot be handed a simulation.

A publisher deployment has exactly one `PUBLISHER_ENVIRONMENT`. Two environments are two deployments, with their own server IDs, credentials, and databases. The gateway refuses changing the environment set on a server ID.

## Solana cluster

**Mainnet / Devnet / Testnet** is selected on **Wallet**. It is checked separately and always.

Jupiter swap and prediction plugins are **mainnet or nothing** in both sandbox and production. There is no Jupiter sandbox-as-devnet trading path. A wallet selected for another network is refused for those plugins because the bytes are mainnet bytes either way.

Direct `vault_transfer` and message signing **do** follow the wallet cluster. A sidecar pointed at `https://api.devnet.solana.com` is a different feature from a sandbox feed.

## Push topic label

`BROADCAST_PUSH_ENVIRONMENT` is a string inside a Firebase topic name so one Firebase project can serve two gateway deployments. It is not the execution promise and not a Solana cluster.
