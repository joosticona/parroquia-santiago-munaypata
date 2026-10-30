import { clearAuthCookie, json, sameOrigin } from '../../../lib/auth.js';
export const prerender = false;
export async function POST({ request, cookies, locals }) {
  const env = locals?.runtime?.env;
  if (!sameOrigin(request, env))
    return json({ error: 'Origen no permitido' }, 403);
  clearAuthCookie(cookies);
  return json({ ok: true });
}
