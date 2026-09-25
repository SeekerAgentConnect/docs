---
title: Direct Server SDK
excerpt: "@seeker-vault/server-sdk is the embeddable TypeScript engine of a direct server: pairing, the request lifecycle, SQLite persistence, and the phone-facing Connect services. MCP is a host, not part of it."
hidden: false
---

`@seeker-vault/server-sdk` is the TypeScript engine behind a server that one phone pairs with directly. Your backend calls it in-process to create, read, cancel, and observe requests; the owner's phone pairs with and calls the Connect API it mounts. The SDK never holds a wallet key, approves, signs, or broadcasts.

It is a **private package**, version `0.1.0`, not published to npm. Install it from a packed tarball or from a checkout:

```sh
pnpm --filter @seeker-vault/server-sdk run build
npm pack --json ./server-sdk --pack-destination /absolute/reviewed/directory
# in your own project
npm install --ignore-scripts /absolute/reviewed/directory/seeker-vault-server-sdk-0.1.0.tgz
```

Runtime: Node.js `>=24.21.0 <25`, ESM only. Two entry points, and no other subpath is supported:

| Import | Contents |
| --- | --- |
| `@seeker-vault/server-sdk` | `openDirectServer`, `startPhoneApi`, `privateRequest`, pairing-link helpers, provider and relay types, bounds |
| `@seeker-vault/server-sdk/protocol` | The generated protobuf messages and service descriptors (`ActionSchema`, `AckActionSchema`, `RequestState`, …) |

Importing either does nothing: no file, port, `.env`, signal handler, timer, Firebase, Solana, or MCP.

## `openDirectServer` and the lifecycle

`openDirectServer(options)` explicitly opens and migrates the SQLite file and returns one `DirectServer`.

| Option | Required | Meaning |
| --- | --- | --- |
| `databasePath` | yes | The durable SQLite file. No default is chosen for you |
| `publicOrigin` | yes | The origin placed in pairing codes and the direct manifest (HTTPS off loopback) |
| `requestTtlSeconds`, `pendingLimit`, `pairingTokenTtlSeconds`, `liveCommandTimeoutSeconds` | yes | The request and pairing limits |
| `log` | yes | `(message: string) => void` |
| `transferProvider`, `stakingProvider`, `confirmationProvider` | no | Read-only chain adapters. Absent means those actions are not served or confirmed |
| `invalidationSender` | no | Your own Firebase delivery |
| `relay` | no | `{ relayUrl, serverId, credential }` — the [gateway push relay](/docs/push-relay). Refused together with `invalidationSender` |
| `now`, `updatePollMs` | no | Clock and update polling |

The returned `DirectServer` has `serverId`, `databasePath`, `databaseSchemaVersion`, `manifest`, `requests`, `pairing`, `liveCommands`, `phoneHandler(options)`, `beginShutdown()`, and `close()`.

Shut down in this order: stop accepting host traffic, `beginShutdown()` (cancels live and update streams, keeps SQLite open for in-flight responses), close your listener, unsubscribe observers, `await close()` (drains queued invalidations, closes SQLite; safe to call twice).

## What the SDK owns, and what you supply

| SDK | Host (you) |
| --- | --- |
| Request identity, validation, idempotency, lifecycle, expiry, cancellation, prepared versions, result binding, signature verification | Process entry, environment, signals, health, logging, TLS, ingress |
| The SQLite schema and migrations; one paired phone; the phone credential; revocation | MCP transport, tools, `MCP_TOKEN` / OAuth — never passed to the SDK |
| The direct manifest and the phone's `PairingService`, `RequestService`, `UpdateService` | Concrete Solana RPC, transaction building and comparison |
| Live updates, result observation, content-free invalidation scheduling | Firebase delivery and its credentials, or the relay credential |
| The pairing landing page and fragment codec | A QR renderer, if you show one |

The SDK has no API that submits a phone result, approves, opens a wallet, signs, or broadcasts. Those stay behind the authenticated phone API.

## Mounting the phone API

