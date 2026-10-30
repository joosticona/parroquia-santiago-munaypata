import { getContent, setContent } from '../../../lib/db.js';
import { normalizeRecord } from '../../../lib/validation.js';
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
    const { kind, operation, record } = body;
    if (
      !['sacramentos', 'horarios', 'avisos', 'eventos', 'galeria'].includes(
        kind,
      )
    )
      throw Error('Sección no permitida');
    if (!['create', 'update', 'delete'].includes(operation))
      throw Error('Operación no permitida');
    const existing = await getContent(kind, env),
      id = String(record?.id || '').slice(0, 70);
    const index = existing.findIndex((v) => v.id === id);
    if (kind === 'sacramentos' && operation !== 'update')
      throw Error('Los sacramentos base no se pueden borrar ni duplicar');
    let updated;
    if (operation === 'delete') {
      if (index < 0) throw Error('Registro no encontrado');
      updated = existing.filter((v) => v.id !== id);
    } else if (operation === 'create') {
      if (existing.length >= 100) throw Error('Límite de registros alcanzado');
      updated = [
        { ...normalizeRecord(kind, record, {}), id: crypto.randomUUID() },
        ...existing,
      ];
    } else {
      if (index < 0) throw Error('Registro no encontrado');
      updated = existing.map((r, i) =>
        i === index ? { ...normalizeRecord(kind, record, r), id: r.id } : r,
      );
    }
    await setContent(kind, updated, env);
    return json({ ok: true, value: updated });
  } catch (e) {
    return json({ error: e.message || 'No se pudo guardar' }, 400);
  }
}
