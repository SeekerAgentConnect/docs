---
title: Run a Restricted feed
description: "Publish to a private audience. The gateway operator registers your feed as Restricted, your server decides which wallets and devices may read it, and the gateway enforces that decision on every read."
slug: /restricted-feeds
sidebar_position: 3
---

A **Restricted** feed is a subscriber-only feed. You still publish each signal once, and the gateway still delivers it, but only to devices you approved. A subscriber proves which wallet they control by signing one message, you decide whether that wallet may read, and the gateway admits only the devices you granted. You can revoke a device, or every device of a wallet, when someone is no longer eligible.

|                          | Public                                                    | Restricted                                                                             |
| ------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Who can read             | Anyone who adds the feed link                              | Only devices you approved                                                              |
| What the subscriber does | Adds the link                                             | Adds the link, signs one wallet message, waits for your decision                       |
| What you learn           | Nothing about subscribers                                  | The wallet address that proved itself, a device fingerprint, and the phone's own label |
| What the gateway knows   | Which channels a caller asked about                       | Opaque subscriber and device references, a grant, and a session digest                 |
| Push                     | A shared topic                                            | One target per approved device, dropped with its grant                                 |
| Set by                   | The gateway operator (default)                            | The gateway operator, with your authentication origin                                  |

Restricted is an **access policy** of an ordinary feed (`gateway_feed`). It is not a new connection mode, and it is not the retired `gateway_private` mode. Everything on [Publish your first feed](/docs/publish-your-first-feed) still applies; this page adds who may read.

## Who does what

| Role | Controls | Where |
| --- | --- | --- |
| **Gateway operator** | Whether your feed is Public or Restricted, and the one authentication origin phones may prove a wallet to | The gateway's admin page or `feed-gatewayctl` |
| **Publisher administrator** (you) | Which wallets and devices may read: approve, reject, revoke, reissue an invitation | Your server's Devices page or its token-protected API |
| **Subscriber** | Which wallet they prove, and whether to keep the feed | SAC on their phone |

The operator's switch decides *whether* a feed is gated. Your approvals decide *who* gets through. Neither can do the other's job: an operator cannot approve a subscriber, and you cannot make your own feed public.

## Before you start

1. **Decide your eligibility rule.** Who may read: people an operator vouches for by hand, or wallets that hold a paid membership in your own system. The shipped demo asks a human. For an automatic rule, see [Paid membership](/docs/recipe-paid-membership).
2. **Pick your authentication origin.** A public HTTPS origin, such as `https://auth.example.com`, where phones reach your server's `/access/v1` endpoint. HTTPS, no path, no query, no fragment. Plain HTTP works only on loopback, for local development.
3. **Ask the gateway operator to register the feed as Restricted at that origin.** Until they do, your server publishes nothing, by design.

## 1. The operator registers the feed as Restricted

**From the gateway's admin page.** When adding a server, **Add server** has a **Who may read its feed** choice. For an existing publisher, its page has a **Who may read** form.

1. Choose **Restricted — only devices the publisher approved**.
2. Enter the **Authentication origin**: the publisher's `PUBLISHER_AUTH_ORIGIN`, character for character.
3. On an existing publisher, type its server ID to confirm, then **Save access**.

**From the command line**, register a new publisher as Restricted, or switch an existing one:

```sh
feed-gatewayctl register --server 3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d --label "signals" \
  --access restricted --auth-origin https://auth.example.com

feed-gatewayctl access --server 3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d \
  --access restricted --auth-origin https://auth.example.com
```

