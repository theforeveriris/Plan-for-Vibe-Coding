// 密钥列表管理
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SpecialKey } from '../types'

const API_BASE = 'http://localhost:3000'

export const useKeysStore = defineStore('keys', () => {
  // 状态
  const keys = ref<SpecialKey[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 方法
  async function fetchKeys() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE}/api/keys`)
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
    fetchKeys,
    addKey,
    clearKeys
  }
})