-- CloudDrive D1 配置表
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 默认配置
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('max_file_size', '104857600'),        -- 单文件最大 100MB
  ('chunk_size', '5242880'),             -- 分片大小 5MB
  ('chunk_enabled', 'true'),             -- 启用分片上传
  ('chunk_threshold', '10485760'),       -- 超过 10MB 自动分片
  ('max_storage_size', '1073741824');    -- 总存储空间 1GB

-- 分享链接表
CREATE TABLE IF NOT EXISTS shares (
  id TEXT PRIMARY KEY,
  file_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT,
  download_count INTEGER DEFAULT 0
);

