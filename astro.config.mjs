import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import pages from './adapters/pages/index.mjs';

export default defineConfig({
  output: 'server',
  compressHTML: true,
  adapter:
    process.env.DEPLOY_TARGET === 'pages'
      ? pages()
      : node({ mode: 'standalone' }),
  server: { host: true },
});
