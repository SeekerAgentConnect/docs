---
title: Manifests and capabilities
excerpt: A server manifest is the validated statement of who you are, which mode you use, and which plugins the phone must already contain.
hidden: false
---

A **server manifest** is protobuf `seekervault.server.v1.ServerManifest`. Every kind of server publishes one. The phone validates it before anything from that server can be executed.

Templates build and publish a feed manifest from configuration. Independent servers call `PublishServerManifest`. You do not install code through a manifest.

## Fields

| Field | Rule |
| --- | --- |
| `server_id` | Lowercase UUID |
| `protocol_version` | `1` in this release. Zero is never published |
| `settings_revision` | Increases when anything else changes. Never goes backwards |
| `mode` | `direct`, `gateway_feed`, or `gateway_private`. Never absent, never inferred |
| `required_plugins` | At most 16 IDs, each with a contract range |
| `environments` | `production`, `sandbox`, or both — what the **server serves** |
| `display_name` | Optional, bounded, unverified |
| Reference | One of `direct` (URL), `feed` (gateway origin + `server/<server_id>`), or `gateway_private` (gateway origin only) |

The reference must match the mode. A feed channel must be `server/<your server_id>`. A private manifest’s gateway origin must equal the gateway’s public origin, including scheme and port.

A manifest has **no** field that installs code, asks for a permission, carries a policy, or names a wallet endpoint.

## Plugins

Shipped client plugins:

| Plugin ID | Capability ID | Contract |
| --- | --- | --- |
| `jupiter.swap` | `swap` | 1 |
| `jupiter.prediction` | `prediction` | 1 |

A plugin ID is a lowercase dotted name, not a URL. The phone matches it against code **already compiled** into the build. Missing or incompatible plugins make the server unexecutable: the owner can still read and reject, but there is no Approve button to overrule that.

## What the phone does with a revision

- Same revision, same content — nothing changes
- Higher revision — replace the cached manifest
- Lower revision — refuse (`stale_revision`)
- Same revision, different content — refuse (`changed_without_revision`)

Unreachable is not an answer: the previous record stays.

**Support is not cached.** Installing a build that adds a plugin must be able to change the verdict.

A `protocol_version` this build does not speak is “update the app”, not a malformed server. Version zero is malformed.

## Mode and environments cannot silently change

Once a server ID has published a mode and an environment set, a later revision cannot switch them. Use a distinct server ID for a different deployment promise. The gateway refuses `other_environment`.

A connection records which environment the **owner keeps**. Feeds start in sandbox when the publisher offers it. Direct sidecar connections are always production.

## Legacy direct

A sidecar that answers `UNIMPLEMENTED` to `GetServerManifest` is a documented path: no manifest, no required plugins, same pairing and request store as before.
