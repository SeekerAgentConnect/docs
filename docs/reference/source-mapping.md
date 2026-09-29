---
title: Source mapping
description: "Which source files each public page was checked against, at which revision, the discrepancies still open, and the checklist for the next update."
slug: /source-mapping
sidebar_position: 5
---

Pages are checked against the Seeker Agent Connect source repository, [SeekerAgentConnect/sac](https://github.com/SeekerAgentConnect/sac) (formerly `BrRenat/SeekerAgentConnect`, and before that `SeekerAgentWallet`). Different pages can record different revisions.

| Revision | Pages checked against it |
| --- | --- |
| `ed49139f0c228ddee3440839c073a82411f10d49` (`develop`, 2026-09-27) | Welcome, How it works, Connect your wallet, Connect a server or add a feed, Join a Restricted feed, Review requests and signals, Notifications and live updates, History and results, Troubleshooting, General SAC MCP server, SKR Staking MCP server, Connect your agent, Pair your phone and enable push, Build your own server, Build on the Direct Server SDK, Public and Restricted feeds, Connect to the SAC gateway, Publish your first feed, Run a Restricted feed, Manage subscriber access, Supported actions, the three recipes, Protocol, MCP tools, Restricted access reference, Errors and limits, Source mapping |
| `ce340cdc008efef4dce3cddc591616dba1ba4012` | Rules and warnings: rule semantics. Its UI labels were re-checked at `ed49139` |
| SAC branch `feat/see-174` (2026-09-29, based on `a0b822a`, not yet merged) | Wallet profiles and supported networks only (SEE-174): Connect your wallets, Connect a server or add a feed, Join a Restricted feed, Review requests and signals, History and results, Troubleshooting, How it works, General SAC MCP server, SKR Staking MCP server, Pair your phone and enable push, Build your own server, Build on the Direct Server SDK, Public and Restricted feeds, Connect to the SAC gateway, Publish your first feed, Run a Restricted feed, Supported actions, the copy-trading and prediction recipes, Protocol, MCP tools, Errors and limits |

At `ed49139` the repository had been reorganised into `apps/`, `services/`, `packages/`, `servers/`, `examples/` and `tools/`, and its packages renamed to the `@seeker_agent_connect` npm scope. Restricted-feed behaviour was compared with `5babd9a`, where it was last checked, and found unchanged apart from paths.

## Open discrepancies {#open-discrepancies}

Recorded so the next update can close them. The pages state the behaviour that works today.

| Discrepancy | How the pages handle it |
| --- | --- |
| The source's release notes and installation guide describe `@seeker_agent_connect/server-sdk`, `mcp-server` and `mcp-skr-staking` as published release candidates, but the public npm registry answered 404 for all three on 2026-09-27. The `ghcr.io/seekeragentconnect/*` images are not publicly pullable | Install tabs default to building from a source checkout; the npm tab names the package and the `next` tag, with a note to fall back to source. No GHCR image is documented |
| The source repository is private, so its links and paths are not readable by every reader | Links point to the canonical repository; paths are given as text |
| No public contact channel for SAC team onboarding is documented anywhere in the source | [Connect to the SAC gateway](/docs/connect-to-gateway) says to contact the SAC team, without inventing an address or form |
| The feed confirmation's title reads **Add this public feed?** for a Restricted feed too | Called out on [Join a Restricted feed](/docs/join-restricted-feed#add-the-link) |
| After a revocation, the app offers no **Send access request**; the way back is removing and re-adding the feed | Documented as that |
| The Go publisher library's module path still carries the old name, `github.com/BrRenat/SeekerAgentWallet/publisher-support`, and the library is not published separately | The paid-membership example uses the module path as it is and says so |
| The source's installation guide shows an SDK example with option names that do not exist (`publicUrl`) | The SDK page follows `packages/server-sdk/README.md` and `examples/minimal.ts`, which type-check |
| The SEE-174 pages describe wallet profiles and `supported_networks` from a branch that was not yet merged or released when they were written | Merge this documentation together with, or after, the app and server release that ships it |
| The `do-deploy` Compose preset for the general MCP server (`compose/mcp/compose.yaml`) passes an explicit variable list that does not include `SAC_SUPPORTED_NETWORKS` | The quickstart's Docker tab warns that a server started from it declares no network until the variable is added |
| `RELAY_*` for the general MCP server appears only in the root `.env.example`, not in `servers/mcp-server/.env.example` or its README | Documented from `servers/mcp-server/src/config.ts` and `docs/guides/server-development.md` §17 |

## Mapping {#mapping}

Paths are relative to the source repository at `ed49139`.

| Page | Sources |
| --- | --- |
| Welcome, How it works | `README.md`, `docs/architecture.md`, `docs/guides/server-development.md` §1–2, §17, `docs/wiki/restricted-feeds.md`, `docs/wiki/environments.md` |
| Use the app | `apps/android/app/src/main/res/values/strings_*.xml`; `…/connections/AddConnectionScreen.kt`, `ConnectionsScreen.kt`, `ConnectionText.kt`; `…/access/FeedAccessManager.kt`, `access/storage/FeedAccessStore.kt`; `…/inbox/InboxScreen.kt`; `…/history/ChainStatus.kt`, `HistoryDetailMapping.kt`; `…/activity/Explorer.kt`; `…/notifications/RequestNotifications.kt`; `docs/guides/wallet-setup.md`, `pairing.md`, `pending-requests.md`, `policies.md`, `troubleshooting.md`, `firebase.md`, `docs/wiki/in-app-notifications.md` |
| General SAC MCP server, Connect your agent, Pair your phone | `servers/mcp-server/README.md`, `.env.example`, `src/config.ts`, `src/cli.ts`, `src/requests/mcp-tools.ts`, `src/pairing/`; root `.env.example` and `package.json`; `tools/test-agent/src/main.ts`; `deploy/mcp/`, `deploy/README.md`; `docs/guides/installation.md`; `docs/integrations/hermes.md`, `openclaw.md`, `claude.md`; `examples/hermes.config.yaml` |
| SKR Staking MCP server | `servers/mcp-skr-staking/.env.example`, `src/cli.ts`, `src/requests/tools.ts`, `src/skr/chain.ts`; `deploy/skr-staking/compose.yaml`; `docs/integrations/skr-staking.md`, `docs/wiki/skr-staking.md` |
| MCP tools | `servers/mcp-server/src/requests/mcp-tools.ts`, `src/mcp-endpoint.ts`, `src/pairing/mcp-tool.ts`; `servers/mcp-skr-staking/src/requests/tools.ts`, `src/pairing/mcp-tool.ts` |
| Build your own server, Direct Server SDK | `packages/server-sdk/README.md`, `package.json`, `src/index.ts`, `src/direct-server.ts`, `src/requests/agent-api.ts`, `src/pairing/`, `src/push/relay.ts`, `examples/minimal.ts`; `docs/guides/server-development.md` §17; `release/components.json` |
| Publish feeds | `services/gateway/README.md`, `internal/config/config.go`; `packages/protocol/proto/seekervault/gateway/v1/publish.proto`, `feed.proto`, `problem.proto`, `server/v1/manifest.proto`; `docs/guides/server-development.md`; `docs/wiki/feed-gateway.md`, `execution-providers.md`, `jupiter-swap.md`, `jupiter-prediction.md`; `apps/android/.../res/values/strings_operations.xml`, `strings_prediction_review.xml` |
| Run a Restricted feed, Manage subscriber access, Restricted access reference | `docs/integrations/restricted-feeds.md`, `docs/wiki/restricted-feeds.md`, `docs/guides/restricted-feed-demo.md`; `packages/publisher-support/access/` (`access.go`, `config.go`, `http.go`, `proof.go`, `sync.go`), `packages/publisher-support/store/access.go`; `examples/demo-signals/internal/admin/devices.go`, `examples/demo-signals/cmd/copytrading/main.go` |
| Connect to the SAC gateway | `docs/guides/server-development.md` (registration, §17 relay onboarding), `services/gateway/README.md`, `examples/demo-signals/README.md`, `servers/mcp-server/src/config.ts`, `servers/mcp-skr-staking/.env.example` |
| Recipes | `examples/demo-signals/README.md`, `cmd/copytrading/main.go`, `cmd/copytrading-admin`; `examples/demo-prediction/README.md`; `deploy/copytrading/`, `deploy/prediction/`; `packages/publisher-support/access/` |
| Wallets and per-connection selection (SEE-174) | `apps/android/.../wallet/Wallet.kt`, `WalletRepository.kt`, `WalletScreen.kt`, `storage/WalletStore.kt`; `…/connections/ConnectionWallet.kt`, `Connection.kt`; `…/servers/ManifestValidation.kt`; `…/access/FeedAccessManager.kt`; `strings_wallet.xml`, `strings_connections.xml`; `docs/guides/wallet-setup.md`, `docs/wiki/wallet-profiles.md`, `docs/wiki/server-manifests.md#supported-networks` |
| Declaring networks (SEE-174) | `packages/protocol/proto/seekervault/server/v1/manifest.proto`, `gateway/v1/problem.proto`; `packages/server-sdk/src/manifest.ts`, `README.md`; `servers/mcp-server/README.md`, `src/config.ts`, root `.env.example`; `servers/mcp-skr-staking/README.md`; `packages/publisher-support/network/`, `config/`; `examples/demo-signals/README.md`, `examples/demo-prediction/README.md`; `services/gateway/internal/rules/manifest.go` |
| Protocol, Errors and limits | `packages/protocol/proto/seekervault/**`, `docs/protocol.md`, `docs/security.md`, `servers/mcp-server/src/config.ts`, `services/gateway/internal/config/config.go`, `packages/publisher-support/access/http.go` |

## What public pages leave out {#out-of-scope}

Operating the gateway (deployment presets, its admin page and command-line tool, its own settings) is the SAC team's job and is documented only in the source repository (`services/gateway/README.md`, `deploy/README.md`). Public pages describe what an integrator sends, receives and configures. The retired `/docs/run-your-own-gateway` URL redirects to [Connect to the SAC gateway](/docs/connect-to-gateway).

## Update checklist {#update-checklist}

1. Record the new revision in the table above, only for the pages you actually checked against it.
2. Diff `packages/protocol/proto/seekervault/**` and `packages/server-sdk/src/index.ts` against Protocol and the SDK page.
3. Diff both servers' `tools.ts` / `mcp-tools.ts` against MCP tools.
4. Diff Android string resources against the Use the app pages.
5. Diff `packages/publisher-support/access/` and `examples/demo-signals/internal/admin/devices.go` against the Restricted pages and the recipes.
6. Check whether the npm packages resolve publicly; if they do, make the npm tab the default.
7. Keep: sandbox is not a Solana network, network is not environment, an empty `supported_networks` never means Mainnet, each connection has its own wallet and no global wallet exists, direct is always production, one paired phone per server, the gateway never sees a decision or a wallet address, Public and Restricted are access policies of one feed mode, SAC ships no billing, the SAC team operates the gateway.
8. Run `npm run check`, `npm run typecheck` and `npm run build`, then preview with `npm run serve`.
