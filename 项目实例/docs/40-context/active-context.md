# Active Context - 当前活跃上下文

## [IMPORTANT] 会话启动强制指令
AI 在回答前必须：
1. 确认已读取本文档
2. 确认已读取关联的 Task 文档
3. 回复开头声明："已加载活跃上下文"

## 当前任务
**T001: PGP密钥生成核心逻辑**（进行中）
- 下一步：实现 `generator.ts` 中的密钥生成函数
- 阻塞：无

## 最近变更（Last 3 Changes）
1. [2026-04-20] 项目初始化，创建基础目录结构
2. [2026-04-20] 安装 node-openpgp 依赖
3. [2026-04-20] 创建文档体系

## 当前代码状态
- 分支：`main`
- 最后提交：`initial commit - project structure`
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