import { runtimeEnv } from './env.js';
const COOKIE = 'santiago_admin';
const encoder = new TextEncoder();
export function authConfigured(env) {
  const { ADMIN_PASSWORD: password, SESSION_SECRET: secret } = runtimeEnv(env);
  return !!(
    password &&
    secret?.length >= 32 &&
    password.length >= 12 &&
    !password.startsWith('CAMBIA_')
  );
}
function encode(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
}
function decode(value) {
  return Uint8Array.from(
    atob(value.replaceAll('-', '+').replaceAll('_', '/')),
    (c) => c.charCodeAt(0),
  );
}
async function signingKey(env) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(runtimeEnv(env).SESSION_SECRET || ''),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}
export async function createSession(env) {
  const payload = encode(
    encoder.encode(
      JSON.stringify({ exp: Date.now() + 12 * 60 * 60 * 1000, role: 'admin' }),
    ),
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    await signingKey(env),
    encoder.encode(payload),
  );
  return payload + '.' + encode(new Uint8Array(signature));
}
export async function validSession(value, env) {
  if (!authConfigured(env) || !value || typeof value !== 'string') return false;
  const [payload, signature, ...rest] = value.split('.');
  if (!payload || !signature || rest.length) return false;
  try {
    if (
      !(await crypto.subtle.verify(
        'HMAC',
        await signingKey(env),
        decode(signature),
        encoder.encode(payload),
      ))
    )
      return false;
    const data = JSON.parse(new TextDecoder().decode(decode(payload)));
    return data.role === 'admin' && data.exp > Date.now();
  } catch {
    return false;
  }
}
export async function passwordMatches(password, env) {
  const key = await signingKey(env);
  const expected = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(runtimeEnv(env).ADMIN_PASSWORD || ''),
  );
  return crypto.subtle.verify(
    'HMAC',
    key,
    expected,
    encoder.encode(String(password || '')),
  );
}
export function isAdmin(Astro) {
  return validSession(
    Astro.cookies.get(COOKIE)?.value,
    Astro.locals?.runtime?.env,
  );
}
export function adminResponse(request, env) {
  const cookie = request.headers
    .get('cookie')
    ?.split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(COOKIE + '='))
    ?.slice(COOKIE.length + 1);
  return validSession(cookie, env);
}
export function setAuthCookie(cookies, session, secure) {
  cookies.set(COOKIE, session, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/',
    maxAge: 12 * 60 * 60,
  });
}
export function clearAuthCookie(cookies) {
  cookies.delete(COOKIE, { path: '/' });
}
export function sameOrigin(request, env) {
  const origin = request.headers.get('origin');
  return (
    !origin ||
    origin === new URL(request.url).origin ||
    (!!runtimeEnv(env).PUBLIC_ORIGIN &&
      origin === process.env.PUBLIC_ORIGIN.replace(/\/$/, ''))
  );
}
const attempts = new Map();
export function throttle(key, max = 10, windowMs = 60000) {
  if (attempts.size > 5000) attempts.clear();
  const now = Date.now(),
    entry = attempts.get(key) || { n: 0, start: now };
  if (now - entry.start > windowMs) {
    entry.n = 0;
    entry.start = now;
  }
  entry.n++;
  attempts.set(key, entry);
  return entry.n > max;
}
export function clientKey(request, scope, clientAddress) {
  // Solo confiar en el IP recibido del adaptador/proxy confiable en producción.
  return (
    scope +
    ':' +
    (clientAddress ||
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-real-ip') ||
      'unknown')
  );
}
export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
export function unauthorized() {
  return json({ error: 'Sesión no autorizada' }, 401);
}
