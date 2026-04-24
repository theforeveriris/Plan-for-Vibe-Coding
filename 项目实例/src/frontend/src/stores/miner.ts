// 挖掘状态管理
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  StartMinerRequest,
  SSEMessage,
  MiningTask,
  SpecialKey,
} from '../types'

// 从 localStorage 加载 API URL，默认值为 http://localhost:3000
const getApiBase = (): string => {
  return localStorage.getItem('backendUrl') || 'http://localhost:3000'
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
    }
    throw error
  }
}

export const useMinerStore = defineStore('miner', () => {
  // 状态
  const isRunning = ref(false)
  const taskId = ref<string | null>(null)
  const attempts = ref(0)
  const hashrate = ref(0)
  const matches = ref<SpecialKey[]>([])
  const logs = ref<Array<{ time: Date; type: 'info' | 'match' | 'error'; message: string }>>([])
  const hashrateHistory = ref<number[]>(Array(60).fill(0))
  const apiBase = ref(getApiBase())
  const sseReconnectCount = ref(0)
  const maxSseReconnects = 5

  // SSE 连接
  let sseConnection: EventSource | null = null
  let sseReconnectTimer: ReturnType<typeof setTimeout> | null = null

  // 计算属性
  const currentTask = computed<MiningTask | null>(() => null) // 简化实现

  // 方法
  function updateApiUrl(url: string) {
    apiBase.value = url
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

    try {
      sseConnection = new EventSource(`${apiBase.value}/api/miner/stream/${targetTaskId}`)

      sseConnection.onopen = () => {
        sseReconnectCount.value = 0
        console.log('SSE 连接已建立')
      }

      sseConnection.onmessage = (event) => {
        try {
          // 处理 keep-alive
          if (event.data.startsWith(': keep-alive')) {
            return
          }

          const message: SSEMessage = JSON.parse(event.data)
          handleSSEMessage(message)
        } catch (error) {
          console.error('解析 SSE 消息失败:', error)
        }
      }

      sseConnection.onerror = (error) => {
        console.error('SSE 连接错误:', error)

        // 如果任务仍在运行，尝试重连
        if (isRunning.value && sseReconnectCount.value < maxSseReconnects) {
          sseReconnectCount.value++
          const delay = Math.min(1000 * Math.pow(2, sseReconnectCount.value), 30000)
          addLog('info', `SSE 连接断开，${delay / 1000}秒后尝试重连 (${sseReconnectCount.value}/${maxSseReconnects})`)

          sseReconnectTimer = setTimeout(() => {
            if (isRunning.value && taskId.value) {
              startSSEConnection(taskId.value)
            }
          }, delay)
        } else if (sseReconnectCount.value >= maxSseReconnects) {
          addLog('error', 'SSE 重连次数已达上限，请检查网络连接')
          closeSSEConnection()
        } else {
          closeSSEConnection()
        }
      }
    } catch (error) {
      console.error('创建 SSE 连接失败:', error)
      addLog('error', '无法建立实时连接')
    }
  }

  function closeSSEConnection() {
    if (sseReconnectTimer) {
      clearTimeout(sseReconnectTimer)
      sseReconnectTimer = null
    }

    if (sseConnection) {
      sseConnection.close()
      sseConnection = null
    }
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
        addLog('match', `发现特殊密钥: ${message.fingerprint}`)
        // 这里应该调用 fetchKeys 来更新密钥列表
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

  function addLog(type: 'info' | 'match' | 'error', message: string) {
    logs.value.push({ time: new Date(), type, message })

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
    updateApiUrl,
    startMining,
    stopMining,
    clearLogs,
  }
})
