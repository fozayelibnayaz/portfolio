import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  // GitHub Pages serves this project from /portfolio/, while the local
  // dev server should continue to work from /.
  base: mode === 'production' ? './' : '/',
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      input: {
        portfolio: resolve(process.cwd(), 'index.html'),
        cms: resolve(process.cwd(), 'cms/index.html'),
        cmsPage: resolve(process.cwd(), 'cms.html'),
      },
    },
  },
}));
