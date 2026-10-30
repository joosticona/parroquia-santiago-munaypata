// Explicit cloud environments must never silently write to ephemeral local disk.
export async function storeUpload(name, bytes, contentType, env) {
  if (env !== undefined) {
    if (!env.UPLOADS) throw new Error('Falta el binding R2 UPLOADS');
    await env.UPLOADS.put(name, bytes, { httpMetadata: { contentType } });
    return;
  }
  const { writeFile, mkdir } = await import('node:fs/promises');
  const { default: path } = await import('node:path');
  const { dataDir } = await import('./local-db.js');
  const dir = path.join(dataDir(), 'uploads');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes, { flag: 'wx', mode: 0o600 });
}
export async function readUpload(name, env) {
  if (env !== undefined) {
    if (!env.UPLOADS) throw new Error('Falta el binding R2 UPLOADS');
    const object = await env.UPLOADS.get(name);
    if (!object) throw new Error('No encontrado');
    return object.body;
  }
  const { readFile } = await import('node:fs/promises');
  const { default: path } = await import('node:path');
  const { dataDir } = await import('./local-db.js');
  return readFile(path.join(dataDir(), 'uploads', name));
}
