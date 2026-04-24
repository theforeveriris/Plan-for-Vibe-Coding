# T003: SSE实时推送

## 元信息
- 状态：待开始 | 优先级：P0 | 故事点：5
- 负责人：Claude（编码）+ @developer（验收）
- 迭代：Sprint 1（2026-04-20 ~ 2026-05-03）
- 关联：US-002, ADR-002

## 目标
实现 SSE 实时推送挖掘进度到前端，支持每秒更新。

## 已完成 [DONE]
- [ ] （未开始）

## 进行中 [IN PROGRESS]
- [ ] （未开始）

## 待开始 [TODO]
- [ ] 实现 SSE 端点
- [ ] 实现进度推送逻辑
- [ ] 实现自动重连
- [ ] 前端 SSE 客户端封装

## 代码地图（Code Map）
/backend/
|-- app/
|   |-- api/
|   |   |-- miner/
|   |   |   |-- stream/
|   |   |   |   |-- [taskId]/
|   |   |   |   |   |-- route.ts    # GET SSE流

/frontend/
|-- src/
|   |-- composables/
|   |   |-- useSSE.ts              # SSE客户端封装

## SSE消息格式

```typescript
// 进度消息
interface ProgressMessage {
  type: 'progress';
  taskId: string;
  attempts: number;
  hashrate: number;        // keys/sec
  matchesFound: number;
  timestamp: number;
}

// 匹配消息
interface MatchMessage {
  type: 'match';
  taskId: string;
  fingerprint: string;
  patternType: string;
  attemptsToFind: number;
}

// 错误消息
interface ErrorMessage {
  type: 'error';
  taskId: string;
  error: string;
}
```

## 依赖
- 依赖：T001 完成