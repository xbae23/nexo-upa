-- Ejecutar una sola vez en la D1 existente `nexo-usuarios`.
-- No altera ni borra usuarios, sesiones o perfiles_nexo.
CREATE TABLE IF NOT EXISTS social_media (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES usuarios(id),
  object_key TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL CHECK (purpose IN ('post','story','message','avatar')),
  mime TEXT NOT NULL,
  file_name TEXT NOT NULL DEFAULT '',
  bytes INTEGER NOT NULL,
  target_id TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_social_media_expiry ON social_media(expires_at);
CREATE INDEX IF NOT EXISTS idx_social_media_owner_time ON social_media(owner_id,created_at);

CREATE TABLE IF NOT EXISTS social_avatars (
  user_id TEXT PRIMARY KEY REFERENCES usuarios(id),
  media_id TEXT NOT NULL REFERENCES social_media(id),
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS social_posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL REFERENCES usuarios(id),
  kind TEXT NOT NULL CHECK (kind IN ('post','notify','reporte','venta')),
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  price TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  media_id TEXT REFERENCES social_media(id),
  day_key TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_social_posts_live ON social_posts(expires_at,created_at);
CREATE INDEX IF NOT EXISTS idx_social_posts_author ON social_posts(author_id,created_at);

CREATE TABLE IF NOT EXISTS social_stories (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL REFERENCES usuarios(id),
  body TEXT NOT NULL DEFAULT '',
  media_id TEXT REFERENCES social_media(id),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_social_stories_live ON social_stories(expires_at,created_at);

CREATE TABLE IF NOT EXISTS social_follows (
  follower_id TEXT NOT NULL REFERENCES usuarios(id),
  followee_id TEXT NOT NULL REFERENCES usuarios(id),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  PRIMARY KEY(follower_id,followee_id)
);
CREATE INDEX IF NOT EXISTS idx_social_follows_expiry ON social_follows(expires_at);

CREATE TABLE IF NOT EXISTS social_presence (
  user_id TEXT PRIMARY KEY REFERENCES usuarios(id),
  seen_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_social_presence_seen ON social_presence(seen_at);

CREATE TABLE IF NOT EXISTS social_ups (
  post_id TEXT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES usuarios(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY(post_id,user_id)
);
CREATE TABLE IF NOT EXISTS social_saves (
  post_id TEXT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES usuarios(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY(post_id,user_id)
);
CREATE TABLE IF NOT EXISTS social_reposts (
  post_id TEXT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES usuarios(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY(post_id,user_id)
);

CREATE TABLE IF NOT EXISTS social_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES usuarios(id),
  parent_id TEXT REFERENCES social_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_social_comments_post ON social_comments(post_id,created_at);

CREATE TABLE IF NOT EXISTS social_conversations (
  id TEXT PRIMARY KEY,
  user_a TEXT NOT NULL REFERENCES usuarios(id),
  user_b TEXT NOT NULL REFERENCES usuarios(id),
  created_at INTEGER NOT NULL,
  first_message_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  CHECK(user_a <> user_b)
);
CREATE INDEX IF NOT EXISTS idx_social_conversations_a ON social_conversations(user_a,expires_at);
CREATE INDEX IF NOT EXISTS idx_social_conversations_b ON social_conversations(user_b,expires_at);

CREATE TABLE IF NOT EXISTS social_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES social_conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES usuarios(id),
  body TEXT NOT NULL DEFAULT '',
  media_id TEXT REFERENCES social_media(id),
  file_name TEXT NOT NULL DEFAULT '',
  reply_to TEXT,
  reaction TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_social_messages_thread ON social_messages(conversation_id,created_at);

CREATE TABLE IF NOT EXISTS social_notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES usuarios(id),
  actor_id TEXT NOT NULL REFERENCES usuarios(id),
  kind TEXT NOT NULL,
  post_id TEXT REFERENCES social_posts(id) ON DELETE CASCADE,
  body TEXT NOT NULL DEFAULT '',
  read_at INTEGER,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_social_notifications_user ON social_notifications(user_id,expires_at,created_at);
