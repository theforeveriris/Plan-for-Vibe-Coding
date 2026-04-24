<template>
  <div class="miner-control">
    <div class="control-header">
      <h3>控制面板</h3>
      <div class="status-badge" :class="{ running: isRunning }">
        {{ isRunning ? '运行中' : '已停止' }}
      </div>
    </div>

    <!-- 规则列表 -->
    <div class="rules-section">
      <div class="section-header">
        <h4>筛选规则</h4>
        <button @click="addRule" class="add-rule-btn">+ 添加规则</button>
      </div>

      <div v-for="(rule, index) in rules" :key="rule.id" class="rule-item">
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
          <button @click="removeRule(index)" class="remove-rule-btn" v-if="rules.length > 1">×</button>
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
                class="param-input"
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
                class="param-input"
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
                class="param-input"
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
                class="param-input"
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
                class="param-input"
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
                class="param-input"
              />
            </label>
          </template>
        </div>
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
          class="threads-input"
        />
      </label>
    </div>

    <!-- 控制按钮 -->
    <div class="control-buttons">
      <button
        @click="startMining"
        :disabled="isRunning || !hasEnabledRules"
        class="start-btn"
      >
        开始挖掘
      </button>
      <button
        @click="stopMining"
        :disabled="!isRunning"
        class="stop-btn"
      >
        停止挖掘
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMinerStore } from '../stores/miner'
import type { PatternRule } from '../types'

const minerStore = useMinerStore()
const isRunning = minerStore.isRunning

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
  })
}

function stopMining() {
  minerStore.stopMining()
}
</script>

<style scoped>
.miner-control {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 8px;
  padding: 16px;
  overflow-y: auto;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.control-header h3 {
  margin: 0;
  color: #00f0ff;
  font-size: 16px;
}

.status-badge {
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.status-badge.running {
  background: rgba(0, 240, 255, 0.2);
  color: #00f0ff;
}

.rules-section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h4 {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.add-rule-btn {
  padding: 4px 12px;
  background: rgba(0, 240, 255, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 4px;
  color: #00f0ff;
  cursor: pointer;
  font-size: 12px;
}

.add-rule-btn:hover {
  background: rgba(0, 240, 255, 0.3);
}

.rule-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
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
}

.rule-type {
  flex: 1;
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}

.rule-color {
  width: 32px;
  height: 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: none;
}

.remove-rule-btn {
  width: 24px;
  height: 24px;
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 4px;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-rule-btn:hover {
  background: rgba(255, 107, 107, 0.3);
}

.rule-params {
  padding-left: 24px;
}

.rule-params label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
}

.param-input {
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  width: 120px;
}

.threads-section {
  margin-bottom: 16px;
}

.threads-section label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.threads-input {
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  width: 60px;
}

.control-buttons {
  display: flex;
  gap: 12px;
}

.start-btn, .stop-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.start-btn {
  background: rgba(0, 240, 255, 0.2);
  color: #00f0ff;
  border: 1px solid rgba(0, 240, 255, 0.3);
}

.start-btn:hover:not(:disabled) {
  background: rgba(0, 240, 255, 0.3);
}

.stop-btn {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.stop-btn:hover:not(:disabled) {
  background: rgba(255, 107, 107, 0.3);
}

.start-btn:disabled, .stop-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
