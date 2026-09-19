---
title: Operator roles
excerpt: Shared gateway, owner sidecar, and publisher are three jobs. Do not mix their secrets or ports.
hidden: false
---

| Role | Runs | Typical secrets |
| --- | --- | --- |
| **Broadcast gateway operator** | `broadcast/` or `deploy/server` part 1 | Centrifugo keys, ACME email, optional Firebase for **feed** hints |
| **Direct-sidecar operator** | `sidecar/` , `gateway/` compose, or `compose.direct.yaml` | `MCP_TOKEN`, `PHONE_TOKEN`, pairing database, optional Firebase for **request** hints |
| **Publisher / developer** | CopyTrading or Prediction template, or an independent backend | `BROADCAST_CREDENTIAL`, `PUBLISHER_API_TOKEN` or `GATEWAY_TOKEN` |
| **App user** | SAC on the phone | None of the above |

The shared gateway never holds `MCP_TOKEN`. A publisher never mounts Firebase credentials. A feed never receives device credentials.

## Two “gateway” directories

- **`broadcast/`** — shared gateway for feeds and private invitations. This is what docs mean by gateway next to *feed*, *broadcast*, or *invitation*.
- **`gateway/`** — reverse proxy in front of **one owner sidecar**. Next to *self-hosting* or *direct*.

`deploy/server/` packages the shared stack, optional demo publishers, and a **separate** direct sidecar compose file.

## Suggested order

1. Operator brings up the shared gateway and proves unary + stream health.
2. Developer registers a server ID and publishes.
3. Owner adds a feed or confirms an invitation in SAC.
4. Separately, the owner may pair a **direct** sidecar for agents — different URL, port, and credential.
