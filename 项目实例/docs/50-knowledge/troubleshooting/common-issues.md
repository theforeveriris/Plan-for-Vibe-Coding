# 问题排查记录（Troubleshooting）

## 常见问题

### Q1: Worker 线程报错 "Module not found"
**问题**：node-openpgp 在 Worker 线程中无法加载

**原因**：node-openpgp 是纯 ESM 模块，需要特殊处理

**解决方案**：
- 使用 `new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })`
- 或使用 `pooled-thread` 等线程管理库

### Q2: SSE 连接自动断开
**问题**：SSE 连接每隔一段时间自动断开

**原因**：服务器或代理的超时设置

**解决方案**：
- 前端实现自动重连机制
- 定期发送 keep-alive comment（如 `// keep-alive\n\n`）

### Q3: SQLite 数据库锁定
**问题**：并发写入时报 "database is locked"

**原因**：SQLite 不支持真正的并发写入

**解决方案**：
- 使用 write-ahead logging (WAL) 模式
- 批量写入，减少锁竞争

### Q4: 前端 SSE 事件解析错误
**问题**：解析 SSE 数据时出现错误

**原因**：消息格式不正确或包含换行符

**解决方案**：
```typescript
// 正确的 SSE 数据格式
controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

// 前端解析
const lines = event.data.split('\n');
const data = JSON.parse(lines[0]);
```