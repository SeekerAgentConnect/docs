---
title: Hermes
excerpt: Point Hermes at the MCP server's /mcp endpoint with a bearer token. Hermes asks; the owner still reviews on the phone and confirms in the wallet.
hidden: false
---

Hermes Agent talks to the MCP server as a Streamable HTTP client. These instructions target Hermes **v0.21.3 (v2026.9.14)** and its official MCP configuration reference. That version has not been run against the packaged server. v0.21.1 was run against the same endpoint and configuration, including through a forwarded port, and the owner later passed a physical-Seeker round trip.

## Setup

1. Start the server by any route in the [walkthrough](/docs/direct-sidecar-walkthrough), pair the phone, connect the wallet. You need `MCP_TOKEN`, never `PHONE_TOKEN`.
2. Merge the `seeker_vault` entry from `examples/hermes.config.yaml` into `mcp_servers` in `~/.hermes/config.yaml`. Back the file up first; do not replace it or remove other entries.
3. Keep the token out of the config file:

```sh
printf 'MCP_SEEKER_VAULT_API_KEY=%s\n' "replace-with-mcp-token" >> ~/.hermes/.env
chmod 600 ~/.hermes/.env
```

The entry:

```yaml
mcp_servers:
  seeker_vault:
    url: "http://127.0.0.1:8080/mcp"
    headers:
      Authorization: "Bearer ${MCP_SEEKER_VAULT_API_KEY}"
    timeout: 90
    tools:
      include:
        [
          vault_display_command,
          vault_get_address,
          vault_get_capabilities,
          vault_sign_message,
          vault_transfer,
          vault_request_ack,
          vault_get_request,
          vault_cancel_request,
          vault_create_pairing_link,
        ]
      resources: false
      prompts: false
```

- `timeout` is seconds. Only `vault_display_command` waits for the owner: keep the value above `LIVE_COMMAND_TIMEOUT_SECONDS` (60 by default) and below Hermes's 300-second HTTP limit. The durable tools answer at once.
- A tool in `include` that the server does not serve is absent from the session: `vault_transfer` needs `SOLANA_RPC_URL`, `vault_request_ack` needs `MCP_DEMO_TOOLS=true`.
- Hermes names each tool `mcp__seeker_vault__<tool>`.
- An unset variable is sent as literal text, and the server answers 401.

Check, then reload:

```sh
hermes mcp list
hermes mcp test seeker_vault
```

Hermes connects when a session starts. After a configuration change, or if the server was down at startup, type `/reload-mcp` in the session.

## The round trip

1. **Read what is served**: `vault_get_capabilities`. `approval` is always `manual`; treat anything missing from `operations` as unavailable.
2. **Read the wallet**: `vault_get_address`. Naming another wallet is `WALLET_MISMATCH`; none connected is `WALLET_NOT_CONNECTED`.
3. **Create**: `vault_sign_message` with the wallet, the message, and an `idempotency_key`. The answer is `PENDING` with a `request_id`. Nothing is signed.
4. **Answer on the phone**: open **Inbox**, check the message, tap **Approve and sign**, confirm in the wallet.
5. **Read later**: `vault_get_request` until `terminal` is true. `COMPLETED` carries `signature` and `signed_message_base64`; verify the signature against those bytes yourself.

Statuses: wait on `PENDING` and `PROCESSING`; poll through `SUBMITTED`; `REJECTED` and `EXPIRED` are answers, not errors; **never retry `UNKNOWN`**.

The model saying "done" is not the tool result. Count a pass only when the phone showed the request, the tool JSON shows a terminal status, and the server log agrees.

## Pairing from Hermes

`vault_create_pairing_link` returns `https_url` and `pairing_uri`. Have Hermes show both whole, or a "Connect your phone" link whose target is the entire `https_url`. The pairing page refuses a shortened or wrapped link. The owner still confirms on the phone, and issuing a link disconnects nobody.

## Hosted and remote

- **The packaged server on the same machine:** the entry above works unchanged. The token is the `MCP_TOKEN` in `deploy/mcp/.env`, or in the tarball's `config.env`.
- **Over a public endpoint:** `examples/hermes.config.hosted.yaml` is the same entry pointed at your domain, for example `https://direct.example.com:8443/mcp`, without the two development tools. The certificate must be a real one, the domain must be accepted by the server (`MCP_ALLOWED_HOSTS`; the `SIDECAR_PUBLIC_URL` hostname is allowed implicitly), and OAuth must be **off**: a static bearer is not an access token ([Claude](/docs/claude)).
- **SSH reverse tunnel:** `ssh -N -R 127.0.0.1:18080:127.0.0.1:8080 <you>@<vps>`, then `url: "http://127.0.0.1:18080/mcp"`. Loopback names pass on any port.
- **Existing VPN:** forward a port on the VPN address to the server, restrict who may reach it, add that address to `MCP_ALLOWED_HOSTS`, and point Hermes at it. Otherwise the server answers 403.

Never expose plain HTTP to the internet, and never work around a certificate warning. Anyone with the token can queue requests for you to answer, so treat it as a password.
