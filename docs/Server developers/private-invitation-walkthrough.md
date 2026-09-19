---
title: Private invitation to result
excerpt: Register the backend, create an SDK invitation, let the owner confirm in SAC, send a request to that exact binding, and read the declared result.
hidden: false
---

This walkthrough is for an **independent server**. The owner does not run a sidecar for you. Public feeds and direct pairing remain separate paths.

**Creating or opening an invitation does not authorize wallet operations.** The owner still reviews, supplies owner inputs, and — in production — confirms in Seed Vault Wallet.

## Prerequisites

- A running [shared broadcast gateway](/docs/shared-gateway) whose public origin you know exactly (`https://gateway.example.com`, including scheme and port).
- Operator registration of **your** lowercase UUID. You receive a publisher credential **once**.
- Go 1.27.1 or newer.
- Backend secret storage for `GATEWAY_TOKEN`. Never render it to a browser.
- SAC installed on the owner’s phone. For swap/prediction, the build must include those plugins (the shipped app does).

Gateway-operator steps (register, TLS, listeners) are not this walkthrough. See [Operators](/docs/roles).

Placeholders used below:

```sh
export GATEWAY_URL=https://gateway.example.com
export GATEWAY_TOKEN=replace-with-publisher-credential
export SERVER_ID=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
```

## 1. Register the server

Ask the gateway operator, or if you operate the gateway yourself:

```sh
cd broadcast
go run ./cmd/broadcastctl register --database ./broadcast.db \
  --server 3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d --label "independent server"
```

Put the shown credential in backend secret storage. Send it only as `Authorization: Bearer` to the publisher listener.

## 2. Publish a private manifest

```go
gateway, err := sdk.NewGateway(sdk.GatewayOptions{
    URL:      os.Getenv("GATEWAY_URL"),
    Token:    os.Getenv("GATEWAY_TOKEN"),
    ServerID: os.Getenv("SERVER_ID"),
})

_, err = gateway.PublishServerManifest(ctx, &serverv1.ServerManifest{
    ServerId:         os.Getenv("SERVER_ID"),
    ProtocolVersion:  1,
    SettingsRevision: 1,
    Mode:             serverv1.ConnectionMode_CONNECTION_MODE_GATEWAY_PRIVATE,
    Reference: &serverv1.ServerManifest_GatewayPrivate{
        GatewayPrivate: &serverv1.GatewayPrivate{GatewayUrl: os.Getenv("GATEWAY_URL")},
    },
    RequiredPlugins: []*serverv1.PluginRequirement{{
        PluginId: "jupiter.swap", MinContract: 1, MaxContract: 1,
    }},
    Environments: []serverv1.ServerEnvironment{
        serverv1.ServerEnvironment_SERVER_ENVIRONMENT_SANDBOX,
    },
    DisplayName: "Trading bot",
})
```

The origin must equal `BROADCAST_PUBLIC_URL`. Mode and served environments cannot change on a later revision.

SAC starts the connection in **sandbox** whenever sandbox is offered, otherwise production. The owner may switch only among environments the manifest names.

## 3. Create an invitation and share it

```go
invite, err := gateway.CreateInvitation(ctx, "onboarding-session-42", 15*time.Minute)
// share invite.GetInvitationUrl()  — hosted page
// or encode invite.GetAppUri()     — QR / Open in SAC
```

Use a server-scoped opaque reference, not a wallet address. A new onboarding session ID is a good default.

The hosted page already renders a QR, an **Open in SAC** button, and install guidance. For a bot or CLI, print the URL. For a website, return the URL from an **authenticated backend** endpoint. Do not proxy `GATEWAY_TOKEN` into browser code.

Zero lifetime selects 15 minutes. Allowed range: 1 minute through 24 hours.

Page views, QR image requests, SAC previews, and cancellation **do not** bind a device. If the session is cancelled, call `RevokeInvitation`. A completed invitation is a connection: revoke it with `RevokeConnection`.

## 4. Owner confirms in SAC

1. Open **Add connection**.
2. Scan the QR or paste `seekervault://invite?…`, or tap **Open in SAC** from the hosted page.
3. Read **Connect to this server?** Connecting lets this server send private requests to this device through the gateway. It does not share a wallet, grant signing, approve a request, or expose history.
4. Tap **Connect**.

