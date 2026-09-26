---
title: Welcome to Seeker Agent Connect
excerpt: The phone app that reviews requests from your agents and from public feeds. The wallet you already have still signs.
hidden: false
---

Seeker Agent Connect (SAC) is an Android app for the Solana Seeker. Servers send you **private requests** and **public feed signals**. You review each one on the phone. When something needs a signature, **Seed Vault Wallet**, the wallet you already have, signs it.

SAC never creates a wallet, never holds a key, and never signs on its own. Connecting a server or adding a feed only lets that server send you something to review.

## Three ways in

| You are | What you do | Start here |
| --- | --- | --- |
| **An app user** | Connect your wallet, add a server or a feed, review what arrives | [Connect your wallet](/docs/wallet-setup) |
| **Running your own MCP server** | Run the server on your machine, connect your agent, and let it hand you a pairing link for the phone | [Quickstart](/docs/mcp-quickstart) |
| **Running a feed server** | Publish a signal once; the gateway delivers it to everyone who added your feed | [What the gateway does](/docs/feed-gateway) |

If you are not sure which one you are, read [How it works](/docs/how-it-works) first. It is one diagram.

## What a request can be

Acknowledge a message, sign a message, transfer SOL or a token, swap, place a prediction order, or stake SKR. Every one of them waits for your tap on the phone, and then for the wallet. Nothing is automatic.

## Sandbox

A feed can run in **sandbox**: the phone fetches the same market data and builds the same transaction as in production, then stops. Nothing is signed and nothing is sent. Sandbox is not a Solana network. Connections to your own MCP server are always production.

## Recipes

Two worked examples show what you can build: [copy trading for your own audience](/docs/recipe-copytrading) and [prediction markets with your own filters](/docs/recipe-prediction).

This site describes [SeekerAgentConnect](https://github.com/BrRenat/SeekerAgentConnect) at commit `ce340cdc008efef4dce3cddc591616dba1ba4012`. See the [source mapping](/docs/source-mapping).
