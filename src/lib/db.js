import './env.js';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { DEFAULTS, STATES } from './defaults.js';

let db;
export function dataDir(){ return path.resolve(process.env.DATA_DIR || './data'); }
export function getDb(){
  if (db) return db;
  mkdirSync(dataDir(), {recursive:true});
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
  for (const [key,value] of Object.entries(DEFAULTS)) if (!find.get(key)) insert.run(key,JSON.stringify(value));
  return db;
}
export function getContent(key){
  if(!(key in DEFAULTS)) throw new Error('Contenido no permitido');
  const row = getDb().prepare('SELECT value FROM content WHERE key=?').get(key);
  return row ? JSON.parse(row.value) : DEFAULTS[key];
}
export function getAllContent(){
  return Object.fromEntries(Object.keys(DEFAULTS).map(k=>[k,getContent(k)]));
}
export function setContent(key,value){
  if(!(key in DEFAULTS)) throw new Error('Contenido no permitido');
  getDb().prepare('INSERT INTO content(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key,JSON.stringify(value));
}
export function newRegistration(item){
  const db=getDb();
  const now=new Date().toISOString();
  db.prepare(`INSERT INTO registrations (code,sacrament,name,age,guardian,phone,email,notes,status,admin_note,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,'Recibida','',?,?)`)
    .run(item.code,item.sacrament,item.name,item.age,item.guardian,item.phone,item.email,item.notes,now,now);
}
export function listRegistrations(limit=2000){
  if(limit===0)return getDb().prepare('SELECT * FROM registrations ORDER BY created_at DESC').all();
  return getDb().prepare('SELECT * FROM registrations ORDER BY created_at DESC LIMIT ?').all(limit);
}
export function findRegistration(code){
  return getDb().prepare('SELECT * FROM registrations WHERE code=?').get(code);
}
export function setRegistrationStatus(code,status,note){
  if(!STATES.includes(status)) return false;
  return getDb().prepare('UPDATE registrations SET status=?, admin_note=?,updated_at=? WHERE code=?')
    .run(status,note.slice(0,800),new Date().toISOString(),code).changes>0;
}
export function removeRegistration(code){
  return getDb().prepare('DELETE FROM registrations WHERE code=?').run(code).changes>0;
}
