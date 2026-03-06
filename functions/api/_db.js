// D1 数据库自动初始化
// 首次调用时自动创建所需的表

export async function ensureTables(db) {
    await db.batch([
        db.prepare(`CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT DEFAULT (datetime('now'))
        )`),
        db.prepare(`CREATE TABLE IF NOT EXISTS shares (
            id TEXT PRIMARY KEY,
            file_key TEXT NOT NULL,
            file_name TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            expires_at TEXT,
            download_count INTEGER DEFAULT 0
        )`),
        db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('max_file_size', '104857600')`),
        db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('chunk_size', '5242880')`),
        db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('chunk_enabled', 'true')`),
        db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('chunk_threshold', '10485760')`),
        db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('max_storage_size', '1073741824')`),
    ]);
}
