// 数据库 schema
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// 确保数据目录存在
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 数据库连接
const db = new Database(path.join(dataDir, 'miner.db'));

// 初始化数据库
export function initDatabase() {
  // 启用 WAL 模式以提高并发性能
  db.exec('PRAGMA journal_mode = WAL;');
  
  // 创建 mining_tasks 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS mining_tasks (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      pattern_type TEXT NOT NULL,
      pattern_config TEXT NOT NULL,
      threads INTEGER NOT NULL,
      started_at TEXT NOT NULL,
      stopped_at TEXT,
      total_attempts INTEGER DEFAULT 0,
      matches_found INTEGER DEFAULT 0
    );
  `);
  
  // 创建 special_keys 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS special_keys (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      fingerprint TEXT NOT NULL UNIQUE,
      pattern_type TEXT NOT NULL,
      match_position INTEGER NOT NULL,
      attempts_to_find INTEGER NOT NULL,
      public_key_armored TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES mining_tasks(id)
    );
  `);
  
  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_keys_task ON special_keys(task_id);
    CREATE INDEX IF NOT EXISTS idx_keys_fingerprint ON special_keys(fingerprint);
    CREATE INDEX IF NOT EXISTS idx_keys_attempts ON special_keys(attempts_to_find DESC);
  `);
  
  console.log('Database initialized successfully');
}

export { db };