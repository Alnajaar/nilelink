CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hash TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    origin TEXT NOT NULL,
    payload TEXT,
    timestamp INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_hash ON events(hash);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
