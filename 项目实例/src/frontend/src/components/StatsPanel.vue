<template>
  <div class="stats-panel">
    <!-- 简洁模式（顶部显示） -->
    <div v-if="mode !== 'detailed'" class="stats-simple space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gray-900 rounded p-3">
          <div class="text-xs text-gray-400">总尝试次数</div>
          <div class="text-xl font-bold text-white">{{ formatNumber(attempts) }}</div>
        </div>
        <div class="bg-gray-900 rounded p-3">
          <div class="text-xs text-gray-400">发现数量</div>
          <div class="text-xl font-bold text-matrix-green">{{ matches }}</div>
        </div>
        <div class="bg-gray-900 rounded p-3 col-span-2">
          <div class="text-xs text-gray-400">当前 Hashrate</div>
          <div class="text-xl font-bold text-cyber-cyan">{{ hashrate.toFixed(1) }} keys/s</div>
        </div>
      </div>
    </div>

    <!-- 详细模式（Tab切换显示） -->
    <div v-else class="stats-detailed space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="stat-card">
          <div class="stat-label">总尝试次数</div>
          <div class="stat-value">{{ formatNumber(attempts) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">发现数量</div>
          <div class="stat-value text-green">{{ matches }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">当前 Hashrate</div>
          <div class="stat-value text-cyan">{{ hashrate.toFixed(1) }} keys/s</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">运行时间</div>
          <div class="stat-value">{{ formatDuration(uptime) }}</div>
        </div>
      </div>

      <!-- 规则统计 -->
      <div class="rules-stats">
        <div class="section-title">规则统计</div>
        <div class="rules-list">
          <div
            v-for="(count, type) in matchStats"
            :key="type"
            class="rule-stat-item"
          >
            <span class="rule-type">{{ type }}</span>
            <span class="rule-count">{{ count }} 个</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMinerStore } from '../stores/miner'

const props = defineProps<{
  mode?: 'simple' | 'detailed'
}>()

const minerStore = useMinerStore()

const attempts = computed(() => minerStore.attempts)
const matches = computed(() => minerStore.matches.length)
const hashrate = computed(() => minerStore.hashrate)

// 运行时间（秒）
const uptime = computed(() => {
  // 简化计算，实际应该从任务开始时间计算
  return Math.floor(minerStore.attempts / Math.max(minerStore.hashrate, 1))
})

// 按规则类型统计匹配数量
const matchStats = computed(() => {
  const stats: Record<string, number> = {}
  minerStore.matches.forEach(key => {
    const type = key.patternType
    stats[type] = (stats[type] || 0) + 1
  })
  return stats
})

function formatNumber(num: number): string {
  return num.toLocaleString()
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
}
</script>

<style scoped>
.stats-panel {
  font-family: 'Inter', sans-serif;
}

.stat-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.stat-value.text-green {
  color: #00ff88;
}

.stat-value.text-cyan {
  color: #00f0ff;
}

.section-title {
  font-size: 13px;
  color: #00f0ff;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.2);
}

.rules-stats {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.rule-stat-item:last-child {
  border-bottom: none;
}

.rule-type {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  text-transform: capitalize;
}

.rule-count {
  font-size: 13px;
  color: #00f0ff;
  font-weight: bold;
}
</style>
