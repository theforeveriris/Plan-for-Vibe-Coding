<template>
  <div class="miner-terminal">
    <div class="terminal-header">
      <h3>实时终端</h3>
      <button @click="clearLogs" class="clear-btn">清空</button>
    </div>
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
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 8px;
  overflow: hidden;
}

.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 240, 255, 0.1);
  border-bottom: 1px solid rgba(0, 240, 255, 0.3);
}

.terminal-header h3 {
  margin: 0;
  color: #00f0ff;
  font-size: 14px;
}

.clear-btn {
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 12px;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.terminal-content {
  height: 300px;
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
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  flex-shrink: 0;
}

.separator {
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.fingerprint {
  font-weight: bold;
  flex-shrink: 0;
}

.message {
  color: rgba(255, 255, 255, 0.9);
}

.log-line.info .message {
  color: rgba(255, 255, 255, 0.9);
}

.log-line.match .message {
  color: #00f0ff;
}

.log-line.error .message {
  color: #ff4444;
}

.empty-state {
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  padding: 40px 0;
}
</style>
