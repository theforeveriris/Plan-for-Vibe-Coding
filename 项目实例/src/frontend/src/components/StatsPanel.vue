<template>
  <div class="stats-panel">
    <!-- 简洁模式（顶部显示） -->
    <div v-if="mode !== 'detailed'" class="stats-simple space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gray-900 rounded p-3">
          <div class="text-xs text-gray-400">总尝试次数</div>
          <div class="text-xl font-bold text-white">
            <AnimatedNumber :value="attempts" />
          </div>
        </div>
        <div class="bg-gray-900 rounded p-3">
          <div class="text-xs text-gray-400">发现数量</div>
          <div class="text-xl font-bold text-matrix-green">
            <AnimatedNumber :value="matches" />
          </div>
        </div>
        <div class="bg-gray-900 rounded p-3 col-span-2">
          <div class="text-xs text-gray-400">当前 Hashrate</div>
          <div class="text-xl font-bold text-cyber-cyan">
            <AnimatedNumber :value="hashrate" :decimals="1" /> keys/s
          </div>
        </div>
      </div>
    </div>

    <!-- 详细模式（Tab切换显示） -->
    <div v-else class="stats-detailed space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="stat-card">
          <div class="stat-label">总尝试次数</div>
          <div class="stat-value">
            <AnimatedNumber :value="attempts" />
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">发现数量</div>
          <div class="stat-value text-green">
            <AnimatedNumber :value="matches" />
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">当前 Hashrate</div>
          <div class="stat-value text-cyan">
            <AnimatedNumber :value="hashrate" :decimals="1" /> keys/s
          </div>
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
import AnimatedNumber from './AnimatedNumber.vue'

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
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.stats-simple {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

@media (prefers-color-scheme: dark) {
  .stats-simple {
    background: #2a2a2a;
    border: 1px solid #333;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}

.stats-simple .bg-gray-900 {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  transition: all 0.3s ease;
}

@media (prefers-color-scheme: dark) {
  .stats-simple .bg-gray-900 {
    background: #333333;
    border: 1px solid #444;
  }
}

.stats-simple .bg-gray-900:hover {
  border-color: #d8b4fe;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(147, 51, 234, 0.1);
}

@media (prefers-color-scheme: dark) {
  .stats-simple .bg-gray-900:hover {
    box-shadow: 0 2px 8px rgba(147, 51, 234, 0.2);
  }
}

.stats-simple .text-xs {
  font-size: 11px;
  color: #666666;
  margin-bottom: 4px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (prefers-color-scheme: dark) {
  .stats-simple .text-xs {
    color: #cccccc;
  }
}

.stats-simple .text-xl {
  font-size: 18px;
  font-weight: 700;
  color: #333333;
  line-height: 1.2;
}

@media (prefers-color-scheme: dark) {
  .stats-simple .text-xl {
    color: #f0f0f0;
  }
}

.stats-simple .text-matrix-green {
  color: #16a34a;
}

@media (prefers-color-scheme: dark) {
  .stats-simple .text-matrix-green {
    color: #10b981;
  }
}

.stats-simple .text-cyber-cyan {
  color: #9333ea;
}

@media (prefers-color-scheme: dark) {
  .stats-simple .text-cyber-cyan {
    color: #d8b4fe;
  }
}

.stat-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s ease;
}

@media (prefers-color-scheme: dark) {
  .stat-card {
    background: #2a2a2a;
    border: 1px solid #333;
  }
}

.stat-card:hover {
  border-color: #d8b4fe;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(147, 51, 234, 0.1);
}

@media (prefers-color-scheme: dark) {
  .stat-card:hover {
    box-shadow: 0 2px 8px rgba(147, 51, 234, 0.2);
  }
}

.stat-label {
  font-size: 11px;
  color: #666666;
  margin-bottom: 4px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (prefers-color-scheme: dark) {
  .stat-label {
    color: #cccccc;
  }
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #333333;
  line-height: 1.2;
}

@media (prefers-color-scheme: dark) {
  .stat-value {
    color: #f0f0f0;
  }
}

.stat-value.text-green {
  color: #16a34a;
}

@media (prefers-color-scheme: dark) {
  .stat-value.text-green {
    color: #10b981;
  }
}

.stat-value.text-cyan {
  color: #9333ea;
}

@media (prefers-color-scheme: dark) {
  .stat-value.text-cyan {
    color: #d8b4fe;
  }
}

.section-title {
  font-size: 12px;
  color: #9333ea;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e9d5ff;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (prefers-color-scheme: dark) {
  .section-title {
    color: #d8b4fe;
    border-bottom: 1px solid rgba(147, 51, 234, 0.2);
  }
}

.rules-stats {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
}

@media (prefers-color-scheme: dark) {
  .rules-stats {
    background: #2a2a2a;
    border: 1px solid #333;
  }
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
  border-bottom: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

@media (prefers-color-scheme: dark) {
  .rule-stat-item {
    border-bottom: 1px solid #333;
  }
}

.rule-stat-item:hover {
  color: #9333ea;
}

.rule-stat-item:last-child {
  border-bottom: none;
}

.rule-type {
  font-size: 12px;
  color: #333333;
  text-transform: capitalize;
  font-weight: 500;
}

@media (prefers-color-scheme: dark) {
  .rule-type {
    color: #f0f0f0;
  }
}

.rule-count {
  font-size: 12px;
  color: #9333ea;
  font-weight: 700;
  background: #f5f3ff;
  padding: 2px 6px;
  border-radius: 10px;
  border: 1px solid #e9d5ff;
}

@media (prefers-color-scheme: dark) {
  .rule-count {
    color: #d8b4fe;
    background: rgba(147, 51, 234, 0.1);
    border: 1px solid rgba(147, 51, 234, 0.2);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-simple {
    padding: 10px;
  }
  
  .stats-simple .text-xl {
    font-size: 16px;
  }
  
  .stat-card {
    padding: 10px;
  }
  
  .stat-value {
    font-size: 16px;
  }
}
</style>
