// Worker 线程 - 负责生成 PGP 密钥并筛选特殊指纹
import { parentPort, workerData } from 'worker_threads';
import { generateKeyPair } from '../lib/pgp/generator';
import { matchesPattern } from '../lib/pgp/patterns';
import type { PatternConfig, KeyPair } from '../lib/pgp/types';

const { taskId, pattern } = workerData as { taskId: string; pattern: PatternConfig };

let attempts = 0;
let lastUpdateTime = Date.now();
let lastAttempts = 0;

async function mineKeys() {
  while (true) {
    try {
      // 生成密钥对
      const keyPair = await generateKeyPair();
      attempts++;

      // 检查是否匹配模式
      const matchResult = matchesPattern(keyPair.fingerprint, pattern);
      
      if (matchResult.matched) {
        // 找到特殊密钥
        parentPort?.postMessage({
          type: 'match',
          key: keyPair,
          attempts,
        });
      }

      // 每秒更新一次进度
      const now = Date.now();
      if (now - lastUpdateTime >= 1000) {
        const hashrate = (attempts - lastAttempts) / ((now - lastUpdateTime) / 1000);
        
        parentPort?.postMessage({
          type: 'progress',
          attempts: attempts - lastAttempts,
          hashrate,
        });

        lastUpdateTime = now;
        lastAttempts = attempts;
      }
    } catch (error) {
      console.error('Mining error:', error);
      // 短暂暂停后继续
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// 开始挖掘
mineKeys();
