import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// Set DOCS_URL / DOCS_BASE_URL in CI to match where the site is hosted.
const url = process.env.DOCS_URL ?? 'https://seekeragentconnect.github.io';
const baseUrl = process.env.DOCS_BASE_URL ?? '/docs/';

// The landing page lives in SeekerAgentConnect/landing and is published separately.
const landingUrl = 'https://seekeragentconnect.github.io/landing/';
// Source repository of the app, SDK, MCP servers and gateway.
const sourceUrl = 'https://github.com/SeekerAgentConnect/sac';

const config: Config = {
  title: 'Seeker Agent Connect',
  tagline:
    'Review requests from your agents and signals from feeds. The wallet you already have still signs.',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url,
  baseUrl,
  organizationName: 'SeekerAgentConnect',
  projectName: 'docs',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  onDuplicateRoutes: 'throw',

  markdown: {
    // .md pages are plain CommonMark (as on ReadMe); only .mdx files are parsed as MDX.
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'throw',
      onBrokenMarkdownImages: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        // Pages that moved or were removed keep their old URLs working.
        redirects: [
          // The self-hosted gateway guide was operator material; publishers onboard with the SAC team.
          {from: '/run-your-own-gateway', to: '/connect-to-gateway'},
        ],
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          // baseUrl is already /docs/, so docs live at the site root: URLs stay /docs/<slug> as on ReadMe.
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/SeekerAgentConnect/docs/edit/v1.0/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Seeker Agent Connect',
      logo: {
        alt: 'Seeker Agent Connect',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
        width: 32,
        height: 32,
        href: landingUrl,
        target: '_self',
      },
      items: [
        {type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs'},
        {
          type: 'dropdown',
          label: 'Demos',
          position: 'left',
          items: [
            {
              href: 'https://prediction-demo-quni7.ondigitalocean.app/trader',
              label: 'Prediction demo',
            },
            {
              href: 'https://signals-demo-fzs2q.ondigitalocean.app/trader',
              label: 'Trade signals demo',
            },
          ],
        },
        {
          href: sourceUrl,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Start here',
          items: [
            {label: 'Welcome', to: '/docs/getting-started'},
            {label: 'How it works', to: '/docs/how-it-works'},
            {label: 'Use the app', to: '/docs/use-the-app'},
          ],
        },
        {
          title: 'Build',
          items: [
            {label: 'Connect your agent', to: '/docs/mcp-servers'},
            {label: 'Build your own server', to: '/docs/direct-or-feed'},
            {label: 'Publish feeds', to: '/docs/publish-feeds'},
            {label: 'Connect to the SAC gateway', to: '/docs/connect-to-gateway'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'Recipes', to: '/docs/recipes'},
            {label: 'Reference', to: '/docs/reference'},
            {label: 'Source mapping', to: '/docs/source-mapping'},
            {label: 'Website', href: landingUrl},
            {label: 'GitHub', href: sourceUrl},
          ],
        },
      ],
      copyright: `Seeker Agent Connect documentation.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['bash', 'go', 'yaml', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
