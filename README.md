# Seeker Agent Connect documentation

This repository is the public **Seeker Agent Connect (SAC)** documentation, built with [Docusaurus](https://docusaurus.io) 3.10 from the `docs/` tree.

The app reviews and authorizes requests from independent servers. Seed Vault Wallet still signs. Source of truth for behavior is [SeekerAgentConnect/sac](https://github.com/SeekerAgentConnect/sac) (formerly `BrRenat/SeekerAgentConnect` and SeekerAgentWallet). The revision these pages were written against is recorded on [Source mapping](docs/reference/source-mapping.md).

The landing page is in [SeekerAgentConnect/landing](https://github.com/SeekerAgentConnect/landing) and published at <https://seekeragentconnect.github.io/landing/>; the navbar logo and the footer's **Website** link point there. It links to pages here by absolute URL, so update it when a slug changes.

## Repository layout

| Path | Purpose |
| --- | --- |
| `docs/` | Seven sections, one folder each: `start-here`, `use-the-app`, `connect-your-agent`, `build-your-server`, `publish-feeds`, `recipes`, `reference` |
| `docs/*/_category_.json` | Sidebar category label, position, and its overview page (a card index, or a doc) |
| `docusaurus.config.ts`, `sidebars.ts` | Site configuration and redirects for moved pages; the sidebar is generated from the folders |
| `src/`, `static/` | Theme CSS, the `NavCards` component, the `/` and `/docs` redirects to Welcome, static assets |
| `scripts/check-docs.mjs` | Front matter, slug, sidebar-position, placeholder, landing-slug and gateway-operator-material checks |
| `.github/workflows/docs.yml` | Checks and build on pull requests; GitHub Pages deploy from `v1.0` |

Page front matter uses `title`, `description`, `slug`, and `sidebar_position`. `.md` pages are parsed as CommonMark; use `.mdx` only when a page needs components (tabs, cards). In `.mdx`, escape explicit heading ids: `## Step 1: Run it \{#run-it}`.

The default documentation version is Git branch **`v1.0`**. Feature work targets `v1.0`, not `master`/`main`.

## Local development

Requires Node 20 or newer.

```sh
npm ci
npm start           # live preview at http://localhost:3000/docs/getting-started
npm run check       # front matter, slugs, sidebar positions, placeholders
npm run typecheck
npm run build       # production build; fails on broken links and anchors
```

## Publication

1. Open a pull request **into `v1.0`**.
2. Wait for **Docs** CI (`check`, `typecheck`, `build`).
3. Review the build locally with `npm run build && npm run serve` (navigation, tables, code blocks, a narrow viewport).
4. Merge. The push to `v1.0` builds and deploys the site to GitHub Pages (Settings → Pages → Source must be **GitHub Actions**).
5. Verify the public URL after publication.

To host elsewhere, set `DOCS_URL` and `DOCS_BASE_URL` when building (defaults: `https://seekeragentconnect.github.io` and `/docs/`).

## Contributing

1. Branch from `v1.0`.
2. Add or edit Markdown under `docs/<category>/`. Use a **unique filename** and set `slug: /<file-stem>` so the page lives at `/docs/<file-stem>`.
3. Set `sidebar_position` to place the page in its folder. A new folder needs a `_category_.json` with its `label` and `position`.
4. Link internally as `/docs/<slug>`; the build fails on a broken link or anchor. When you move or remove a page, add a redirect in `docusaurus.config.ts` and keep landing-page slugs in the `required` list of `scripts/check-docs.mjs`.
5. Use placeholders (`replace-with-publisher-credential`, `gateway.example.com`) — never real tokens.
6. Distinguish `direct` and `gateway_feed`. `gateway_private` is retired: never describe it as available. Public and Restricted are access policies of `gateway_feed`, not connection modes; scope any "anonymous" or "no credential" statement to Public feeds. SAC ships no billing or payments: describe paid access as the publisher's own system plus Restricted delivery. Do not describe Sandbox as a Solana network or Jupiter sandbox as devnet trading.
7. The SAC team operates the gateway. Public pages describe what an integrator sends, receives and configures; never gateway deployment, its admin page or `feed-gatewayctl` (the check script refuses them).
8. Update [Source mapping](docs/reference/source-mapping.md) when the Direct Server SDK, the gateway API, proto, or UI labels change.
9. Run `npm run check`, `npm run typecheck` and `npm run build`.

## License

Documentation in this repository follows the license of [SeekerAgentConnect](https://github.com/SeekerAgentConnect/sac) unless a file says otherwise.
