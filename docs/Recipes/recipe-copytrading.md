---
title: Copy trading for your subscribers
excerpt: You have followers, or paying members. Run the CopyTrading demo as a Restricted feed, approve who may read it, and every signal you post reaches them. Each one decides on their own phone.
hidden: false
---

**The idea.** You trade, and people want to follow your moves. Instead of a chat with screenshots, you publish each trade as a signal. The subscribers you approved see it in SAC within seconds, enter the amount they want, and swap from their own wallet. You never touch their funds and never learn what they did.

The CopyTrading demo is a **Restricted** feed: holding the link is not enough. A subscriber proves which wallet they control, you approve that device on the demo's Devices page, and the gateway delivers only to approved devices. Why and how that works is on [Run a Restricted feed](/docs/restricted-feeds). For an open feed anyone can read, see the [Prediction recipe](/docs/recipe-prediction), which is Public.

The demo approves by hand. To approve paying members automatically, add a rule: [Paid membership](/docs/recipe-paid-membership).

## 1. Get registered as Restricted

Send us your server's address and your **authentication origin**, the public HTTPS address where subscribers' phones will reach your server, for example `https://copytrading.example.com`. Ask for a **Restricted** registration. You get your three values back: server ID, credential, gateway address ([the flow](/docs/how-it-works#registering-a-server-with-the-gateway)).

If you run your own gateway, register it yourself:

```sh
feed-gatewayctl register --server 3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d --label "copy trading" \
  --access restricted --auth-origin https://copytrading.example.com
```

The origin must match `PUBLISHER_AUTH_ORIGIN` below character for character. Until the gateway confirms the feed is Restricted at that origin, the demo publishes nothing and logs `access_unconfirmed`; your signals wait in its database.

## 2. Run the demo

`demo-copytrading/` in the repository is a complete feed server: it publishes your manifest, keeps every signal in its own database, retries when the gateway is unreachable, checks in so your feed reads as online, and serves the `/access/v1` endpoint phones prove their wallet to.

```sh
cd demo-copytrading
PUBLISHER_SERVER_ID=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d \
PUBLISHER_GATEWAY_URL=https://feeds.example.com \
PUBLISHER_PUBLISH_URL=https://feeds.example.com \
PUBLISHER_ENVIRONMENT=sandbox \
PUBLISHER_DATABASE_PATH=./copytrading.db \
PUBLISHER_AUTH_ORIGIN=https://copytrading.example.com \
BROADCAST_CREDENTIAL=replace-with-publisher-credential \
PUBLISHER_API_TOKEN=$(openssl rand -base64 32) \
go run ./cmd/copytrading
```

Or with Docker: `deploy/copytrading`, where `PUBLISHER_AUTH_ORIGIN` is required in `deploy/copytrading/.env`.

By default `/access/v1` is served on the same listener as the demo's API (`PUBLISHER_API_ADDRESS`, `127.0.0.1:8092`). Publish it at your authentication origin through your HTTPS proxy or platform ingress. It holds no secret and checks every call by signature; the rest of the API stays behind `PUBLISHER_API_TOKEN`. To give it a listener of its own, set `PUBLISHER_AUTH_ADDRESS`. Grant and invitation lifetimes are on [Run a Restricted feed](/docs/restricted-feeds#2-configure-your-server).

At startup the demo logs `access=restricted` with your origin and prints your feed link.

## 3. Share the link

```text
seekervault://feed?v=1&gateway=https%3A%2F%2Ffeeds.example.com&server=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d&access=restricted
```

Put it wherever your audience is: your members' area, a private group, a page. The link carries no secret and grants nothing by itself. Anyone who adds it in SAC is asked to sign one message proving their wallet (it moves no funds), and then waits for you.

## 4. Approve your subscribers

The demo ships a password-protected **trader page**. It is a client of the demo's own API, so the browser never holds `PUBLISHER_API_TOKEN`.

```sh
cd demo-copytrading
printf '%s\n' 'replace-with-your-password' | go run ./cmd/copytrading-admin hash trader >> ./admin-passwords

ADMIN_API_URL=http://127.0.0.1:8092 \
ADMIN_PASSWORDS_FILE=./admin-passwords \
ADMIN_SESSION_SECRET=$(openssl rand -base64 32) \
PUBLISHER_API_TOKEN=replace-with-the-same-api-token \
go run ./cmd/copytrading-admin
```

Open `http://127.0.0.1:8096/trader` and sign in as `trader`. With Docker, start it with `--profile admin`; it listens on `127.0.0.1:8096` at `/`. Keep it off the public internet.

Follow **Devices · feed access** from the signals page. Each subscriber who signed appears as a row with their wallet, their phone's label (marked *user-supplied*), the device's installation fingerprint, and **Pending approval**.

1. **Approve** a row. The page answers *approved; the device receives a single-use invitation* and shows the invitation as a link and a QR code.
2. The subscriber's phone redeems the invitation by itself the next time it checks: every few seconds while SAC is open, or when they open the feed or tap **Refresh**. Nobody needs to copy the invitation.
3. The row moves to *Approved — the gateway has not confirmed the grant yet*, then to *Connected — the gateway admits this device until …*. Access renews on its own while the device stays approved.

**Reject** turns a request down; the device gets no grant. **Revoke device** or **Revoke all devices of this wallet** ends access later. A revocation shows as *Revocation pending at the gateway* until the gateway confirms it, because until then the device can still read. Every state is explained on [Run a Restricted feed](/docs/restricted-feeds#4-approve-devices).

Each phone is approved separately, even for the same wallet.

## 5. Post a signal

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

Or from the trader page, where you post, update, and withdraw signals by hand.

You name the pair and the slippage ceiling. Never the amount: that is each follower's choice. Every approved device receives the same signal.

## 6. What your subscribers see

A **Swap signal** in the Inbox with your note. They enter an amount, get a quote, and either **Approve and swap** in production or **Simulate** in sandbox. Their decision, their amount, and their signature stay on their phone.

A subscriber who is not approved sees *Waiting for the publisher to approve this device.* and no signals. One you revoked sees *The publisher revoked this device's access to the feed. Signals already on this phone stay.* Revocation stops future delivery; it cannot erase what was already delivered. The full subscriber journey is on [Connect servers and feeds](/docs/connecting-servers#join-a-restricted-feed).

## Going to production

Sandbox lets your followers rehearse with real quotes and no risk. When you are ready, register a second server ID for production, as Restricted with its own authentication origin, run the demo with `PUBLISHER_ENVIRONMENT=production`, and share its link. Each subscriber then asks for access to that feed separately. Details and every setting: `demo-copytrading/README.md` and `demo-copytrading/.env.example`.
