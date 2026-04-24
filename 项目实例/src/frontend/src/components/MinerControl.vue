<template>
  <div class="miner-control">
    <div class="control-header">
      <div class="status-badge" :class="{ running: isRunning }">
        {{ isRunning ? '运行中' : '已停止' }}
      </div>
      <button @click="showConfig" class="ghost-btn config-btn" title="配置">
        ⚙️
      </button>
    </div>

    <!-- 规则配置摘要 -->
    <div class="config-summary">
      <div class="summary-item">
        <span class="summary-label">独立规则:</span>
        <span class="summary-value">{{ enabledIndependentRulesCount }} / {{ ruleEngineStore.independentRules.length }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">规则组:</span>
        <span class="summary-value">{{ enabledRuleGroupsCount }} / {{ ruleEngineStore.ruleGroups.length }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">冲突策略:</span>
        <span class="summary-value">{{ conflictStrategyLabel }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">逻辑关系:</span>
        <span class="summary-value">{{ logicOperatorLabel }}</span>
      </div>
    </div>

    <!-- 线程数设置 -->
    <div class="threads-section">
      <label>
        线程数:
        <input
          type="number"
          v-model.number="threads"
          min="1"
          max="8"
          class="line-input threads-input"
        />
      </label>
    </div>

    <!-- 控制按钮 -->
    <div class="control-buttons">
      <button
        @click="startMining"
        :disabled="isRunning || !hasEnabledRules"
        class="ghost-btn start-btn"
      >
        开始挖掘
      </button>
      <button
        @click="stopMining"
        :disabled="!isRunning"
        class="ghost-btn stop-btn"
      >
        停止挖掘
      </button>
    </div>

    <!-- 提示信息 -->
    <div class="hint-text">
      💡 规则配置请切换到"规则引擎"标签页进行管理
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useMinerStore } from '../stores/miner'
import { useRuleEngineStore } from '../stores/ruleEngine'

const minerStore = useMinerStore()
const ruleEngineStore = useRuleEngineStore()
const isRunning = minerStore.isRunning

// 注入配置按钮显示函数
const showConfig = inject<() => void>('showConfig', () => {
  console.warn('showConfig not provided')
})

const threads = ref(4)

// 计算启用的独立规则数量
const enabledIndependentRulesCount = computed(() => {
  return ruleEngineStore.independentRules.filter(r => r.enabled).length
})

// 计算启用的规则组数量
const enabledRuleGroupsCount = computed(() => {
  return ruleEngineStore.ruleGroups.filter(g => g.enabled).length
})

// 冲突策略显示标签
const conflictStrategyLabel = computed(() => {
  const strategyMap: Record<string, string> = {
    'priority': '按优先级',
    'first-match': '首个匹配',
    'all': '全部执行',
    'group-first': '规则组优先'
  }
  return strategyMap[ruleEngineStore.conflictResolution] || '按优先级'
})

// 逻辑关系显示标签
const logicOperatorLabel = computed(() => {
  // 如果有规则组，显示混合
  if (ruleEngineStore.ruleGroups.length > 0) {
    return '混合（见规则引擎）'
  }
  // 否则显示独立规则的默认OR
  return '或 (OR)'
})

// 是否有启用的规则
const hasEnabledRules = computed(() => {
  const hasIndependentRules = ruleEngineStore.independentRules.some(r => r.enabled)
  const hasGroupRules = ruleEngineStore.ruleGroups.some(g => g.enabled && g.ruleRefs.some(ref => ref.enabled))
  return hasIndependentRules || hasGroupRules
})

function startMining() {
  const enabledRules = ruleEngineStore.independentRules.filter(rule => rule.enabled)
  
  if (enabledRules.length === 0 && ruleEngineStore.ruleGroups.length === 0) {
    alert('请至少启用一条规则或创建一个规则组')
    return
  }

  // 构建规则配置
  const ruleConfig = ruleEngineStore.exportConfiguration()

  minerStore.startMining({
    patterns: enabledRules,
    threads: threads.value,
    ruleConfig: ruleConfig,
  })
}

function stopMining() {
  minerStore.stopMining()
}
</script>

<style scoped>
.miner-control {
  background: transparent;
  padding: 0;
  overflow-y: auto;
  height: 100%;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

@media (prefers-color-scheme: dark) {
  .control-header {
    border-bottom: 1px solid #333;
  }
}

.status-badge {
  padding: 6px 16px;
  background: #f0f0f0;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  color: #666666;
  transition: all 0.3s ease;
}

@media (prefers-color-scheme: dark) {
  .status-badge {
    background: #333333;
    color: #cccccc;
  }
}

.status-badge.running {
  background: #f0fdf4;
  color: #16a34a;
}

@media (prefers-color-scheme: dark) {
  .status-badge.running {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }
}

/* 幽灵按钮样式 */
.ghost-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #9333ea;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 13px;
}

.ghost-btn:hover {
  background: rgba(147, 51, 234, 0.1);
  border-color: rgba(147, 51, 234, 0.2);
  transform: translateY(-1px);
}

@media (prefers-color-scheme: dark) {
  .ghost-btn {
    color: #d8b4fe;
  }
  .ghost-btn:hover {
    background: rgba(147, 51, 234, 0.2);
    border-color: rgba(147, 51, 234, 0.3);
  }
}

.config-btn {
  font-size: 14px;
  padding: 4px 8px;
}

/* 配置摘要 */
.config-summary {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

@media (prefers-color-scheme: dark) {
  .config-summary {
    background: #2a2a2a;
    border-color: #333;
  }
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #e0e0e0;
}

.summary-item:last-child {
  border-bottom: none;
}

@media (prefers-color-scheme: dark) {
  .summary-item {
    border-bottom-color: #333;
  }
}

.summary-label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

@media (prefers-color-scheme: dark) {
  .summary-label {
    color: #ccc;
  }
}

.summary-value {
  font-size: 13px;
  color: #333;
  font-weight: 600;
}

@media (prefers-color-scheme: dark) {
  .summary-value {
    color: #f0f0f0;
  }
}

/* 线程数设置 */
.threads-section {
  margin-bottom: 16px;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
}

@media (prefers-color-scheme: dark) {
  .threads-section {
    border-bottom-color: #333;
  }
}

.threads-section label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333333;
  font-size: 14px;
  font-weight: 500;
}

@media (prefers-color-scheme: dark) {
  .threads-section label {
    color: #f0f0f0;
  }
}

/* 简约线条输入框 */
.line-input {
  background: transparent;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  padding: 4px 0;
  font-size: 13px;
  transition: all 0.3s ease;
  outline: none;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.line-input:focus {
  border-bottom-color: #9333ea;
  box-shadow: 0 1px 0 0 #9333ea;
}

@media (prefers-color-scheme: dark) {
  .line-input {
    border-bottom-color: #444;
    color: #f0f0f0;
  }
  .line-input:focus {
    border-bottom-color: #d8b4fe;
    box-shadow: 0 1px 0 0 #d8b4fe;
  }
}

.threads-input {
  width: 60px;
}

/* 控制按钮 */
.control-buttons {
  display: flex;
  gap: 10px;
  padding-top: 12px;
}

.start-btn, .stop-btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

.start-btn {
  color: #9333ea;
  border: 1px solid #e9d5ff;
}

.start-btn:hover:not(:disabled) {
  background: rgba(147, 51, 234, 0.1);
  border-color: #d8b4fe;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);
}

@media (prefers-color-scheme: dark) {
  .start-btn {
    color: #d8b4fe;
    border-color: rgba(147, 51, 234, 0.3);
  }
  .start-btn:hover:not(:disabled) {
    background: rgba(147, 51, 234, 0.2);
  }
}

.stop-btn {
  color: #dc2626;
  border: 1px solid #fecaca;
}

.stop-btn:hover:not(:disabled) {
  background: rgba(220, 38, 38, 0.1);
  border-color: #fca5a5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

@media (prefers-color-scheme: dark) {
  .stop-btn {
    color: #ef4444;
    border-color: rgba(220, 38, 38, 0.3);
  }
  .stop-btn:hover:not(:disabled) {
    background: rgba(220, 38, 38, 0.2);
  }
}

.start-btn:disabled, .stop-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 提示信息 */
.hint-text {
  margin-top: 16px;
  padding: 10px;
  background: #f5f3ff;
  border-radius: 8px;
  border: 1px solid #e9d5ff;
  font-size: 12px;
  color: #9333ea;
  text-align: center;
}

@media (prefers-color-scheme: dark) {
  .hint-text {
    background: rgba(147, 51, 234, 0.1);
    border-color: rgba(147, 51, 234, 0.2);
    color: #d8b4fe;
  }
}
</style>
