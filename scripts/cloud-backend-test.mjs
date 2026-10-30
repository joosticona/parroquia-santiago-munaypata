import { strict as assert } from 'node:assert';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import * as db from '../src/lib/db.js';
import * as auth from '../src/lib/auth.js';
import { POST as login } from '../src/pages/api/admin/login.js';
import { POST as upload } from '../src/pages/api/admin/upload.js';
import { GET as media } from '../src/pages/media/[name].js';
import { GET as data } from '../src/pages/api/admin/data.js';
import { GET as csv } from '../src/pages/api/admin/export.csv.js';
import { POST as requests } from '../src/pages/api/admin/solicitudes.js';

// Execute the D1 SQL against SQLite while preserving D1's asynchronous API shape.
function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(
    readFileSync(
      new URL('../migrations/0001_initial.sql', import.meta.url),
      'utf8',
    ),
  );
  return {
    sqlite,
    prepare(sql) {
      return {
        bind(...values) {
          const statement = sqlite.prepare(sql);
          return {
            first: async () => statement.get(...values) ?? null,
            all: async () => ({
              results: statement.all(...values),
              success: true,
            }),
            run: async () => ({
              meta: { changes: statement.run(...values).changes },
              success: true,
            }),
          };
        },
      };
    },
  };
}
const first = database(),
  second = database();
const objects = new Map();
const env = {
  DB: first,
  UPLOADS: {
    async put(key, value, options) {
      objects.set(key, { value, options });
    },
    async get(key) {
      const object = objects.get(key);
      return object ? { body: object.value } : null;
    },
  },
  ADMIN_PASSWORD: 'cloud-test-password-2026',
  SESSION_SECRET: 'cloud-test-secret-more-than-thirty-two-characters',
  PUBLIC_ORIGIN: 'https://parroquia.example',
};
const locals = { runtime: { env } };
const base = env.PUBLIC_ORIGIN;
const request = (route, body, cookie) =>
  new Request(base + route, {
    method: 'POST',
    headers: {
      Origin: base,
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
try {
  assert.equal((await db.getContent('settings', env)).registrationOpen, false);
  await db.setContent('settings', { registrationOpen: true }, env);
  assert.equal((await db.getAllContent(env)).settings.registrationOpen, true);
  assert.equal(
    (await db.getContent('settings', { DB: second })).registrationOpen,
    false,
  );
  await assert.rejects(db.getContent('settings', {}), /binding D1/);
  const token = await auth.createSession(env);
  assert(await auth.validSession(token, env));
  assert(
    !(await auth.validSession(token, {
      ...env,
      SESSION_SECRET: 'another-secret-more-than-thirty-two-characters',
    })),
  );
  assert(!(await auth.validSession(token + 'x', env)));
  assert(auth.sameOrigin(request('/login', {}), env));
  let cookie;
  assert.equal(
    (await login({ request: request('/login', { password: 'wrong' }), locals }))
      .status,
    401,
  );
  assert.equal(
    (
      await login({
        request: request('/login', { password: env.ADMIN_PASSWORD }),
        locals,
        url: new URL(base),
        cookies: {
          set(name, value, options) {
            assert(options.secure);
            cookie = name + '=' + value;
          },
        },
      })
    ).status,
    200,
  );
  assert(cookie);
  const code = 'STG-0123456789ABCDEF';
  await db.newRegistration(
    {
      code,
      sacrament: 'bautismo',
      name: 'Persona ficticia',
      age: '20',
      guardian: 'Responsable ficticio',
      phone: '71234567',
      email: '',
      notes: '',
    },
    env,
  );
  assert.equal((await db.findRegistration(code, env)).status, 'Recibida');
  assert.equal((await db.listRegistrations(0, env)).length, 1);
  assert.equal(
    await db.setRegistrationStatus(code, 'Inventado', '', env),
    false,
  );
  const mutation = await requests({
    request: request(
      '/requests',
      { action: 'update', code, status: 'Aprobada', note: 'Prueba' },
      cookie,
    ),
    locals,
  });
  assert.equal(mutation.status, 200);
  assert.equal((await db.findRegistration(code, env)).status, 'Aprobada');
  const authenticated = new Request(base, { headers: { Cookie: cookie } });
  assert.equal(
    (await (await data({ request: authenticated, locals })).json())
      .registrations.length,
    1,
  );
  assert(
    (await (await csv({ request: authenticated, locals })).text()).includes(
      code,
    ),
  );
  const form = new FormData();
  form.append(
    'file',
    new File(
      [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 1])],
      'image.png',
      { type: 'image/png' },
    ),
  );
  const result = await upload({
    request: new Request(base + '/upload', {
      method: 'POST',
      headers: { Origin: base, Cookie: cookie },
      body: form,
    }),
    locals,
  });
  assert.equal(result.status, 200);
  const name = (await result.json()).url.split('/').at(-1);
  assert.equal(objects.get(name).options.httpMetadata.contentType, 'image/png');
  const response = await media({ params: { name }, locals });
  assert.equal(response.status, 200);
  assert.equal((await response.arrayBuffer()).byteLength, 12);
  assert.equal(
    (await media({ params: { name: '../secret' }, locals })).status,
    404,
  );
  objects.delete(name);
  assert.equal((await media({ params: { name }, locals })).status, 404);
  assert(await db.removeRegistration(code, env));
  assert.equal(await db.removeRegistration(code, env), false);
  assert.equal(await db.findRegistration(code, env), null);
  console.log(
    'OK: D1 migration/CRUD/isolation, cloud secrets/login, authenticated APIs/export, R2 upload/media.',
  );
} finally {
  first.sqlite.close();
  second.sqlite.close();
}
