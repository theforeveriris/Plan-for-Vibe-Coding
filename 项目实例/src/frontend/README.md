# 前端入口文件

## 目录结构说明

此目录为前端 Vue 3 应用程序的根目录。

### 目录结构

```
frontend/
|-- src/
|   |-- components/       # Vue 组件
|   |-- views/            # 页面视图
|   |-- stores/           # Pinia 状态管理
|   |-- composables/      # 组合式函数
|   |-- types/            # TypeScript 类型
|-- public/               # 静态资源
|-- package.json
|-- vite.config.ts
|-- tsconfig.json
|-- tailwind.config.js
```

### 主要文件

- `src/App.vue` - 根组件
- `src/main.ts` - 入口文件
- `src/views/Dashboard.vue` - 主页面

### 启动方式

```bash
cd frontend
pnpm install
pnpm dev
```

### API 配置

在 `src/config.ts` 中配置后端 API 地址：

```typescript
export const API_BASE = 'http://localhost:3000';
```