---
title: Authentication roles
excerpt: Each credential opens one surface. Pairing and invitations are transport authorization only.
hidden: false
---

## Owner sidecar

| Credential | Opens | Does not open |
| --- | --- | --- |
| `MCP_TOKEN` or OAuth access token | `/mcp` | Phone APIs |
| Pairing token | `PairingService.Pair` once | MCP, requests |
| Phone credential from pairing | `RequestService`, `UpdateService`, own pairing management | `/mcp` |
| `PHONE_TOKEN` | Live diagnostic only | Durable requests |

Agents cannot prepare, approve, submit results, publish a wallet, or revoke a phone.

## Shared gateway

| Credential | Opens |
| --- | --- |
| Publisher credential | Publisher listener: manifests, feed documents, invitations, private requests |
| Invitation capability | Preview + one redemption |
| Device credential | That binding’s requests, declared results, and self-revocation |
| None | Public feed listener, read-only |

A publisher credential never appears in an invitation URL. A device credential is hashed at rest on the gateway.

## Publisher template

`PUBLISHER_API_TOKEN` grants create/update/cancel on **that** template’s API. It is not a gateway credential and not a phone credential.

## What connecting never grants

Pairing, adding a feed, and confirming an invitation do not select a wallet, approve a request, open the wallet, or sign.
