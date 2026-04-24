// 数据库查询操作
import { db } from './schema';
import type { MiningTask, SpecialKey, PatternConfig } from '../pgp/types';

// 任务相关操作
export function createTask(task: Omit<MiningTask, 'id' | 'startedAt' | 'totalAttempts' | 'matchesFound'> & { id: string }) {
  const stmt = db.prepare(`
    INSERT INTO mining_tasks (id, status, pattern_type, pattern_config, threads, started_at, total_attempts, matches_found)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    task.id,
    task.status,
    task.pattern.type,
    JSON.stringify(task.pattern),
    task.threads,
    new Date().toISOString(),
    0,
    0
  );
}

export function updateTaskProgress(taskId: string, attempts: number, matchesFound: number) {
  const stmt = db.prepare(`
    UPDATE mining_tasks
    SET total_attempts = ?, matches_found = ?
    WHERE id = ?
  `);
  
  stmt.run(attempts, matchesFound, taskId);
}

export function stopTask(taskId: string) {
  const stmt = db.prepare(`
    UPDATE mining_tasks
    SET status = 'stopped', stopped_at = ?
    WHERE id = ?
  `);
  
  stmt.run(new Date().toISOString(), taskId);
}

export function getTask(taskId: string): MiningTask | null {
  const stmt = db.prepare(`
    SELECT * FROM mining_tasks WHERE id = ?
  `);
  
  const row = stmt.get(taskId);
  if (!row) return null;
  
  return {
    id: row.id,
    status: row.status,
    pattern: JSON.parse(row.pattern_config),
    threads: row.threads,
    startedAt: new Date(row.started_at),
    stoppedAt: row.stopped_at ? new Date(row.stopped_at) : undefined,
    totalAttempts: row.total_attempts,
    matchesFound: row.matches_found,
  };
}

// 密钥相关操作
export function createSpecialKey(key: SpecialKey) {
  const stmt = db.prepare(`
    INSERT INTO special_keys (id, task_id, fingerprint, pattern_type, match_position, attempts_to_find, public_key_armored, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    key.id,
    key.taskId,
    key.fingerprint,
    key.patternType,
    key.matchPosition,
    key.attemptsToFind,
    key.publicKeyArmored,
    key.createdAt.toISOString()
  );
}

export function getKeys(page: number = 1, pageSize: number = 10): { keys: SpecialKey[]; total: number } {
  const offset = (page - 1) * pageSize;
  
  // 获取总数
  const countStmt = db.prepare('SELECT COUNT(*) as total FROM special_keys');
  const { total } = countStmt.get() as { total: number };
  
  // 获取分页数据
  const stmt = db.prepare(`
    SELECT * FROM special_keys
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);
  
  const rows = stmt.all(pageSize, offset) as any[];
  
  const keys = rows.map(row => ({
    id: row.id,
    taskId: row.task_id,
    fingerprint: row.fingerprint,
    patternType: row.pattern_type,
    matchPosition: row.match_position,
    attemptsToFind: row.attempts_to_find,
    publicKeyArmored: row.public_key_armored,
    createdAt: new Date(row.created_at),
  }));
  
  return { keys, total };
}

export function getKeysByTaskId(taskId: string): SpecialKey[] {
  const stmt = db.prepare(`
    SELECT * FROM special_keys
    WHERE task_id = ?
    ORDER BY created_at DESC
  `);
  
  const rows = stmt.all(taskId) as any[];
  
  return rows.map(row => ({
    id: row.id,
    taskId: row.task_id,
    fingerprint: row.fingerprint,
    patternType: row.pattern_type,
    matchPosition: row.match_position,
    attemptsToFind: row.attempts_to_find,
    publicKeyArmored: row.public_key_armored,
    createdAt: new Date(row.created_at),
  }));
}

// 清除过期任务（可选）
export function cleanupOldTasks(days: number = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const stmt = db.prepare(`
    DELETE FROM mining_tasks
    WHERE stopped_at IS NOT NULL AND stopped_at < ?
  `);
  
  const result = stmt.run(cutoffDate.toISOString());
  console.log(`Cleaned up ${result.changes} old tasks`);
}