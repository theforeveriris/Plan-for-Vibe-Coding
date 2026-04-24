# Active Context - 当前活跃上下文

## [IMPORTANT] 会话启动强制指令
AI 在回答前必须：
1. 确认已读取本文档
2. 确认已读取关联的 Task 文档
3. 回复开头声明："已加载活跃上下文"

## 当前任务
**UI 精简与全屏布局优化**（已完成）
- 移除顶部 Header，让 Dashboard 占满整个网页
- 将配置按钮（⚙️）移到控制面板右上角并缩小
- 移除 MinerTerminal 和 MinerControl 内部重复标题
- 阻塞：无

## 最近变更（Last 3 Changes）
1. [2026-04-25] 移除顶部 Header，Dashboard 占满全屏 - App.vue 移除 header，dashboard-content 高度改为 100vh
2. [2026-04-25] 配置按钮移到控制面板右上角 - 使用 provide/inject 传递显示函数，按钮缩小为 emoji 样式
3. [2026-04-25] 移除组件内部重复标题 - MinerTerminal 移除 terminal-header，MinerControl 移除 h3 标题
4. [2026-04-25] 合并控制面板/实时终端/已发现密钥到单个 TabContainer - 左侧面板仅保留 StatsPanel + TabContainer
5. [2026-04-25] 修复 TabContainer 被挤压问题 - 为 left-panel 子元素设置正确的 flex 属性
6. [2026-04-25] 修复 MinerControl 无法滚动问题 - 添加 overflow-y: auto
7. [2026-04-25] 实现 TabContainer 组件 - 将实时终端/已发现密钥、Hashrate趋势/监控分别放入标签页容器
8. [2026-04-25] 修复 Chart.js 错误 - RangeError: Maximum call stack size exceeded 和 TypeError: Cannot set properties of undefined
9. [2026-04-25] 修复 Dashboard.vue 重复 title 问题
10. [2026-04-24] 修复网络错误问题 - 添加 CORS、超时处理、SSE 重连
11. [2026-04-24] 修复 stop API 导入路径错误 (`../../../` -> `../../../../`)
12. [2026-04-24] 完成 PGP 密钥生成核心逻辑（`src/backend/app/lib/pgp/generator.ts`）
13. [2026-04-24] 完成筛选规则实现（`src/backend/app/lib/pgp/patterns.ts`）
14. [2026-04-24] 完成数据库存储实现（`src/backend/app/lib/db/`）
15. [2026-04-24] 完成 API 路由实现（`src/backend/app/api/`）
16. [2026-04-24] 完成前端界面实现（`src/frontend/`）
17. [2026-04-24] 修复 API 路由导入路径错误（`src/backend/app/api/miner/start/route.ts`）
18. [2026-04-24] 修复 task-manager.ts 导入路径错误（`src/backend/app/lib/task-manager.ts`）
19. [2026-04-24] 替换 better-sqlite3 为文件系统存储（`src/backend/app/lib/db/`）
20. [2026-04-24] 成功启动前后端服务并验证 API 正常运行
21. [2026-04-24] 实现后端服务 URL 动态配置功能（`src/frontend/src/components/ConfigModal.vue`）

## 当前代码状态
- 分支：`main`
- 最后提交：`feat: add backend URL configuration feature`
- 未提交更改：UI 精简、全屏布局、TabContainer 组件、Chart.js 修复、文档更新

## 必须遵守的规则（精简版）
1. 所有API路由必须使用 TypeScript，参数必须校验
2. Worker线程必须处理好错误和内存管理
3. 私钥不存储，仅一次性返回
4. 使用 SSE 推送进度，不是 WebSocket
5. 后端服务 URL 必须可配置，默认值为 http://localhost:3000
6. 所有 API 路由必须配置 CORS 响应头
7. 前端 fetch 必须使用带超时的封装
8. SSE 连接必须实现自动重连机制
9. 组件内部禁止直接调用 API（必须通过自定义 Hook / Service）
10. 禁止使用 `@ts-ignore`（必须附带详细原因）

## 当前环境
- Node.js: 20.x
- Next.js: 14.2.35
- Vue: 3.4+
- TypeScript: 5.4+

## 服务状态
- 后端服务：http://localhost:3001（运行中，3000 被占用）
- 前端服务：http://localhost:5173/（运行中）
- API 状态：正常（200 OK，CORS 已配置）
