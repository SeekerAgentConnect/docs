---
title: Build on the Server SDK
excerpt: The TypeScript engine behind the MCP server, for a direct server of your own. Pairing, requests, results, and phone wake-ups come with it.
hidden: false
---

`@seeker-vault/server-sdk` is what the MCP server is built on. Use it when your backend should talk to a paired phone directly, without MCP: create requests in-process, observe them, read the results. The SDK owns pairing, the request lifecycle, storage in one SQLite file, the phone-facing API, live updates, and the pairing page. Your code owns the transport, the business logic, and any chain access.

The package is private for now. Build and pack it from the checkout, then install the tarball:

```sh
pnpm --filter @seeker-vault/server-sdk run build
npm pack ./server-sdk --pack-destination ./artifacts
npm install ./artifacts/seeker-vault-server-sdk-0.1.0.tgz @bufbuild/protobuf
```

Node 24, ESM. Two imports: `@seeker-vault/server-sdk` and `@seeker-vault/server-sdk/protocol`.

## Open a server

```ts
import { openDirectServer, startPhoneApi, privateRequest, pairingLandingUrl }
  from "@seeker-vault/server-sdk";

const server = openDirectServer({
  databasePath: "/var/lib/my-server/direct.db",
  publicOrigin: "https://direct.example.com",   // what pairing links point at
  requestTtlSeconds: 86_400,
  pendingLimit: 100,
  pairingTokenTtlSeconds: 600,
  liveCommandTimeoutSeconds: 30,
  log: console.info,
});
const phoneApi = await startPhoneApi(server, { host: "127.0.0.1", port: 8080 });
```

Opening migrates the file and fixes the server ID. Reopening it keeps the pairing and every request.

## Pair the phone

```ts
const issued = server.pairing.issue();
console.info(issued.uri);                   // seekervault://pair?…
console.info(pairingLandingUrl(issued));    // https://direct.example.com/pair#…
```

Serve the page at `/pair` with `handlePairingLink(req, res, { publicOrigin })`, or show the URI as a QR. One paired phone per server; `server.pairing.active()` tells you which, `revoke()` ends it.

## Create, observe, read

```ts
import { create } from "@bufbuild/protobuf";
import { ActionSchema, AckActionSchema } from "@seeker-vault/server-sdk/protocol";

const action = create(ActionSchema, {
  kind: { case: "ack", value: create(AckActionSchema, { text: "Deploy finished. OK?" }) },
});
const { request } = server.requests.createRequest(
  privateRequest(action, "First request", "my-backend-0001", 600),
);
const stop = server.requests.observe(request.ref!.requestId, (r) => console.info(r.state));
```

`createRequest` stores; it does not approve. The listener runs on every change the phone makes. `get(id)` reads the request with its outcome; `cancel(id)` withdraws a pending one. A message signature is a `sign_message` action with the wallet from `server.requests.activeWallet()`. Transfers and staking are served only when you pass a `transferProvider` or `stakingProvider`.

## Wake the phone

Register your server with the gateway ([the flow](/docs/how-it-works#registering-a-server-with-the-gateway)) and pass the three values:

```ts
openDirectServer({ /* … */, relay: { relayUrl, serverId, credential } });
```

The SDK advertises the relay to the phone, stores the handle the phone gives back, and sends a content-free wake-up after every change. Nothing about the request is relayed.

## Live updates

`startPhoneApi` serves the unary API only, so the phone refreshes by hand. For live updates, mount `server.phoneHandler({ includeUpdates: true, updateUrl })` on an HTTP/2 listener. Never put that stream behind an HTTP/1 proxy.

## Shut down

`server.beginShutdown()`, close your listener, `await server.close()`.

The runnable version of this page is `server-sdk/examples/minimal.ts`; the full API is in `server-sdk/README.md`.
