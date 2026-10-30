import { getContent, setContent } from '../../../lib/db.js';
import { normalizeSettings } from '../../../lib/validation.js';
import {
  adminResponse,
  json,
  unauthorized,
  sameOrigin,
} from '../../../lib/auth.js';
export const prerender = false;
export async function POST({ request, locals }) {
  const env = locals?.runtime?.env;
  if (!(await adminResponse(request, env))) return unauthorized();
  if (!sameOrigin(request, env))
    return json({ error: 'Origen no permitido' }, 403);
  try {
    const body = await request.json();
    const value = normalizeSettings(body, await getContent('settings', env));
    await setContent('settings', value, env);
    return json({ ok: true, value });
  } catch (e) {
    return json({ error: e.message || 'Datos inválidos' }, 400);
  }
}
