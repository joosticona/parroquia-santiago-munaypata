import { randomBytes } from 'node:crypto';
import { newRegistration, getContent } from '../../lib/db.js';
import { clean, cleanPhone, validEmail } from '../../lib/validation.js';
import { json, throttle, clientKey, sameOrigin } from '../../lib/auth.js';
export const prerender = false;
export async function POST({ request, clientAddress }) {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido' }, 403);
  if (
    throttle(
      clientKey(request, 'inscripcion', clientAddress),
      5,
      60 * 60 * 1000,
    )
  )
    return json({ error: 'Demasiadas solicitudes. Intenta más tarde.' }, 429);
  if (!request.headers.get('content-type')?.includes('application/json'))
    return json({ error: 'Se requiere JSON' }, 415);
  let b;
  try {
    b = await request.json();
  } catch {
    return json({ error: 'Datos inválidos' }, 400);
  }
  const settings = getContent('settings');
  if (!settings.registrationOpen)
    return json(
      {
        error:
          'Las preinscripciones no están habilitadas todavía. Consulta con la secretaría.',
      },
      403,
    );
  const sacrament = getContent('sacramentos').find((x) => x.id === b.sacrament);
  if (!sacrament?.open)
    return json(
      { error: 'Este sacramento no tiene preinscripción habilitada.' },
      400,
    );
  if (b.website) return json({ ok: true, code: 'REVISION' }); // campo trampa antispam
  const data = {
    code: 'STG-' + randomBytes(8).toString('hex').toUpperCase(),
    sacrament: sacrament.id,
    name: clean(b.name, 120),
    age: clean(b.age, 3),
    guardian: clean(b.guardian, 120),
    phone: cleanPhone(b.phone),
    email: clean(b.email, 120),
    notes: clean(b.notes, 800),
  };
  if (
    data.name.length < 5 ||
    data.guardian.length < 5 ||
    !/^\d{1,3}$/.test(data.age) ||
    Number(data.age) > 110 ||
    data.phone.length < 7 ||
    !validEmail(data.email) ||
    b.consent !== true
  )
    return json(
      { error: 'Revisa nombre, edad, responsable, teléfono y consentimiento.' },
      400,
    );
  try {
    newRegistration(data);
    return json({ ok: true, code: data.code, sacrament: sacrament.title }, 201);
  } catch {
    return json(
      { error: 'No se pudo guardar la solicitud. Intenta nuevamente.' },
      500,
    );
  }
}
