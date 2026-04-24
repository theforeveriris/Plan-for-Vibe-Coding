<template>
  <div class="miner-terminal terminal h-64 overflow-y-auto p-4 text-sm">
    <div v-for="(log, index) in logs" :key="index" :class="['log-entry', log.type]">
      <span class="timestamp text-gray-500">[{{ formatTime(log.time) }}]</span>
      <span v-if="log.type === 'match'" class="match-highlight text-matrix-green font-bold">
        🎯 MATCH: {{ log.message }}
      </span>
      <span v-else-if="log.type === 'error'" class="text-red-400">
        ⚠️ ERROR: {{ log.message }}
      </span>
      <span v-else class="text-gray-300">
        {{ log.message }}
      </span>
    </div>
    <div v-if="logs.length === 0" class="text-gray-500">
      终端就绪，开始挖掘后将显示日志...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useMinerStore } from '../stores/miner'

const minerStore = useMinerStore()
const logs = ref<Array<{ time: Date; type: 'info' | 'match' | 'error'; message: string }>>([])

// 监听挖掘状态，更新日志
watch(
  () => minerStore.logs,
  (newLogs) => {
    logs.value = newLogs
  },
  { deep: true }
)

function formatTime(date: Date) {
  return date.toLocaleTimeString()
}

onMounted(() => {
  // 初始化日志
  logs.value = minerStore.logs
})
</script>

<style scoped>
.miner-terminal {
  font-family: 'JetBrains Mono', monospace;
  background-color: #000;
  border: 1px solid #333;
  border-radius: 4px;
}

.log-entry {
  margin-bottom: 4px;
  line-height: 1.4;
}

.timestamp {
  margin-right: 12px;
}
</style>