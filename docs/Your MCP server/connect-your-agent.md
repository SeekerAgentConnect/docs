---
title: Connect your agent
excerpt: Hermes, OpenClaw, or Claude. Each one asks; you still approve on the phone.
hidden: false
---

Every client needs the same two things: the MCP URL and the bearer token from `MCP_TOKEN`. Keep the token out of config files. Anyone who has it can queue requests for you to answer.

## Hermes

Merge into `mcp_servers` in `~/.hermes/config.yaml`, and put `MCP_SEEKER_VAULT_API_KEY=<MCP_TOKEN>` in `~/.hermes/.env`:

```yaml
mcp_servers:
  seeker_vault:
    url: "http://127.0.0.1:8080/mcp"
    headers:
      Authorization: "Bearer ${MCP_SEEKER_VAULT_API_KEY}"
    timeout: 90
    tools:
      include:
        [vault_get_address, vault_get_capabilities, vault_sign_message, vault_transfer,
         vault_get_request, vault_cancel_request, vault_create_pairing_link]
```

Check with `hermes mcp test seeker_vault`. Hermes names the tools `mcp__seeker_vault__<tool>`. The full entry, including the two development-only tools, is `examples/hermes.config.yaml` in the repository.

## OpenClaw

```sh
openclaw mcp set seeker_vault '{
  "url":"http://127.0.0.1:8080/mcp",
  "transport":"streamable-http",
  "headers":{"Authorization":"Bearer ${MCP_SEEKER_VAULT_API_KEY}"},
  "requestTimeoutMs":90000
}'
openclaw mcp probe seeker_vault --json
```

`transport` is required: the server speaks Streamable HTTP, not the older SSE transport.

## Claude

A hosted client should not hold your token. Turn on OAuth instead: set `MCP_OAUTH_ISSUER` to your authorization server and `MCP_OAUTH_SCOPE` to the scope it issues, on a server with public HTTPS. Then add `https://direct.example.com:8443/mcp` as a custom connector in Claude's settings; Claude signs in at your authorization server and receives a short-lived token. The MCP server only validates tokens; it is not an authorization server and does not host sign-in.

## The pairing link

When the agent calls `vault_create_pairing_link`, have it show the whole `https_url`, or a "Connect your phone" link whose target is that whole address. A shortened or wrapped link is refused by the pairing page. The link is a one-use secret; the owner still confirms on the phone.

## Remote agents

An agent on another machine needs an address it can reach. Add that hostname to `MCP_ALLOWED_HOSTS` and use HTTPS. Never expose plain HTTP to the internet.
