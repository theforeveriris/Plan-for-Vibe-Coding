<template>
  <div class="stats-panel space-y-4">
    <!-- 统计数字 -->
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

    <!-- Hashrate 图表 -->
    <div class="bg-gray-900 rounded p-3">
      <div class="text-xs text-gray-400 mb-2">Hashrate 趋势</div>
      <div class="h-32">
        <HashrateChart />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMinerStore } from '../stores/miner'
import HashrateChart from './HashrateChart.vue'

const minerStore = useMinerStore()

const attempts = computed(() => minerStore.attempts)
const matches = computed(() => minerStore.matches.length)
const hashrate = computed(() => minerStore.hashrate)

function formatNumber(num: number): string {
  return num.toLocaleString()
}
</script>

<style scoped>
.stats-panel {
  font-family: 'Inter', sans-serif;
}
</style>