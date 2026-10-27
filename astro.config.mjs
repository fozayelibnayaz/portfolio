// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

/**
 * Deploy targets
 * ---------------------------------------------------------------
 * GitHub project page  →  BASE_PATH=/portfolio npm run build
 * User page / root     →  npm run build
 * Netlify / Vercel     →  npm run build
 */
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site: 'https://fozayelibnayaz.github.io',
  base,
  trailingSlash: 'ignore',
  build: {
    assets: 'assets',
    inlineStylesheets: 'auto',
  },
  server: {
    host: true,
    port: 4321,
    // allow the sandbox preview proxy to reach the dev server
    allowedHosts: true,
  },
  vite: {
    server: {
      // the sandbox preview proxies the dev server through a public host
      allowedHosts: ['.e2b.app', 'localhost', '127.0.0.1'],
      hmr: { clientPort: 443 },
    },
    resolve: {
      alias: {
        src: fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      cssMinify: 'lightningcss',
      assetsInlineLimit: 2048,
    },
  },
});
