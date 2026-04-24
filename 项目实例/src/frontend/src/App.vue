<template>
  <div class="app min-h-screen bg-dark-bg text-white">
    <header class="bg-dark-card border-b border-gray-800 py-4 px-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-matrix-green font-mono">
          PGP Vanity Key Miner
        </h1>
        <p class="text-gray-400 text-sm">
          挖掘具有特殊指纹的 PGP 密钥对
        </p>
      </div>
      <button
        @click="showConfig = true"
        class="btn bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2"
      >
        <span>⚙️ 配置</span>
      </button>
    </header>
    
    <main class="container mx-auto px-4 py-6">
      <Dashboard />
    </main>
    
    <!-- 配置模态框 -->
    <ConfigModal
      v-if="showConfig"
      @close="showConfig = false"
      @save="handleConfigSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Dashboard from './views/Dashboard.vue'
import ConfigModal from './components/ConfigModal.vue'
import { useMinerStore } from './stores/miner'
import { useKeysStore } from './stores/keys'

const showConfig = ref(false)
const minerStore = useMinerStore()
const keysStore = useKeysStore()

function handleConfigSave(url: string) {
  // 更新 store 中的 API 基础 URL
  minerStore.updateApiUrl(url)
  keysStore.updateApiUrl(url)
  showConfig.value = false
}
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>