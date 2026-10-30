import { setRegistrationStatus, removeRegistration } from '../../../lib/db.js';
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
    const code = String(body.code || '').slice(0, 32);
    if (body.action === 'delete') {
      if (!(await removeRegistration(code, env)))
        throw Error('Solicitud no encontrada');
    } else if (body.action === 'update') {
      if (
        !(await setRegistrationStatus(
          code,
          String(body.status),
          String(body.note || ''),
          env,
        ))
      )
        throw Error('Estado o solicitud inválidos');
    } else throw Error('Acción no permitida');
    return json({ ok: true });
  } catch (e) {
    return json({ error: e.message || 'No se pudo actualizar' }, 400);
  }
}
