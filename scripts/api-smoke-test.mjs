import { strict as assert } from 'node:assert';
import { mkdtempSync, rmSync } from 'node:fs';
import path from 'node:path';
const folder = mkdtempSync(path.join(process.cwd(), 'santiago-api-'));
process.env.DATA_DIR = folder;
process.env.ADMIN_PASSWORD = 'una-clave-fuerte-de-pruebas-2026';
process.env.SESSION_SECRET =
  'clave-sesion-larga-de-pruebas-mas-de-cincuenta-caracteres-2026';
const { getDb } = await import('../src/lib/db.js');
const { createSession } = await import('../src/lib/auth.js');
const enroll = await import('../src/pages/api/inscripciones.js');
const status = await import('../src/pages/api/estado.js');
const admin = await import('../src/pages/api/admin/settings.js');
const collection = await import('../src/pages/api/admin/collections.js');
const upload = await import('../src/pages/api/admin/upload.js');
const media = await import('../src/pages/media/[name].js');
const base = 'http://localhost:4321';
const req = (url, body, headers = {}) =>
  new Request(base + url, {
    method: 'POST',
    headers: { Origin: base, 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
const parse = async (res) => ({ status: res.status, data: await res.json() });
try {
  let r = await parse(
    await enroll.POST({
      request: req('/api/inscripciones', { sacrament: 'bautismo' }),
    }),
  );
  assert.equal(r.status, 403, 'inscripciones bloqueadas por defecto');
  const cookie = 'santiago_admin=' + (await createSession());
  r = await parse(
    await admin.POST({
      request: req(
        '/api/admin/settings',
        { registrationOpen: true },
        { Cookie: cookie },
      ),
    }),
  );
  assert.equal(r.status, 200, JSON.stringify(r.data));
  const registration = {
    sacrament: 'bautismo',
    name: 'Prueba Catequista',
    age: '18',
    guardian: 'Prueba Responsable',
    phone: '71234567',
    email: '',
    notes: '',
    consent: true,
  };
  r = await parse(
    await enroll.POST({ request: req('/api/inscripciones', registration) }),
  );
  assert.equal(r.status, 201, JSON.stringify(r.data));
  const code = r.data.code;
  r = await parse(
    await status.POST({
      request: req('/api/estado', { code, phone: '71234567' }),
    }),
  );
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.status, 'Recibida');
  r = await parse(
    await status.POST({
      request: req('/api/estado', { code, phone: '70000000' }),
    }),
  );
  assert.equal(r.status, 404);
  r = await parse(
    await collection.POST({
      request: req(
        '/api/admin/collections',
        {
          kind: 'avisos',
          operation: 'create',
          record: { title: 'Aviso de prueba', description: 'Detalle' },
        },
        { Cookie: cookie },
      ),
    }),
  );
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert(r.data.value.some((x) => x.title === 'Aviso de prueba'));
  const f = new FormData();
  f.append(
    'file',
    new File(
      [Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 1, 0, 0, 0, 0])],
      'portada.png',
      { type: 'image/png' },
    ),
  );
  const upReq = new Request(base + '/api/admin/upload', {
    method: 'POST',
    headers: { Origin: base, Cookie: cookie },
    body: f,
  });
  r = await parse(await upload.POST({ request: upReq }));
  assert.equal(r.status, 200, JSON.stringify(r.data));
  const filename = r.data.url.split('/').at(-1);
  const response = await media.GET({ params: { name: filename } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Content-Type'), 'image/png');
  console.log(
    'OK: rutas API de inscripción, seguimiento, panel, avisos, upload y media.',
  );
} finally {
  (await getDb()).close();
  // Bun on Windows keeps SQLite statements alive until garbage collection.
  globalThis.Bun?.gc(true);
  rmSync(folder, { recursive: true, force: true });
}

await import('./cloud-backend-test.mjs');
