// 启动挖掘任务
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { taskManager } from '../../lib/task-manager';
import { initDatabase } from '../../lib/db/schema';

// 初始化数据库
initDatabase();

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

    const taskId = await taskManager.startTask(
      {
        type: data.patternType,
        params: data.patternConfig,
      },
      data.threads
    );

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