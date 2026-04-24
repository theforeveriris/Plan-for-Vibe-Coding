# Active Context - 当前活跃上下文

## [IMPORTANT] 会话启动强制指令
AI 在回答前必须：
1. 确认已读取本文档
2. 确认已读取关联的 Task 文档
3. 回复开头声明："已加载活跃上下文"

## 当前任务
**网络错误修复**（已完成）
- 修复了前端持续出现的 "网络错误: TypeError: Failed to fetch" 问题
- 阻塞：无

## 最近变更（Last 3 Changes）
1. [2026-04-24] 修复网络错误问题 - 添加 CORS、超时处理、SSE 重连
2. [2026-04-24] 修复 stop API 导入路径错误 (`../../../` -> `../../../../`)
3. [2026-04-24] 完成 PGP 密钥生成核心逻辑（`src/backend/app/lib/pgp/generator.ts`）
4. [2026-04-24] 完成筛选规则实现（`src/backend/app/lib/pgp/patterns.ts`）
5. [2026-04-24] 完成数据库存储实现（`src/backend/app/lib/db/`）
6. [2026-04-24] 完成 API 路由实现（`src/backend/app/api/`）
7. [2026-04-24] 完成前端界面实现（`src/frontend/`）
8. [2026-04-24] 修复 API 路由导入路径错误（`src/backend/app/api/miner/start/route.ts`）
9. [2026-04-24] 修复 task-manager.ts 导入路径错误（`src/backend/app/lib/task-manager.ts`）
10. [2026-04-24] 替换 better-sqlite3 为文件系统存储（`src/backend/app/lib/db/`）
11. [2026-04-24] 成功启动前后端服务并验证 API 正常运行
12. [2026-04-24] 实现后端服务 URL 动态配置功能（`src/frontend/src/components/ConfigModal.vue`）

## 当前代码状态
- 分支：`main`
- 最后提交：`feat: add backend URL configuration feature`
- 未提交更改：网络错误修复相关文件

## 必须遵守的规则（精简版）
1. 所有API路由必须使用 TypeScript，参数必须校验
2. Worker线程必须处理好错误和内存管理
3. 私钥不存储，仅一次性返回
4. 使用 SSE 推送进度，不是 WebSocket
5. 后端服务 URL 必须可配置，默认值为 http://localhost:3000
6. 所有 API 路由必须配置 CORS 响应头
7. 前端 fetch 必须使用带超时的封装
8. SSE 连接必须实现自动重连机制

## 当前环境
- Node.js: 20.x
- Next.js: 14.2.35
- Vue: 3.4+
- TypeScript: 5.4+

## 服务状态
- 后端服务：http://localhost:3001（运行中，3000 被占用）
- 前端服务：待启动
- API 状态：正常（200 OK，CORS 已配置）
