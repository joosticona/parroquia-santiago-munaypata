import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { dataDir } from '../../lib/db.js';
export const prerender = false;
const types = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
};
export async function GET({ params }) {
  const name = String(params.name || '');
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp|pdf)$/.test(name))
    return new Response('No encontrado', { status: 404 });
  try {
    const file = await readFile(path.join(dataDir(), 'uploads', name));
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
