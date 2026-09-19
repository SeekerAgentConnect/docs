---
title: Claude
excerpt: Optional OAuth profile for a hosted MCP client. The sidecar is a resource server, not an authorization server. A live Claude connector has not been verified.
hidden: false
---

Claude over OAuth is **optional**. Most owners use [Hermes](/docs/hermes) with a static bearer token on loopback or a private URL.

When OAuth is on, the sidecar validates JWTs and serves protected-resource metadata. It is **not** an authorization server. You supply an AS that supports:

- JWT access tokens and JWKS
- RFC 8414 / OIDC discovery
- PKCE S256
- CIMD or DCR
- Audience equal to this `/mcp`
- Short-lived tokens

```sh
# gateway/.env
MCP_OAUTH_ISSUER=https://auth.example.com/realms/seeker
MCP_OAUTH_SCOPE=seeker-vault:agent
# optional: MCP_OAUTH_RESOURCE, MCP_OAUTH_JWKS_URL

cd gateway
docker compose -f compose.yaml -f compose.public.yaml -f compose.oauth.yaml up -d --build
```

In Claude: **Settings → Connectors → Add custom connector** → `https://vault.example.com/mcp`.

## Limitations

- **No hosted Claude client connection is recorded as run.** Treat connector setup as implemented in code and tests, not as a completed physical-client verification.
- While OAuth is on, public `/mcp` accepts only AS tokens. `MCP_TOKEN` remains on the private loopback endpoint.
- Live diagnostic and public `/healthz` are not on the public Caddy routes.
- This project does not endorse a specific authorization server.
- `MCP_OAUTH_*` with `MCP_ENABLED=false` is a configuration error.

Preflight curls for metadata, `WWW-Authenticate`, and initialize live in the wallet repository’s `docs/integrations/claude.md`.
