# Active Context - 当前活跃上下文

## [IMPORTANT] 会话启动强制指令
AI 在回答前必须：
1. 确认已读取本文档
2. 确认已读取关联的 Task 文档
3. 回复开头声明："已加载活跃上下文"

## 当前任务
**T001: PGP密钥生成核心逻辑**（已完成）
- 下一步：开始 T002 筛选规则实现
- 阻塞：无

## 最近变更（Last 3 Changes）
1. [2026-04-24] 完成 PGP 密钥生成核心逻辑（`src/backend/app/lib/pgp/generator.ts`）
2. [2026-04-24] 完成筛选规则实现（`src/backend/app/lib/pgp/patterns.ts`）
3. [2026-04-24] 完成数据库存储实现（`src/backend/app/lib/db/`）
4. [2026-04-24] 完成 API 路由实现（`src/backend/app/api/`）
5. [2026-04-24] 完成前端界面实现（`src/frontend/`）

## 当前代码状态
- 分支：`main`
- 最后提交：`feat: complete PGP vanity key miner project`
- 未提交更改：无

## 必须遵守的规则（精简版）
1. 所有API路由必须使用 TypeScript，参数必须校验
2. Worker线程必须处理好错误和内存管理
3. 私钥不存储，仅一次性返回
4. 使用 SSE 推送进度，不是 WebSocket

## 当前环境
- Node.js: 20.x
- Next.js: 14.x
- Vue: 3.4+
- TypeScript: 5.4+