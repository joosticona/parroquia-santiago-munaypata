import { storeUpload } from '../../../lib/media.js';
import {
  adminResponse,
  json,
  unauthorized,
  sameOrigin,
  throttle,
  clientKey,
} from '../../../lib/auth.js';
export const prerender = false;
function typeOf(bytes) {
  const starts = (signature, offset = 0) =>
    signature.every((value, i) => bytes[offset + i] === value);
  const text = (value) => Array.from(value, (c) => c.charCodeAt(0));
  if (starts([0xff, 0xd8, 0xff])) return ['jpg', 'image/jpeg'];
  if (starts([137, 80, 78, 71, 13, 10, 26, 10])) return ['png', 'image/png'];
  if (starts(text('RIFF')) && starts(text('WEBP'), 8))
    return ['webp', 'image/webp'];
  if (starts(text('%PDF-'))) return ['pdf', 'application/pdf'];
  return null;
}
export async function POST({ request, clientAddress, locals }) {
  const env = locals?.runtime?.env;
  if (!(await adminResponse(request, env))) return unauthorized();
  if (!sameOrigin(request, env))
    return json({ error: 'Origen no permitido' }, 403);
  if (throttle(clientKey(request, 'upload', clientAddress), 25, 60 * 60 * 1000))
    return json({ error: 'Demasiadas cargas de archivos' }, 429);
  try {
    const form = await request.formData(),
      file = form.get('file');
    if (!(file instanceof File))
      return json({ error: 'Selecciona un archivo' }, 400);
    if (file.size > 8 * 1024 * 1024 || file.size < 10)
      return json({ error: 'Archivos de máximo 8 MB' }, 400);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const info = typeOf(bytes);
    if (!info) return json({ error: 'Solo imágenes JPG/PNG/WebP o PDF' }, 400);
    if (info[0] !== 'pdf' && file.size > 5 * 1024 * 1024)
      return json({ error: 'Las imágenes deben pesar menos de 5 MB' }, 400);
    const name = crypto.randomUUID() + '.' + info[0];
    await storeUpload(name, bytes, info[1], env);
    return json({ ok: true, url: '/media/' + name, type: info[1] });
  } catch {
    return json({ error: 'No se pudo subir el archivo' }, 400);
  }
}
