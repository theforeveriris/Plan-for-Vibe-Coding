# Active Context - 当前活跃上下文

## [IMPORTANT] 会话启动强制指令
AI 在回答前必须：
1. 确认已读取本文档
2. 确认已读取关联的 Task 文档
3. 回复开头声明："已加载活跃上下文"

## 当前任务
**规则引擎后端集成与UI细节优化**（进行中）
- 规则引擎前端已实现（RuleGroupManager、ruleEngine Store）
- 控制面板已转型为任务控制面板（只读显示配置摘要）
- 实时终端已改为白底黑字风格
- KeyCard按钮已移除emoji
- 阻塞：规则引擎后端与task-manager集成

## 最近变更（Last 10 Changes）
1. [2026-04-25] KeyCard按钮移除emoji - 复制/下载/详情按钮改为纯文本
2. [2026-04-25] 实时终端改为白底黑字 - 背景白色，文字深灰/黑色
3. [2026-04-25] 解决控制面板与规则引擎冲突 - MinerControl转型为任务控制面板，职责分离
4. [2026-04-25] 实现规则引擎前端 - RuleGroupManager组件、ruleEngine Store、类型定义
5. [2026-04-25] 移除顶部 Header，Dashboard 占满全屏 - App.vue 移除 header，dashboard-content 高度改为 100vh
6. [2026-04-25] 配置按钮移到控制面板右上角 - 使用 provide/inject 传递显示函数，按钮缩小为 emoji 样式
7. [2026-04-25] 移除组件内部重复标题 - MinerTerminal 移除 terminal-header，MinerControl 移除 h3 标题
8. [2026-04-25] 合并控制面板/实时终端/已发现密钥到单个 TabContainer - 左侧面板仅保留 StatsPanel + TabContainer
9. [2026-04-25] 修复 TabContainer 被挤压问题 - 为 left-panel 子元素设置正确的 flex 属性
10. [2026-04-25] 修复 MinerControl 无法滚动问题 - 添加 overflow-y: auto

## 当前代码状态
- 分支：`main`
- 最后提交：`feat: add backend URL configuration feature`
- 未提交更改：规则引擎前端、控制面板转型、UI细节优化

## 必须遵守的规则（精简版）
1. 所有API路由必须使用 TypeScript，参数必须校验
2. Worker线程必须处理好错误和内存管理
3. 私钥不存储，仅一次性返回
4. 使用 SSE 推送进度，不是 WebSocket
5. 后端服务 URL 必须可配置，默认值为 http://localhost:3001
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

## 组件职责说明
| 组件 | 职责 | 位置 |
|------|------|------|
| MinerControl | 任务控制（状态、线程、开始/停止） | 控制面板标签页 |
| RuleGroupManager | 规则配置（独立规则、规则组、全局配置） | 规则引擎标签页 |
| MinerTerminal | 实时日志显示 | 实时终端标签页 |
| KeyCard | 密钥卡片（复制、下载、详情） | 已发现密钥标签页 |
| StatsPanel | 统计信息展示 | 右侧面板 |
| HashrateChart | Hashrate趋势图表 | 右侧面板 |
