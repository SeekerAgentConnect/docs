---
title: Source mapping
excerpt: Public pages mapped to SeekerAgentConnect sources at the commit they were written against. Recheck this list when the SDK or protocol changes.
hidden: false
---

Public documentation in this repository was written against **SeekerAgentConnect** commit:

`ce340cdc008efef4dce3cddc591616dba1ba4012`

The repository was renamed from SeekerAgentWallet; Go module paths and some in-repo links still carry the old name. Recheck the default branch before updating pages that name RPCs, environment variables, or UI labels.

Internal tickets and agent notes were used only to check accuracy. They are not part of the public navigation.

## Mapping

| Public page | Main sources |
| --- | --- |
| Getting started, how it fits together, connection modes | `README.md`, `docs/architecture.md`, `docs/wiki/server-manifests.md`, `docs/wiki/gateway-pairing.md` |
| Capabilities, first request | `docs/wiki/common-requests.md`, `docs/wiki/execution-providers.md`, `docs/guides/server-development.md` |
| Wallet, connecting, reviewing | `docs/guides/wallet-setup.md`, `docs/guides/pairing.md`, `docs/guides/pending-requests.md`, `docs/wiki/feed-onboarding.md`, `docs/wiki/review-sheets.md` |
| Owner inputs, rules, outcomes | `docs/wiki/common-requests.md`, `docs/guides/policies.md`, `docs/policy.md`, `docs/guides/transfers.md`, `docs/guides/message-signing.md` |
| Notifications, disconnecting, user troubleshooting | `docs/wiki/in-app-notifications.md`, `docs/wiki/feed-presence.md`, `docs/guides/live-background-updates.md`, `docs/guides/troubleshooting.md`, `android/app/src/main/res/values/strings.xml` |
| Overview, manifests, request lifecycle | `docs/protocol.md`, `docs/wiki/server-manifests.md`, `proto/seekervault/request/`, `proto/seekervault/server/v1/manifest.proto` |
| Direct Server SDK, direct server walkthrough | `server-sdk/README.md`, `server-sdk/src/index.ts`, `docs/development/server-sdk.md`, `docs/integrations/server-sdk.md` |
| Public feed walkthrough, examples | `docs/guides/server-development.md`, `feed-gateway/README.md`, `docs/integrations/signal-api.md`, `demo-copytrading/`, `demo-prediction/`, `publisher-support/README.md` |
| Push relay | `docs/guides/server-development.md` §17, `docs/wiki/feed-gateway.md`, `feed-gateway/internal/pushrelay/wire.go`, `docs/guides/firebase.md` |
| Private invitation walkthrough (retired) | `docs/wiki/gateway-pairing.md`, `docs/protocol.md` (retired identifiers) |
| MCP adapter, direct MCP server walkthrough, Hermes, OpenClaw, Claude | `mcp-server/README.md`, `docs/development/mcp-server.md`, `docs/wiki/mcp-adapter.md`, `docs/integrations/hermes.md`, `docs/integrations/openclaw.md`, `docs/integrations/claude.md` |
| SKR staking | `skr-staking-server/README.md`, `docs/wiki/skr-staking.md`, `docs/integrations/skr-staking.md`, `docs/development/skr-staking-server.md` |
| Jupiter swap and prediction | `docs/wiki/jupiter-swap.md`, `docs/wiki/jupiter-prediction.md`, `docs/integrations/jupiter.md`, `docs/wiki/environments.md` |
| Operators | `deploy/README.md`, `deploy/*/.env.example`, `deploy/*.yaml`, `docs/guides/self-hosting.md`, `docs/development/feed-gateway.md`, `docs/development/demos.md`, `docs/guides/firebase.md`, `docs/security.md` |
| Reference contracts | `proto/seekervault/request/v1/`, `request/v2/`, `server/v1/`, `gateway/v1/`, `proposal/v1/`, `update/v1/`, `docs/protocol.md`, `docs/security.md` |
| Reference limits and errors | `mcp-server/src/config.ts`, `server-sdk/src/requests/action.ts`, `server-sdk/src/storage/pairing-store.ts`, `feed-gateway/internal/config/config.go`, `feed-gateway/internal/gateway/errors.go`, `android/.../plugins/ProviderRegistry.kt` |

## Update checklist

When the implementation changes, walk this list:

1. Bump the commit hash on this page and on the welcome page.
2. Diff `server-sdk/src` and `proto/seekervault/**` against [Direct Server SDK](/docs/direct-server-sdk), [Request contract](/docs/request-contract), [Manifest contract](/docs/manifest-contract), and [Errors](/docs/errors).
3. Diff `mcp-server/src/requests/mcp-tools.ts` and `skr-staking-server/src/requests/tools.ts` against [SDK methods and API operations](/docs/sdk-and-api).
4. Diff Android string resources against app-user pages (button labels, statuses, banners).
5. Confirm sandbox copy still says: no sign, no send, not a Solana cluster, Jupiter is not devnet, direct is always production.
6. Confirm no page describes `gateway_private`, invitations, device credentials, or `seekervault://invite` as available; the retired page says why.
7. Confirm relay copy matches `feed-gateway/internal/pushrelay/wire.go`: content-free `request_invalidation`, handle via `SetRelayHandle`, relay or direct FCM but never both.
8. Confirm presence copy matches `docs/wiki/feed-presence.md`: `Heartbeat`, `GetFeedStatus`, 32 channels, 3 × `BROADCAST_HEARTBEAT_SECONDS`, unknown is never online.
9. Confirm staking copy matches `request.proto` and `docs/wiki/skr-staking.md`: four operations, no amount for cancel and withdraw, mainnet only.
10. Confirm `/v1/requests` remains primary and `/v1/signals` remains compatibility.
11. Run `npx @readme/cli lint` and `node scripts/check-docs.mjs`.
12. Preview the ReadMe branch for the pull request and check navigation on a narrow viewport.
