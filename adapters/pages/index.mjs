import { fileURLToPath } from 'node:url';
import { rename, writeFile } from 'node:fs/promises';

export default function pages() {
  let output;
  return {
    name: 'parroquia-cloudflare-pages',
    hooks: {
      'astro:config:setup': ({ updateConfig, config }) => {
        updateConfig({
          session: false,
          build: {
            redirects: false,
            client: new URL('./dist/pages/', config.root),
            server: new URL('./dist/pages/_worker.js/', config.root),
          },
          image: { service: { entrypoint: 'astro/assets/services/noop' } },
          vite: {
            resolve: {
              alias: [
                {
                  find: /^\.\/local-db\.js$/,
                  replacement: fileURLToPath(
                    new URL('./no-local-db.mjs', import.meta.url),
                  ),
                },
              ],
            },
            ssr: {
              target: 'webworker',
              noExternal: true,
              external: [
                'node:fs',
                'node:fs/promises',
                'node:path',
                'node:crypto',
                'node:stream',
                'node:buffer',
                'node:util',
                'node:events',
              ],
            },
          },
        });
      },
      'astro:config:done': ({ setAdapter, config }) => {
        output = config.build.client;
        setAdapter({
          name: 'parroquia-cloudflare-pages',
          serverEntrypoint: fileURLToPath(
            new URL('./server.mjs', import.meta.url),
          ),
          entrypointResolution: 'auto',
          adapterFeatures: { buildOutput: 'server', middlewareMode: 'classic' },
          supportedAstroFeatures: {
            hybridOutput: 'stable',
            staticOutput: 'stable',
            serverOutput: 'stable',
            sharpImageService: 'unsupported',
            envGetSecret: 'unsupported',
          },
        });
      },
      'astro:build:done': async () => {
        await rename(
          new URL('_worker.js/entry.mjs', output),
          new URL('_worker.js/index.js', output),
        );
        await writeFile(
          new URL('_routes.json', output),
          JSON.stringify(
            {
              version: 1,
              include: ['/*'],
              exclude: [
                '/_astro/*',
                '/admin/*.*',
                '/admin.js',
                '/*.svg',
                '/robots.txt',
              ],
            },
            null,
            2,
          ),
        );
      },
    },
  };
}
