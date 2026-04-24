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

    <!-- 逻辑关系选择 -->
    <div class="logic-section">
      <label class="logic-label">筛选逻辑关系:</label>
      <div class="logic-toggle">
        <button
          class="pill-tab"
          :class="{ active: logicOperator === 'OR' }"
          @click="logicOperator = 'OR'"
          title="任一条件匹配即通过"
        >
          或 (OR)
        </button>
        <button
          class="pill-tab"
          :class="{ active: logicOperator === 'AND' }"
          @click="logicOperator = 'AND'"
          title="所有条件都必须匹配"
        >
          与 (AND)
        </button>
      </div>
      <div class="logic-hint">
        {{ logicOperator === 'OR' ? '任一规则匹配即视为特殊密钥' : '所有启用的规则都必须匹配' }}
      </div>
    </div>

    <!-- 规则列表 -->
    <div class="rules-section">
      <div class="section-header">
        <h4>筛选规则</h4>
        <button @click="addRule" class="ghost-btn add-rule-btn">+ 添加规则</button>
      </div>

      <ul class="divider-list">
        <li v-for="(rule, index) in rules" :key="rule.id" class="rule-item">
          <div class="rule-header">
            <input
              type="checkbox"
              v-model="rule.enabled"
              class="rule-enable"
            />
            <select v-model="rule.type" class="rule-type">
              <option value="consecutive">连续字符</option>
              <option value="repeating">重复序列</option>
              <option value="palindrome">回文</option>
              <option value="special_date">特殊日期</option>
              <option value="custom_regex">自定义正则</option>
              <option value="leading_zeros">前导零</option>
            </select>
            <input
              type="color"
              v-model="rule.color"
              class="rule-color"
              title="选择高亮颜色"
            />
            <button @click="removeRule(index)" class="ghost-btn remove-rule-btn" v-if="rules.length > 1">×</button>
          </div>

          <div class="rule-params">
            <template v-if="rule.type === 'consecutive'">
              <label>
                最小长度:
                <input
                  type="number"
                  v-model.number="rule.params.minLength"
                  min="2"
                  max="10"
                  class="line-input param-input"
                />
              </label>
            </template>

            <template v-if="rule.type === 'repeating'">
              <label>
                最小长度:
                <input
                  type="number"
                  v-model.number="rule.params.minLength"
                  min="2"
                  max="10"
                  class="line-input param-input"
                />
              </label>
            </template>

            <template v-if="rule.type === 'palindrome'">
              <label>
                最小长度:
                <input
                  type="number"
                  v-model.number="rule.params.minLength"
                  min="3"
                  max="20"
                  class="line-input param-input"
                />
              </label>
            </template>

            <template v-if="rule.type === 'special_date'">
              <label>
                日期模式:
                <input
                  type="text"
                  v-model="rule.params.pattern"
                  placeholder="如: 19900101"
                  class="line-input param-input"
                />
              </label>
            </template>

            <template v-if="rule.type === 'custom_regex'">
              <label>
                正则表达式:
                <input
                  type="text"
                  v-model="rule.params.pattern"
                  placeholder="如: (\\d)\\1{4,}"
                  class="line-input param-input"
                />
              </label>
            </template>

            <template v-if="rule.type === 'leading_zeros'">
              <label>
                零的个数:
                <input
                  type="number"
                  v-model.number="rule.params.zeroCount"
                  min="3"
                  max="20"
                  class="line-input param-input"
                />
              </label>
            </template>
          </div>
        </li>
      </ul>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useMinerStore } from '../stores/miner'
import type { PatternRule } from '../types'

const minerStore = useMinerStore()
const isRunning = minerStore.isRunning

// 注入配置按钮显示函数
const showConfig = inject<() => void>('showConfig', () => {
  console.warn('showConfig not provided')
})

// 生成唯一ID
function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// 默认规则
function createDefaultRule(): PatternRule {
  return {
    id: generateId(),
    type: 'consecutive',
    params: {
      minLength: 5,
    },
    color: '#00f0ff',
    enabled: true,
  }
}

const rules = ref<PatternRule[]>([createDefaultRule()])
const threads = ref(4)
const logicOperator = ref<'AND' | 'OR'>('OR')

