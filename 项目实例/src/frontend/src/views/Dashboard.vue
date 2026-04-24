<template>
  <div class="dashboard grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- 左侧控制面板 -->
    <div class="lg:col-span-1 space-y-6">
      <div class="bg-dark-card rounded-lg border border-gray-800 p-4">
        <h2 class="text-xl font-semibold mb-4 text-cyber-cyan">控制面板</h2>
        <MinerControl />
      </div>
      
      <div class="bg-dark-card rounded-lg border border-gray-800 p-4">
        <h2 class="text-xl font-semibold mb-4 text-cyber-cyan">统计面板</h2>
        <StatsPanel />
      </div>
    </div>
    
    <!-- 右侧终端和密钥 -->
    <div class="lg:col-span-2 space-y-6">
      <div class="bg-dark-card rounded-lg border border-gray-800 p-4">
        <h2 class="text-xl font-semibold mb-4 text-cyber-cyan">实时终端</h2>
        <MinerTerminal />
      </div>
      
      <div class="bg-dark-card rounded-lg border border-gray-800 p-4">
        <h2 class="text-xl font-semibold mb-4 text-cyber-cyan">已发现的特殊密钥</h2>
        <div v-if="keys.length === 0" class="text-gray-500 py-8">
          还没有发现特殊密钥，开始挖掘吧！
        </div>
        <div v-else class="grid grid-cols-1 gap-4">
          <KeyCard 
            v-for="key in keys" 
            :key="key.id" 
            :key-data="key"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MinerControl from '../components/MinerControl.vue'
import MinerTerminal from '../components/MinerTerminal.vue'
import StatsPanel from '../components/StatsPanel.vue'
import KeyCard from '../components/KeyCard.vue'
import { useKeysStore } from '../stores/keys'
import type { SpecialKey } from '../types'

const keysStore = useKeysStore()
const keys = ref<SpecialKey[]>([])

onMounted(async () => {
  await keysStore.fetchKeys()
  keys.value = keysStore.keys
})
</script>

<style scoped>
.dashboard {
  height: calc(100vh - 120px);
}
</style>