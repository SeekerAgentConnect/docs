---
title: Waking a phone through the relay
excerpt: A direct server you host can wake a backgrounded phone through the feed gateway's push relay — a scoped relay credential, three settings, and one content-free message. No Firebase project of your own.
hidden: false
---

A direct server holds the phone's authenticated connection, but a backgrounded app has no connection to carry anything, and waking an Android device needs a Firebase project and a service-account credential. The gateway relay is the alternative: **the gateway operator holds the Firebase credential, you hold a scoped relay credential that does one thing, and the owner's phone decides which servers may wake it.** Nothing else about your server changes.

This is not the retired private mode coming back. It routes a wake-up, never a request, a decision, or a result.

## 1. Ask the operator for a relay credential

Ask the operator of the gateway the owner's app is built for to register your server with the **relay** capability — the same registration as a publisher, with the relay box ticked, or on the host:

```sh
feed-gatewayctl register --server 3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d --label "my server" --for relay
# capabilities relay
# server      3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
# credential  <8-character handle>
#
# <the credential, shown once>
```

A relay-only registration publishes no feed and needs no manifest. You get three things: your **server ID**, the **relay credential** (shown once, stored as a hash), and the gateway's **origin**. You are never given a Firebase project, service account, API key, or device target. A relay credential cannot publish a feed, is not an admin credential, and is refused by the publisher API. A server that both publishes and relays holds one credential per capability; a credential is for one of them. The gateway itself needs `BROADCAST_PUSH_CREDENTIALS` ([operator setup](/docs/firebase)).

## 2. Configure your server

All three or none; two of three refuses to start.

```sh
RELAY_URL=https://feeds.example.com          # the gateway's origin, as the operator gave it
RELAY_SERVER_ID=3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
RELAY_CREDENTIAL=replace-with-relay-credential
```

Those are the MCP server's names; the SKR staking server reads `SKR_STAKING_RELAY_URL`, `SKR_STAKING_RELAY_SERVER_ID`, `SKR_STAKING_RELAY_CREDENTIAL`. On the [SDK](/docs/direct-server-sdk) it is one option:

```ts
openDirectServer({
  // …
  relay: {
    relayUrl: "https://feeds.example.com",
    serverId: "3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
    credential: process.env.RELAY_CREDENTIAL!,
  },
});
```

Direct Firebase (`FCM_PROJECT_ID`, or `invalidationSender` on the SDK) **and** the relay together are refused at startup: both fire on the same committed update, and a phone would be woken twice. A relay URL that is not an origin, or a server ID that is not a lowercase UUID, is a named startup failure.

## 3. What the phone does

Pairing does not change. Afterwards, over the authenticated connection:

1. Your server **advertises** the relay: `PairingService.GetConnectionCapabilities` answers `relay { protocol_version: 1, relay_url, server_id }`. The SDK does this once `relay` is configured.
2. The phone **compares** `relay_url` with the one relay origin its build was configured to trust, and ignores anything else. Naming an address of your own gets you nothing.
3. The phone **enrols** its installation with the gateway and **authorises** a binding: its installation, your server ID, this connection.
4. The gateway issues an opaque **handle**; the phone hands it to you with `PairingService.SetRelayHandle`, and the SDK stores it against the connection. It is not an FCM target and is never stored as one.

## 4. What is relayed

After a request commits, the SDK coalesces updates per connection and calls:

```http
POST https://feeds.example.com/relay/v1/notify
Authorization: Bearer <your relay credential>
Content-Type: application/json

{"version":"1","handle":"<the handle the phone gave you>","hint":"created"}
```

`hint` is `created` or `updated` and chooses Android delivery priority, nothing else. The gateway builds the message from constants:

```json
{ "data": { "kind": "request_invalidation", "version": "1" },
  "android": { "collapse_key": "seeker-vault-request-state-v1", "priority": "HIGH", "ttl": "300s" } }
```

That is the whole payload, and you cannot add to it. The phone then reads **your** server, authenticated, and renders what it says.

**Never relayed:** the request, its title or text, an approval, a signature, a result, a wallet, an amount, or anything the owner decided. The gateway learns that a registered server had something for a device that authorised it, and when.

| Answer | Meaning |
| --- | --- |
| `202` `accepted` | Firebase was asked. Not a promise a phone was woken |
| `200` `coalesced` | That device is already being woken; nothing to retry |
| `401` | Credential unknown, revoked, a publishing credential, or the relay switched off |
| `403` | The handle does not authorise you: fabricated, revoked, expired, or somebody else's |
| `429` | Too many; the next committed update is the retry |
| `503` | Outage, rejected device target, or no Firebase credential at the gateway yet |

**Best effort.** The SDK swallows every outcome. A request that was created, committed, and answered is not undone by a phone hearing late; an unreachable relay never fails a create, a synchronisation, or a decision. A `403` compare-clears the handle, so a racing re-authorisation is kept.

**Bounds.** Two sends a second per server with twenty in hand, one wake-up every two seconds per device with five in hand, and a deployment ceiling (`BROADCAST_RELAY_*`). Above the per-device rate the answer is `coalesced`.

## What ends what

| | Does | Does not |
| --- | --- | --- |
| **Rotate** (`rotate --for relay`) | Adds a second credential; both work | Revoke the old one afterwards |
| **Revoke** a credential | Refused from the next call | End any authorisation; a new credential resumes waking the same phones |
| **Disable** the relay capability | Every relay credential refused while off | Recall messages already handed to Firebase |
| **Owner disconnects** | The binding is revoked; the next `notify` is `403` and the SDK clears the handle | Need anything on your side |
| **Forget the server** | Registration, credentials, and every authorisation | Unpair anybody; they stop being woken through the gateway |

A binding lasts a month unless the phone renews it; a still-paired phone re-authorises on its next reconciliation. If the gateway loses its data, bindings do not survive: the phone enrols again and re-authorises, and you need a re-registration and the same three settings. No re-pairing.

## Three push paths

| | Feed topics | Gateway relay | Direct Firebase |
| --- | --- | --- | --- |
| Which servers | Publishers | Direct servers | Direct servers |
| Who is woken | Everyone subscribed to a public topic | One device that authorised this server | One device paired with this server |
| Who holds Firebase | The operator | The operator | You |
| You configure | Nothing | Relay URL, server ID, one credential | `FCM_PROJECT_ID` and application default credentials |
