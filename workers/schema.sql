CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, body TEXT NOT NULL,
  parent TEXT, created INTEGER NOT NULL, fingerprint TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_parent_created ON messages(parent,created);
CREATE INDEX IF NOT EXISTS idx_messages_fingerprint_created ON messages(fingerprint,created);
