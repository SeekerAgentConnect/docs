---
title: Pair your phone and enable push
description: "The pairing link, reaching the server from the phone, and push wake-ups through the SAC relay. Shared by both MCP servers and any direct server."
slug: /pair-your-phone
sidebar_position: 4
---

Both supplied MCP servers, and any server built on the [Direct Server SDK](/docs/server-sdk), connect to a phone the same way. This page is the shared part; each server's guide links here.

## Before you pair {#before-you-pair}

- **SAC is installed** and at least one wallet is saved on the phone, on a network your server declares ([Connect your wallets](/docs/wallet-setup), [Declare your networks](/docs/direct-or-feed#supported-networks)). Pairing works without a wallet, but no request that needs one can be answered.
- **The phone can reach the server.** The pairing link carries the server's public address (`SIDECAR_PUBLIC_URL` on the general server, `SKR_STAKING_PUBLIC_URL` on the SKR Staking server). Pick the case that fits:

| Where the server runs | What the phone needs |
| --- | --- |
| Your computer, phone on USB (development) | `adb reverse tcp:8080 tcp:8080` (or `8090` for SKR Staking), and the address left on loopback |
| A private network such as a VPN | An HTTPS address on that network with a publicly trusted certificate |
| A hosted server | Public HTTPS with HTTP/2 end to end, so live updates can stream |

:::warning
Self-signed certificates do not work, and plain HTTP works only on loopback. Never expose plain HTTP to the internet.
:::

## Step 1: Get a pairing link {#get-a-pairing-link}

Ask your agent to connect your phone. It calls the server's pairing tool, `vault_create_pairing_link` on the general server or `skr_create_pairing_link` on the SKR Staking server, and gets back:

- `https_url`: a page on your server at `/pair`, with the one-use code in the part after `#`;
- `pairing_uri`: the same code as a `seekervault://pair?…` line, for pasting.

Have the agent show the **whole** `https_url`, or a link whose target is the whole address. A shortened or wrapped link is treated as damaged and the page will not open the app.

From a terminal on the server you can print the same code as a QR instead: `pnpm pair` in a source checkout of the general server, or the `pair` command of either server's CLI.

:::caution[Treat the link as a secret]
Until it is used, anyone who opens it on their phone could pair instead of you. It expires after ten minutes (`PAIRING_TOKEN_TTL_SECONDS`), works once, and a newer link voids an older unused one.
:::

## Step 2: Confirm on the phone {#confirm-on-the-phone}

1. Open the link on the phone and tap **Open Seeker Agent Connect**, or scan the QR, or paste the `seekervault://pair` line into **Add connection**.
2. Check the server address on **Pair with this server?**
3. Tap **Pair**.
4. The server's page opens with the wallet picker. Choose the wallet this server should use and tap **Use this wallet**. It lists only wallets on the networks your server declares.

Opening the link or loading the page does nothing by itself; only **Pair** in the app pairs.

**Expected result:** the server appears on the app's connections list with its wallet, the server receives that wallet's address and network, and your agent's next request arrives in the Inbox.

A server has **one** paired phone. When a phone is already paired, the tool result includes a `warning`: pairing again from any phone replaces the old pairing and cancels its pending requests. Creating the link alone does not.

## Step 3: Enable push wake-ups (optional) {#enable-push}

While SAC is open, requests arrive live over the server's own connection. To wake the phone when the app is closed, the server needs a way to send a push. For servers that are not part of the SAC Firebase project, that way is the **SAC relay** on the SAC-operated gateway:

1. Ask the SAC team to register your server for the relay ([Connect to the SAC gateway](/docs/connect-to-gateway#direct-server-push)). You receive a server ID, a relay credential and the gateway address.
2. Set all three on your server and restart it:

| Server | Variables |
| --- | --- |
| General SAC MCP server | `RELAY_URL`, `RELAY_SERVER_ID`, `RELAY_CREDENTIAL` |
| SKR Staking MCP server | `SKR_STAKING_RELAY_URL`, `SKR_STAKING_RELAY_SERVER_ID`, `SKR_STAKING_RELAY_CREDENTIAL` |
| Direct Server SDK | `relay: { relayUrl, serverId, credential }` in `openDirectServer` |

3. The phone learns about the relay the next time it syncs with your server; no re-pairing is needed.

Set all three values or none; a partial set is refused at startup. The relay sends only a content-free wake-up; the phone then reads the request from your server directly. Nothing about the request passes through the gateway. The phone accepts wake-ups only from the relay address built into the app, so a relay you run yourself cannot wake a production SAC build.

**Expected result:** with the app closed, a new request produces a notification. If it does not, check that notifications are allowed for SAC in Android settings ([Notifications](/docs/notifications)).

<details>
<summary>The general server can use Firebase directly instead</summary>

The general MCP server can send pushes through its own Firebase project with `FCM_PROJECT_ID` and Application Default Credentials. That only reaches an app build configured for the same Firebase project, so it is for development builds. `FCM_PROJECT_ID` and the relay variables are mutually exclusive.

</details>

## Troubleshooting pairing {#troubleshooting}

| The app or page says | What to do |
| --- | --- |
| The pairing link is damaged or incomplete | Open the whole `https_url`, or paste the whole `seekervault://pair` line |
| The server refused the code | The link was used, expired, or replaced. Ask the agent for a new one |
| The certificate isn't trusted | The server needs a publicly trusted HTTPS certificate |
| **Couldn't reach the server** | Start the server, check the address, or run `adb reverse` again over USB |
| **No live updates** | The server answers but does not stream: it needs HTTP/2 end to end. Pull to refresh still works |

## Next

- [Connect your agent](/docs/connect-your-agent) if the agent is not connected yet.
- [Review requests and signals](/docs/reviewing-requests) for what happens on the phone.