With the Docker preset, run the same commands through `gateway-ctl` ([Run your own gateway](/docs/run-your-own-gateway#register-a-publisher)). `--auth-origin` is required with `--access restricted` and refused with `--access public`. `feed-gatewayctl list` marks each Restricted publisher with its origin and live grant count; a Public one shows no access line.

Both sides normalise the origin (lowercase host, no default port, no trailing slash) and then compare it exactly. `https://auth.example.com` and `https://signals.example.com`, or `https://auth.example.com` and `https://auth.example.com:8443`, are different origins, and a mismatch stops publication. Agree it with the operator exactly.

Changing the policy or the origin retires every live stream issued under the old one. Grants already issued are **not** revoked by a policy change: revoking a device is the publisher's job, on its own page. After a change, the publisher should publish its manifest again so the policy it states matches.

## 2. Configure your server

The CopyTrading demo, and any server built on the repository's publisher library, reads these beside the ordinary `PUBLISHER_*` settings:

| Variable | Default | What it is |
| --- | --- | --- |
| `PUBLISHER_AUTH_ORIGIN` | Required | The origin phones reach `/access/v1` at, exactly as the operator registered it. Missing or malformed refuses to start |
| `PUBLISHER_AUTH_ADDRESS` | Empty | A separate `host:port` listener for `/access/v1`. Empty serves it beside the token-protected `/v1` API on `PUBLISHER_API_ADDRESS`, which suits a platform that gives a service one public port |
| `PUBLISHER_ACCESS_GRANT_HOURS` | `6` (1 to 720) | How long a device's gateway grant runs before your server renews it. Also the bound on how long access outlives your server's reach to the gateway |
| `PUBLISHER_ACCESS_INVITATION_MINUTES` | `5` (1 to 60) | How long an approved device has to redeem its invitation |
| `PUBLISHER_ACCESS_CHALLENGES_PER_HOUR` | `60` | Wallet challenges one client IP address may ask for in an hour. Status checks and redemptions get twenty times it. Behind a proxy, the first `X-Forwarded-For` address counts |

Publish `/access/v1` at the authentication origin. It holds no credential: every call is checked by signature, and it tells a caller nothing about anyone else. Your operator routes (`/v1/access/...`) stay behind `PUBLISHER_API_TOKEN`, like publishing does.

If you write your own backend instead of using the library, your manifest's `feed` reference must carry the policy and the origin, `"access":{"policy":"FEED_ACCESS_POLICY_RESTRICTED","authOrigin":"https://auth.example.com"}`, and your server must implement the same `/access/v1` contract ([Protocol](/docs/protocol#restricted-feeds)).

### It fails closed

Before it publishes, the server asks the gateway how it enforces this feed. It publishes only when the answer is **Restricted, at this origin**.

| Situation | What happens |
| --- | --- |
| The operator has not registered the feed as Restricted, or registered another origin | Nothing is published. The refusal is `access_unconfirmed`, naming the `feed-gatewayctl access` command to run. Signals wait in your server's database |
| The gateway is unreachable, or too old to know about Restricted feeds | Same: `access_unconfirmed`, signals wait |
| A manifest claims a policy or origin the operator did not register | The gateway refuses it with `ACCESS_MISMATCH` |
| The operator switches the feed back to Public | Your server stops publishing within about a minute; a confirmation is trusted for one minute |

`access_unconfirmed` is not permanent. When the registration is right, the waiting signals go out. The failure is a delayed publication, never an audience nobody approved.

## 3. Share the feed link

A Restricted feed's link is the ordinary one with a hint on the end. The demo prints it at startup:

```text
seekervault://feed?v=1&gateway=https%3A%2F%2Ffeeds.example.com&server=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d&access=restricted
```

Share it anywhere. **A link alone grants no access.** It tells the subscriber what they are adding, and nothing more:

- The phone reads the policy and the authentication origin from the manifest the gateway serves, which the gateway stamps from the operator's registration. That is the only address a phone ever sends a wallet proof to. A link cannot name one.
- `access=restricted` is a floor: if the manifest then says Public, the phone refuses the feed.

What the subscriber sees is on [Connect servers and feeds](/docs/connecting-servers#join-a-restricted-feed).

## 4. Approve devices

Each subscriber's phone sends a request signed by their wallet and bound to a key in that phone's Keystore. Your eligibility rule decides it. With the demo's rule, **manual approval**, every request waits for you on the **Devices · feed access** page.

**Where it is.** In the CopyTrading demo, the password-protected trader UI links to it from the signals page: `/trader/devices` when run with `go run ./cmd/copytrading-admin` (default `http://127.0.0.1:8096/trader/devices`), or `/devices` on port 8096 with Docker's `--profile admin`. See [Copy trading for your subscribers](/docs/recipe-copytrading#4-approve-your-subscribers).

**What a row shows.** The wallet that signed the request, the device's **label** (what the phone calls itself, marked *user-supplied*: a claim, never a reason to approve), the **installation** (the fingerprint of the device key the wallet signed for), when it was requested and decided, and where its access stands.

| Button | Shown when | What it does |
| --- | --- | --- |
| **Approve** | The request is pending | Approves this one device and issues a single-use invitation for it |
| **Reject** | The request is pending | The device receives no grant |
| **Reissue invitation** | The device is approved and has neither a live invitation nor a live grant | Issues a fresh invitation. The previous one stops working |
| **Revoke device** | The request is pending or approved | Ends this device's access |
| **Revoke all devices of this wallet** | The request is pending or approved | Ends access for every device that proved this wallet |

Approving one device never approves another, even of the same wallet. A second phone is a second request.

**The invitation.** After approval the row shows the invitation as a link and a QR code, single use, for that device only, until it expires (five minutes by default). The subscriber does not need either: their phone redeems the invitation by itself the next time it checks, every few seconds while SAC is open, or when they open the feed or tap **Refresh**. Showing the invitation is safe: it is bound to one device key, so on any other device it does nothing. If it expires unused, press **Reissue invitation**.

### Access states

| State | Page says | Means |
| --- | --- | --- |
| `pending_approval` | Pending approval | Waiting for your decision |
| `rejected` | Rejected | No grant. The subscriber can send a new request |
| `invited` | Approved — waiting for the device to redeem its invitation | Approved; the phone has not redeemed yet |
| `invitation_expired` | Approved — the invitation expired before the device used it; reissue it | Press **Reissue invitation** |
| `grant_pending` | Approved — the gateway has not confirmed the grant yet | Redeemed; the gateway has not confirmed the grant |
| `connected` | Connected — the gateway admits this device until *time* | Reading. Renewed automatically while approved |
| `expired` | Grant expired at the gateway — renewal has not reached it | The renewal has not landed |
| `revocation_pending` | Revocation pending at the gateway — this device can still read until the gateway confirms | Revoked here, **not yet** at the gateway |
| `revoked` | Revoked — the gateway confirmed | The device can no longer read |

The same actions are available to your own tools through the token-protected API. Every call takes `Authorization: Bearer $PUBLISHER_API_TOKEN`:

| Call | Does |
| --- | --- |
| `GET /v1/access/devices` | Lists devices with the states above |
| `POST /v1/access/devices/{id}/approve`, `…/reject`, `…/revoke`, `…/reissue` | Acts on one device. Optional body `{"by":"<who decided>"}` |
| `POST /v1/access/wallets/{wallet}/revoke` | Revokes every device of a wallet. Answers `{"revoked": <count>}` |

Only your server's own process writes its access database. A billing webhook or another admin tool calls these routes; it does not open the database.

## 5. When the gateway has not confirmed

Your server records each decision first and then tells the gateway, retrying until the gateway confirms. Two states exist so that nobody is told something that is not yet true.

- **`grant_pending`**: you approved and the phone redeemed, but the gateway has not confirmed the grant. The phone may not read yet.
- **`revocation_pending`**: you revoked, but the gateway has not confirmed. **The device can still read.** Do not treat it as revoked.

While a row is in either state, the page shows the attempt count and the last error. The server retries on its own, backing off from one second to one minute, and checks every 15 seconds.

If a row stays there:

1. Read the last error on the row.
2. Check that your server can reach `PUBLISHER_PUBLISH_URL` and that `BROADCAST_CREDENTIAL` is still valid. `unauthenticated` means the credential was revoked or rotated away.
3. Ask the operator whether the feed is still registered as Restricted. A grant call for a Public feed is refused with `NOT_RESTRICTED`.
4. Leave the server running. Nothing needs to be resent by hand: the pending change goes out when the gateway answers.

While your server cannot reach the gateway, an approved device keeps reading for at most one grant lifetime, and a revoked device for at most what is left of its grant, because nothing renews a grant you revoked. With the default settings, that bound is **six hours**. Set a shorter `PUBLISHER_ACCESS_GRANT_HOURS` for a tighter bound, at the cost of more renewal traffic. The gateway caps any grant at its own maximum (24 hours by default) and shortens a longer request.

## What the gateway enforces

| On a Restricted channel | Requires |
| --- | --- |
| The manifest | Nothing. It is answered to anyone, because a phone needs it to know where to prove a wallet |
| Listing and reading signals | A live grant's session, on every page |
| Live updates | A stream ticket that names the channel only for a live grant, and lasts no longer than it |
| Online/offline status | A live grant's session; otherwise the channel is left out |
| Push | A per-device target registered under the grant's session. Restricted channels never use a shared push topic |

There is no anonymous fallback. When a device is revoked, the gateway stops admitting it on its next read, and devices still attached to live updates receive nothing further. **Revocation does not depend on push**: a push is a content-free wake-up that grants nothing, and one that never arrives changes nothing about whether access ended.

**Revocation cannot erase what was delivered.** It stops future reads, live updates, reconnects and renewals. Signals already on a subscriber's phone stay there, and the app tells them so.

## Who knows what

| | Holds | Never holds |
| --- | --- | --- |
| Your server | The wallet address that proved itself, the device key it bound, the phone's label, your decision, invitations, grant IDs, and a digest of each session | What a subscriber did with a signal: no amount, decision, transaction, or result |
| The gateway | A grant ID, one opaque reference per wallet and one per device, the SHA-256 of the session, an expiry, and a push target while one is registered | The wallet address, the wallet signature, the device's label, or the session itself |
| The phone | A per-feed device key in the Android Keystore, the session, and its own record of the request | — |

The subscriber's **wallet private key never leaves their wallet**. The wallet signs one plain-text message that says it is not a transaction and moves no funds. The phone's separate **device key** is created in the Android Keystore for this feed only and signs every later step, so status checks, redemption and reconnects never open the wallet again.

Subscriber amounts, trading decisions and results stay on the phone, exactly as with a Public feed. Every approved subscriber receives the same publication: a Restricted feed gates who reads, it does not personalise what they read, and nothing is traded automatically.

## Next

- [Paid membership](/docs/recipe-paid-membership): approve automatically from your own membership records.
- [Copy trading for your subscribers](/docs/recipe-copytrading): the shipped Restricted demo, end to end.
- [Errors and limits](/docs/errors-and-limits#restricted-feeds): every refusal code and default.
