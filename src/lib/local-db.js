import './env.js';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DEFAULTS } from './defaults.js';

let db;
export function dataDir() {
  return path.resolve(process.env.DATA_DIR || './data');
}
export function getDb() {
  if (db) return db;
  mkdirSync(dataDir(), { recursive: true });
  db = new DatabaseSync(path.join(dataDir(), 'parroquia.sqlite'));
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS content (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS registrations (
      code TEXT PRIMARY KEY, sacrament TEXT NOT NULL, name TEXT NOT NULL,
      age TEXT NOT NULL, guardian TEXT NOT NULL, phone TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Recibida', admin_note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_reg_status ON registrations(status);
    CREATE INDEX IF NOT EXISTS idx_reg_created ON registrations(created_at);
  `);
  const find = db.prepare('SELECT key FROM content WHERE key=?');
  const insert = db.prepare('INSERT INTO content(key,value) VALUES(?,?)');
  for (const [key, value] of Object.entries(DEFAULTS))
    if (!find.get(key)) insert.run(key, JSON.stringify(value));
  return db;
}