const hasEnabledRules = computed(() => {
  return rules.value.some(rule => rule.enabled)
})

function addRule() {
  const colors = ['#00f0ff', '#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94']
  const newRule = createDefaultRule()
  newRule.color = colors[rules.value.length % colors.length]
  rules.value.push(newRule)
}

function removeRule(index: number) {
  rules.value.splice(index, 1)
}

function startMining() {
  const enabledRules = rules.value.filter(rule => rule.enabled)
  if (enabledRules.length === 0) {
    alert('请至少启用一条规则')
    return
  }

  minerStore.startMining({
    patterns: enabledRules,
    threads: threads.value,
    logicOperator: logicOperator.value,
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
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

@media (prefers-color-scheme: dark) {
  .control-header {
    border-bottom: 1px solid #333;
  }
}

.status-badge {
  padding: 4px 12px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 12px;
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

/* 逻辑关系选择区域 */
.logic-section {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

@media (prefers-color-scheme: dark) {
  .logic-section {
    background: #2a2a2a;
    border: 1px solid #333;
  }
}

.logic-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8px;
}

@media (prefers-color-scheme: dark) {
  .logic-label {
    color: #f0f0f0;
  }
}

.logic-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
}

.pill-tab {
  padding: 6px 14px;
  border-radius: 16px;
  background: transparent;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 13px;
  color: #666666;
}

@media (prefers-color-scheme: dark) {
  .pill-tab {
    border-color: #444;
    color: #cccccc;
  }
}

.pill-tab:hover {
  background: #f0f0f0;
}

@media (prefers-color-scheme: dark) {
  .pill-tab:hover {
    background: #333333;
  }
}

.pill-tab.active {
  background: #f5f3ff;
  border-color: #e9d5ff;
  color: #9333ea;
}

@media (prefers-color-scheme: dark) {
  .pill-tab.active {
    background: rgba(147, 51, 234, 0.2);
    border-color: rgba(147, 51, 234, 0.3);
    color: #d8b4fe;
  }
}

.logic-hint {
  font-size: 12px;
  color: #999;
  font-style: italic;
}

@media (prefers-color-scheme: dark) {
  .logic-hint {
    color: #777;
  }
}

.rules-section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-header h4 {
  margin: 0;
  color: #333333;
  font-size: 14px;
  font-weight: 600;
}

@media (prefers-color-scheme: dark) {
  .section-header h4 {
    color: #f0f0f0;
  }
}

.add-rule-btn {
  font-size: 12px;
}

/* 分割线列表 */
.divider-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.divider-list li {
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.divider-list li:last-child {
  border-bottom: none;
}

.divider-list li:hover {
  background: rgba(147, 51, 234, 0.02);
}

@media (prefers-color-scheme: dark) {
  .divider-list li {
    border-bottom-color: #333;
  }
  .divider-list li:hover {
    background: rgba(147, 51, 234, 0.05);
  }
}

.rule-item {
  padding: 10px 0;
}

.rule-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.rule-enable {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #d8b4fe;
}

.rule-type {
  flex: 1;
  padding: 6px 8px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #333333;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

@media (prefers-color-scheme: dark) {
  .rule-type {
    border-color: #444;
    color: #f0f0f0;
  }
}

.rule-type:hover {
  border-color: #d8b4fe;
}

.rule-color {
  width: 32px;
  height: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  background: none;
  transition: all 0.3s ease;
}

@media (prefers-color-scheme: dark) {
  .rule-color {
    border-color: #444;
  }
}

.rule-color:hover {
  border-color: #d8b4fe;
  transform: scale(1.05);
}

.remove-rule-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #dc2626;
}

.remove-rule-btn:hover {
  background: rgba(220, 38, 38, 0.1);
  border-color: rgba(220, 38, 38, 0.2);
}

.rule-params {
  padding-left: 24px;
  margin-top: 6px;
}

.rule-params label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666666;
  font-size: 13px;
  font-weight: 500;
}

@media (prefers-color-scheme: dark) {
  .rule-params label {
    color: #cccccc;
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

.param-input {
  width: 100px;
}

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

.threads-input {
  width: 60px;
}

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
</style>
