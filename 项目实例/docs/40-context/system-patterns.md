# System Patterns - 可复制代码模式

## 模式 1: Next.js API Route 标准结构
```typescript
// app/api/miner/start/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const StartMinerSchema = z.object({
  patternType: z.enum(['consecutive', 'repeating', 'palindrome', 'special_date', 'custom_regex', 'leading_zeros']),
  patternConfig: z.object({
    minLength: z.number().optional(),
    pattern: z.string().optional(),
    zeroCount: z.number().optional(),
  }),
  threads: z.number().min(1).max(8).default(4),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = StartMinerSchema.parse(body);

    const taskId = uuidv4();
    // 创建任务，启动Worker...

    return NextResponse.json({ success: true, taskId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Miner start error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## 模式 2: SSE Stream
```typescript
// app/api/miner/stream/[taskId]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 定期发送进度
      const interval = setInterval(() => {
        const progress = getTaskProgress(taskId);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(progress)}\n\n`)
        );
      }, 1000);

      // 清理
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

## 模式 3: PGP 密钥生成
```typescript
// app/lib/pgp/generator.ts
import * as openpgp from 'node-openpgp';

export async function generateKeyPair(): Promise<KeyPair> {
  const { privateKey, publicKey } = await openpgp.generateKey({
    type: 'rsa',
    rsaBits: 2048,
    userIDs: [{ name: 'PGP Vanity Miner', email: 'miner@localhost' }],
    passphrase: '', // 无密码
  });

  const fingerprint = openpgp.readKey({ armoredKey: publicKey })
    .getFingerprint();

  return {
    publicKey,
    privateKey,
    fingerprint,
  };
}
```

## 模式 4: 筛选规则
```typescript
// app/lib/pgp/patterns.ts
export function matchesPattern(fingerprint: string, config: PatternConfig): MatchResult | null {
  const hexFingerprint = fingerprint.replace(/ /g, '').toUpperCase();

  switch (config.type) {
    case 'consecutive':
      return matchConsecutive(hexFingerprint, config.params.minLength || 5);
    case 'repeating':
      return matchRepeating(hexFingerprint, config.params.minLength || 3);
    case 'palindrome':
      return matchPalindrome(hexFingerprint);
    case 'custom_regex':
      return matchRegex(hexFingerprint, config.params.pattern || '');
    case 'leading_zeros':
      return matchLeadingZeros(hexFingerprint, config.params.zeroCount || 5);
    default:
      return null;
  }
}
```

## 模式 5: Vue 3 Store (Pinia)
```typescript
// frontend/src/stores/miner.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useMinerStore = defineStore('miner', () => {
  const isRunning = ref(false);
  const taskId = ref<string | null>(null);
  const attempts = ref(0);
  const hashrate = ref(0);
  const matches = ref<SpecialKey[]>([]);

  const hashrateHistory = ref<number[]>([]);

  function updateProgress(data: ProgressMessage) {
    attempts.value = data.attempts;
    hashrate.value = data.hashrate;
    hashrateHistory.value.push(data.hashrate);
    if (hashrateHistory.value.length > 60) {
      hashrateHistory.value.shift();
    }
  }

  return {
    isRunning,
    taskId,
    attempts,
    hashrate,
    matches,
    hashrateHistory,
    updateProgress,
  };
});
```