## 5. Observe completion on the backend

```go
status, err := gateway.WaitForConnection(ctx, invite.GetInvitationId(), time.Second)
switch status.GetStatus() {
case gatewayv1.InvitationStatus_INVITATION_STATUS_CONNECTED:
    connectionID := status.GetConnectionId()
    // store beside "onboarding-session-42"
case gatewayv1.InvitationStatus_INVITATION_STATUS_EXPIRED:
    // create a new invitation; never reuse this one
}
```

There is no browser callback. Store `connection_id` beside the user reference. It is the durable target for **this device**.

## 6. Send a request to that exact binding

```go
record, err := gateway.SendRequest(ctx, sdk.PrivateRequest{
    RequestID:         requestID,
    Revision:          1,
    UserRef:           "onboarding-session-42",
    ConnectionID:      connectionID,
    ExpiresAt:         time.Now().Add(10 * time.Minute),
    Title:             "Review swap",
    Description:       "Strategy rebalance",
    CapabilityID:      "swap",
    CapabilityVersion: 1,
    PluginID:          "jupiter.swap",
    Parameters:        swapParameters,
    OwnerInputs:       swapOwnerInputs,
})
```

Use plugin parameters from [Jupiter swap](/docs/jupiter-swap) or [Jupiter prediction](/docs/jupiter-prediction). Prediction uses `prediction` / `jupiter.prediction`.

The gateway pins the request to that binding. A missing, revoked, foreign, or user-mismatched connection is `NO_BINDING`. It never falls back to another device.

Repeating the same revision with identical content is unchanged. Changing content without raising the revision is a conflict. `CancelRequest` raises the revision and closes the source request.

An MCP tool on **your** backend may call the same `SendRequest`. MCP does not receive a device credential and cannot confirm, approve, select a wallet, or sign.

## 7. Owner reviews; you read the result

On the phone the owner enters [owner inputs](/docs/owner-inputs), prepares, inspects bytes, sees [rules](/docs/rules), and then:

- **Sandbox:** **Simulate**. Wallet never opens. Activity: **Simulated**.
- **Production:** **Approve and swap** (or the prediction equivalent), then confirm in the wallet.

Poll:

```go
record, err := gateway.Request(ctx, requestID)
```

The result returns only because the envelope carries `RESULT_MODE_RETURN_TO_ORIGIN`. A public feed never does this. You receive declared owner inputs and the final outcome — not a device credential, wallet authorization, prepared bytes, or Activity history.

Terminal conflict: `RESULT_CONFLICT`. Never ask the wallet again.

## 8. Extra devices and revocation

Every additional device needs a fresh invitation. The same `user_ref` is allowed; each confirmation creates a **distinct** `connection_id`. Store each ID and choose it explicitly in `SendRequest`.

SAC **Disconnect** revokes only that device. `RevokeConnection` does the same from the server. Siblings remain active.

## Runnable examples

From the `publisher` module:

```sh
cd publisher
GATEWAY_URL=https://gateway.example.com \
GATEWAY_TOKEN="$GATEWAY_TOKEN" \
SERVER_ID=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d \
go run ./examples/gateway-onboarding --kind trading --environment sandbox \
  --user account-42 --wait --send
```

Website form (credential stays in the process):

```sh
SERVER_KIND=trading SERVER_ENVIRONMENT=sandbox LISTEN_ADDR=127.0.0.1:8090 \
go run ./examples/gateway-website
```

`--kind` may be `trading`, `prediction`, or `mcp`. Production is `--environment production` or `SERVER_ENVIRONMENT=production`. Defaults are sandbox.

See [Examples](/docs/examples) for the request bodies those flags send.

## Troubleshooting

| Code / symptom | What to do |
| --- | --- |
| `INVITATION_EXPIRED` | Create a fresh invitation; never recycle the token |
| `INVITATION_USED` | Redemption already happened; poll status by ID |
| Revoked invite looks like `INVALID_INVITATION` | Expected; only the backend knows it revoked |
| `NO_BINDING` | Use the connection ID returned for **this** invitation |
| `RESULT_CONFLICT` | A terminal outcome already stands |
| Page opens but SAC cannot connect | Manifest mode and gateway origin must match the page origin, including scheme and port |
