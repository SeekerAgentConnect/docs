---
title: Manifest contract
excerpt: seekervault.server.v1.ServerManifest states identity, protocol version 1, settings revision, one of two modes, required plugins, environments, and a single reference.
hidden: false
---

Package `seekervault.server.v1` in `proto/seekervault/server/v1/manifest.proto`. Every kind of server publishes one: a direct server answers it over `PairingService.GetServerManifest`, and a publisher registers it with `PublisherService.PublishManifest` so phones read it from `FeedService.GetServerManifest`.

## Fields

| Field | Number | Constraint |
| --- | --- | --- |
| `server_id` | 1 | Lowercase UUID. The one in the pairing code, or the publisher's own. A manifest can never move a connection to another server |
| `protocol_version` | 2 | `1`. Zero is never published; a version the app does not speak is reported as unsupported, not rounded |
| `settings_revision` | 3 | Changes whenever anything else does, never goes backwards. It counts settings changes, not software versions |
| `mode` | 4 | `CONNECTION_MODE_DIRECT` (1) or `CONNECTION_MODE_GATEWAY_FEED` (2). Never absent, never inferred |
| `required_plugins` | 5 | At most 16 `PluginRequirement`s. Empty means the server needs none |
| `environments` | 6 | `SERVER_ENVIRONMENT_PRODUCTION`, `SERVER_ENVIRONMENT_SANDBOX`, or both; at most one of each |
| `display_name` | 7 | Optional, at most 64 UTF-8 bytes of printable text. Never verified; the owner can rename the connection |
| `oneof reference` | 8 or 9 | `direct` (`DirectServer`) when mode is direct; `feed` (`GatewayFeed`) when mode is gateway feed. Mode and reference must agree |

Field 10 and the name `gateway_private` are reserved, as are enum value 3 and `CONNECTION_MODE_GATEWAY_PRIVATE`. Older stored manifests that carry them decode only as unsupported history. See [Connection modes](/docs/connection-modes).

The reference is deliberately the last field, so cross-runtime fixtures can compare serialized bytes.

## Reference messages

```text
message DirectServer  { string url = 1; }                          // HTTPS, no user info, query, or fragment
message GatewayFeed   { string gateway_url = 1; string channel = 2; }
message PluginRequirement { string plugin_id = 1; uint32 min_contract = 2; uint32 max_contract = 3; }
```

- `DirectServer.url` must be the origin the phone paired with. It confirms a URL and can never change one. Loopback HTTP is accepted only in development builds.
- `GatewayFeed.gateway_url` is the gateway's public origin, compared character for character with the reference the feed was added from. `channel` must be `server/<server_id>`; the gateway refuses `foreign_channel`, and the phone checks it again. The publisher's own address is absent on purpose.
- `PluginRequirement.plugin_id` is lowercase dot-separated segments, at most 128 bytes, at least one dot: a name, never a URL or package. `min_contract` is at least 1 and at most `max_contract`. Manifests still name the legacy plugin IDs `jupiter.swap` and `jupiter.prediction` at contract `1..1`; the phone resolves both to its `jupiter` execution provider.

## Rules the gateway and the phone enforce

- A connection never changes mode, and a missing mode is refused rather than read as a feed.
- The environment set of a server ID cannot change after its first publication (`GATEWAY_PROBLEM_OTHER_ENVIRONMENT`). A second environment is a second deployment with its own ID, credential, and database.
- The gateway accepts only `CONNECTION_MODE_GATEWAY_FEED` manifests naming its own origin (`not_a_feed`, `other_gateway`).
- The phone caches by identity and revision: same revision and content, nothing changes; higher revision, re-read; lower, `stale_revision`; same revision with different content, `changed_without_revision`.

Phone-side refusal codes (`ManifestProblem`): `no_protocol`, `bad_server_id`, `other_server`, `no_mode`, `other_mode`, `bad_reference`, `bad_endpoint`, `other_endpoint`, `foreign_channel`, `no_revision`, `stale_revision`, `changed_without_revision`, `bad_plugin`, `duplicate_plugin`, `too_many_plugins`, `bad_environment`, `bad_name`.

## Support states

Reported in this order and never cached, because a verdict depends on the build running now:

| State | Meaning | Executable |
| --- | --- | --- |
| `ManifestRefused` | The manifest broke a rule above | No |
| `ProtocolUnsupported` | A contract this build does not speak: update the app | No |
| `EnvironmentUnsupported` | The server does not serve the environment this connection keeps | No |
| `PluginMissing` | This build carries no plugin with a required ID | No |
| `PluginIncompatible` | It carries one, at a contract outside the required range | No |
| `Supported` | Everything required is here | Yes |
| `LegacyDirect` | A direct server that publishes no manifest (`unimplemented`) | Yes |
| `Unknown` | Not asked yet; only possible for a direct connection | Yes |

Unsupported servers remain readable and rejectable; approval is not offered and nothing is prepared. See [Manifests](/docs/manifests) and [Environments and networks](/docs/environments).
