-- Sign-up storage for the volunteer interest form and event RSVPs.
-- Run this once against the D1 database before the site goes live:
--   wrangler d1 execute pcyd-signups --file=./schema.sql --remote

CREATE TABLE IF NOT EXISTS signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  type TEXT NOT NULL CHECK (type IN ('volunteer', 'rsvp')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_title TEXT,
  interest_areas TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_signups_type ON signups (type);
CREATE INDEX IF NOT EXISTS idx_signups_created_at ON signups (created_at);
