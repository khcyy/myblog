DROP TABLE IF EXISTS comments;
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_slug TEXT NOT NULL,
    author TEXT NOT NULL,
    email TEXT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_comments_post_slug ON comments(post_slug);

DROP TABLE IF EXISTS likes;
CREATE TABLE likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_slug TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_likes_post_slug ON likes(post_slug);
