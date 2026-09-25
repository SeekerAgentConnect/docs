---
title: Manifests and capabilities
excerpt: A server manifest is the validated statement of who you are, which of the two modes you use, and which bundled client plugins the phone must already contain.
hidden: false
---

A **server manifest** is protobuf `seekervault.server.v1.ServerManifest`. Every server publishes one. The phone validates it before anything from that server can be executed.

A direct server built on the [SDK](/docs/direct-server-sdk) publishes its own; the demos build a feed manifest from configuration; a plain-HTTP publisher sends one with `PublisherService.PublishManifest`. You do not install code through a manifest.

## Fields

| Field | Rule |
| --- | --- |
| `server_id` | Lowercase UUID: the one in a pairing code, or the registered publisher ID |
| `protocol_version` | `1`. Zero is never published. A version this build does not speak is "update the app", not a malformed server |
| `settings_revision` | Increases when anything else changes. Never goes backwards |
| `mode` | `CONNECTION_MODE_DIRECT` (1) or `CONNECTION_MODE_GATEWAY_FEED` (2). Never absent, never inferred. Value 3 is reserved for the retired private mode |
| `required_plugins` | At most 16 `PluginRequirement { plugin_id, min_contract, max_contract }` |
| `environments` | `production`, `sandbox`, or both — what the **server serves** |
| `display_name` | Optional, at most 64 bytes, never verified |
| Reference | One of `direct { url }` or `feed { gateway_url, channel }`. Field 10 (`gateway_private`) is reserved |

The reference must match the mode. A manifest has **no** field that installs code, asks for a permission, carries a policy, or names a wallet endpoint.

### Direct

The SDK builds and serves it for you over `PairingService.GetServerManifest`: mode `direct`, `url` = your configured public origin, `environments` = production only, no required plugins, no display name (a direct connection is labelled by the host the owner paired with). The revision moves when those settings change. A server that answers `UNIMPLEMENTED` is the documented **legacy direct** path: no manifest, nothing required, same pairing and request store.

### Feed

Published to the gateway and resolved by the phone from the gateway, never from you. `gateway_url` must equal the gateway's `BROADCAST_PUBLIC_URL` character for character (`other_gateway`), `channel` must be `server/<your server_id>` (`foreign_channel`), and the server ID must be the one your credential resolves to (`other_server`). The gateway refuses a direct manifest: relaying one would let a publisher point phones at an address of its choosing.

## Plugins and capabilities

A request's `action` names a versioned capability (`capability_id`, `capability_version`) and the bundled plugin it is written for (`plugin_id`). The manifest says which plugins, at which contract range.

| Manifest `plugin_id` | `capability_id` | `capability_version` | Contract | On the phone |
| --- | --- | --- | --- | --- |
| `jupiter.swap` | `swap` | 1 | 1 | Execution provider `jupiter` |
| `jupiter.prediction` | `prediction` (also `prediction.buy`) | 1 | 1 | Execution provider `jupiter` |

The two plugin names are legacy spellings served by one provider. Nothing on the wire changed: publish `min_contract` 1 and `max_contract` 1. A plugin ID is a lowercase dotted name, never a URL, and is matched against code **already compiled** into the build. Missing or incompatible plugins make the server unexecutable: the owner can read and reject, but there is no Approve button to overrule that.

A direct manifest lists no plugins. Its actions — `ack`, `sign_message`, `transfer`, `swap`, `staking` — are carried out by the app itself.

## What the phone does with a revision

- Same revision, same content — nothing changes
- Higher revision — replace the cached manifest
- Lower revision — refuse (`stale_revision`)
- Same revision, different content — refuse (`changed_without_revision`)

Unreachable is not an answer: the previous record stays.

**Support is not cached.** It is derived from the compiled plugin registry on every read, so installing a build that adds a plugin changes the verdict.

| Support state | Executable |
| --- | --- |
| `Supported`, `LegacyDirect`, `Unknown` (not asked yet) | Yes |
| `ManifestRefused`, `ProtocolUnsupported`, `EnvironmentUnsupported`, `PluginMissing`, `PluginIncompatible` | No; still readable, and the screen says which |

## Mode and environments cannot silently change

A connection never changes mode. Once a server ID has published an environment set, a later revision cannot switch it: the gateway refuses `other_environment`. Use a distinct server ID for a different deployment promise.

A connection records which environment the **owner keeps**. Feeds start in sandbox when the publisher offers it. Direct connections are always production. Sandbox is not a Solana network, and Jupiter sandbox is not devnet trading.
