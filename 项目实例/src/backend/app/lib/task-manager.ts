// 任务管理器
import { v4 as uuidv4 } from 'uuid';
import { Worker } from 'worker_threads';
import path from 'path';
import type { MiningTask, PatternConfig, KeyPair, SSEMessage } from '../pgp/types';
import { createTask, updateTaskProgress, stopTask } from '../db/queries';

interface MiningWorker {
  worker: Worker;
  taskId: string;
  attempts: number;
  hashrate: number;
  startTime: number;
  lastUpdateTime: number;
  lastAttempts: number;
}

class TaskManager {
  private tasks: Map<string, MiningTask> = new Map();
  private workers: Map<string, MiningWorker> = new Map();
  private sseClients: Map<string, Set<(message: SSEMessage) => void>> = new Map();

  constructor() {
    // 定期清理过期任务
    setInterval(() => this.cleanupTasks(), 60000);
  }

  async startTask(pattern: PatternConfig, threads: number = 4): Promise<string> {
    const taskId = uuidv4();
    
    const task: MiningTask = {
      id: taskId,
      status: 'running',
      pattern,
      threads,
      startedAt: new Date(),
      totalAttempts: 0,
      matchesFound: 0,
    };

    // 保存到数据库
    createTask(task);
    this.tasks.set(taskId, task);
    this.sseClients.set(taskId, new Set());

    // 启动 Worker 线程
    for (let i = 0; i < threads; i++) {
      this.startWorker(taskId, pattern);
    }

    return taskId;
  }

  private startWorker(taskId: string, pattern: PatternConfig) {
    const workerPath = path.join(__dirname, '../../workers/mining.worker.ts');
    const worker = new Worker(workerPath, {
      workerData: { taskId, pattern }
    });

    const workerInfo: MiningWorker = {
      worker,
      taskId,
      attempts: 0,
      hashrate: 0,
      startTime: Date.now(),
      lastUpdateTime: Date.now(),
      lastAttempts: 0,
    };

    this.workers.set(`${taskId}_${Date.now()}`, workerInfo);

    worker.on('message', (message: any) => {
      if (message.type === 'progress') {
        workerInfo.attempts += message.attempts;
        workerInfo.hashrate = message.hashrate;
        
        // 更新任务进度
        this.updateTaskProgress(taskId);
      } else if (message.type === 'match') {
        // 处理匹配到的密钥
        this.handleMatch(taskId, message.key, message.attempts);
      }
    });

    worker.on('error', (error) => {
      console.error(`Worker error for task ${taskId}:`, error);
    });

    worker.on('exit', (code) => {
      console.log(`Worker exited with code ${code} for task ${taskId}`);
      this.workers.forEach((info, key) => {
        if (info.taskId === taskId) {
          this.workers.delete(key);
        }
      });
    });
  }

  private updateTaskProgress(taskId: string) {
    let totalAttempts = 0;
    let totalHashrate = 0;
    let workerCount = 0;

    this.workers.forEach((info) => {
      if (info.taskId === taskId) {
        totalAttempts += info.attempts;
        totalHashrate += info.hashrate;
        workerCount++;
      }
    });

    const task = this.tasks.get(taskId);
    if (task) {
      task.totalAttempts = totalAttempts;
      this.tasks.set(taskId, task);
      
      // 更新数据库
      updateTaskProgress(taskId, totalAttempts, task.matchesFound);

      // 发送 SSE 消息
      const message: SSEMessage = {
        type: 'progress',
        taskId,
        attempts: totalAttempts,
        hashrate: totalHashrate / workerCount || 0,
        matchesFound: task.matchesFound,
        timestamp: Date.now(),
      };

      this.broadcastSSEMessage(taskId, message);
    }
  }

  private handleMatch(taskId: string, key: KeyPair, attempts: number) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.matchesFound++;
      this.tasks.set(taskId, task);

      // 发送匹配消息
      const message: SSEMessage = {
        type: 'match',
        taskId,
        fingerprint: key.fingerprint,
        patternType: task.pattern.type,
        attemptsToFind: attempts,
      };

      this.broadcastSSEMessage(taskId, message);
    }
  }

  async stopTask(taskId: string) {
    // 停止所有相关 Worker
    this.workers.forEach((info, key) => {
      if (info.taskId === taskId) {
        info.worker.terminate();
        this.workers.delete(key);
      }
    });

    // 更新任务状态
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = 'stopped';
      this.tasks.set(taskId, task);
      stopTask(taskId);

      // 发送完成消息
      const message: SSEMessage = {
        type: 'complete',
        taskId,
        totalAttempts: task.totalAttempts,
        totalMatches: task.matchesFound,
      };

      this.broadcastSSEMessage(taskId, message);
    }
  }

  getTask(taskId: string): MiningTask | undefined {
    return this.tasks.get(taskId);
  }

  registerSSEClient(taskId: string, callback: (message: SSEMessage) => void) {
    const clients = this.sseClients.get(taskId);
    if (clients) {
      clients.add(callback);
    }
  }

  unregisterSSEClient(taskId: string, callback: (message: SSEMessage) => void) {
    const clients = this.sseClients.get(taskId);
    if (clients) {
      clients.delete(callback);
      if (clients.size === 0) {
        this.sseClients.delete(taskId);
      }
    }
  }

  private broadcastSSEMessage(taskId: string, message: SSEMessage) {
    const clients = this.sseClients.get(taskId);
    if (clients) {
      clients.forEach(callback => callback(message));
    }
  }

  private cleanupTasks() {
    const now = Date.now();
    const cutoffTime = now - (24 * 60 * 60 * 1000); // 24小时

    this.tasks.forEach((task, taskId) => {
      if (task.status === 'stopped' && task.startedAt.getTime() < cutoffTime) {
        this.tasks.delete(taskId);
        this.sseClients.delete(taskId);
      }
    });
  }
}

// 导出单例
export const taskManager = new TaskManager();