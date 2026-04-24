// 停止挖掘任务
import { NextRequest, NextResponse } from 'next/server';
import { taskManager } from '../../../../lib/task-manager';

// CORS 响应头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    
    await taskManager.stopTask(taskId);
    
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error('Miner stop error:', error);
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
