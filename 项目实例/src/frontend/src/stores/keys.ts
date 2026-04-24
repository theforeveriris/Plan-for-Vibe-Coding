// 密钥列表管理
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SpecialKey } from '../types'

// 从 localStorage 加载 API URL，默认值为 http://localhost:3000
const getApiBase = (): string => {
  return localStorage.getItem('backendUrl') || 'http://localhost:3000'
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
      const response = await fetch(`${apiBase.value}/api/keys`)
      const data = await response.json()

      if (data.success) {
        keys.value = data.keys || []
      } else {
        error.value = data.error || '获取密钥列表失败'
      }
    } catch (err) {
      error.value = `网络错误: ${err}`
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
    clearKeys
  }
})