# Seeker Agent Connect documentation

This repository is the public **Seeker Agent Connect (SAC)** documentation, published with [ReadMe](https://readme.com) from the `docs/` and `reference/` trees.

The app reviews and authorizes requests from independent servers. Seed Vault Wallet still signs. Source of truth for behavior is [BrRenat/SeekerAgentWallet](https://github.com/BrRenat/SeekerAgentWallet). The revision these pages were written against is recorded on [Source mapping](docs/Reference/source-mapping.md).

## Repository layout

| Path | Purpose |
| --- | --- |
| `docs/` | Guides, grouped by reader: Start here, App users, Server developers, Integrations, Operators, Reference |
| `docs/**/_order.yaml` | Sidebar order (ReadMe Git Sync) |
| `reference/ReadMeConfig/` | Required ReadMe configuration pages (keep `hidden: true`) |
| `scripts/check-docs.mjs` | Internal-link, `_order.yaml`, and placeholder checks |
| `.github/workflows/docs.yml` | Lint and link checks on pull requests |

Do not introduce a second documentation framework. Page front matter uses ReadMe fields only: `title`, `excerpt`, `hidden`.

The default documentation version is Git branch **`v1.0`**. Feature work targets `v1.0`, not `master`/`main`.

## Local validation

```sh
npx --yes @readme/cli lint
node scripts/check-docs.mjs
```

`@readme/cli lint` checks front matter, sidebar files, and broken links. `check-docs.mjs` additionally requires every `_order.yaml` entry to resolve, every `/docs/<slug>` link to match a page slug, and flags committed-looking secrets.

Preview locally (beta; may prompt for a ReadMe login):

```sh
npx --yes @readme/cli dev
```

Git Sync also opens a ReadMe branch for this Git branch. After merge to `v1.0`, confirm the public hub URL in the ReadMe dashboard.

## Publication

This repo is wired for ReadMe Git Sync:

1. Open a pull request **into `v1.0`**.
2. Wait for **Docs** CI (`@readme/cli lint` + `check-docs.mjs`).
3. Review the ReadMe branch preview (navigation, tables, code blocks, a narrow viewport).
4. Merge only after that review. Git Sync updates version **v1.0**.
5. Verify the public URL after publication.

`reference/ReadMeConfig/` pages (`getting-started`, `authentication`, `my-requests`) stay hidden. They are ReadMe product configuration, not SAC API reference.

## Contributing

1. Branch from `v1.0`.
2. Add or edit Markdown under `docs/<Category>/`. Use a **unique filename** (the file stem is the ReadMe slug).
3. List the slug in that folder’s `_order.yaml`. Category names belong in `docs/_order.yaml`.
4. Link internally as `/docs/<slug>`.
5. Use placeholders (`replace-with-publisher-credential`, `gateway.example.com`) — never real tokens.
6. Distinguish `direct`, `gateway_feed`, and `gateway_private`. Do not describe Sandbox as a Solana network or Jupiter sandbox as devnet trading.
7. Update [Source mapping](docs/Reference/source-mapping.md) when SDK, proto, or UI labels change.
8. Run the two validation commands above.

## License

Documentation in this repository follows the license of [SeekerAgentWallet](https://github.com/BrRenat/SeekerAgentWallet) unless a file says otherwise.
