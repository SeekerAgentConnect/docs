---
title: Source mapping
excerpt: Public pages mapped to SeekerAgentWallet sources. Recheck this list when the SDK or protocol changes.
hidden: false
---

Public documentation in this repository was written against **SeekerAgentWallet** commit:

`e0d54b402c42ffca9c77c91fa372edc6de3ad898`

That was the latest `master` commit at the time of this migration. Recheck `origin/master` before updating pages that name RPCs, env vars, or UI labels.

Internal tickets, stage reports, and agent notes were used only to check accuracy. They are not part of the public navigation.

## Mapping

| Public page | Main sources |
| --- | --- |
| Welcome, how it fits, modes | `README.md`, `docs/architecture.md`, `docs/wiki/server-manifests.md`, `docs/wiki/client-plugins.md` |
| Capabilities, first request | `README.md`, `docs/wiki/common-requests.md`, `docs/guides/gateway-onboarding.md` |
| Wallet, connecting, review | `docs/guides/wallet-setup.md`, `pairing.md`, `pending-requests.md`, `message-signing.md`, `transfers.md`, `docs/wiki/feed-onboarding.md`, `docs/wiki/gateway-pairing.md` |
| Owner inputs, rules, Activity | `docs/wiki/common-requests.md`, `docs/guides/policies.md`, `docs/policy.md`, `docs/guides/transfers.md` |
| Notifications, disconnect | `docs/guides/live-background-updates.md`, `docs/guides/firebase.md`, `docs/guides/pairing.md` |
| Private invitation walkthrough | `docs/guides/gateway-onboarding.md`, `publisher/sdk/gateway.go`, `publisher/examples/gateway-onboarding/` |
| Public feed walkthrough | `docs/guides/server-development.md`, `publisher/README.md`, `docs/integrations/signal-api.md` |
| SDK, lifecycle, examples | `publisher/sdk/*.go`, `docs/wiki/common-requests.md`, `docs/protocol.md` |
| MCP, Hermes, Claude, direct walkthrough | `docs/wiki/mcp-adapter.md`, `docs/integrations/hermes.md`, `claude.md`, `docs/guides/pairing.md` |
| Jupiter plugins | `docs/wiki/jupiter-swap.md`, `jupiter-prediction.md`, `docs/integrations/jupiter.md`, `docs/wiki/environments.md` |
| Operators | `docs/guides/self-hosting.md`, `deploy/server/README.md`, `GUIDE.md`, `broadcast/README.md`, `docs/guides/firebase.md` |
| Reference contracts | `proto/seekervault/request/v2/request.proto`, `server/v1/manifest.proto`, `gateway/v1/*.proto` |

## Update checklist

When the implementation changes, walk this list:

1. Bump the commit hash on this page and on the welcome page.
2. Diff `publisher/sdk/*.go` against [Go Server SDK](/docs/go-sdk) and the two walkthroughs.
3. Diff `proto/seekervault/**` against [Request contract](/docs/request-contract), [Manifest contract](/docs/manifest-contract), and [Errors](/docs/errors).
4. Diff Android string resources against app-user pages (button labels, statuses).
5. Confirm sandbox copy still says: no sign, no send, not a Solana cluster, Jupiter is not devnet.
6. Confirm invitation copy still says: open ≠ authorize; extra device = extra invitation; exact `connection_id`.
7. Confirm `/v1/requests` remains primary and `/v1/signals` remains compatibility.
8. Run `npx @readme/cli lint` and `node scripts/check-docs.mjs`.
9. Preview the ReadMe branch for the pull request and check navigation on a narrow viewport.
