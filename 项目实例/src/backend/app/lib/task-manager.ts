// 任务管理器
import { v4 as uuidv4 } from 'uuid';
import type { MiningTask, PatternConfig, KeyPair, SSEMessage } from './pgp/types';
import { createTask, updateTaskProgress, stopTask, getTask } from './db/queries';
import { generateKeyPair } from './pgp/generator';
import { matchesPattern } from './pgp/patterns';

interface WorkerInfo {
  taskId: string;
  attempts: number;
  hashrate: number;
  startTime: number;
  lastUpdateTime: number;
  lastAttempts: number;
  intervalId: ReturnType<typeof setInterval>;
}

class TaskManager {
  private tasks: Map<string, MiningTask> = new Map();
  private workers: Map<string, WorkerInfo> = new Map();
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

    console.log(`[TaskManager] 任务已创建: taskId=${taskId}, pattern=${pattern.type}, threads=${threads}`);

    // 启动 Worker（在主线程中运行）
    for (let i = 0; i < threads; i++) {
      this.startWorker(taskId, pattern);
    }

    return taskId;
  }

  private startWorker(taskId: string, pattern: PatternConfig) {
    const workerId = `${taskId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const workerInfo: WorkerInfo = {
      taskId,
      attempts: 0,
      hashrate: 0,
      startTime: Date.now(),
      lastUpdateTime: Date.now(),
      lastAttempts: 0,
      intervalId: setInterval(async () => {
        try {
          // 每秒执行一次挖掘
          const startTime = Date.now();
          let batchAttempts = 0;
          
          // 每批处理最多 10 个密钥（避免阻塞事件循环）
          while (batchAttempts < 10 && Date.now() - startTime < 900) {
            const keyPair = await generateKeyPair();
            batchAttempts++;
            workerInfo.attempts++;
            
            const matchResult = matchesPattern(keyPair.fingerprint, pattern);
            
            if (matchResult.matched) {
              this.handleMatch(taskId, keyPair, workerInfo.attempts);
            }
          }
          
          // 更新 hashrate
          const now = Date.now();
          const timeDiff = (now - workerInfo.lastUpdateTime) / 1000;
          if (timeDiff >= 1) {
            workerInfo.hashrate = (workerInfo.attempts - workerInfo.lastAttempts) / timeDiff;
            workerInfo.lastUpdateTime = now;
            workerInfo.lastAttempts = workerInfo.attempts;
            
            // 更新任务进度
            this.updateTaskProgress(taskId);
          }
        } catch (error) {
          console.error(`[TaskManager] Worker ${workerId} error:`, error);
        }
      }, 1000),
    };

    this.workers.set(workerId, workerInfo);
    console.log(`[TaskManager] Worker 已启动: ${workerId}`);
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
    console.log(`[TaskManager] 停止任务: taskId=${taskId}`);

    // 停止所有相关 Worker
    this.workers.forEach((info, key) => {
      if (info.taskId === taskId) {
        clearInterval(info.intervalId);
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
    // 先从内存获取
    const memoryTask = this.tasks.get(taskId);
    if (memoryTask) {
      return memoryTask;
    }

    // 内存中没有，从数据库加载
    const dbTask = getTask(taskId);
    if (dbTask) {
      // 转换日期类型
      const task: MiningTask = {
        ...dbTask,
        startedAt: new Date(dbTask.startedAt),
        stoppedAt: dbTask.stoppedAt ? new Date(dbTask.stoppedAt) : undefined,
      };
      this.tasks.set(taskId, task);
      return task;
    }

    return undefined;
  }

  registerSSEClient(taskId: string, callback: (message: SSEMessage) => void) {
    let clients = this.sseClients.get(taskId);
    if (!clients) {
      clients = new Set();
      this.sseClients.set(taskId, clients);
    }
    clients.add(callback);
    console.log(`[TaskManager] SSE 客户端已注册: taskId=${taskId}, 客户端数=${clients.size}`);
  }

  unregisterSSEClient(taskId: string, callback: (message: SSEMessage) => void) {
    const clients = this.sseClients.get(taskId);
    if (clients) {
      clients.delete(callback);
      console.log(`[TaskManager] SSE 客户端已注销: taskId=${taskId}, 剩余客户端数=${clients.size}`);
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
