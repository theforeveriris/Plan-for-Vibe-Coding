# 技术栈及选型理由

## 后端技术栈

| 技术 | 版本 | 选型理由 | 替代方案及拒绝原因 |
|------|------|---------|------------------|
| Next.js | 14+ | App Router + Server Components，简化API部署 | Express（需单独部署） |
| TypeScript | 5.4+ | 类型安全，减少运行时错误 | JavaScript（类型安全差） |
| node-openpgp | 6.x | 纯JS实现PGP，无系统依赖 | GnuPG（需安装系统包，跨平台复杂） |
| better-sqlite3 | 9.x | 同步API，简单易用，性能好 | Prisma + PostgreSQL（过重） |
| zod | 3.x | 运行时类型校验 | Joi（API不一致） |

## 前端技术栈

| 技术 | 版本 | 选型理由 | 替代方案及拒绝原因 |
|------|------|---------|------------------|
| Vue 3 | 3.4+ | Composition API，灵活的逻辑复用 | React（更习惯Vue的语法） |
| TypeScript | 5.4+ | 与后端保持一致的类型体验 | JavaScript（类型安全） |
| Vite | 5.x | 极快的启动和HMR | Webpack（配置复杂，编译慢） |
| Tailwind CSS | 3.4+ | 原子化CSS，开发效率高 | CSS Modules（样式复用困难） |
| Pinia | 2.x | Vue 3官方推荐，TypeScript支持好 | Vuex（4.x学习成本高） |
| Chart.js | 4.x | 轻量级，文档完善 | ECharts（功能太重） |
| @vueuse/core | 10.x | 实用的组合式工具集 | 自己封装（重复造轮子） |

## 开发工具

| 技术 | 版本 | 用途 |
|------|------|------|
| pnpm | 8.x | 包管理，比npm快 |
| ESLint | 9.x | 代码检查 |
| Prettier | 3.x | 代码格式化 |
| Husky | 9.x | Git hooks |
| lint-staged | 15.x | 只检查暂存文件 |

## 基础设施

| 技术 | 用途 | 备注 |
|------|------|------|
| SQLite | 密钥元数据存储 | 轻量级，无需部署 |
| SSE | 实时进度推送 | 比WebSocket更简单 |

## 禁忌技术（禁止使用）
- [X] MongoDB：不适合这种结构化数据存储
- [X] GnuPG 系统命令：跨平台部署复杂
- [X] WebSocket：SSE足够，且实现更简单
- [X] Redux/MobX：Pinia更轻量，与Vue配合更好