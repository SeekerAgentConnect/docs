---
title: Source mapping
description: "Which source files each public page was checked against, at which revision, the discrepancies still open, and the checklist for the next update."
slug: /source-mapping
sidebar_position: 5
---

Pages are checked against the Seeker Agent Connect source repository, [SeekerAgentConnect/sac](https://github.com/SeekerAgentConnect/sac) (formerly `BrRenat/SeekerAgentConnect`, and before that `SeekerAgentWallet`). Different pages can record different revisions.

| Revision | Pages checked against it |
| --- | --- |
| `f3521ff7f3f0a05523453105ad5d09bcafa53cb5` (`master`, 2026-10-07; the commit every `<component>-v0.0.1` release tag points at) | Welcome (Get the app), General SAC MCP server, SKR Staking MCP server, Build on the Direct Server SDK, Protocol (package name only), Copy trading and Prediction recipes (Docker paragraph only), Source mapping |
| `ed49139f0c228ddee3440839c073a82411f10d49` (`develop`, 2026-09-27) | Welcome, How it works, Connect your wallet, Connect a server or add a feed, Join a Restricted feed, Review requests and signals, Notifications and live updates, History and results, Troubleshooting, General SAC MCP server, SKR Staking MCP server, Connect your agent, Pair your phone and enable push, Build your own server, Build on the Direct Server SDK, Public and Restricted feeds, Connect to the SAC gateway, Publish your first feed, Run a Restricted feed, Manage subscriber access, Supported actions, the three recipes, Protocol, MCP tools, Restricted access reference, Errors and limits, Source mapping |
| `ce340cdc008efef4dce3cddc591616dba1ba4012` | Rules and warnings: rule semantics. Its UI labels were re-checked at `ed49139` |

At `ed49139` the repository had been reorganised into `apps/`, `services/`, `packages/`, `servers/`, `examples/` and `tools/`, and its packages renamed to the `@seeker_agent_connect` npm scope. Restricted-feed behaviour was compared with `5babd9a`, where it was last checked, and found unchanged apart from paths.

At `f3521ff` the repository was public, the npm scope had become `@seekeragentconnect`, and every component had its first public release, `0.0.1`: the three npm packages on `latest` with provenance (`@seekeragentconnect/server-sdk`, `mcp-server`, `mcp-skr-staking`), six anonymously pullable images under `ghcr.io/seekeragentconnect/` (`mcp-server`, `mcp-skr-staking`, `gateway`, `gateway-centrifugo`, `demo-signals`, `demo-prediction`), and the signed `sac-0.0.1.apk` on the `android-v0.0.1` GitHub Release. The Compose presets had moved from `deploy/` to the separate `do-deploy` repository's `compose/`. The install tabs therefore default to npm, the Docker tabs run the public images, and Welcome says how to get and verify the app. The pre-public `@seeker_agent_connect` release candidates no longer resolve.

## Open discrepancies {#open-discrepancies}

Recorded so the next update can close them. The pages state the behaviour that works today.

| Discrepancy | How the pages handle it |
| --- | --- |
| No public contact channel for SAC team onboarding is documented anywhere in the source | [Connect to the SAC gateway](/docs/connect-to-gateway) says to contact the SAC team, without inventing an address or form |
| The feed confirmation's title reads **Add this public feed?** for a Restricted feed too | Called out on [Join a Restricted feed](/docs/join-restricted-feed#add-the-link) |
| After a revocation, the app offers no **Send access request**; the way back is removing and re-adding the feed | Documented as that |
| The Go publisher library's module path still carries the old name, `github.com/BrRenat/SeekerAgentWallet/publisher-support`, and the library is not published separately | The paid-membership example uses the module path as it is and says so |
| The source's installation guide shows an SDK example with option names that do not exist (`publicUrl`) | The SDK page follows `packages/server-sdk/README.md` and `examples/minimal.ts`, which type-check |
| `RELAY_*` for the general MCP server appears only in the root `.env.example`, not in `servers/mcp-server/.env.example` or its README | Documented from `servers/mcp-server/src/config.ts` and `docs/guides/server-development.md` §17 |

Closed at `f3521ff`: the packages were not publicly resolvable and no image was pullable (both are, as `0.0.1`, since 2026-10-07), and the source repository was private (it is public).

## Mapping {#mapping}

Paths are relative to the source repository at `ed49139`, or at `f3521ff` for the pages re-checked there; `do-deploy` paths are relative to that repository.

| Page | Sources |
| --- | --- |
| Welcome, How it works | `README.md`, `docs/architecture.md`, `docs/guides/server-development.md` §1–2, §17, `docs/wiki/restricted-feeds.md`, `docs/wiki/environments.md` |
| Use the app | `apps/android/app/src/main/res/values/strings_*.xml`; `…/connections/AddConnectionScreen.kt`, `ConnectionsScreen.kt`, `ConnectionText.kt`; `…/access/FeedAccessManager.kt`, `access/storage/FeedAccessStore.kt`; `…/inbox/InboxScreen.kt`; `…/history/ChainStatus.kt`, `HistoryDetailMapping.kt`; `…/activity/Explorer.kt`; `…/notifications/RequestNotifications.kt`; `docs/guides/wallet-setup.md`, `pairing.md`, `pending-requests.md`, `policies.md`, `troubleshooting.md`, `firebase.md`, `docs/wiki/in-app-notifications.md` |
| General SAC MCP server, Connect your agent, Pair your phone | `servers/mcp-server/README.md`, `.env.example`, `Dockerfile`, `src/config.ts`, `src/cli.ts`, `src/requests/mcp-tools.ts`, `src/pairing/`; root `.env.example` and `package.json`; `tools/test-agent/src/main.ts`; `release/components.json`; `docs/guides/installation.md`; `docs/integrations/hermes.md`, `openclaw.md`, `claude.md`; `examples/hermes.config.yaml`; `compose/mcp/` and `compose/README.md` in `do-deploy` |
| SKR Staking MCP server | `servers/mcp-skr-staking/.env.example`, `Dockerfile`, `src/cli.ts`, `src/requests/tools.ts`, `src/skr/chain.ts`; `release/components.json`; `docs/guides/installation.md`; `docs/integrations/skr-staking.md`, `docs/wiki/skr-staking.md`; `compose/skr-staking/compose.yaml` in `do-deploy` |
| MCP tools | `servers/mcp-server/src/requests/mcp-tools.ts`, `src/mcp-endpoint.ts`, `src/pairing/mcp-tool.ts`; `servers/mcp-skr-staking/src/requests/tools.ts`, `src/pairing/mcp-tool.ts` |
| Build your own server, Direct Server SDK | `packages/server-sdk/README.md`, `package.json`, `src/index.ts`, `src/direct-server.ts`, `src/requests/agent-api.ts`, `src/pairing/`, `src/push/relay.ts`, `examples/minimal.ts`; `docs/guides/server-development.md` §17; `release/components.json`; `docs/guides/installation.md` |
| Welcome: Get the app | `release/components.json` (`android`), `docs/guides/installation.md`, `docs/development/releases.md`, the `android-v0.0.1` GitHub Release |
| Publish feeds | `services/gateway/README.md`, `internal/config/config.go`; `packages/protocol/proto/seekervault/gateway/v1/publish.proto`, `feed.proto`, `problem.proto`, `server/v1/manifest.proto`; `docs/guides/server-development.md`; `docs/wiki/feed-gateway.md`, `execution-providers.md`, `jupiter-swap.md`, `jupiter-prediction.md`; `apps/android/.../res/values/strings_operations.xml`, `strings_prediction_review.xml` |
| Run a Restricted feed, Manage subscriber access, Restricted access reference | `docs/integrations/restricted-feeds.md`, `docs/wiki/restricted-feeds.md`, `docs/guides/restricted-feed-demo.md`; `packages/publisher-support/access/` (`access.go`, `config.go`, `http.go`, `proof.go`, `sync.go`), `packages/publisher-support/store/access.go`; `examples/demo-signals/internal/admin/devices.go`, `examples/demo-signals/cmd/copytrading/main.go` |
| Connect to the SAC gateway | `docs/guides/server-development.md` (registration, §17 relay onboarding), `services/gateway/README.md`, `examples/demo-signals/README.md`, `servers/mcp-server/src/config.ts`, `servers/mcp-skr-staking/.env.example` |
| Recipes | `examples/demo-signals/README.md`, `cmd/copytrading/main.go`, `cmd/copytrading-admin`; `examples/demo-prediction/README.md`; `packages/publisher-support/access/`; `compose/copytrading/`, `compose/prediction/` in `do-deploy` |
| Protocol, Errors and limits | `packages/protocol/proto/seekervault/**`, `docs/protocol.md`, `docs/security.md`, `servers/mcp-server/src/config.ts`, `services/gateway/internal/config/config.go`, `packages/publisher-support/access/http.go` |

## What public pages leave out {#out-of-scope}

Operating the gateway (deployment presets, its admin page and command-line tool, its own settings) is the SAC team's job and is documented only in the source repository (`services/gateway/README.md`) and the `do-deploy` repository (`compose/README.md`). Public pages describe what an integrator sends, receives and configures. The retired `/docs/run-your-own-gateway` URL redirects to [Connect to the SAC gateway](/docs/connect-to-gateway).

## Update checklist {#update-checklist}

1. Record the new revision in the table above, only for the pages you actually checked against it.
2. Diff `packages/protocol/proto/seekervault/**` and `packages/server-sdk/src/index.ts` against Protocol and the SDK page.
3. Diff both servers' `tools.ts` / `mcp-tools.ts` against MCP tools.
4. Diff Android string resources against the Use the app pages.
5. Diff `packages/publisher-support/access/` and `examples/demo-signals/internal/admin/devices.go` against the Restricted pages and the recipes.
6. Check that the npm packages and the GHCR images still resolve publicly (`npm view @seekeragentconnect/mcp-server version`, an anonymous `docker pull`) and that the versions and digests the pages name are still the current release; the install tabs have defaulted to npm and the public images since `0.0.1`.
7. Keep: sandbox is not a Solana network, direct is always production, one paired phone per server, the gateway never sees a decision or a wallet address, Public and Restricted are access policies of one feed mode, SAC ships no billing, the SAC team operates the gateway.
8. Run `npm run check`, `npm run typecheck` and `npm run build`, then preview with `npm run serve`.
