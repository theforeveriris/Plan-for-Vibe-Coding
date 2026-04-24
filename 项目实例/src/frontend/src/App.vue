<template>
  <div class="app min-h-screen bg-dark-bg text-white">
    <Dashboard />
    
    <!-- 配置模态框 -->
    <ConfigModal
      v-if="showConfig"
      @close="showConfig = false"
      @save="handleConfigSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import Dashboard from './views/Dashboard.vue'
import ConfigModal from './components/ConfigModal.vue'
import { useMinerStore } from './stores/miner'
import { useKeysStore } from './stores/keys'

const showConfig = ref(false)
const minerStore = useMinerStore()
const keysStore = useKeysStore()

// 提供配置按钮的显示控制给子组件
provide('showConfig', () => {
  showConfig.value = true
})

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
