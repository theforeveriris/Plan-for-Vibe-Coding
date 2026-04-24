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

### Q6: SSE 连接持续断开并重连失败
**问题**：SSE 连接建立后立即断开，经过5次重连后达到上限失败

**根本原因分析**：
1. **EventSource `onerror` 触发时机问题**：连接建立但无数据时也会触发 `onerror`
2. **keep-alive 间隔过长**：30秒间隔可能导致某些代理/防火墙断开空闲连接
3. **前端 `onmessage` 未处理 `event.data` 为空的情况**
4. **缺少连接健康检测**：无法区分"连接正常但无数据"和"连接已断开"
5. **重连策略过于激进**：指数退避从2秒开始，5次后达到上限

**解决方案**：

#### 前端优化
```typescript
// 1. 添加连接状态管理
const sseConnectionState = ref<'connecting' | 'open' | 'closed' | 'error'>('closed');
const lastHeartbeatTime = ref<number>(0);

// 2. 网络状态检测
function isNetworkOnline(): boolean {
  return navigator.onLine;
}

// 3. 优化重连策略 - 指数退避 + 随机抖动
function attemptReconnect(targetTaskId: string) {
  if (sseReconnectCount.value >= maxSseReconnects) {
    addLog('error', `重连次数已达上限`);
    return;
  }

  // 检查网络状态
  if (!isNetworkOnline()) {
    scheduleReconnect(targetTaskId, 5000);
    return;
  }

  sseReconnectCount.value++;
  const baseDelay = Math.min(1000 * Math.pow(1.5, sseReconnectCount.value), 15000);
  const jitter = Math.random() * 1000;
  const delay = baseDelay + jitter;

  scheduleReconnect(targetTaskId, delay);
}

// 4. 心跳检测
function startHeartbeatCheck(targetTaskId: string) {
  heartbeatTimer = setInterval(() => {
    const timeSinceLastHeartbeat = Date.now() - lastHeartbeatTime.value;
    // 超过90秒无消息，强制重连
    if (timeSinceLastHeartbeat > 90000) {
      attemptReconnect(targetTaskId);
    }
  }, 45000);
}

// 5. 详细的错误日志
sseConnection.onerror = (error) => {
  const stateNames = { 0: 'CONNECTING', 1: 'OPEN', 2: 'CLOSED' };
  console.error(`[SSE] 连接错误 (状态: ${stateNames[sseConnection?.readyState]})`, error);
};
```

#### 后端优化
```typescript
// 1. 缩短 keep-alive 间隔（15秒）
const keepAliveInterval = setInterval(() => {
  safeEnqueue(`: keep-alive\n\n`);
}, 15000);

// 2. 安全发送消息，避免对已关闭连接操作
function safeEnqueue(data: string) {
  if (!isClosed) {
    try {
      controller.enqueue(encoder.encode(data));
      return true;
    } catch (error) {
      cleanup();
      return false;
    }
  }
  return false;
}

// 3. 任务不存在时发送错误信息
const task = taskManager.getTask(taskId);
if (!task) {
  safeEnqueue(`data: ${JSON.stringify({ type: 'error', error: '任务不存在' })}\n\n`);
  cleanup();
  return;
}

// 4. 详细的连接日志
console.log(`[SSE Server] 新连接请求: taskId=${taskId}`);
console.log(`[SSE Server] 客户端断开连接: taskId=${taskId}`);
```

#### 关键改进点
- **keep-alive 间隔**：从 30秒 缩短到 15秒
- **最大重连次数**：从 5次 增加到 10次
- **退避基数**：从 2 降低到 1.5，更温和
- **心跳检测**：45秒检测一次，90秒无响应强制重连
- **网络状态检测**：重连前检查 `navigator.onLine`
- **随机抖动**：避免多个客户端同时重连的惊群效应

## 网络请求最佳实践

### 前端
- 所有 API 请求使用封装后的 `fetchWithTimeout`
- 错误处理区分类型，提供用户友好的提示
- SSE 连接实现自动重连机制
- 页面加载时检查后端服务可用性
- 使用 `navigator.onLine` 检测网络状态
- SSE 连接添加心跳检测机制

### 后端
- 所有 API 路由必须配置 CORS 响应头
- 支持 OPTIONS 预检请求
- SSE 端点添加 keep-alive 机制（建议 15秒 间隔）
- 异常处理避免泄露敏感信息
- 添加详细的连接/断开日志
- 任务不存在时主动发送错误信息并关闭连接
