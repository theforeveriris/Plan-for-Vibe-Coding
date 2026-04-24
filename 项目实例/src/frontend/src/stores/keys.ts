// 密钥列表管理
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SpecialKey } from '../types'

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

export const useKeysStore = defineStore('keys', () => {
  // 状态
  const keys = ref<SpecialKey[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const apiBase = ref(getApiBase())

  // 方法
  function updateApiUrl(url: string) {
    apiBase.value = url
  }

  async function fetchKeys() {
    loading.value = true
    error.value = null

    try {
      const response = await fetchWithTimeout(`${apiBase.value}/api/keys`)
      const data = await response.json()

      if (data.success) {
        keys.value = data.keys || []
      } else {
        error.value = data.error || '获取密钥列表失败'
      }
    } catch (err) {
      if (err instanceof Error) {
        error.value = `网络错误: ${err.message}`
      } else {
        error.value = '网络错误: 无法连接到后端服务'
      }
    } finally {
      loading.value = false
    }
  }

  function addKey(key: SpecialKey) {
    keys.value.unshift(key)
  }

  function clearKeys() {
    keys.value = []
  }

  return {
    keys,
    loading,
    error,
    apiBase,
    updateApiUrl,
    fetchKeys,
    addKey,
    clearKeys,
  }
})
