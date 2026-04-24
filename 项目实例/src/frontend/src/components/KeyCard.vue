<template>
  <div class="key-card" :style="{ borderColor: keyData.color }">
    <div class="key-header">
      <span class="pattern-badge" :style="{ backgroundColor: keyData.color + '20', color: keyData.color }">
        {{ keyData.patternType }}
      </span>
      <span class="match-text">{{ keyData.matchedText }}</span>
    </div>
    <div class="key-fingerprint">{{ keyData.fingerprint }}</div>
    <div class="key-meta">
      <span>尝试次数: {{ keyData.attemptsToFind }}</span>
      <span>{{ formatDate(keyData.createdAt) }}</span>
    </div>
    <div class="key-actions">
      <button @click="copyFingerprint" class="ghost-btn action-btn" title="复制指纹">
        复制
      </button>
      <button @click="downloadKey" class="ghost-btn action-btn" title="下载公钥">
        下载
      </button>
      <button @click="showDetails" class="ghost-btn action-btn" title="查看详情">
        详情
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SpecialKey } from '../types'

const props = defineProps<{
  keyData: SpecialKey
}>()

const showDetail = ref(false)

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

function copyFingerprint() {
  navigator.clipboard.writeText(props.keyData.fingerprint)
    .then(() => {
      alert('指纹已复制到剪贴板')
    })
    .catch(err => {
      console.error('复制失败:', err)
      alert('复制失败')
    })
}

function downloadKey() {
  // 校验公钥内容
  if (!props.keyData.publicKeyArmored || props.keyData.publicKeyArmored.trim() === '') {
    alert('公钥内容为空，无法下载')
    console.error('公钥内容为空:', props.keyData)
    return
  }

  // 校验公钥格式
  if (!props.keyData.publicKeyArmored.includes('-----BEGIN PGP PUBLIC KEY BLOCK-----')) {
    alert('公钥格式不正确')
    console.error('公钥格式不正确:', props.keyData.publicKeyArmored)
    return
  }

  try {
    // 创建 Blob
    const blob = new Blob([props.keyData.publicKeyArmored], {
      type: 'text/plain;charset=utf-8'
    })

    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pgp-key-${props.keyData.fingerprint}.asc`

    // 触发下载
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log('密钥下载成功:', props.keyData.fingerprint)
  } catch (error) {
    console.error('下载失败:', error)
    alert('下载失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

function showDetails() {
  showDetail.value = !showDetail.value
  if (showDetail.value) {
    // 显示详细信息
    const details = `
指纹: ${props.keyData.fingerprint}
规则类型: ${props.keyData.patternType}
匹配文本: ${props.keyData.matchedText}
匹配位置: ${props.keyData.matchPosition}
尝试次数: ${props.keyData.attemptsToFind}
创建时间: ${formatDate(props.keyData.createdAt)}
公钥长度: ${props.keyData.publicKeyArmored?.length || 0} 字符
    `.trim()
    alert(details)
  }
}
</script>

<style scoped>
.key-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-left: 4px solid;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

@media (prefers-color-scheme: dark) {
  .key-card {
    background: #2a2a2a;
    border-color: #333;
  }
}

.key-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (prefers-color-scheme: dark) {
  .key-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}

.key-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.pattern-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.match-text {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

@media (prefers-color-scheme: dark) {
  .match-text {
    color: #ccc;
  }
}

.key-fingerprint {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #333;
  word-break: break-all;
  margin-bottom: 8px;
  padding: 6px;
  background: #f8f9fa;
  border-radius: 4px;
}

@media (prefers-color-scheme: dark) {
  .key-fingerprint {
    color: #f0f0f0;
    background: #333;
  }
}

.key-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #999;
  margin-bottom: 8px;
}

@media (prefers-color-scheme: dark) {
  .key-meta {
    color: #777;
  }
}

.key-actions {
  display: flex;
  gap: 6px;
}

.ghost-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #9333ea;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 12px;
}

.ghost-btn:hover {
  background: rgba(147, 51, 234, 0.1);
  border-color: rgba(147, 51, 234, 0.2);
  transform: translateY(-1px);
}

@media (prefers-color-scheme: dark) {
  .ghost-btn {
    color: #d8b4fe;
  }
  .ghost-btn:hover {
    background: rgba(147, 51, 234, 0.2);
    border-color: rgba(147, 51, 234, 0.3);
  }
}

.action-btn {
  font-size: 12px;
  padding: 4px 8px;
}
</style>
