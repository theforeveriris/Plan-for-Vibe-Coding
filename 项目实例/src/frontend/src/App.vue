<template>
  <div class="app min-h-screen bg-dark-bg text-white">
    <header class="bg-dark-card border-b border-gray-800 py-4 px-6">
      <h1 class="text-2xl font-bold text-matrix-green font-mono">
        PGP Vanity Key Miner
      </h1>
      <p class="text-gray-400 text-sm">
        挖掘具有特殊指纹的 PGP 密钥对
      </p>
    </header>
    
    <main class="container mx-auto px-4 py-6">
      <Dashboard />
    </main>
  </div>
</template>

<script setup lang="ts">
import Dashboard from './views/Dashboard.vue'
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>