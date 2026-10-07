---
title: Copy trading for your subscribers
description: "You have followers or paying members. Run the CopyTrading demo as a Restricted feed, approve who may read it, and every trade you post reaches them. Each one decides on their own phone."
slug: /recipe-copytrading
sidebar_position: 1
---

**Use case.** You trade, and people want to follow your moves. Instead of a chat with screenshots, you publish each trade as a swap signal. The subscribers you approved see it in SAC, enter the amount they want, and swap from their own wallet. You never touch their funds and never learn what they did.

| | |
| --- | --- |
| **Integration mode** | Feed, **Restricted** access policy |
| **Starting point** | The CopyTrading demo feed server, `examples/demo-signals` in the [source repository](https://github.com/SeekerAgentConnect/sac) |
| **Access decisions** | By hand on the demo's Devices page; for automatic approval see [Paid membership](/docs/recipe-paid-membership) |
| **Action** | `jupiter.swap`: you name the pair and a slippage ceiling, each subscriber chooses the amount |

## Prerequisites {#prerequisites}

- A **Restricted** sandbox registration at your authentication origin, for example `https://copytrading.example.com`, and its values ([Connect to the SAC gateway](/docs/connect-to-gateway)).
- A checkout of the source repository with Go, or Docker.
- A public HTTPS route from your authentication origin to the demo's `/access/v1` endpoint.
- SAC on a phone with a Mainnet wallet saved, to test as a subscriber. You choose it for the feed right after adding it.

## Step 1: Run the demo {#run-the-demo}

The demo is a complete feed server: it publishes your manifest, keeps every signal in its own database, retries when the gateway is unreachable, checks in so your feed reads as online, and serves the `/access/v1` endpoint phones prove their wallet to.

```sh
cd examples/demo-signals
PUBLISHER_SERVER_ID=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d \
PUBLISHER_GATEWAY_URL=https://gateway.example.com \
PUBLISHER_PUBLISH_URL=https://gateway.example.com \
PUBLISHER_ENVIRONMENT=sandbox \
PUBLISHER_SUPPORTED_NETWORKS=mainnet \
PUBLISHER_DATABASE_PATH=./copytrading.db \
PUBLISHER_AUTH_ORIGIN=https://copytrading.example.com \
BROADCAST_CREDENTIAL=replace-with-publisher-credential \
PUBLISHER_API_TOKEN=$(openssl rand -base64 32) \
go run ./cmd/copytrading
```

`PUBLISHER_SUPPORTED_NETWORKS` is `mainnet` by default and may only be narrowed to `none`: Jupiter swaps run on Mainnet only, in sandbox too, so the demo refuses `devnet` or `testnet`.

Or with Docker: the public image `ghcr.io/seekeragentconnect/demo-signals` (the `compose/copytrading` project in the separate [`do-deploy`](https://github.com/SeekerAgentConnect/do-deploy) repository runs it, with the same values in its `.env`).

By default `/access/v1` is served on the demo's API listener (`PUBLISHER_API_ADDRESS`, `127.0.0.1:8092`). Route your authentication origin to it; the rest of the API stays behind `PUBLISHER_API_TOKEN`. Every access setting is on [Run a Restricted feed](/docs/restricted-feeds#serve-access-endpoint).

**Expected result:** the demo logs `access=restricted` with your origin and prints your feed link. If it logs `access_unconfirmed`, the registration does not yet say Restricted at that exact origin; your signals wait in its database until it does ([It fails closed](/docs/restricted-feeds#fails-closed)).

## Step 2: Share the link {#share-the-link}

```text
seekervault://feed?v=1&gateway=https%3A%2F%2Fgateway.example.com&server=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d&access=restricted
```

Put it wherever your audience is: your members' area, a private group, a page. It grants nothing by itself. Anyone who adds it in SAC signs one message proving their wallet (it moves no funds), then waits for you.

## Step 3: Approve your subscribers {#approve-subscribers}

The demo ships a password-protected **trader page**, a client of its own API:

```sh
cd examples/demo-signals
printf '%s\n' 'replace-with-your-password' | go run ./cmd/copytrading-admin hash trader >> ./admin-passwords

ADMIN_API_URL=http://127.0.0.1:8092 \
ADMIN_PASSWORDS_FILE=./admin-passwords \
ADMIN_SESSION_SECRET=$(openssl rand -base64 32) \
PUBLISHER_API_TOKEN=replace-with-the-same-api-token \
go run ./cmd/copytrading-admin
```

Open `http://127.0.0.1:8096/trader` and sign in as `trader`. With Docker, start it with `--profile admin`. Keep it off the public internet.

1. Follow **Devices · feed access** from the signals page. Each subscriber who signed appears with their wallet, their phone's label (marked *user-supplied*), the installation fingerprint, and **Pending approval**.
2. **Approve** a row. The page answers *approved; the device receives a single-use invitation*.
3. The subscriber's phone redeems the invitation by itself on its next check. Nobody needs to copy anything.

**Expected result:** the row moves to *Connected — the gateway admits this device until …*. Rejecting, reissuing and revoking are on [Manage subscriber access](/docs/manage-subscriber-access).

## Step 4: Post a signal {#post-a-signal}

From your own script or bot, through the demo's API:

```sh
curl -sS http://127.0.0.1:8092/v1/requests \
  -H "Authorization: Bearer $PUBLISHER_API_TOKEN" -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: desk-1-sol-usdc' \
  -d '{"expires_at":"2030-01-01T00:00:00Z","note":"trimming SOL into USDC",
       "terms":{"input_mint":"So11111111111111111111111111111111111111112","input_decimals":"9",
                "output_mint":"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v","output_decimals":"6",
                "max_slippage_bps":"50"}}'
```

Or from the trader page, where you post, update and withdraw signals by hand. You name the pair and the slippage ceiling, never the amount. Every approved device receives the same signal.

## Expected result {#expected-result}

Each approved subscriber sees a **Swap signal** in the Inbox with your note. They enter an amount, **Get a quote and prepare**, then **Simulate** in sandbox or **Approve and swap** in production. Their decision, amount and signature stay on their phone.

A subscriber you have not approved sees *Waiting for the publisher to approve this device.* and no signals. One you revoked sees that their access was revoked; signals already delivered stay on their phone.

## Going to production {#production}

Sandbox lets followers rehearse with real quotes and no risk. When you are ready, ask for a production registration (Restricted, with its authentication origin), run the demo with `PUBLISHER_ENVIRONMENT=production` and the new server ID, and share its link. Each subscriber asks for access to that feed separately. Every setting is in `examples/demo-signals/README.md`.

## Next {#next}

- [Paid membership](/docs/recipe-paid-membership): approve paying members automatically.
- [Manage subscriber access](/docs/manage-subscriber-access)
