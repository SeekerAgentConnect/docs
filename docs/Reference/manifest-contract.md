---
title: Manifest contract
excerpt: seekervault.server.v1.ServerManifest states mode, plugins, environments, and a single matching reference.
hidden: false
---

Package `seekervault.server.v1` in `proto/seekervault/server/v1/manifest.proto`.

| Field | Constraint |
| --- | --- |
| `server_id` | Lowercase UUID |
| `protocol_version` | `1`; never `0` |
| `settings_revision` | ≥ 1, never decreases |
| `mode` | `CONNECTION_MODE_DIRECT`, `_GATEWAY_FEED`, or `_GATEWAY_PRIVATE` |
| `required_plugins` | ≤ 16; each `plugin_id` + `min_contract` / `max_contract` ≥ 1 |
| `environments` | `PRODUCTION` and/or `SANDBOX` |
| `display_name` | Optional, ≤ 64 UTF-8 bytes |
| `oneof reference` | `Direct{url}`, `GatewayFeed{gateway_url, channel}`, or `GatewayPrivate{gateway_url}` |

`GatewayFeed.channel` must be `server/<server_id>`.

A connection cannot change mode. A server ID cannot change its environment set after the first publish (`GATEWAY_PROBLEM_OTHER_ENVIRONMENT`).

Phone support states: `Supported`, `PluginMissing`, `PluginIncompatible`, `ProtocolUnsupported`, `EnvironmentUnsupported`, `ManifestRefused`, `LegacyDirect`, `Unknown`. Unsupported servers remain readable; approval is not offered.

See [Manifests](/docs/manifests).
