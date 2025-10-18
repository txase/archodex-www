import type { FooterData, HeaderData } from './types';
import { getPermalink } from './utils/permalinks';

export const headerData: HeaderData = {
  links: [
    { text: 'Product', links: [{ text: 'Secrets Observability', href: getPermalink('/product/secrets') }] },
    {
      text: 'Community',
      links: [
        {
          text: 'Discussions',
          icon: 'tabler:brand-github',
          href: 'https://github.com/orgs/Archodex/discussions',
          openInNewTab: true,
        },
        { text: 'Repositories', icon: 'tabler:brand-github', href: 'https://github.com/archodex', openInNewTab: true },
        {
          text: 'Chat',
          icon: 'tabler:brand-matrix',
          href: 'https://matrix.to/#/#archodex:matrix.org',
          openInNewTab: true,
        },
        { text: 'Contributing', href: 'http://localhost:4321/contributing' },
        { text: 'Fair Source', href: getPermalink('/licensing') },
      ],
    },
    {
      text: 'Company',
      links: [
        { text: 'Team', href: getPermalink('/team') },
        { text: 'Contact', href: getPermalink('/contact') },
      ],
    },
    { text: 'Pricing', href: getPermalink('/pricing') },
    { text: 'Docs', href: getPermalink('/docs') },
  ],
  actions: [
    { variant: 'link', text: 'Login', href: `https://app.${import.meta.env.PUBLIC_ARCHODEX_DOMAIN}` },
    { text: 'Playground', href: `https://play.${import.meta.env.PUBLIC_ARCHODEX_DOMAIN}` },
    { variant: 'primary', text: 'Start Free', href: `https://app.${import.meta.env.PUBLIC_ARCHODEX_DOMAIN}/signup` },
  ],
  position: 'left',
};

export const footerData: FooterData = {
  links: [
    { text: 'Product', links: [{ text: 'Pricing', href: '/pricing' }] },
    {
      text: 'Company',
      links: [
        { text: 'Team', href: getPermalink('/team') },
        { text: 'Contact', href: getPermalink('/contact') },
      ],
    },
    {
      text: 'Community',
      links: [
        {
          text: 'Discussions',
          icon: 'tabler:brand-github',
          href: 'https://github.com/orgs/Archodex/discussions',
          openInNewTab: true,
        },
        { text: 'Repositories', icon: 'tabler:brand-github', href: 'https://github.com/archodex', openInNewTab: true },
        {
          text: 'Chat',
          icon: 'tabler:brand-matrix',
          href: 'https://matrix.to/#/#archodex:matrix.org',
          openInNewTab: true,
        },
        { text: 'Contributing', href: getPermalink('/contributing') },
        { text: 'Licensing', href: getPermalink('/licensing') },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    /*{ ariaLabel: 'X', icon: 'tabler:brand-x', href: '#' }*/
  ],
  footNote: '© Archodex, Inc. · 2025 · All rights reserved',
};
