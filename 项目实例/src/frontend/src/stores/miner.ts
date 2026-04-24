// 挖掘状态管理
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  StartMinerRequest, 
  SSEMessage, 
  MiningTask, 
  SpecialKey 
} from '../types'

const API_BASE = 'http://localhost:3000'

export const useMinerStore = defineStore('miner', () => {
  // 状态
  const isRunning = ref(false)
  const taskId = ref<string | null>(null)
  const attempts = ref(0)
  const hashrate = ref(0)
  const matches = ref<SpecialKey[]>([])
  const logs = ref<Array<{ time: Date; type: 'info' | 'match' | 'error'; message: string }>>([])
  const hashrateHistory = ref<number[]>(Array(60).fill(0))
  
  // SSE 连接
  let sseConnection: EventSource | null = null

  // 计算属性
  const currentTask = computed<MiningTask | null>(() => null) // 简化实现

  // 方法
  async function startMining(request: StartMinerRequest) {
    try {
      const response = await fetch(`${API_BASE}/api/miner/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })

      const data = await response.json()
      if (data.success) {
        taskId.value = data.taskId
        isRunning.value = true
        
        // 启动 SSE 连接
        startSSEConnection(data.taskId)
        
        addLog('info', `任务启动成功，ID: ${data.taskId}`)
      } else {
        addLog('error', `启动失败: ${data.error}`)
      }
    } catch (error) {
      addLog('error', `网络错误: ${error}`)
    }
  }

  async function stopMining() {
    if (!taskId.value) return

    try {
      const response = await fetch(`${API_BASE}/api/miner/stop/${taskId.value}`, {
        method: 'POST'
      })

      const data = await response.json()
      if (data.success) {
        isRunning.value = false
        
        // 关闭 SSE 连接
        if (sseConnection) {
          sseConnection.close()
          sseConnection = null
        }
        
        addLog('info', '任务已停止')
      } else {
        addLog('error', `停止失败: ${data.error}`)
      }
    } catch (error) {
      addLog('error', `网络错误: ${error}`)
    }
  }

  function startSSEConnection(taskId: string) {
    sseConnection = new EventSource(`${API_BASE}/api/miner/stream/${taskId}`)

    sseConnection.onmessage = (event) => {
      try {
        const message: SSEMessage = JSON.parse(event.data)
        handleSSEMessage(message)
      } catch (error) {
        console.error('解析 SSE 消息失败:', error)
      }
    }

    sseConnection.onerror = (error) => {
      console.error('SSE 连接错误:', error)
      sseConnection?.close()
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
    startMining,
    stopMining,
    clearLogs
  }
})