import { strict as assert } from 'node:assert';
import { mkdtempSync, rmSync } from 'node:fs';
import path from 'node:path';
const folder = mkdtempSync(path.join(process.cwd(), 'santiago-test-'));
process.env.DATA_DIR = folder;
process.env.ADMIN_PASSWORD = 'UnEjemploDeClaveSuperLarga32';
process.env.SESSION_SECRET =
  'un-secreto-de-prueba-que-supera-ampliamente-los-treinta-y-dos-caracteres';
const db = await import('../src/lib/db.js');
const auth = await import('../src/lib/auth.js');
const validator = await import('../src/lib/validation.js');
try {
  const content = await db.getAllContent();
  assert(content.sacramentos.length === 4);
  assert(content.settings.registrationOpen === false);
  await db.setContent('settings', {
    ...content.settings,
    registrationOpen: true,
  });
  assert((await db.getContent('settings')).registrationOpen);
  const code = 'STG-112233445566AABB';
  await db.newRegistration({
    code,
    sacrament: 'bautismo',
    name: 'Test Persona',
    age: '12',
    guardian: 'Responsable Prueba',
    phone: '71234567',
    email: '',
    notes: '',
  });
  assert.equal((await db.findRegistration(code)).status, 'Recibida');
  assert.equal((await db.listRegistrations()).length, 1);
  assert(await db.setRegistrationStatus(code, 'Aprobada', 'Completo'));
  assert.equal((await db.findRegistration(code)).status, 'Aprobada');
  assert.equal(await db.setRegistrationStatus(code, 'Inventado', ''), false);
  assert(auth.authConfigured());
  const token = await auth.createSession();
  assert(await auth.validSession(token));
  assert(!(await auth.validSession(token + 'abc')));
  assert.equal(validator.cleanPhone('+591 712-34567'), '59171234567');
  const sac = validator.normalizeRecord(
    'avisos',
    { title: 'Prueba', document: '/media/abc.pdf' },
    {},
  );
  assert.equal(sac.document, '/media/abc.pdf');
  assert(await db.removeRegistration(code));
  assert.equal((await db.listRegistrations()).length, 0);
  console.log('OK: base de datos, CRUD, sesión, validación y estados.');
} finally {
  (await db.getDb()).close();
  // Bun on Windows keeps SQLite statements alive until garbage collection.
  globalThis.Bun?.gc(true);
  rmSync(folder, { recursive: true, force: true });
}
