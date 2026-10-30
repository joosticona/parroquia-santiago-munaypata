import { createApp } from 'astro/app/entrypoint';

const app = createApp();

export default {
  async fetch(request, env, ctx) {
    if (!app.match(request)) return env.ASSETS.fetch(request);
    return app.render(request, {
      addCookieHeader: true,
      clientAddress: request.headers.get('CF-Connecting-IP') || undefined,
      locals: { runtime: { env, ctx } },
      waitUntil: (promise) => ctx.waitUntil(promise),
      prerenderedErrorPageFetch: (url) => env.ASSETS.fetch(url),
    });
  },
};
