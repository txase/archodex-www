import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import icon from 'astro-icon';
import compress from 'astro-compress';
import type { AstroIntegration } from 'astro';

import astrowind from './vendor/integration';

import { readingTimeRemarkPlugin, responsiveTablesRehypePlugin, lazyImagesRehypePlugin } from './src/utils/frontmatter';
import { astroCSPHashGenerator } from './src/utils/csp-hash-generator';

import react from '@astrojs/react';

import starlight from '@astrojs/starlight';
import starlightKbd from 'starlight-kbd';

import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const hasExternalScripts = false;
const whenExternalScripts = (items: (() => AstroIntegration) | (() => AstroIntegration)[] = []) =>
  hasExternalScripts ? (Array.isArray(items) ? items.map((item) => item()) : [items()]) : [];

export default defineConfig({
  output: 'static',

  integrations: [
    sitemap(),
    icon({
      include: {
        tabler: ['*'],
        'flat-color-icons': [
          'template',
          'gallery',
          'approval',
          'document',
          'advertising',
          'currency-exchange',
          'voice-presentation',
          'business-contact',
          'database',
        ],
        'simple-icons': ['*'],
      },
    }),

    ...whenExternalScripts(() => partytown({ config: { forward: ['dataLayer.push'] } })),

    compress({
      CSS: true,
      HTML: { 'html-minifier-terser': { removeAttributeQuotes: false } },
      Image: false,
      JavaScript: true,
      SVG: false,
      Logger: 1,
    }),

    astrowind({ config: './src/config.yaml' }),

    astroCSPHashGenerator({
      base: `default-src 'self'; connect-src 'self' https://rules.${process.env.PUBLIC_ARCHODEX_DOMAIN} https://api.web3forms.com/submit https://*.posthog.com`,
      additionalScriptSrc: "'wasm-unsafe-eval' https://*.posthog.com",
      additionalStyleSrc: 'https://*.posthog.com',
    }),

    react(),

    starlight({
      title: 'Archodex Docs',
      logo: { src: './src/assets/images/logo-horizontal-coral.svg', replacesTitle: true },
      head: [
        {
          tag: 'script',
          content: `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('${process.env.PUBLIC_POSTHOG_PROJECT_API_KEY}', {
            api_host: 'https://us.i.posthog.com',
            person_profiles: 'identified_only' // or 'always' to create profiles for anonymous users as well
          })`,
        },
      ],
      components: { Sidebar: './src/components/docs/Sidebar.astro' },
      disable404Route: true,
      pagination: false,
      customCss: ['./src/assets/styles/starlight.css'],
      expressiveCode: { themes: ['github-dark', 'github-light'] },
      plugins: [
        starlightKbd({
          types: [
            { id: 'mac', label: 'macOS', default: true },
            { id: 'windows', label: 'Windows' },
          ],
        }),
      ],
    }),

    mdx(),
  ],

  markdown: {
    remarkPlugins: [readingTimeRemarkPlugin],
    rehypePlugins: [responsiveTablesRehypePlugin, lazyImagesRehypePlugin],
  },

  vite: {
    build: {
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.names[0].endsWith('.css')) {
              return 'assets/index.[hash].css';
            } else {
              return 'assets/[name].[hash][extname]';
            }
          },
          chunkFileNames: 'assets/chunk.[hash].js',
          entryFileNames: 'assets/entry.[hash].js',
        },
      },
    },
    resolve: { alias: { '~': path.resolve(__dirname, './src') } },
    server: {
      proxy: {
        '^/docs/rulesets/dev/.*': {
          target: 'http://localhost:4321',
          changeOrigin: true,
          rewrite: (_) => '/docs/rulesets/dev',
          secure: false,
        },
      },
    },
    plugins: [tailwindcss()],
  },
});
