# ADR-003: SQLite 存储策略

## 状态
已接受（Accepted）| 日期：2026-04-20 | 作者：@developer

## 背景
需要存储已发现的特殊密钥元数据，但密钥本身（包含私钥）需要特殊处理：
- 元数据：可存储（指纹、规则、尝试次数等）
- 私钥：不存储，仅在发现时提供一次性下载

## 决策
使用SQLite存储密钥元数据，不存储私钥。

## 数据库Schema

```sql
CREATE TABLE mining_tasks (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL, -- 'running' | 'stopped' | 'completed'
  pattern_type TEXT NOT NULL,
  pattern_config TEXT NOT NULL, -- JSON
  threads INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  stopped_at TEXT,
  total_attempts INTEGER DEFAULT 0,
  matches_found INTEGER DEFAULT 0
);

CREATE TABLE special_keys (
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

CREATE INDEX idx_keys_task ON special_keys(task_id);
CREATE INDEX idx_keys_fingerprint ON special_keys(fingerprint);
CREATE INDEX idx_keys_attempts ON special_keys(attempts_to_find DESC);
```

## 考虑过的选项

| 选项 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| PostgreSQL | 功能强大，支持JSON | 需单独部署 | [X] 拒绝 |
| SQLite | 零配置，文件级存储 | 不适合高并发 | [O] 接受 |
| Redis | 速度快 | 数据易失，需单独部署 | [X] 拒绝 |

## 后果
- 正面：零配置，数据库就是文件，易于备份
- 正面：私钥不存储，安全性好
- 负面：SQLite写入是串行的，极端情况下可能慢
- 风险缓解：元数据写入频率不高（仅发现特殊密钥时）

## 安全考虑
- 私钥仅在发现时从Worker返回，一次性展示给用户
- 前端需提示用户"立即下载，刷新后私钥将不可获取"
- 数据库仅存储公钥和元数据

## 相关
- 影响：T007 SQLite存储
- 安全相关：私钥处理策略