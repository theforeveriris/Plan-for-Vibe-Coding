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
- 定期发送 keep-alive comment（如 `: keep-alive\n\n`）
- 使用指数退避策略控制重连频率

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

### Q5: 网络错误: TypeError: Failed to fetch
**问题**：前端频繁出现网络错误，API 请求失败

**原因**：
1. **CORS 跨域问题**：后端未配置 CORS 响应头，浏览器拦截跨域请求
2. **请求超时**：fetch 默认没有超时，网络异常时请求会挂起
3. **SSE 无重连**：EventSource 断开后不会自动恢复
4. **后端服务未启动**：前端在后台服务未运行时发起请求

**解决方案**：
1. **后端配置 CORS**：所有 API 路由添加跨域响应头
   ```typescript
   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
     'Access-Control-Allow-Headers': 'Content-Type',
   };
   ```

2. **前端添加超时处理**：封装带超时的 fetch
   ```typescript
   async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
     try {
       const response = await fetch(url, { ...options, signal: controller.signal });
       clearTimeout(timeoutId);
       return response;
     } catch (error) {
       clearTimeout(timeoutId);
       if (error.name === 'AbortError') {
         throw new Error('请求超时，请检查后端服务是否正常运行');
       }
       throw error;
     }
   }
   ```

3. **SSE 自动重连**：实现指数退避重连机制
   ```typescript
   let reconnectCount = 0;
   const maxReconnects = 5;

   eventSource.onerror = () => {
     if (reconnectCount < maxReconnects) {
       reconnectCount++;
       const delay = Math.min(1000 * Math.pow(2, reconnectCount), 30000);
       setTimeout(() => startSSEConnection(), delay);
     }
   };
   ```

4. **错误信息优化**：区分超时、CORS、网络断开等不同错误类型

## 网络请求最佳实践

### 前端
- 所有 API 请求使用封装后的 `fetchWithTimeout`
- 错误处理区分类型，提供用户友好的提示
- SSE 连接实现自动重连机制
- 页面加载时检查后端服务可用性

### 后端
- 所有 API 路由必须配置 CORS 响应头
- 支持 OPTIONS 预检请求
- SSE 端点添加 keep-alive 机制
- 异常处理避免泄露敏感信息
