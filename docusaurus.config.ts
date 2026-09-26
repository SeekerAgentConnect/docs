import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// Set DOCS_URL / DOCS_BASE_URL in CI to match where the site is hosted.
const url = process.env.DOCS_URL ?? 'https://seekeragentconnect.github.io';
const baseUrl = process.env.DOCS_BASE_URL ?? '/docs/';

// The landing page lives in SeekerAgentConnect/landing and is published separately.
const landingUrl = 'https://seekeragentconnect.github.io/landing/';

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
          href: 'https://seeker-gateway-sg8g3.ondigitalocean.app/admin/',
          label: 'Gateway',
          position: 'left',
        },
        {
          href: 'https://prediction-demo-quni7.ondigitalocean.app/trader',
          label: 'Prediction Demo',
          position: 'left',
        },
        {
          href: 'https://signals-demo-fzs2q.ondigitalocean.app/trader',
          label: 'Trade Signals Demo',
          position: 'left',
        },
        {
          href: 'https://github.com/BrRenat/SeekerAgentConnect',
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
          ],
        },
        {
          title: 'Build',
          items: [
            {label: 'MCP server quickstart', to: '/docs/mcp-quickstart'},
            {label: 'Publish your first feed', to: '/docs/publish-your-first-feed'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'Source mapping', to: '/docs/source-mapping'},
            {label: 'Website', href: landingUrl},
            {label: 'GitHub', href: 'https://github.com/BrRenat/SeekerAgentConnect'},
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
