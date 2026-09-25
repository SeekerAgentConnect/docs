---
title: Build a direct server
excerpt: From an empty backend to a reviewed request on the phone with the Direct Server SDK — install, open, pair, create, observe, read the result, revoke.
hidden: false
---

This walkthrough builds a **direct** server on `@seeker-vault/server-sdk`. One phone pairs with it, it sends that phone private requests, and declared results return to it. If you would rather not write a host, the shipped [MCP server](/docs/direct-sidecar-walkthrough) is this walkthrough already packaged; what it does at each step is noted.

Direct connections are always production. The server never holds a key; the owner reviews on the phone and Seed Vault Wallet signs.

## Prerequisites

- Node.js 24.21 or newer (below 25), and the SDK tarball packed from a checkout ([how](/docs/direct-server-sdk)).
- A public HTTPS origin the phone can reach, such as `https://direct.example.com`, with a normally trusted certificate. Loopback HTTP works only for a debug phone with `adb reverse`.
- SAC on the owner's phone.

```sh
npm install --ignore-scripts ./seeker-vault-server-sdk-0.1.0.tgz @bufbuild/protobuf
```

## 1. Open the server

```ts
import { create } from "@bufbuild/protobuf";
import {
  handlePairingLink, isPairingLinkPath, isTerminal, openDirectServer,
  pairingLandingUrl, privateRequest,
} from "@seeker-vault/server-sdk";
import { AckActionSchema, ActionSchema } from "@seeker-vault/server-sdk/protocol";
import { createServer } from "node:http";

const publicOrigin = "https://direct.example.com";
const direct = openDirectServer({
  databasePath: "/var/lib/my-server/direct.db",   // a durable directory you own
  publicOrigin,
  requestTtlSeconds: 86_400,
  pendingLimit: 100,
  pairingTokenTtlSeconds: 600,
  liveCommandTimeoutSeconds: 30,
  log: (message) => console.info(`[direct] ${message}`),
});
```

Opening migrates the file and fixes the server ID (`direct.serverId`). Reopening the same file later keeps the pairing and every request.

## 2. Listen for the phone

```ts
const handler = direct.phoneHandler();
createServer((req, res) => {
  if (isPairingLinkPath(new URL(req.url ?? "/", publicOrigin).pathname)) {
    handlePairingLink(req, res, { publicOrigin });   // GET /pair and its four assets
    return;
  }
  handler(req, res);
}).listen(8080, "127.0.0.1");
```

Your ingress terminates TLS for `direct.example.com` and forwards to `127.0.0.1:8080`. This listener serves the unary services; live updates need `phoneHandler({ includeUpdates: true, updateUrl })` on an HTTP/2 listener, never behind an HTTP/1 proxy ([direct ingress](/docs/direct-sidecar-proxy)). Without it the phone has no live updates and refreshes by hand. `startPhoneApi(direct, { host, port })` is the shortcut when you do not serve the page.

## 3. Issue a pairing code

```ts
const issued = direct.pairing.issue();
console.info(issued.uri);                  // seekervault://pair?v=1&url=…&server=…&token=…
console.info(pairingLandingUrl(issued));   // https://direct.example.com/pair#<fragment>
```

The URI is the code the owner scans, pastes, or types. The HTTPS link opens the page you mounted in step 2: a QR code, an **Open Seeker Agent Connect** button, and a copy fallback. The page pairs nothing by itself. The token lives in the URL fragment, so it never reaches your access log. Show the whole link; a truncated fragment is refused as damaged. Rendering a QR in your own terminal is your job; the SDK ships no renderer. A code lasts `pairingTokenTtlSeconds`, and a newer one voids an unused one. If a phone is already paired, `issued.replaces` names it: pairing with this code will disconnect that phone.

*MCP server:* `pnpm pair` prints the QR, the URI, and the link; an agent calls `vault_create_pairing_link`.

## 4. Pair in SAC

The owner opens **Add connection**, scans or pastes the code (or opens the HTTPS link and taps its button), reads the confirmation, and confirms. Nothing is stored until then, and connecting selects no wallet and authorizes no signing.

```ts
const phone = direct.pairing.active();   // { connectionId, deviceName, pairedAtMs } or undefined
```

One paired phone per server. The owner then connects a wallet in the app, and the phone publishes it to you; `direct.requests.connectedWallet()` reads it.

## 5. Create a request

Through the SDK's `AgentRequests` seam, `direct.requests`. An acknowledgement needs no wallet and is the smallest request the phone reviews:

```ts
const action = create(ActionSchema, {
  kind: { case: "ack", value: create(AckActionSchema, { text: "Deploy finished. OK?" }) },
});
const created = direct.requests.createRequest(
  privateRequest(action, "First request from my backend", "my-backend-0001", 600),
);
const requestId = created.request.ref?.requestId ?? "";
```

`created.created` is false when the idempotency key already stood for a request: a retry returns the original and stores nothing. The request is PENDING, not approved. With no phone paired this throws a `RequestFailure` with `NOT_PAIRED`.

A message signature is the first wallet action: build a `SignMessageActionSchema` with `wallet` from `direct.requests.activeWallet()` and `content: { case: "text", value: "…" }`. Transfers and staking are served only when you passed a `transferProvider` or `stakingProvider`; the MCP server does that with `SOLANA_RPC_URL`.

## 6. Observe the lifecycle

```ts
const stop = direct.requests.observe(requestId, (request) => {
  console.info(request.state, request.outcome?.detail);
});
```

The listener runs on every committed revision, after the phone's `SubmitResult` lands: `PENDING` → `COMPLETED` or `REJECTED` for an acknowledgement; `PENDING` → `PROCESSING` → `COMPLETED` for a signature; `PROCESSING` → `SUBMITTED` → `CONFIRMED` for a transaction. See [request lifecycle](/docs/request-lifecycle).

## 7. Read the result

```ts
const request = direct.requests.get(requestId);
if (isTerminal(request.state)) {
  console.info(request.outcome?.signature, request.outcome?.detail);
}
```

`outcome.signature` is the wallet's Ed25519 signature for a message (verified by the SDK against the request's wallet) or the transaction's ID on chain. `SUBMITTED` is not success: confirmation runs only when a `confirmationProvider` is configured and somebody reads the request. `UNKNOWN` is not terminal and must never be retried.

*MCP server:* `vault_get_request` until `terminal` is true.

## 8. Cancel and revoke

```ts
direct.requests.cancel(requestId);            // PENDING only; otherwise INVALID_STATE
direct.pairing.revoke(phone.connectionId);    // { revoked, cancelled }
```

Revoking ends the phone credential at once, deletes its push target, and cancels its PENDING requests. The owner can do the same from the phone. Then `direct.beginShutdown()`, close the listener, `stop()`, `await direct.close()`.

## What the SDK does not do here

No TLS, no health endpoint, no agent-facing API, no QR image, no Firebase. To wake a backgrounded phone without a Firebase project, add the [gateway push relay](/docs/push-relay).
