---
title: Restricted access reference
description: "The publisher's /access/v1 contract, the gateway's grant calls, the session a phone presents, the admin API, access states and publisher settings for Restricted feeds."
slug: /restricted-access-reference
sidebar_position: 3
---

The guide is [Run a Restricted feed](/docs/restricted-feeds). This page is the exact contract a custom backend implements, and what the publisher library already implements.

## The publisher's endpoint: `/access/v1` {#access-v1}

Served by the publisher at its registered authentication origin. Public, credential-free, signature-checked. Bodies are strict JSON of at most 16 KiB. Errors answer `{"error": "<code>", "detail": "…"}` ([codes](/docs/errors-and-limits#restricted-feeds)).

| Call | Body | Answer |
| --- | --- | --- |
| `POST /access/v1/challenges` | `feed`, `wallet`, `device_key`, `label` | `attempt`, `nonce`, `issued_at`, `expires_at`, `auth_origin`, `feed`, `installation`, `message` |
| `POST /access/v1/requests` | `attempt`, `wallet_signature`, `device_signature` | `request_id`, `state` |
| `POST /access/v1/requests/{id}/status` | `at`, `device_signature` | `request_id`, `state`, `connected`, and `invitation` while one is live |
| `POST /access/v1/redeem` | `feed`, `invitation`, `at`, `device_signature` | `request_id`, `session`, `grant_id`, `until`, `gateway` |

## Two keys {#two-keys}

- **The wallet** (Ed25519) signs exactly one thing: the challenge `message`, plain ASCII that names the authentication origin, the feed, the wallet, the device key, the attempt, a nonce and two timestamps, begins `Seeker Agent Connect feed access v1`, and says *This is not a transaction. Signing it moves no funds and approves nothing.* The phone rebuilds that text from the fields and compares it before the wallet opens.
- **The device key** (P-256, generated in the Android Keystore for this feed, sent as X.509 SubjectPublicKeyInfo) signs the same bytes, which binds the request to this installation, and then signs every status check and redemption. `installation` is the hex of the first 10 bytes of the device key's SHA-256.

A signed moment (`at`) more than five minutes from the server's clock is refused as `stale_proof`. A challenge is single use and lasts five minutes by default.

## The gateway's grant calls {#grant-calls}

On the publisher API, authenticated with the publisher credential:

| Call | Does |
| --- | --- |
| `DescribeAccess` | Answers the policy and authentication origin the feed is registered with, and `most_grant_seconds`, the longest grant the gateway honours |
| `GrantAccess` | Grants or renews: a grant ID, an opaque subscriber reference (one per wallet), an opaque device reference (one per device), the SHA-256 of the session, and a lifetime. Answers the `lifetime_seconds` it applied, which may be shorter |
| `RevokeAccess` | Revokes 1 to 64 grant IDs on the caller's channel. Answers how many it revoked |

The gateway never receives a wallet address or a wallet signature.

## What the phone presents {#session}

A `session` on `ListRequests`, `ListProposals` (every page), `GetRequest`, `GetProposal`, `GetFeedStatus`, `GetStreamTicket` and `SetFeedPushTarget`. A Restricted channel never appears in `GetFeedTopics`; each approved device registers its own push target under its grant instead. After a revocation, the gateway moves the channel's stream name, so a listener attached under the old one receives nothing more; it gets one field-less `AccessChanged` event and must ask for a new ticket.

## Admin API (publisher library) {#admin-api}

On the publisher's own API, behind `Authorization: Bearer $PUBLISHER_API_TOKEN`:

| Call | Does |
| --- | --- |
| `GET /v1/access/devices` | Lists devices with their access state |
| `POST /v1/access/devices/{id}/approve`, `…/reject`, `…/revoke`, `…/reissue` | Acts on one device. Optional body `{"by":"<who decided>"}` |
| `POST /v1/access/wallets/{wallet}/revoke` | Revokes every device of a wallet. Answers `{"revoked": <count>}` |

## Access states {#access-states}

| Publisher state | Phone shows |
| --- | --- |
| `pending_approval` | Waiting for the publisher to approve this device. |
| `rejected` | The publisher didn't approve this device. |
| `invited`, `invitation_expired`, `grant_pending` | Approved. Finishing the connection… |
| `connected` | Signals arrive |
| `expired` | This device's access to the feed has run out. |
| `revocation_pending` | Signals still arrive until the gateway confirms |
| `revoked` | The publisher revoked this device's access to the feed. |

What each publisher state means and what to do is on [Manage subscriber access](/docs/manage-subscriber-access#access-states); the subscriber's side is on [Join a Restricted feed](/docs/join-restricted-feed#access-states).

## Publisher settings (publisher library) {#publisher-settings}

| Variable | Default | What it is |
| --- | --- | --- |
| `PUBLISHER_AUTH_ORIGIN` | Required | The origin phones reach `/access/v1` at, exactly as registered |
| `PUBLISHER_AUTH_ADDRESS` | Empty | A separate `host:port` listener for `/access/v1`. Empty serves it beside the `/v1` API on `PUBLISHER_API_ADDRESS` |
| `PUBLISHER_ACCESS_GRANT_HOURS` | `6` (1 to 720) | Grant lifetime; renewed when a third is left. Also the bound on how long access outlives the server's reach to the gateway |
| `PUBLISHER_ACCESS_INVITATION_MINUTES` | `5` (1 to 60) | How long an approved device has to redeem its invitation |
| `PUBLISHER_ACCESS_CHALLENGES_PER_HOUR` | `60` | Wallet challenges per client IP address per hour; status checks and redemptions get twenty times it. Behind a proxy, the first `X-Forwarded-For` address counts |

The ordinary publisher settings (`PUBLISHER_SERVER_ID`, `PUBLISHER_GATEWAY_URL`, `PUBLISHER_PUBLISH_URL`, `PUBLISHER_ENVIRONMENT`, `BROADCAST_CREDENTIAL`, `PUBLISHER_API_TOKEN`) are on [Connect to the SAC gateway](/docs/connect-to-gateway#configure).
