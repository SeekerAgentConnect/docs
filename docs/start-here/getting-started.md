---
title: Welcome to Seeker Agent Connect
description: "The phone app that reviews requests from your agents and signals from feeds, public or subscriber-only. The wallet you already have still signs."
slug: /getting-started
sidebar_position: 1
---

Seeker Agent Connect (SAC) is an Android app for the Solana Seeker. Servers send you **private requests** and **feed signals**. You review each one on the phone. When something needs a signature, **Seed Vault Wallet**, the wallet you already have, signs it.

SAC never creates a wallet, never holds your wallet's keys, and never signs on its own. Connecting a server or adding a feed only lets that server send you something to review.

## Three ways in

| You are | What you do | Start here |
| --- | --- | --- |
| **An app user** | Connect your wallet, add a server or a feed, review what arrives | [Connect your wallet](/docs/wallet-setup) |
| **Running your own MCP server** | Run the server on your machine, connect your agent, and let it hand you a pairing link for the phone | [Quickstart](/docs/mcp-quickstart) |
| **Running a feed server** | Publish a signal once; the gateway delivers it to your subscribers, everyone or only those you approved | [What the gateway does](/docs/feed-gateway) |

If you are not sure which one you are, read [How it works](/docs/how-it-works) first. It is one diagram.

## Publish to a private audience

A feed can be **Public**, open to anyone with its link, or **Restricted**, open only to subscribers you approve. Grant access to selected users, offer a paid membership, and revoke access when someone is no longer eligible. SAC delivers your signals to approved subscribers, and each subscriber decides what to do from their own wallet.

- A **paid trading-signal community**: members who paid you get your trade ideas in SAC.
- An **invite-only analyst group**: you approve each person by hand.
- A **service with a subscription**: a subscription in your own system unlocks the feed.

A subscriber proves which wallet they control by signing one message, which moves no funds. You decide per wallet, and the gateway enforces it for each approved device. Pricing, checkout and billing stay in your own system: SAC controls delivery, not payment. Every approved subscriber receives the same signal, and nothing is traded for them. See [Run a Restricted feed](/docs/restricted-feeds) and [Paid membership](/docs/recipe-paid-membership).

A feed is a stream of signals and requests to review, not audio or video streaming.

## What a request can be

Acknowledge a message, sign a message, transfer SOL or a token, swap, place a prediction order, or stake SKR. Every one of them waits for your tap on the phone, and then for the wallet. Nothing is automatic.

## Sandbox

A feed can run in **sandbox**: the phone fetches the same market data and builds the same transaction as in production, then stops. Nothing is signed and nothing is sent. Sandbox is not a Solana network. Connections to your own MCP server are always production.

## Recipes

Three worked examples show what you can build: [copy trading for your subscribers](/docs/recipe-copytrading), a Restricted feed; [paid membership](/docs/recipe-paid-membership), approving members automatically; and [prediction markets with your own filters](/docs/recipe-prediction), a Public feed.

This site describes [SeekerAgentConnect](https://github.com/BrRenat/SeekerAgentConnect). The source revision each page was checked against is on the [source mapping](/docs/source-mapping).
