---
title: Go Server SDK
excerpt: sdk.Client writes public-feed requests to a template. sdk.Gateway creates private invitations and routes common requests.
hidden: false
---

Package: `github.com/BrRenat/SeekerAgentWallet/publisher/sdk`  
Module: `github.com/BrRenat/SeekerAgentWallet/publisher`

Neither client knows a wallet, an approval, a phone store, or a plugin implementation.

## Feed client: `sdk.Client`

Talks to **your publisher template’s** JSON API, not to the gateway and not to SAC.

```go
client, err := sdk.New(sdk.Options{
    URL:   os.Getenv("PUBLISHER_API_URL"),   // e.g. http://127.0.0.1:8092
    Token: os.Getenv("PUBLISHER_API_TOKEN"), // template token, ≥32 characters
})
created, err := client.CreateRequest(ctx, sdk.CreateRequest{
    IdempotencyKey: "desk-1-sol-usdc-2026-09-17T19:00Z",
    ExpiresAt:      time.Now().UTC().Add(2 * time.Hour),
    Description:    "trimming SOL into USDC on the bounce",
    Parameters: map[string]string{
        "input_mint":        "So11111111111111111111111111111111111111112",
        "input_decimals":    "9",
        "output_mint":       "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "output_decimals":   "6",
        "max_slippage_bps":  "50",
    },
})
```

`CreateRequest` sends `POST {URL}/v1/requests` with:

- `Authorization: Bearer <token>`
- `Idempotency-Key`
- JSON body `expires_at`, `note` (from `Description`), `terms` (from `Parameters`)

Required: non-empty idempotency key, non-zero expiry, non-nil parameters map.

The SDK does **not** wrap template list, update, or cancel. Use `curl` or `publishctl` for those. See [request lifecycle](/docs/request-lifecycle).

## Private client: `sdk.Gateway`

Talks to the shared gateway’s **PublisherService** with the operator-issued publisher credential.

```go
gateway, err := sdk.NewGateway(sdk.GatewayOptions{
    URL:      os.Getenv("GATEWAY_URL"),
    Token:    os.Getenv("GATEWAY_TOKEN"), // publisher credential; backend only
    ServerID: os.Getenv("SERVER_ID"),
})
```

The SDK sends that token only in the `Authorization` header. It never puts it in an invitation URL, QR payload, or response value.

| Method | Gateway RPC | Purpose |
| --- | --- | --- |
| `PublishServerManifest` | `PublishManifest` | Publish the private manifest before inviting |
| `CreateInvitation(ctx, userRef, lifetime)` | `CreateInvitation` | Temporary single-use invite. Zero lifetime selects the gateway default (15 minutes). Allowed range: 1 minute through 24 hours |
| `Invitation` | `GetInvitation` | Pending, connected, or expired |
| `WaitForConnection` | polls `GetInvitation` | Default interval 1 second |
| `RevokeInvitation` | `RevokeInvitation` | Still-pending only; retrying is safe |
| `SendRequest` | `CreatePrivateRequest` | Common envelope, private audience, `RETURN_TO_ORIGIN` |
| `Request` | `GetPrivateRequest` | Source document and eventual result |
| `CancelRequest` | `CancelPrivateRequest` | Raises revision and closes the source request |
| `RevokeConnection` | `RevokePrivateConnection` | One device binding |

`SendRequest` requires `UserRef` and `ConnectionID`. The gateway verifies both belong together under this server. Connecting grants neither review nor signing.

`user_ref` is your opaque routing key (an onboarding session ID is a good default). Do **not** use a wallet address.

## Invitation values you may share

From `CreateInvitation`:

- `GetInvitationUrl()` — hosted page for a website, chat, or terminal
- `GetAppUri()` — QR payload / Open in SAC (`seekervault://invite?v=1&gateway=…&token=…`)
- `GetInvitationId()` — for authenticated polling
- `GetExpiresAt()`

None of these contains `GATEWAY_TOKEN`.
