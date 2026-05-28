CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id TEXT NOT NULL,
  username TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'reader',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS users_github_id_unique ON users(github_id);
CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  tags TEXT,
  cover_image TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  pinned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_unique ON posts(slug);
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON posts(published_at);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  views INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_unique ON projects(slug);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);
CREATE INDEX IF NOT EXISTS projects_published_at_idx ON projects(published_at);

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_type TEXT NOT NULL DEFAULT 'post',
  target_id INTEGER,
  user_id INTEGER,
  nickname TEXT,
  email TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  post_slug TEXT,
  author TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS comments_target_type_idx ON comments(target_type);
CREATE INDEX IF NOT EXISTS comments_target_id_idx ON comments(target_id);
CREATE INDEX IF NOT EXISTS comments_status_idx ON comments(status);
CREATE INDEX IF NOT EXISTS comments_post_slug_idx ON comments(post_slug);

CREATE TABLE IF NOT EXISTS login_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  github_id TEXT NOT NULL,
  username TEXT NOT NULL,
  email TEXT,
  ip TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS login_logs_user_id_idx ON login_logs(user_id);
CREATE INDEX IF NOT EXISTS login_logs_github_id_idx ON login_logs(github_id);
CREATE INDEX IF NOT EXISTS login_logs_created_at_idx ON login_logs(created_at);

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY,
  site_name TEXT NOT NULL DEFAULT 'My Blog',
  site_description TEXT NOT NULL DEFAULT '',
  homepage_intro TEXT NOT NULL DEFAULT '',
  header_logo_url TEXT NOT NULL DEFAULT '',
  hero_left_decor_url TEXT NOT NULL DEFAULT '',
  hero_avatar_url TEXT NOT NULL DEFAULT '',
  hero_right_decor_url TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO site_settings (
  id, site_name, site_description, homepage_intro, updated_at
) VALUES (
  1, 'isishey', '', '', CURRENT_TIMESTAMP
);