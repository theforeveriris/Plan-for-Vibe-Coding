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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.stats-simple {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.stats-simple .bg-gray-900 {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 10px;
  padding: 12px;
  transition: all 0.2s ease;
}

.stats-simple .bg-gray-900:hover {
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.stats-simple .text-xs {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 6px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stats-simple .text-xl {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
}

.stats-simple .text-matrix-green {
  color: #34d399;
  text-shadow: 0 0 8px rgba(52, 211, 153, 0.4);
}

.stats-simple .text-cyber-cyan {
  color: #38bdf8;
  text-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
}

.stat-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 10px;
  padding: 14px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 6px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
}

.stat-value.text-green {
  color: #34d399;
  text-shadow: 0 0 8px rgba(52, 211, 153, 0.4);
}

.stat-value.text-cyan {
  color: #38bdf8;
  text-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
}

.section-title {
  font-size: 13px;
  color: #3b82f6;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rules-stats {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 10px;
  padding: 14px;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rule-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.05);
  transition: all 0.2s ease;
}

.rule-stat-item:hover {
  color: #3b82f6;
}

.rule-stat-item:last-child {
  border-bottom: none;
}

.rule-type {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  text-transform: capitalize;
  font-weight: 500;
}

.rule-count {
  font-size: 13px;
  color: #3b82f6;
  font-weight: 700;
  background: rgba(59, 130, 246, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-simple {
    padding: 12px;
  }
  
  .stats-simple .text-xl {
    font-size: 18px;
  }
  
  .stat-card {
    padding: 12px;
  }
  
  .stat-value {
    font-size: 18px;
  }
}
</style>
