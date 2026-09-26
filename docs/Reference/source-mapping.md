---
title: Source mapping
excerpt: Which repository sources each public page was written from, at which revision, and the checklist for the next update.
hidden: false
---

Pages are checked against **SeekerAgentConnect** page by page, so different pages can record different revisions. The repository was renamed from SeekerAgentWallet; Go module paths still carry the old name.

| Revision | Pages checked against it |
| --- | --- |
| `5babd9a38da24d89b3fe45812ed8b75f2e7b80b4` (develop) | Welcome, How it works, Connect your wallet, Connect servers and feeds, Troubleshooting, What the gateway does, Publish your first feed, Run a Restricted feed, Run your own gateway, Copy trading for your subscribers, Paid membership for your signals, Prediction markets your way, Protocol, Errors and limits, Source mapping |
| `ce340cdc008efef4dce3cddc591616dba1ba4012` | Review requests, Rules, Quickstart, Connect your agent, Tools, Server SDK, Plugins and actions |

At `5babd9a`, the pages above were checked for Restricted feeds and every statement that assumed all feeds are public. Parts of those pages that Restricted feeds do not touch were not re-verified beyond `ce340cd`.

## Mapping

| Page | Sources |
| --- | --- |
| Welcome, How it works | `README.md`, `docs/architecture.md`, `docs/guides/server-development.md` §1–2, `docs/guides/firebase.md`; Restricted feeds: `docs/wiki/restricted-feeds.md` |
| App users | `docs/guides/wallet-setup.md`, `pairing.md`, `pending-requests.md`, `policies.md`, `troubleshooting.md`, `docs/wiki/in-app-notifications.md`, `feed-presence.md`, Android `strings_*.xml`; Restricted feeds: Android `strings_connections.xml`, `access/FeedAccessManager.kt`, `connections/ConnectionText.kt`, `connections/AddConnectionScreen.kt`, `SeekerVaultApp.kt` |
| Quickstart, Connect your agent | `mcp-server/README.md`, `docs/development/mcp-server.md`, `docs/guides/pairing.md`, `docs/integrations/hermes.md`, `openclaw.md`, `claude.md`, `deploy/README.md` |
| Tools | `mcp-server/src/requests/mcp-tools.ts`, `skr-staking-server/src/requests/tools.ts`, `docs/wiki/skr-staking.md` |
| Server SDK | `server-sdk/README.md`, `server-sdk/src/index.ts`, `server-sdk/examples/minimal.ts`, `docs/guides/server-development.md` §17 |
| Feed server | `docs/guides/server-development.md`, `docs/wiki/feed-gateway.md`, `feed-gateway/README.md`, `docs/wiki/execution-providers.md`, `jupiter-swap.md`, `jupiter-prediction.md`, `deploy/README.md` |
| Run a Restricted feed | `docs/integrations/restricted-feeds.md`, `docs/wiki/restricted-feeds.md`, `docs/guides/restricted-feed-demo.md`, `publisher-support/access/` (`access.go`, `config.go`, `http.go`, `proof.go`, `sync.go`), `demo-copytrading/internal/admin/devices.go`, `feed-gateway/internal/admin/templates/server.html` and `servers.html`, `feed-gateway/cmd/feed-gatewayctl/main.go`, `feed-gateway/internal/config/config.go` |
| Recipes | `demo-copytrading/README.md`, `demo-copytrading/cmd/copytrading/main.go`, `demo-copytrading/internal/admin/config.go`, `deploy/copytrading/compose.yaml`, `deploy/copytrading/.env.example`, `docs/guides/restricted-feed-demo.md`, `demo-prediction/README.md`, `docs/development/demos.md`; Paid membership: `publisher-support/access/access.go`, `sync.go`, `http.go`, `docs/integrations/restricted-feeds.md` |
| Protocol, Errors and limits | `proto/seekervault/**` (including `server/v1/manifest.proto` `FeedAccess`, `gateway/v1/feed.proto`, `publish.proto`, `problem.proto` 47–54), `docs/protocol.md`, `docs/security.md`, `mcp-server/src/config.ts`, `feed-gateway/internal/config/config.go`, `publisher-support/access/http.go`, `access.go`, `config.go` |

## Update checklist

1. Record the new revision in the table above, only for the pages you actually checked against it.
2. Diff `proto/seekervault/**` and `server-sdk/src/index.ts` against Protocol and Build on the Server SDK.
3. Diff the two `tools.ts` files against Tools.
4. Diff Android string resources against the App users pages.
5. Diff `publisher-support/access/` and `demo-copytrading/internal/admin/devices.go` against Run a Restricted feed and the recipes.
6. Keep: sandbox is not a Solana network, direct is always production, one paired phone per server, the gateway never sees a decision or a wallet address, registration gives three values, Public and Restricted are access policies of one feed mode, SAC ships no billing.
7. Run `npx @readme/cli lint` and `node scripts/check-docs.mjs`, then preview the ReadMe branch.
