import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  compressHTML: true,
  adapter: node({ mode: 'standalone' }),
  server: { host: true },
});
