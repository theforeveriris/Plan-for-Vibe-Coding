// 启动挖掘任务
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { taskManager } from '../../../lib/task-manager';
import { initDatabase } from '../../../lib/db/schema';

// 初始化数据库
initDatabase();

// CORS 响应头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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

    return NextResponse.json({ success: true, taskId }, { headers: corsHeaders });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters', details: error.errors },
        { status: 400, headers: corsHeaders }
      );
    }
    console.error('Miner start error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
