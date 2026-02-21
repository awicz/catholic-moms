-- Catholic Moms Group — Database Schema
-- Run this in your Neon SQL editor to set up the database.

CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,           -- bcrypt hash, never plaintext
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS books (
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  author        TEXT NOT NULL,
  purchase_url  TEXT,                  -- nullable, link to purchase
  why_helpful   VARCHAR(100),          -- max 100 chars
  added_by_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  added_by_name TEXT NOT NULL,         -- denormalized: survives user deletion
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_categories (
  book_id     INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, category_id)
);

-- Seed initial categories
INSERT INTO categories (name, slug) VALUES
  ('Prayer & Spirituality',     'prayer-and-spirituality'),
  ('Marriage & Family',         'marriage-and-family'),
  ('Raising Children in Faith', 'raising-children-in-faith'),
  ('Saints & Catholic Heroes',  'saints-and-catholic-heroes'),
  ('Theology & Doctrine',       'theology-and-doctrine'),
  ('Health & Wholeness',        'health-and-wholeness'),
  ('Grief & Suffering',         'grief-and-suffering'),
  ('Community & Friendship',    'community-and-friendship')
ON CONFLICT (slug) DO NOTHING;
