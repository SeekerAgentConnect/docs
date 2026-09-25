---
title: Claude
excerpt: Optional OAuth profile for a hosted MCP client. The MCP server is a resource server only; you bring the authorization server. No hosted Claude connector run is recorded.
hidden: false
---

A hosted MCP client runs on somebody else's machine and should not hold your `MCP_TOKEN`. With OAuth on, a person authorizes the client at **your** authorization server, the client receives a short-lived access token issued for this deployment, and you can take that authorization back without rotating the token everything else uses.

This is optional. [Hermes](/docs/hermes) and [OpenClaw](/docs/openclaw) with a static bearer token on loopback or a private URL need none of it.

OAuth decides who may ask. Everything behind it is unchanged: a request still waits for the owner on the phone, the server holds no key and signs nothing, and an authorized client cannot approve anything.

## What the server does, and does not do

The MCP server is an OAuth 2.1 **resource server**:

- it publishes protected-resource metadata (RFC 9728) at `/.well-known/oauth-protected-resource` and `/.well-known/oauth-protected-resource/mcp`, naming the authorization server and the scope;
- it validates every access token itself: an asymmetric signature against the issuer's published keys, `iss` equal to `MCP_OAUTH_ISSUER`, `aud` carrying this deployment's MCP URI, an unexpired `exp`, and the scopes in `MCP_OAUTH_SCOPE`;
- it refuses everything else, and never passes a token on.

It is **not** an authorization server: no `/authorize`, no `/token`, no client registration, no consent screen, no user database, no client secret. The only thing it reads from your provider is public keys. Opaque tokens cannot be checked, because there is no introspection call. This project does not endorse a provider.

## What your authorization server has to support

| Requirement | Why |
| --- | --- |
| JWT access tokens signed with RS\*, PS\*, ES\* or EdDSA, with a published JWKS | The server validates the token locally |
| RFC 8414 metadata or OpenID Connect discovery | Both the client and the server read it; `jwks_uri` comes from it unless `MCP_OAUTH_JWKS_URL` is set |
| PKCE `S256` | A spec-compliant client refuses to start without it |
| Client ID Metadata Documents or dynamic client registration | The hosted client and your provider have no prior relationship |
| An audience: resource indicators, or any way to put this deployment's `/mcp` URI in `aud` | The check that stops a token minted for something else |
| Revocation and short access-token lifetimes | See below |

## Setting it up

1. Have the public HTTPS endpoint first: native TLS on `https://direct.example.com:8443`, as in [Direct ingress and native TLS](/docs/direct-sidecar-proxy).
2. In `deploy/mcp/.env`:

```sh
MCP_OAUTH_ISSUER=https://<your-authorization-server>   # exactly as its tokens spell iss
MCP_OAUTH_SCOPE=seeker-vault:agent
# only if the defaults are wrong for your provider:
# MCP_OAUTH_RESOURCE=https://direct.example.com:8443/mcp
# MCP_OAUTH_JWKS_URL=<the provider's JWKS URL>
```

`MCP_OAUTH_ISSUER` is the switch. Without it there is no OAuth and the metadata paths answer 404; the other three without it are a configuration error. `MCP_OAUTH_*` with `MCP_ENABLED=false` is also an error.

3. Restart the MCP service, then check before involving Claude:

```sh
curl -s https://direct.example.com:8443/.well-known/oauth-protected-resource
curl -si -X POST https://direct.example.com:8443/mcp -H 'Content-Type: application/json' -d '{}' \
  | grep -i www-authenticate
```

The challenge must name the metadata document and the scope to ask for.

4. In Claude: **Settings → Connectors → Add custom connector**, with the URL `https://direct.example.com:8443/mcp`. Claude gets the 401, reads the metadata, and sends you to your authorization server to sign in and consent. Try `vault_get_capabilities` first, then a message signature. Nothing happens until the owner approves it on the phone.

## Boundaries

- An access token reaches `/mcp` and nothing else. The phone's own API takes the phone's credentials; a hosted client never gains one.
- While OAuth is on, `MCP_TOKEN` is accepted only under a loopback `Host`. The public name takes access tokens only.
- Scopes are a refusal, not a capability: a valid token without `MCP_OAUTH_SCOPE` gets `403` with `insufficient_scope`. The tools an access token reaches are exactly the tools `MCP_TOKEN` reaches.
- Revocation is bounded by the token's lifetime. Keep access tokens short (five to fifteen minutes) and revoke the grant at the provider. Removing `MCP_OAUTH_ISSUER` and restarting refuses every access token at once.
- Every refusal says in words which check failed, in `WWW-Authenticate` and in the server log, and never quotes the token.

## What has been run

The whole path was exercised against an authorization server the tests control: discovery over TLS, a real MCP session opened with an access token, and every refusal. **No hosted Claude client has connected to it.** Treat the connector as implemented and tested in every part except the one that matters most.
