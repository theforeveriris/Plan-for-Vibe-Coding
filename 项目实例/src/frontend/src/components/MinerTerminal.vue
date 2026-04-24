<template>
  <div class="miner-terminal">
    <div class="terminal-content" ref="terminalContent">
      <div
        v-for="(log, index) in logs"
        :key="index"
        class="log-line"
        :class="log.type"
      >
        <span class="timestamp">{{ formatTime(log.time) }}</span>
        <span class="separator">|</span>
        <!-- 显示密钥指纹（如果有） -->
        <span
          v-if="log.fingerprint"
          class="fingerprint"
          :style="{ color: log.color || '#00f0ff' }"
        >
          [{{ log.fingerprint }}]
        </span>
        <span class="message">{{ log.message }}</span>
      </div>
      <div v-if="logs.length === 0" class="empty-state">
        等待任务启动...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useMinerStore } from '../stores/miner'

const minerStore = useMinerStore()
const terminalContent = ref<HTMLDivElement>()

const logs = minerStore.logs

function clearLogs() {
  minerStore.clearLogs()
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// 自动滚动到底部
watch(
  () => logs.length,
  () => {
    nextTick(() => {
      if (terminalContent.value) {
        terminalContent.value.scrollTop = terminalContent.value.scrollHeight
      }
    })
  }
)
</script>

<style scoped>
.miner-terminal {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.terminal-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
}

.log-line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
  word-break: break-all;
}

.timestamp {
  color: #999999;
  white-space: nowrap;
  flex-shrink: 0;
}

.separator {
  color: #cccccc;
  flex-shrink: 0;
}

.fingerprint {
  font-weight: bold;
  flex-shrink: 0;
}

.message {
  color: #333333;
}

.log-line.info .message {
  color: #333333;
}

.log-line.match .message {
  color: #0066cc;
}

.log-line.error .message {
  color: #cc0000;
}

.empty-state {
  color: #999999;
  text-align: center;
  padding: 40px 0;
}
</style>
