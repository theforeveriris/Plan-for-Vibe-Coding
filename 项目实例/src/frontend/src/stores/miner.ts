// 挖掘状态管理
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  StartMinerRequest,
  SSEMessage,
  MiningTask,
  SpecialKey,
  PatternRule,
} from '../types'

// 从 localStorage 加载 API URL，默认值为当前后端地址
const getApiBase = (): string => {
  const saved = localStorage.getItem('backendUrl')
  if (saved) return saved

  const hostname = window.location.hostname || 'localhost'
  return `http://${hostname}:3002`
}

// 带超时的 fetch 封装
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时，请检查后端服务是否正常运行')
      }
      if (error.message.includes('Failed to fetch')) {
        throw new Error(`无法连接到后端服务 (${url})，请检查：1.后端是否启动 2.地址是否正确`)
      }
    }
    throw error
  }
}

// 检测网络是否在线
function isNetworkOnline(): boolean {
  return navigator.onLine
}

export const useMinerStore = defineStore('miner', () => {
  // 状态
  const isRunning = ref(false)
  const taskId = ref<string | null>(null)
  const attempts = ref(0)
  const hashrate = ref(0)
  const matches = ref<SpecialKey[]>([])
  const logs = ref<Array<{ time: Date; type: 'info' | 'match' | 'error'; message: string; fingerprint?: string; color?: string }>>([])
  const hashrateHistory = ref<number[]>(Array(60).fill(0))
  const apiBase = ref(getApiBase())
  const sseReconnectCount = ref(0)
  const maxSseReconnects = 10
  const sseConnectionState = ref<'connecting' | 'open' | 'closed' | 'error'>('closed')
  const lastHeartbeatTime = ref<number>(0)

  // SSE 连接
  let sseConnection: EventSource | null = null
  let sseReconnectTimer: ReturnType<typeof setTimeout> | null = null
  let heartbeatTimer: ReturnType<typeof setTimeout> | null = null
  let connectionStartTime = 0

  // 计算属性
  const currentTask = computed<MiningTask | null>(() => null)

  // 方法
  function updateApiUrl(url: string) {
    apiBase.value = url
    localStorage.setItem('backendUrl', url)
  }

  async function startMining(request: StartMinerRequest) {
    try {
      const response = await fetchWithTimeout(`${apiBase.value}/api/miner/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const data = await response.json()
      if (data.success) {
        taskId.value = data.taskId
        isRunning.value = true
        sseReconnectCount.value = 0

        // 启动 SSE 连接
        startSSEConnection(data.taskId)

        addLog('info', `任务启动成功，ID: ${data.taskId}`)
      } else {
        addLog('error', `启动失败: ${data.error}`)
      }
    } catch (error) {
      if (error instanceof Error) {
        addLog('error', `网络错误: ${error.message}`)
      } else {
        addLog('error', '网络错误: 无法连接到后端服务')
      }
    }
  }

  async function stopMining() {
    if (!taskId.value) return

    try {
      const response = await fetchWithTimeout(`${apiBase.value}/api/miner/stop/${taskId.value}`, {
        method: 'POST',
      })

      const data = await response.json()
      if (data.success) {
        isRunning.value = false

        // 关闭 SSE 连接
        closeSSEConnection()

        addLog('info', '任务已停止')
      } else {
        addLog('error', `停止失败: ${data.error}`)
      }
    } catch (error) {
      if (error instanceof Error) {
        addLog('error', `网络错误: ${error.message}`)
      } else {
        addLog('error', '网络错误: 无法连接到后端服务')
      }
    }
  }

  function startSSEConnection(targetTaskId: string) {
    // 关闭旧连接
    closeSSEConnection()

    // 检查网络状态
    if (!isNetworkOnline()) {
      addLog('error', '网络已断开，请检查网络连接后重试')
      scheduleReconnect(targetTaskId, 5000)
      return
    }

    try {
      connectionStartTime = Date.now()
      sseConnectionState.value = 'connecting'
      const url = `${apiBase.value}/api/miner/stream/${targetTaskId}`
      console.log(`[SSE] 正在连接: ${url}`)

      sseConnection = new EventSource(url)

      sseConnection.onopen = () => {
        const connectTime = Date.now() - connectionStartTime
        sseConnectionState.value = 'open'
        lastHeartbeatTime.value = Date.now()
        // 连接成功后重置重连计数
        sseReconnectCount.value = 0
        console.log(`[SSE] 连接已建立 (耗时 ${connectTime}ms)`)
        addLog('info', `实时连接已建立`)

        // 启动心跳检测
        startHeartbeatCheck(targetTaskId)
      }

      sseConnection.onmessage = (event) => {
        // 更新心跳时间
        lastHeartbeatTime.value = Date.now()

        // 处理空消息
        if (!event.data || event.data.trim() === '') {
          return
        }

        // 处理 keep-alive
        if (event.data.startsWith(': keep-alive')) {
          console.log('[SSE] 收到心跳')
          return
        }

        try {
          const message: SSEMessage = JSON.parse(event.data)
          handleSSEMessage(message)
        } catch (error) {
          console.error('[SSE] 解析消息失败:', error, '原始数据:', event.data)
        }
      }

      sseConnection.onerror = (error) => {
        const currentState = sseConnection?.readyState
        const stateNames: Record<number, string> = {
          0: 'CONNECTING',
          1: 'OPEN',
          2: 'CLOSED',
        }
        console.error(`[SSE] 连接错误 (状态: ${stateNames[currentState || 2] || 'UNKNOWN'})`, error)

        // 关键修复：区分初始连接错误和连接中断
        if (sseConnectionState.value === 'open') {
          sseConnectionState.value = 'error'
          if (isRunning.value) {
            attemptReconnect(targetTaskId)
          }
        } else if (sseConnectionState.value === 'connecting') {
          console.log('[SSE] 初始连接失败，稍后重试...')
          sseConnectionState.value = 'error'
          if (isRunning.value) {
            scheduleReconnect(targetTaskId, 3000)
          }
        }
      }
    } catch (error) {
      console.error('[SSE] 创建连接失败:', error)
      sseConnectionState.value = 'error'
      addLog('error', '无法建立实时连接')

      if (isRunning.value) {
        attemptReconnect(targetTaskId)
      }
    }
  }

  function attemptReconnect(targetTaskId: string) {
    // 检查是否达到最大重连次数
    if (sseReconnectCount.value >= maxSseReconnects) {
      addLog('error', `SSE 重连次数已达上限 (${maxSseReconnects}次)，请检查网络连接或后端服务状态`)
      closeSSEConnection()
      isRunning.value = false
      return
    }

    // 检查网络状态
    if (!isNetworkOnline()) {
      console.log('[SSE] 网络离线，延迟重连')
      addLog('info', '网络已断开，等待网络恢复...')
      scheduleReconnect(targetTaskId, 5000)
      return
    }

    sseReconnectCount.value++

    // 使用指数退避 + 随机抖动，避免惊群效应
    const baseDelay = Math.min(1000 * Math.pow(1.5, sseReconnectCount.value), 15000)
    const jitter = Math.random() * 1000
    const delay = baseDelay + jitter

    const nextAttempt = sseReconnectCount.value
    const maxAttempts = maxSseReconnects
    console.log(`[SSE] 计划重连: ${delay.toFixed(0)}ms后 (第${nextAttempt}/${maxAttempts}次)`)
    addLog('info', `连接断开，${(delay / 1000).toFixed(1)}秒后尝试重连 (${nextAttempt}/${maxAttempts})`)

    scheduleReconnect(targetTaskId, delay)
  }

  function scheduleReconnect(targetTaskId: string, delay: number) {
    // 清除旧定时器
    if (sseReconnectTimer) {
      clearTimeout(sseReconnectTimer)
    }

    sseReconnectTimer = setTimeout(() => {
      if (isRunning.value) {
        console.log(`[SSE] 执行重连...`)
        startSSEConnection(targetTaskId)
      }
    }, delay)
  }

  function startHeartbeatCheck(targetTaskId: string) {
    // 清除旧心跳检测
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
    }

    // 每45秒检查一次心跳（服务器15秒发送一次 keep-alive）
    heartbeatTimer = setInterval(() => {
      const timeSinceLastHeartbeat = Date.now() - lastHeartbeatTime.value
      console.log(`[SSE] 心跳检测: 距上次消息 ${(timeSinceLastHeartbeat / 1000).toFixed(1)}秒`)

      // 如果超过90秒没有收到任何消息，认为连接已死
      if (timeSinceLastHeartbeat > 90000) {
        console.warn('[SSE] 心跳超时，连接可能已断开')
        addLog('error', '实时连接无响应，尝试重新连接...')

        // 强制关闭并重新连接
        if (sseConnection) {
          sseConnection.close()
          sseConnection = null
        }

        if (isRunning.value) {
          attemptReconnect(targetTaskId)
        }
      }
    }, 45000)
  }

  function closeSSEConnection() {
    console.log('[SSE] 关闭连接')

    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }

    if (sseReconnectTimer) {
      clearTimeout(sseReconnectTimer)
      sseReconnectTimer = null
    }

    if (sseConnection) {
      sseConnection.close()
      sseConnection = null
    }

    sseConnectionState.value = 'closed'
    lastHeartbeatTime.value = 0
  }

  function handleSSEMessage(message: SSEMessage) {
    switch (message.type) {
      case 'progress':
        attempts.value = message.attempts
        hashrate.value = message.hashrate

        // 更新 hashrate 历史
        hashrateHistory.value.push(message.hashrate)
        if (hashrateHistory.value.length > 60) {
          hashrateHistory.value.shift()
        }

        addLog('info', `尝试: ${message.attempts}, Hashrate: ${message.hashrate.toFixed(1)} keys/s`)
        break

      case 'match':
        // 添加到匹配列表
        const newKey: SpecialKey = {
          id: `${message.taskId}_${Date.now()}`,
          taskId: message.taskId,
          fingerprint: message.fingerprint,
          patternType: message.patternType,
          patternId: message.patternId,
          matchPosition: 0,
          matchedText: message.matchedText,
          attemptsToFind: message.attemptsToFind,
          publicKeyArmored: '',
          color: message.color,
          createdAt: new Date().toISOString(),
        }
        matches.value.unshift(newKey)

        addLog('match', `发现特殊密钥: ${message.fingerprint} [${message.matchedText}]`, message.fingerprint, message.color)
        break

      case 'error':
        addLog('error', message.error)
        break

      case 'complete':
        addLog('info', `任务完成，总尝试: ${message.totalAttempts}, 总匹配: ${message.totalMatches}`)
        isRunning.value = false
        closeSSEConnection()
        break
    }
  }

  function addLog(type: 'info' | 'match' | 'error', message: string, fingerprint?: string, color?: string) {
    logs.value.push({ time: new Date(), type, message, fingerprint, color })

    // 限制日志数量
    if (logs.value.length > 100) {
      logs.value.shift()
    }
  }

  function clearLogs() {
    logs.value = []
  }

  return {
    isRunning,
    taskId,
    attempts,
    hashrate,
    matches,
    logs,
    hashrateHistory,
    currentTask,
    apiBase,
    sseConnectionState,
    sseReconnectCount,
    updateApiUrl,
    startMining,
    stopMining,
    clearLogs,
  }
})
