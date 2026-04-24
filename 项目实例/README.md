# PGP Vanity Key Miner

一个用于生成具有特殊指纹的 PGP 密钥对的全栈 Web 应用。

## 项目概述

PGP Vanity Key Miner 是一个类似于加密货币 vanity address 生成器的工具，但专门针对 OpenPGP 公钥指纹/ID。它可以批量生成 PGP 密钥对，并筛选出具有特殊模式的公钥。

### 核心功能

- **多规则筛选**：支持连续数字、重复数字、回文、特殊日期、自定义正则和前导零等多种筛选规则
- **多线程挖掘**：使用 Worker 线程实现并行密钥生成，提高挖掘效率
- **实时进度推送**：通过 SSE (Server-Sent Events) 实现服务器向客户端的实时进度推送
- **数据持久化**：使用 SQLite 存储密钥元数据（不存储私钥，确保安全性）
- **完整的前端界面**：包含控制面板、实时终端、统计面板和密钥卡片展示

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 后端 | Next.js | 14+ |
| 后端 | node-openpgp | 6.0.0 |
| 后端 | better-sqlite3 | 9.4.3 |
| 前端 | Vue 3 | 3.4+ |
| 前端 | TypeScript | 5.2.2 |
| 前端 | TailwindCSS | 3.4.4 |
| 前端 | Pinia | 2.1.7 |
| 前端 | Chart.js | 4.4.8 |

## 快速开始

### 方法一：使用启动脚本（推荐）

1. **确保环境准备就绪**：
   - Node.js 20.x 或更高版本
   - pnpm 包管理器

2. **运行启动脚本**：
   ```bash
   # 在项目根目录执行
   .\start-project.bat
   ```

   脚本会自动：
   - 安装后端依赖
   - 启动后端开发服务器
   - 安装前端依赖
   - 启动前端开发服务器

3. **访问应用**：
   - 后端 API：http://localhost:3000
   - 前端应用：http://localhost:5173

### 方法二：手动启动

#### 1. 启动后端

```bash
# 进入后端目录
cd src/backend

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

#### 2. 启动前端

```bash
# 进入前端目录
cd src/frontend

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 项目结构

```
项目实例/
|-- src/
|   |-- backend/          # Next.js 后端
|   |   |-- app/
|   |   |   |-- api/      # API 路由
|   |   |   |-- lib/      # 核心库
|   |   |   |-- workers/  # Worker 线程
|   |-- frontend/         # Vue 3 前端
|   |   |-- src/
|   |   |   |-- components/  # 组件
|   |   |   |-- stores/      # 状态管理
|   |   |   |-- views/        # 页面
|-- docs/                 # 项目文档
|-- start-project.bat     # 启动脚本
```

## API 接口

### 1. 启动挖掘任务
- **端点**：`POST /api/miner/start`
- **参数**：
  ```json
  {
    "patternType": "consecutive",
    "patternConfig": {
      "minLength": 5
    },
    "threads": 4
  }
  ```
- **返回**：
  ```json
  {
    "success": true,
    "taskId": "uuid"
  }
  ```

### 2. 停止挖掘任务
- **端点**：`POST /api/miner/stop/:taskId`
- **返回**：
  ```json
  {
    "success": true
  }
  ```

### 3. 实时流
- **端点**：`GET /api/miner/stream/:taskId`
- **返回**：SSE 流，包含进度和匹配信息

### 4. 获取密钥列表
- **端点**：`GET /api/keys`
- **返回**：
  ```json
  {
    "success": true,
    "keys": [
      {
        "id": "uuid",
        "taskId": "uuid",
        "fingerprint": "...",
        "patternType": "consecutive",
        "matchPosition": 0,
        "attemptsToFind": 12345,
        "createdAt": "2026-04-24T12:00:00Z",
        "publicKeyArmored": "..."
      }
    ]
  }
  ```

## 筛选规则

| 规则名称 | 描述 | 配置参数 |
|---------|------|----------|
| `consecutive` | 连续数字 | `minLength` (最小长度) |
| `repeating` | 重复数字 | `minLength` (最小长度) |
| `palindrome` | 回文数字 | 无 |
| `special_date` | 特殊日期 | `pattern` (YYYYMMDD 格式) |
| `custom_regex` | 自定义正则 | `pattern` (正则表达式) |
| `leading_zeros` | 前导零 | `zeroCount` (零的数量) |

## 使用示例

### 示例 1：挖掘包含连续 5 位数字的密钥

1. 在前端控制面板选择：
   - 筛选规则：连续数字
   - 最小长度：5
   - 线程数：4

2. 点击「开始挖掘」

3. 系统会开始生成密钥对，并在找到匹配的密钥时显示在终端和密钥卡片中

### 示例 2：挖掘包含特殊日期的密钥

1. 在前端控制面板选择：
   - 筛选规则：特殊日期
   - 日期模式：19990101
   - 线程数：4

2. 点击「开始挖掘」

## 性能提示

- **线程数设置**：根据 CPU 核心数调整，一般设置为核心数的 1-2 倍
- **筛选规则**：越复杂的规则（如长连续数字）需要更多的尝试次数
- **硬件要求**：PGP 密钥生成是 CPU 密集型操作，建议在性能较好的设备上运行

## 安全注意事项

- **私钥安全**：私钥不会存储在数据库中，仅在生成时提供下载，请妥善保管
- **密钥强度**：默认使用 2048 位 RSA 密钥，可根据需要在代码中调整
- **网络安全**：在生产环境部署时，建议使用 HTTPS 保护 API 通信

## 故障排查

### 常见问题

1. **后端启动失败**：
   - 检查 Node.js 版本是否符合要求
   - 检查端口 3000 是否被占用

2. **前端启动失败**：
   - 检查 Node.js 版本是否符合要求
   - 检查端口 5173 是否被占用

3. **挖掘速度慢**：
   - 减少线程数，避免系统过载
   - 选择更简单的筛选规则

4. **SSE 连接失败**：
   - 检查网络连接
   - 确保后端服务正在运行

## 未来计划

- [ ] 支持 GPU 加速挖掘
- [ ] 实现暂停/恢复功能
- [ ] 添加排行榜功能
- [ ] 支持更多密钥类型（ECDSA、Ed25519）
- [ ] 实现 Docker Compose 一键部署

## 许可证

MIT License