# ADR-002: 使用 SSE 而非 WebSocket 推送进度

## 状态
已接受（Accepted）| 日期：2026-04-20 | 作者：@developer

## 背景
需要将挖掘进度实时推送到前端，有两种主要方案：
1. Server-Sent Events (SSE)：服务端推送，单向
2. WebSocket：双向通信

## 决策
使用 SSE 推送挖掘进度。

## 考虑过的选项

| 选项 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| WebSocket | 双向通信，可客户端发送消息 | 实现复杂，需处理连接管理 | [X] 拒绝 |
| SSE | 实现简单，自动重连，HTTP兼容 | 仅单向（对我们够用） | [O] 接受 |

## 后果
- 正面：实现简单，与Next.js API Routes天然集成
- 正面：自动重连，浏览器原生支持
- 负面：无法从客户端发送控制消息（需另开API）
- 风险缓解：控制消息通过单独的POST API发送

## 实现方式
```typescript
// app/api/miner/stream/[taskId]/route.ts
export async function GET(request: Request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // 定期发送进度
      setInterval(() => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(progress)}\n\n`));
      }, 1000);
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

## 相关
- 影响：T003 SSE实时推送
- 关联：US-002 实时查看进度