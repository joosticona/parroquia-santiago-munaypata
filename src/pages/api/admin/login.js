import { runtimeEnv } from '../../../lib/env.js';
import {
  authConfigured,
  passwordMatches,
  createSession,
  setAuthCookie,
  throttle,
  clientKey,
  json,
  sameOrigin,
} from '../../../lib/auth.js';
export const prerender = false;
export async function POST({ request, cookies, url, clientAddress, locals }) {
  const env = locals?.runtime?.env;
  if (!sameOrigin(request, env))
    return json({ error: 'Origen no permitido' }, 403);
  if (throttle(clientKey(request, 'login', clientAddress), 8, 15 * 60 * 1000))
    return json({ error: 'Demasiados intentos. Intenta más tarde.' }, 429);
  if (!authConfigured(env))
    return json(
      {
        error:
          'Debes configurar ADMIN_PASSWORD y SESSION_SECRET en el servidor.',
      },
      503,
    );
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Datos inválidos' }, 400);
  }
  if (!(await passwordMatches(body.password, env)))
    return json({ error: 'Contraseña incorrecta' }, 401);
  setAuthCookie(
    cookies,
    await createSession(env),
    url.protocol === 'https:' ||
      runtimeEnv(env).PUBLIC_ORIGIN?.startsWith('https://'),
  );
  return json({ ok: true });
}
