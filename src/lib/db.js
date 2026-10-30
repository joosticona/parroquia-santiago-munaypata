import { DEFAULTS, STATES } from './defaults.js';

// D1 bindings always belong to the caller, never to shared module state.
export async function getDb(env) {
  if (env !== undefined) {
    if (!env.DB) throw new Error('Falta el binding D1 DB');
    return {
      prepare(sql) {
        const statement = env.DB.prepare(sql);
        return {
          get: (...args) => statement.bind(...args).first(),
          all: async (...args) => (await statement.bind(...args).all()).results,
          run: async (...args) => {
            const result = await statement.bind(...args).run();
            return { changes: result.meta.changes };
          },
        };
      },
    };
  }
  return (await import('./local-db.js')).getDb();
}
export async function dataDir() {
  return (await import('./local-db.js')).dataDir();
}
export async function getContent(key, env) {
  if (!(key in DEFAULTS)) throw new Error('Contenido no permitido');
  const row = await (
    await getDb(env)
  )
    .prepare('SELECT value FROM content WHERE key=?')
    .get(key);
  return row ? JSON.parse(row.value) : DEFAULTS[key];
}
export async function getAllContent(env) {
  return Object.fromEntries(
    await Promise.all(
      Object.keys(DEFAULTS).map(async (k) => [k, await getContent(k, env)]),
    ),
  );
}
export async function setContent(key, value, env) {
  if (!(key in DEFAULTS)) throw new Error('Contenido no permitido');
  await (
    await getDb(env)
  )
    .prepare(
      'INSERT INTO content(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
    )
    .run(key, JSON.stringify(value));
}
export async function newRegistration(item, env) {
  const db = await getDb(env);
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO registrations (code,sacrament,name,age,guardian,phone,email,notes,status,admin_note,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,'Recibida','',?,?)`,
    )
    .run(
      item.code,
      item.sacrament,
      item.name,
      item.age,
      item.guardian,
      item.phone,
      item.email,
      item.notes,
      now,
      now,
    );
}
export async function listRegistrations(limit = 2000, env) {
  if (limit === 0)
    return (await getDb(env))
      .prepare('SELECT * FROM registrations ORDER BY created_at DESC')
      .all();
  return (await getDb(env))
    .prepare('SELECT * FROM registrations ORDER BY created_at DESC LIMIT ?')
    .all(limit);
}
export async function findRegistration(code, env) {
  return (await getDb(env))
    .prepare('SELECT * FROM registrations WHERE code=?')
    .get(code);
}
export async function setRegistrationStatus(code, status, note, env) {
  if (!STATES.includes(status)) return false;
  return (
    (
      await (
        await getDb(env)
      )
        .prepare(
          'UPDATE registrations SET status=?, admin_note=?,updated_at=? WHERE code=?',
        )
        .run(status, note.slice(0, 800), new Date().toISOString(), code)
    ).changes > 0
  );
}
export async function removeRegistration(code, env) {
  return (
    (
      await (
        await getDb(env)
      )
        .prepare('DELETE FROM registrations WHERE code=?')
        .run(code)
    ).changes > 0
  );
}
