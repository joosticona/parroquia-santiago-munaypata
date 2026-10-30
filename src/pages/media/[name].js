import { readUpload } from '../../lib/media.js';
export const prerender = false;
const types = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
};
export async function GET({ params, locals }) {
  const name = String(params.name || '');
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp|pdf)$/.test(name))
    return new Response('No encontrado', { status: 404 });
  try {
    const file = await readUpload(name, locals?.runtime?.env);
    const ext = name.split('.').at(-1);
    return new Response(file, {
      headers: {
        'Content-Type': types[ext],
        'Content-Disposition': ext === 'pdf' ? 'inline' : 'inline',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('No encontrado', { status: 404 });
  }
}
