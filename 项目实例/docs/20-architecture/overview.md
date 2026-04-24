# 架构概览

## 系统架构图

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|   Vue 3 Frontend | <-> |  Next.js API    | <-> |   SQLite DB      |
|   (Port 5173)    |     |  (Port 3000)     |     |   (Local File)   |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
                                ^
                                |
                         SSE Stream
                                |
                                v
                       +------------------+
                       |                  |
                       |  Worker Threads  |
                       |  (PGP Mining)    |
                       |                  |
                       +------------------+
```

## 技术选型

| 组件 | 技术 | 版本 | 选型理由 |
|------|------|------|---------|
| 后端框架 | Next.js | 14+ | App Router + API Routes，简化部署 |
| 前端框架 | Vue 3 | 3.4+ | Composition API + TypeScript |
| 构建工具 | Vite | 5.x | 快速HMR，良好的开发体验 |
| 状态管理 | Pinia | 2.x | Vue 3 官方推荐 |
| 样式方案 | Tailwind CSS | 3.4+ | 原子化CSS，快速开发 |
| 数据库 | SQLite | 3.x | 轻量级，无需单独部署 |
| PGP库 | node-openpgp | 6.x | 纯JS实现，无系统依赖 |
| 图表 | Chart.js | 4.x | 轻量级，易于集成 |

## 项目结构

```
pgp-vanity-miner/
|-- backend/                  # Next.js 后端
|   |-- app/
|   |   |-- api/
|   |   |   |-- miner/
|   |   |   |   |-- start/
|   |   |   |   |   |-- route.ts    # POST 启动挖掘
|   |   |   |   |-- stop/
|   |   |   |   |   |-- [taskId]/
|   |   |   |   |   |   |-- route.ts    # POST 停止挖掘
|   |   |   |   |-- stream/
|   |   |   |   |   |-- [taskId]/
|   |   |   |   |   |   |-- route.ts    # GET SSE流
|   |   |   |-- keys/
|   |   |   |   |-- route.ts    # GET 密钥列表
|   |   |-- lib/
|   |   |   |-- pgp/
|   |   |   |   |-- miner.ts     # 挖掘核心逻辑
|   |   |   |   |-- patterns.ts  # 筛选规则
|   |   |   |-- db/
|   |   |   |   |-- schema.ts    # SQLite Schema
|   |   |   |   |-- queries.ts   # 数据库操作
|   |   |-- workers/
|   |   |   |-- mining.worker.ts # Worker线程
|   |-- package.json
|
|-- frontend/                # Vue 3 前端
|   |-- src/
|   |   |-- components/
|   |   |   |-- MinerControl.vue    # 控制面板
|   |   |   |-- MinerTerminal.vue    # 实时终端
|   |   |   |-- KeyCard.vue         # 密钥卡片
|   |   |   |-- StatsPanel.vue      # 统计面板
|   |   |-- stores/
|   |   |   |-- miner.ts        # 挖掘状态管理
|   |   |   |-- keys.ts         # 密钥列表管理
|   |   |-- views/
|   |   |   |-- Dashboard.vue   # 主页面
|   |   |-- App.vue
|   |   |-- main.ts
|   |-- package.json
|
|-- docs/                    # 项目文档
|-- README.md
```

## 数据流

### 挖掘任务流程
1. 用户在前端设置规则和参数
2. 点击"开始"，POST `/api/miner/start`
3. 后端创建任务，返回 taskId
4. 前端通过 GET `/api/miner/stream/:taskId` 订阅SSE
5. Worker线程开始生成密钥并推送进度
6. 发现特殊密钥时保存到SQLite，前端显示卡片

### 密钥导出流程
1. 用户点击"复制公钥"或"下载"
2. 从SQLite查询公钥（不包含私钥）
3. 复制到剪贴板或生成.asc文件下载

## 关键设计决策
- [ADR-001] 使用 node-openpgp 而非 GnuPG
- [ADR-002] 使用 SSE 而非 WebSocket 推送进度
- [ADR-003] SQLite 存储元数据，不存储私钥