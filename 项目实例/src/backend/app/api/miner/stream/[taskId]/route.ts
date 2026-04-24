// SSE 实时流
import { NextRequest } from 'next/server';
import { taskManager } from '../../../../lib/task-manager';
import type { SSEMessage } from '../../../../lib/pgp/types';

// CORS 响应头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'X-Accel-Buffering': 'no',
};

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
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
          );
        } catch (error) {
          console.error('SSE enqueue error:', error);
        }
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
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(initialMessage)}\n\n`)
          );
        } catch (error) {
          console.error('SSE initial message error:', error);
        }
      }

      // 处理连接关闭
      request.signal.addEventListener('abort', () => {
        taskManager.unregisterSSEClient(taskId, callback);
        try {
          controller.close();
        } catch (error) {
          // 忽略已关闭的错误
        }
      });

      // 30秒发送一次 keep-alive
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keep-alive\n\n`));
        } catch (error) {
          clearInterval(keepAliveInterval);
          taskManager.unregisterSSEClient(taskId, callback);
        }
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
      ...corsHeaders,
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
