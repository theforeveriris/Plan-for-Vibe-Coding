<template>
  <div class="key-card" :style="{ borderColor: keyData.color || '#00f0ff' }">
    <div class="key-header">
      <span class="key-type" :style="{ color: keyData.color || '#00f0ff' }">
        {{ keyData.patternType }}
      </span>
      <span class="key-time">{{ formatTime(keyData.createdAt) }}</span>
    </div>
    <div class="key-fingerprint" :style="{ color: keyData.color || '#00f0ff' }">
      {{ keyData.fingerprint }}
    </div>
    <div class="key-matched-text" v-if="keyData.matchedText">
      匹配: <span :style="{ color: keyData.color || '#00f0ff' }">{{ keyData.matchedText }}</span>
    </div>
    <div class="key-stats">
      <span>尝试次数: {{ keyData.attemptsToFind }}</span>
    </div>
    <div class="key-actions">
      <button @click="copyPublicKey" class="copy-btn">复制公钥</button>
      <button @click="downloadKey" class="download-btn">下载密钥</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SpecialKey } from '../types'

const props = defineProps<{
  keyData: SpecialKey
}>()

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('zh-CN')
}

function copyPublicKey() {
  navigator.clipboard.writeText(props.keyData.publicKeyArmored)
    .then(() => alert('公钥已复制到剪贴板'))
    .catch(() => alert('复制失败'))
}

function downloadKey() {
  const blob = new Blob([props.keyData.publicKeyArmored], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pgp-key-${props.keyData.fingerprint}.asc`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.key-card {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.key-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.key-type {
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.key-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.key-fingerprint {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  word-break: break-all;
  margin-bottom: 8px;
}

.key-matched-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.key-stats {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 12px;
}

.key-actions {
  display: flex;
  gap: 8px;
}

.copy-btn, .download-btn {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: 12px;
}

.copy-btn:hover, .download-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
