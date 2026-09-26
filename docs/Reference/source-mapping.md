---
title: Source mapping
excerpt: Which repository sources each public page was written from, and the checklist for the next update.
hidden: false
---

Written against **SeekerAgentConnect** commit `ce340cdc008efef4dce3cddc591616dba1ba4012`. The repository was renamed from SeekerAgentWallet; Go module paths still carry the old name.

## Mapping

| Page | Sources |
| --- | --- |
| Welcome, How it works | `README.md`, `docs/architecture.md`, `docs/guides/server-development.md` §1–2, `docs/guides/firebase.md` |
| App users | `docs/guides/wallet-setup.md`, `pairing.md`, `pending-requests.md`, `policies.md`, `troubleshooting.md`, `docs/wiki/in-app-notifications.md`, `feed-presence.md`, Android `strings_*.xml` |
| Quickstart, Connect your agent | `mcp-server/README.md`, `docs/development/mcp-server.md`, `docs/guides/pairing.md`, `docs/integrations/hermes.md`, `openclaw.md`, `claude.md`, `deploy/README.md` |
| Tools | `mcp-server/src/requests/mcp-tools.ts`, `skr-staking-server/src/requests/tools.ts`, `docs/wiki/skr-staking.md` |
| Server SDK | `server-sdk/README.md`, `server-sdk/src/index.ts`, `server-sdk/examples/minimal.ts`, `docs/guides/server-development.md` §17 |
| Feed server | `docs/guides/server-development.md`, `docs/wiki/feed-gateway.md`, `feed-gateway/README.md`, `docs/wiki/execution-providers.md`, `jupiter-swap.md`, `jupiter-prediction.md`, `deploy/README.md` |
| Recipes | `demo-copytrading/README.md`, `demo-prediction/README.md`, `docs/development/demos.md` |
| Protocol, Errors and limits | `proto/seekervault/**`, `docs/protocol.md`, `docs/security.md`, `mcp-server/src/config.ts`, `feed-gateway/internal/config/config.go` |

## Update checklist

1. Bump the commit hash here and on the welcome page.
2. Diff `proto/seekervault/**` and `server-sdk/src/index.ts` against Protocol and Build on the Server SDK.
3. Diff the two `tools.ts` files against Tools.
4. Diff Android string resources against the App users pages.
5. Keep: sandbox is not a Solana network, direct is always production, one paired phone per server, the gateway never sees a decision, registration gives three values.
6. Run `npx @readme/cli lint` and `node scripts/check-docs.mjs`, then preview the ReadMe branch.
