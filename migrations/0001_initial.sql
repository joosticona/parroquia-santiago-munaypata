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