`startPhoneApi(server, { host, port })` starts a small HTTP listener and returns `{ url, close() }`. It mounts the unary services and no update stream, so the phone has no live updates and refreshes by hand. For live updates, mount `server.phoneHandler({ includeUpdates: true, updateUrl })` on your own HTTP/2 listener (native TLS, or h2c behind a TLS-terminating HTTP/2 platform). Never put the `UpdateService` behind an HTTP/1 reverse proxy. See [direct ingress](/docs/direct-sidecar-proxy).

## Requests: `server.requests`

| Call | Does |
| --- | --- |
| `createRequest(privateRequest(action, description, idempotencyKey, expiresInSeconds?))` | Stores a private request; returns `{ request, created }`. Storing is not approval |
| `get(requestId)` | The request as it is now |
| `cancel(requestId)` | Withdraws a PENDING request; any other state fails |
| `observe(requestId, listener)` | Calls back on every committed revision; returns an unsubscribe function; starts no polling |
| `replayOf(idempotencyKey, action)` | The request a key already stands for, or `undefined` |
| `connectedWallet()` / `activeWallet()` | The paired phone's wallet binding; the second throws a `RequestFailure` when there is none |
| `transfers?`, `staking?`, `confirmations?` | Present only when you supplied the matching provider |

Failures are `RequestFailure` with a `RequestError` (`NOT_PAIRED`, `WALLET_NOT_CONNECTED`, `IDEMPOTENCY_CONFLICT`, `INVALID_STATE`, …).

## Pairing: `server.pairing`

`issue()` returns `{ uri, token, serverUrl, serverId, expiresAtMs, replaces }`; `active()` the paired phone (`connectionId`, `deviceName`, `pairedAtMs`) or `undefined`; `revoke(connectionId)` returns `{ revoked, cancelled }`. One paired phone per server: pairing again revokes the previous one and cancels its PENDING requests.

Link helpers: `pairingUri(code)`, `pairingHttpsUrl(code)`, `parsePairingUri(text)`, `pairingLandingUrl(issued)` (`https://<origin>/pair#<fragment>`, token in the fragment), `pairingLinkView(issued)` (`pairing_uri`, `https_url`, `server_url`, `expires_at`, `replaces`, `warning`), `humanPairingLink(view)`, and `handlePairingLink(req, res, { publicOrigin, identity? })`, which serves `/pair` and its four assets. The page never pairs on its own; a truncated fragment is refused as damaged.

## Persistence

One SQLite file, the same schema the MCP server uses. Reopening it preserves the server ID, phone credential, wallet binding, idempotency records, prepared versions, results, revisions, and snapshots. Back it up before an update; never run an older binary against a schema it reports as newer.

## Minimal example

```ts
import { create } from "@bufbuild/protobuf";
import { openDirectServer, privateRequest, startPhoneApi } from "@seeker-vault/server-sdk";
import { AckActionSchema, ActionSchema } from "@seeker-vault/server-sdk/protocol";

const server = openDirectServer({
  databasePath: "/var/lib/my-server/direct.db",
  publicOrigin: "https://direct.example.com",
  requestTtlSeconds: 86_400,
  pendingLimit: 100,
  pairingTokenTtlSeconds: 600,
  liveCommandTimeoutSeconds: 30,
  log: (message) => console.info(`[direct] ${message}`),
});
const phoneApi = await startPhoneApi(server, { host: "127.0.0.1", port: 8080 });

const pairing = server.pairing.issue();
console.info(`Show this once to the owner: ${pairing.uri}`);

const action = create(ActionSchema, {
  kind: { case: "ack", value: create(AckActionSchema, { text: "Review this request" }) },
});
const created = server.requests.createRequest(
  privateRequest(action, "Review this request", "example-1", 300),
);
const stopObserving = server.requests.observe(
  created.request.ref?.requestId ?? "",
  (request) => console.info(`Request is now ${request.state}`),
);

server.beginShutdown();
await phoneApi.close();
stopObserving();
await server.close();
```

The runnable source is `server-sdk/examples/minimal.ts`. It imports no MCP package: the MCP server is one host of this SDK, and MCP tokens belong to it.
