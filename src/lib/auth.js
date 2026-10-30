import './env.js';
import { createHmac, timingSafeEqual } from 'node:crypto';
const COOKIE = 'santiago_admin';
function key() {
  return process.env.SESSION_SECRET || '';
}
export function authConfigured() {
  return !!(
    process.env.ADMIN_PASSWORD &&
    key().length >= 32 &&
    process.env.ADMIN_PASSWORD.length >= 12 &&
    !process.env.ADMIN_PASSWORD.startsWith('CAMBIA_')
  );
}
function sign(payload) {
  return createHmac('sha256', key()).update(payload).digest('base64url');
}
export function createSession() {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + 12 * 60 * 60 * 1000, role: 'admin' }),
  ).toString('base64url');
  return payload + '.' + sign(payload);
}
export function validSession(value) {
  if (!authConfigured() || !value || typeof value !== 'string') return false;
  const [payload, signature, ...rest] = value.split('.');
  if (!payload || !signature || rest.length) return false;
  const good = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (given.length !== good.length || !timingSafeEqual(given, good))
    return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.role === 'admin' && data.exp > Date.now();
  } catch {
    return false;
  }
}
export function isAdmin(Astro) {
  return validSession(Astro.cookies.get(COOKIE)?.value);
}
export function adminResponse(request) {
  const cookie = request.headers
    .get('cookie')
    ?.split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(COOKIE + '='))
    ?.slice(COOKIE.length + 1);
  return validSession(cookie);
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
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  return (
    !origin ||
    origin === new URL(request.url).origin ||
    (!!process.env.PUBLIC_ORIGIN &&
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
