-- prompts table
CREATE TABLE IF NOT EXISTS prompts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- tags table
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- prompts_tags table
CREATE TABLE IF NOT EXISTS prompts_tags (
    prompt_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (prompt_id) REFERENCES prompts (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE,
    PRIMARY KEY (prompt_id, tag_id)
);
