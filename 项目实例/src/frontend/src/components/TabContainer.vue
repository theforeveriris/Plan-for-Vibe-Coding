<template>
  <div class="tab-container">
    <!-- 标签栏 -->
    <div class="tab-header">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-button"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>
    <!-- 内容区 -->
    <div class="tab-content">
      <slot :activeTab="activeTab" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Tab {
  id: string;
  label: string;
}

const props = defineProps<{
  tabs: Tab[];
  defaultTab?: string;
}>()

const activeTab = ref(props.defaultTab || props.tabs[0]?.id || '')
</script>

<style scoped>
.tab-container {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tab-header {
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(0, 240, 255, 0.2);
}

.tab-button {
  padding: 10px 20px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  position: relative;
}

.tab-button:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(0, 240, 255, 0.05);
}

.tab-button.active {
  color: #00f0ff;
  background: rgba(0, 240, 255, 0.1);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #00f0ff;
}

.tab-content {
  flex: 1;
  overflow: hidden;
  padding: 16px;
}
</style>
