# 项目变更日志（Changelog）

## 2026-04-25

### [ Added ]
- 新增 `TabContainer` 组件（`src/frontend/src/components/TabContainer.vue`）
  - 支持标签切换动画和激活状态样式
  - 使用 scoped slot 传递 `activeTab` 状态给子内容
  - 用于组织实时终端/已发现密钥、Hashrate趋势/监控面板

### [ Changed ]
- 重构 `Dashboard.vue` 布局，使用 TabContainer 组件：
  - 实时终端 + 已发现的特殊密钥 → 合并为标签页容器
  - Hashrate 趋势 + Hashrate 监控 → 合并为标签页容器
- 优化 `StatsPanel.vue`，支持详细模式显示规则统计信息
- 增强 `MinerTerminal.vue`，每条记录显示密钥指纹
- 增强 `KeyCard.vue`，支持按规则类型高亮显示

### [ Fixed ]
- 修复 Chart.js `RangeError: Maximum call stack size exceeded` 错误
  - 移除 `deep: true` 的 watcher，避免无限递归
  - 使用 `update('none')` 替代默认更新模式
- 修复 Chart.js `TypeError: Cannot set properties of undefined (setting 'fullSize')` 错误
  - 添加显式的 grid 配置到 scales 选项
  - 确保所有 chart 配置选项正确初始化
- 修复 `Dashboard.vue` 重复 title 显示问题
  - 移除 Dashboard 内部 header，仅保留 `App.vue` 的标题

## 2026-04-24

### [ Fixed ]
- 修复前端持续出现的 "网络错误: TypeError: Failed to fetch" 问题
  - 为所有后端 API 路由添加 CORS 响应头
  - 前端 fetch 添加 `AbortController` 超时处理（默认 10 秒）
  - 优化错误提示，显示具体请求 URL 和状态码
- 修复 SSE 连接频繁断开并重连失败的问题
  - `onopen` 中重置 `sseReconnectCount` 为 0
  - 区分初始连接错误和连接中断，初始失败使用 3 秒延迟重连
  - 添加网络状态检测（`navigator.onLine`）
  - 最大重连次数从 5 次提升到 10 次
- 修复 Hashrate 持续为 0.0 keys/s 的问题
  - 将 RSA 2048 密钥生成替换为 ECC curve25519（性能提升 10-50 倍）
  - 将 Worker 线程改为 `setInterval` 定时器（避免 Next.js 开发模式 ESM 解析问题）
- 修复后端导入路径错误
  - `src/backend/app/api/miner/start/route.ts`: `../pgp/` → `./pgp/`
  - `src/backend/app/api/miner/stop/route.ts`: `../../../` → `../../../../`
  - `src/backend/app/lib/task-manager.ts`: `../pgp/` → `./pgp/`

### [ Added ]
- 实现后端服务 URL 动态配置功能（`src/frontend/src/components/ConfigModal.vue`）
  - 支持修改后端地址并持久化到 `localStorage`
  - 默认地址改为 `http://localhost:3002`

## 2026-04-20

### v0.1.0 - 项目初始化
- 初始化 Next.js 14 + App Router 项目
- 初始化 Vue 3 + Vite 前端项目
- 创建基础目录结构
- 创建外部记忆系统文档体系

### 完成的功能
- [x] Next.js 后端项目脚手架
- [x] Vue 3 前端项目脚手架
- [x] 文档体系结构

### 待开始的功能
- [ ] PGP 密钥生成核心逻辑
- [ ] SSE 实时推送
- [ ] SQLite 数据存储
- [ ] Vue 前端控制面板

## 版本规范

遵循 [Keep a Changelog](https://keepachangelog.com/) 规范：

- `[ Added ]` 新增功能
- `[ Changed ]` 功能变更
- `[ Deprecated ]` 废弃功能
- `[ Removed ]` 移除功能
- `[ Fixed ]` Bug 修复
- `[ Security ]` 安全相关
