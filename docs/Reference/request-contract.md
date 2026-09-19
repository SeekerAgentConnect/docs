---
title: Request contract
excerpt: seekervault.request.v2.Request is the source-authored envelope. Owner answers are not fields of this message.
hidden: false
---

Package `seekervault.request.v2` in `proto/seekervault/request/v2/request.proto`.

```text
message Request {
  uint32 contract_version = 1;
  RequestIdentity identity = 2;
  RequestLifecycle lifecycle = 3;
  Presentation presentation = 4;
  ActionCapability action = 5;
  repeated OwnerInput owner_inputs = 6;
  Audience audience = 7;
  ResultHandling result_handling = 8;
}
```

This release writes and executes `contract_version = 1` only. An unknown version stays readable and dismissible.

## Identity and lifecycle

- `source_id` — the server
- `scope` — e.g. `server/<id>` for a feed, `private/<id>` for a private request
- `request_id` — stable across revisions
- `revision` — monotonic for that identity
- `status` — source status. Feed adapters refuse processing/completed states that would imply one subscriber changed the broadcast document
- `expires_at` — absolute timestamp

## Presentation

`title` and `description` are unverified source text. `PRESENTATION_CATEGORY_REQUEST` or `PRESENTATION_CATEGORY_SIGNAL`. Signal is a label, not an action kind.

## Action and values

`ActionCapability`: `capability_id`, `capability_version`, `plugin_id`, `parameters`.

`Value` is a named `text`, `integer` (decimal string), `flag`, or `opaque`. Integers are strings so uint64 survives JSON.

## Owner inputs

`OwnerInput`: `key`, `label`, `kind` (`AMOUNT`, `COUNT`, `CHOICE`), `required`, optional `minimum` / `maximum`, `options`, `help`.

## Audience and results

- `PrivateAudience.recipient_id` — opaque server-scoped user reference
- `FeedAudience.channel` — `server/<server_id>`
- `RESULT_MODE_DEVICE_LOCAL` — required for a feed
- `RESULT_MODE_RETURN_TO_ORIGIN` — private adapters only

See [Request lifecycle](/docs/request-lifecycle) for adapters and compatibility APIs.
