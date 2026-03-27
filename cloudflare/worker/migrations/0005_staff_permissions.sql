PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS user_permissions (
    user_id TEXT PRIMARY KEY,
    page_permissions TEXT NOT NULL,
    edit_permissions TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
