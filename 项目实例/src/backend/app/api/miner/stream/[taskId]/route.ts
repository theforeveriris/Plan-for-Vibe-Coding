// SSE 实时流
import { NextRequest, NextResponse } from 'next/server';
import { taskManager } from '../../../../lib/task-manager';
import type { SSEMessage } from '../../../../lib/pgp/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const { taskId } = params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 注册 SSE 客户端
      const callback = (message: SSEMessage) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
        );
      };

      taskManager.registerSSEClient(taskId, callback);

      // 发送初始状态
      const task = taskManager.getTask(taskId);
      if (task) {
        const initialMessage: SSEMessage = {
          type: 'progress',
          taskId,
          attempts: task.totalAttempts,
          hashrate: 0,
          matchesFound: task.matchesFound,
          timestamp: Date.now(),
        };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(initialMessage)}\n\n`)
        );
      }

      // 处理连接关闭
      request.signal.addEventListener('abort', () => {
        taskManager.unregisterSSEClient(taskId, callback);
        controller.close();
      });

      // 30秒发送一次 keep-alive
      const keepAliveInterval = setInterval(() => {
        controller.enqueue(encoder.encode(`: keep-alive\n\n`));
      }, 30000);

      // 清理
      return () => {
        clearInterval(keepAliveInterval);
        taskManager.unregisterSSEClient(taskId, callback);
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}