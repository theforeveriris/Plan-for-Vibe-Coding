<template>
  <div class="key-card bg-gray-900 rounded-lg border border-gray-700 p-4 hover:border-matrix-green transition-colors">
    <div class="flex justify-between items-start mb-3">
      <div>
        <h3 class="text-sm font-medium text-gray-300">特殊密钥</h3>
        <span class="inline-block bg-gray-800 text-xs px-2 py-1 rounded mt-1" :class="patternTypeClass">
          {{ patternTypeLabel }}
        </span>
      </div>
      <div class="text-right">
        <div class="text-xs text-gray-400">发现时间</div>
        <div class="text-xs text-gray-500">{{ formatDate(keyData.createdAt) }}</div>
      </div>
    </div>

    <!-- 指纹 -->
    <div class="fingerprint font-mono text-sm mb-3 break-all">
      <span v-for="(char, index) in keyData.fingerprint" :key="index" 
            :class="{
              'text-matrix-green font-bold': isMatchPosition(index)
            }">
        {{ char }}
      </span>
    </div>

    <div class="grid grid-cols-2 gap-2 mb-3">
      <div class="text-xs">
        <div class="text-gray-400">尝试次数</div>
        <div class="text-white">{{ keyData.attemptsToFind.toLocaleString() }}</div>
      </div>
      <div class="text-xs">
        <div class="text-gray-400">匹配位置</div>
        <div class="text-white">{{ keyData.matchPosition }}</div>
      </div>
    </div>

    <div class="flex space-x-2">
      <button 
        @click="copyPublicKey" 
        class="btn flex-1 bg-gray-800 hover:bg-gray-700 text-xs py-1 px-2 rounded flex items-center justify-center"
      >
        <span>复制公钥</span>
      </button>
      <button 
        @click="downloadKey" 
        class="btn flex-1 bg-gray-800 hover:bg-gray-700 text-xs py-1 px-2 rounded flex items-center justify-center"
      >
        <span>下载</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SpecialKey } from '../types'

const props = defineProps<{
  keyData: SpecialKey
}>()

const patternTypeLabel = computed(() => {
  const labels: Record<string, string> = {
    consecutive: '连续数字',
    repeating: '重复数字',
    palindrome: '回文数字',
    special_date: '特殊日期',
    custom_regex: '自定义正则',
    leading_zeros: '前导零'
  }
  return labels[props.keyData.patternType] || props.keyData.patternType
})

const patternTypeClass = computed(() => {
  const classes: Record<string, string> = {
    consecutive: 'text-yellow-400',
    repeating: 'text-purple-400',
    palindrome: 'text-pink-400',
    special_date: 'text-green-400',
    custom_regex: 'text-blue-400',
    leading_zeros: 'text-gray-400'
  }
  return classes[props.keyData.patternType] || 'text-gray-400'
})

function isMatchPosition(index: number): boolean {
  // 简单的匹配位置高亮（实际应该根据匹配长度计算）
  return index >= props.keyData.matchPosition && index < props.keyData.matchPosition + 6
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString()
}

function copyPublicKey() {
  navigator.clipboard.writeText(props.keyData.publicKeyArmored)
    .then(() => {
      alert('公钥已复制到剪贴板')
    })
    .catch(err => {
      console.error('复制失败:', err)
    })
}

function downloadKey() {
  const blob = new Blob([props.keyData.publicKeyArmored], { type: 'application/pgp-keys' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pgp-key-${props.keyData.fingerprint.substring(0, 8)}.asc`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.key-card {
  transition: all 0.2s ease;
}

.key-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.fingerprint {
  font-family: 'JetBrains Mono', monospace;
}
</style>