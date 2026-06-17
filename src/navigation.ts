import type { CallToAction, FooterData, HeaderData } from './types';
import { getPermalink } from './utils/permalinks';

export const getStartedUrl = getPermalink('/docs/getting-started');
export const requestDemoUrl = getPermalink('/contact/request-demo');
export const requestDemoAction = {
  variant: 'primary',
  text: 'Request Demo',
  href: requestDemoUrl,
  'data-astro-reload': true,
} satisfies CallToAction;

export const headerData: HeaderData = { links: [], actions: [requestDemoAction], position: 'left' };

export const footerData: FooterData = {
  links: [
    {
      text: 'About Us',
      links: [
        { text: 'Team', href: getPermalink('/team') },
        { text: 'Contact', href: getPermalink('/contact') },
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
