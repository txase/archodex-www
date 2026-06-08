import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { parse, HTMLElement } from 'node-html-parser';

// Astro's Image assets implementation adds a couple innocuous inline styles for layout purposes.
const ASTRO_IMAGE_LAYOUT_INLINE_STYLE_HASH = 'sha256-hjMqIQL7MuYQfMDg+fxR02kR4RdMYaGpSDYAkyk/LMA=';

const createCspHash = async (s: string) => {
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  const hashBase64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
  return `'sha256-${hashBase64}'`;
};

const pathFromPage = (dir: URL, page: { pathname: string }) => {
  switch (page.pathname) {
    case '':
      return fileURLToPath(`${dir.href}index.html`);
    case '404':
      return fileURLToPath(`${dir.href}404.html`);
    default:
      return fileURLToPath(`${dir.href}${page.pathname}/index.html`);
  }
};

type CSPConfig = {
  base: string;
  additionalScriptSrc?: string;
  additionalStyleSrc?: string;
  additionalStyleAttrSrc?: string;
};

type CSPOverride = Partial<CSPConfig>;

type AstroCSPHashGeneratorConfig = CSPConfig & { pageOverrides?: Record<string, CSPOverride> };

const sourceList = (...sources: string[]) =>
  sources
    .map((source) => source.trim())
    .filter(Boolean)
    .join(' ');

const buildCSPString = ({
  base,
  scriptHashes,
  styleElemHashes,
  additionalScriptSrc = '',
  additionalStyleSrc = '',
  additionalStyleAttrSrc = '',
  additionalDirectives = '',
}: CSPConfig & { scriptHashes: Set<string>; styleElemHashes: Set<string>; additionalDirectives?: string }) => {
  const styleElemSources = additionalStyleSrc.includes("'unsafe-inline'")
    ? additionalStyleSrc
    : sourceList(styleElemHashes.values().toArray().join(' '), additionalStyleSrc);
  const styleAttrSources = additionalStyleAttrSrc.includes("'unsafe-inline'")
    ? additionalStyleAttrSrc
    : sourceList(`'unsafe-hashes' '${ASTRO_IMAGE_LAYOUT_INLINE_STYLE_HASH}'`, additionalStyleAttrSrc);

  return (
    `${base.replace(/;$/, '')}; ` +
    `script-src ${sourceList("'self'", scriptHashes.values().toArray().join(' '), additionalScriptSrc)}; ` +
    `style-src-elem ${sourceList("'self'", styleElemSources)}; ` +
    `style-src-attr ${styleAttrSources};` +
    (additionalDirectives ? ` ${additionalDirectives}` : '')
  );
};

export const astroCSPHashGenerator: (config: AstroCSPHashGeneratorConfig) => AstroIntegration = ({
  base,
  additionalScriptSrc = '',
  additionalStyleSrc = '',
  additionalStyleAttrSrc = '',
  pageOverrides = {},
}) => ({
  name: 'astro-csp-hash-generator',
  hooks: {
    'astro:build:done': async ({ dir, pages, logger }) => {
      const scriptHashes = new Set<string>();
      const styleElemHashes = new Set<string>();

      for (const page of pages) {
        const filePath = pathFromPage(dir, page);

        let root: HTMLElement;
        try {
          root = parse(await readFile(filePath, { encoding: 'utf-8' }));
        } catch (e) {
          throw new Error(`Failed to read file to generate CSP hashes ${filePath}: ${e}`);
        }

        for (const script of root.querySelectorAll('script')) {
          const hash = await createCspHash(script.textContent);
          scriptHashes.add(hash);
        }

        for (const style of root.querySelectorAll('style')) {
          const hash = await createCspHash(style.textContent);
          styleElemHashes.add(hash);
        }
      }

      const cspConfig: CSPConfig = { base, additionalScriptSrc, additionalStyleSrc, additionalStyleAttrSrc };

      const CSPString = buildCSPString({ ...cspConfig, scriptHashes, styleElemHashes });

      const starlightCSPString = buildCSPString({
        ...cspConfig,
        additionalStyleSrc: sourceList("'unsafe-inline'", additionalStyleSrc),
        additionalStyleAttrSrc: "'unsafe-inline'",
        additionalDirectives: "img-src 'self' data:;",
        scriptHashes,
        styleElemHashes,
      });

      for (const page of pages) {
        const filePath = pathFromPage(dir, page);

        let root: HTMLElement;
        try {
          root = parse(await readFile(filePath, { encoding: 'utf-8' }));
        } catch (e) {
          throw new Error(`Failed to read file to inject CSP tag ${filePath}: ${e}`);
        }

        const head = root.querySelector('head');
        if (!head) {
          throw new Error(`No Head element in ${filePath}, skipping CSP generation`);
        }

        logger.info(`Generated CSP for ${filePath}`);

        const pageOverride = pageOverrides[page.pathname];
        const csp = page.pathname.startsWith('docs')
          ? starlightCSPString
          : pageOverride
            ? buildCSPString({ ...cspConfig, ...pageOverride, scriptHashes, styleElemHashes })
            : CSPString;
        const metaCSP = new HTMLElement('meta', {}, `http-equiv="Content-Security-Policy" content="${csp}"`);

        head.prepend(metaCSP);

        await writeFile(filePath, root.toString());
      }
    },
  },
});
