---
title: OpenClaw
excerpt: Register the MCP server in OpenClaw as a streamable-http server with a bearer token. OpenClaw asks; it is not an approval surface.
hidden: false
---

These instructions target OpenClaw **2026.9.5** and follow that version's MCP registry, transport and environment references. OpenClaw was not installed where the packaged server was built, so a real OpenClaw run against it is **not recorded**. The endpoint itself was exercised with the official MCP SDK, including tool discovery and a full request and phone-result round trip. The checks below are the follow-up on a host that has OpenClaw.

## Start the server first

Any route in the [walkthrough](/docs/direct-sidecar-walkthrough): source, packed tarball, or Docker. Keep it running and confirm:

```sh
curl --fail http://127.0.0.1:8080/healthz
```

The server speaks sessionful MCP Streamable HTTP at `/mcp`. It does not speak MCP stdio. Do not put `npx`, `npm exec`, or `seeker-agent-connect-mcp start` in an OpenClaw command or arguments entry: that starts a long-running HTTP server, not a child process.

## Add the HTTP server

Keep the credential outside the registry entry:

```sh
mkdir -p ~/.openclaw
printf 'MCP_SEEKER_VAULT_API_KEY=%s\n' "replace-with-mcp-token" >> ~/.openclaw/.env
chmod 600 ~/.openclaw/.env
```

If the variable already exists, edit it rather than appending. Then register the server with the transport named explicitly:

```sh
openclaw mcp set seeker_vault '{
  "url":"http://127.0.0.1:8080/mcp",
  "transport":"streamable-http",
  "headers":{"Authorization":"Bearer ${MCP_SEEKER_VAULT_API_KEY}"},
  "connectionTimeoutMs":30000,
  "requestTimeoutMs":90000,
  "toolFilter":{"include":[
    "vault_display_command",
    "vault_get_address",
    "vault_get_capabilities",
    "vault_sign_message",
    "vault_transfer",
    "vault_request_ack",
    "vault_get_request",
    "vault_cancel_request",
    "vault_create_pairing_link"
  ]}
}'
```

- `transport` is deliberate: an omitted transport selects OpenClaw's legacy SSE behaviour, which is not this endpoint.
- `requestTimeoutMs` exceeds the 60-second default live-display deadline; the durable tools return at once.
- Tools the deployment does not serve are absent: `vault_request_ack` needs `MCP_DEMO_TOOLS=true`, `vault_transfer` needs `SOLANA_RPC_URL`.
- The qualified tool name is `seeker_vault__<tool>`, for example `seeker_vault__vault_get_capabilities`.

## Verify the real client

```sh
openclaw mcp doctor seeker_vault --probe
openclaw mcp probe seeker_vault --json
```

The probe must connect over `streamable-http` and list the intended tools. A listing is not a request test. Pair a phone, enable the demo tool, call `vault_request_ack` with a unique `idempotency_key`, answer it on the phone, and call `vault_get_request` until it is terminal. `PENDING` means stored, not approved. The wallet tools work the same way: `vault_sign_message`, then **Approve and sign** on the phone, then `vault_get_request`.

`MCP_TOKEN` is only the agent credential. The pairing code is a one-use credential, the paired phone gets another, and wallet authorization stays inside the wallet app. Never reuse one for another role or put any of them in a prompt.

## Pairing from OpenClaw

`vault_create_pairing_link` returns `https_url` and `pairing_uri`. Show both whole, or a "Connect your phone" link whose target is the entire `https_url`. The pairing page refuses a shortened or wrapped link. The owner still confirms on the phone.

## Remote agents and the phone's second leg

When OpenClaw runs on another machine, change `url` to an address that machine can reach and add its host to `MCP_ALLOWED_HOSTS`. Use trusted HTTPS on an exposed network, and never disable certificate verification. On a public deployment with native TLS the address is `https://direct.example.com:8443/mcp`.

The phone separately calls `SIDECAR_PUBLIC_URL`. OpenClaw reaching `127.0.0.1` does not make that address reachable from a phone: a real phone needs a trusted HTTPS origin, and live updates need HTTP/2 end to end. See [Direct ingress and native TLS](/docs/direct-sidecar-proxy). Pair only once the advertised URL is the one the phone can reach.

The static bearer above is the tested baseline. The server can instead validate OAuth access tokens from an external issuer ([Claude](/docs/claude)); do not leave the fixed header in place for that profile.
