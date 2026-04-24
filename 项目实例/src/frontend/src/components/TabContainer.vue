<template>
  <div class="tab-container">
    <!-- 标签栏 -->
    <div class="tab-header" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-button"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`tab-panel-${tab.id}`"
        role="tab"
        type="button"
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
  background: transparent;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tab-header {
  display: flex;
  background: rgba(15, 23, 42, 0.8);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px 12px 0 0;
  padding: 4px 12px;
  gap: 8px;
}

.tab-button {
  padding: 12px 20px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  outline: none;
  border-radius: 8px;
  white-space: nowrap;
}

.tab-button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

.tab-button:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.tab-button.active {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.15);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: #3b82f6;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.tab-content {
  flex: 1;
  overflow: hidden;
  padding: 0;
}
</style>
