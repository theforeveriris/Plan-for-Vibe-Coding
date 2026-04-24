// 停止挖掘任务
import { NextRequest, NextResponse } from 'next/server';
import { taskManager } from '../../../lib/task-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    
    await taskManager.stopTask(taskId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Miner stop error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}