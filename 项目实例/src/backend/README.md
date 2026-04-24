# 后端入口文件

## 目录结构说明

此目录为后端 Next.js 应用程序的根目录。

### 目录结构

```
backend/
|-- app/                    # Next.js App Router
|   |-- api/               # API 路由
|   |-- lib/               # 库文件
|   |-- workers/           # Worker 线程
|-- prisma/ or schemas/    # 数据库 schema（如使用 ORM）
|-- package.json
|-- tsconfig.json
```

### 主要文件

- `app/layout.tsx` - 根布局
- `app/page.tsx` - 根页面
- `app/api/*/route.ts` - API 路由

### 启动方式

```bash
cd backend
pnpm install
pnpm dev
```

### 环境变量

在 `backend/` 目录创建 `.env` 文件：

```env
DATABASE_URL=./data/miner.db
```