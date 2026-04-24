# Project Brief - PGP Vanity Key Miner

## 电梯演讲（30秒版本）
构建一个"PGP靓号密钥挖掘器"Web应用，通过并行生成PGP密钥对并实时筛选具有特殊指纹（连续数字、回文、特殊日期等）的公钥，类似于加密货币vanity address生成器，但针对OpenPGP公钥指纹/ID。

## 核心指标
- 密钥生成速度：目标 10-50 keys/秒（取决于CPU）
- 并发任务数：最多支持 5 个并行挖掘任务
- 实时延迟：SSE推送 < 100ms
- 存储：SQLite 本地记录元数据（不存储私钥）

## 关键约束
- 私钥不存储在服务器，仅在发现时提供一次性下载
- 所有API需认证（防止滥用）
- 挖掘任务是后台任务，支持随时停止
- 需处理 GnuPG 依赖或使用 node-openpgp 纯 JS 实现

## 技术标签
`Next.js 14` `Vue 3` `TypeScript` `TailwindCSS` `Pinia` `SQLite` `SSE` `OpenPGP`

## 相关链接
- 项目前端：http://localhost:5173
- API 文档：docs/50-knowledge/api-docs/
- 监控：内置统计面板