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

  console.log(`[SSE Server] 新连接请求: taskId=${taskId}`);

  const stream = new ReadableStream({
    start(controller) {
      let isClosed = false;
      let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

      // 安全关闭控制器的辅助函数
      function safeClose() {
        if (!isClosed) {
          isClosed = true;
          try {
            controller.close();
          } catch (error) {
            // 忽略已关闭的错误
          }
        }
      }

      // 安全发送消息的辅助函数
      function safeEnqueue(data: string) {
        if (!isClosed) {
          try {
            controller.enqueue(encoder.encode(data));
            return true;
          } catch (error) {
            console.error(`[SSE Server] 发送失败:`, error);
            cleanup();
            return false;
          }
        }
        return false;
      }

      // 清理函数
      function cleanup() {
        if (keepAliveInterval) {
          clearInterval(keepAliveInterval);
          keepAliveInterval = null;
        }
        taskManager.unregisterSSEClient(taskId, callback);
        safeClose();
      }

      // 注册 SSE 客户端
      const callback = (message: SSEMessage) => {
        const success = safeEnqueue(`data: ${JSON.stringify(message)}\n\n`);
        if (!success) {
          console.log(`[SSE Server] 客户端 ${taskId} 无法接收消息，执行清理`);
        }
      };

      taskManager.registerSSEClient(taskId, callback);
      console.log(`[SSE Server] 客户端已注册: taskId=${taskId}`);

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
        safeEnqueue(`data: ${JSON.stringify(initialMessage)}\n\n`);
      } else {
        // 任务不存在，发送错误后关闭
        console.warn(`[SSE Server] 任务不存在: taskId=${taskId}`);
        safeEnqueue(`data: ${JSON.stringify({ type: 'error', taskId, error: '任务不存在或已过期' })}\n\n`);
        cleanup();
        return;
      }

      // 处理连接关闭 - 客户端断开
      request.signal.addEventListener('abort', () => {
        console.log(`[SSE Server] 客户端断开连接: taskId=${taskId}`);
        cleanup();
      });

      // 15秒发送一次 keep-alive（比之前的30秒更频繁，防止代理超时）
      keepAliveInterval = setInterval(() => {
        const success = safeEnqueue(`: keep-alive\n\n`);
        if (success) {
          console.log(`[SSE Server] 发送心跳: taskId=${taskId}`);
        }
      }, 15000);

      // 清理
      return () => {
        cleanup();
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
