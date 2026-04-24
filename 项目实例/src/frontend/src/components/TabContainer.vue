<template>
  <div class="tab-container">
    <!-- 标签栏 - 胶囊样式 -->
    <div class="tab-header" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="pill-tab"
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
      <Transition name="fade" mode="out-in">
        <slot :activeTab="activeTab" />
      </Transition>
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
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tab-header {
  display: flex;
  background: transparent;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 8px 8px 0 0;
  padding: 8px 12px;
  gap: 8px;
}

@media (prefers-color-scheme: dark) {
  .tab-header {
    border-bottom: 1px solid #333;
  }
}

/* 胶囊样式标签 */
.pill-tab {
  padding: 8px 16px;
  border-radius: 20px;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 14px;
  color: #666666;
  white-space: nowrap;
  outline: none;
}

@media (prefers-color-scheme: dark) {
  .pill-tab {
    color: #cccccc;
  }
}

.pill-tab:focus-visible {
  outline: 2px solid #d8b4fe;
  outline-offset: -2px;
}

.pill-tab:hover {
  color: #333333;
  background: #f0f0f0;
  transform: translateY(-1px);
}

@media (prefers-color-scheme: dark) {
  .pill-tab:hover {
    color: #ffffff;
    background: #333333;
  }
}

.pill-tab.active {
  background: #f5f3ff;
  border-color: #e9d5ff;
  color: #9333ea;
  box-shadow: 0 2px 4px rgba(147, 51, 234, 0.1);
}

@media (prefers-color-scheme: dark) {
  .pill-tab.active {
    background: rgba(147, 51, 234, 0.2);
    border-color: rgba(147, 51, 234, 0.3);
    color: #d8b4fe;
    box-shadow: 0 2px 4px rgba(147, 51, 234, 0.2);
  }
}

.tab-content {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
