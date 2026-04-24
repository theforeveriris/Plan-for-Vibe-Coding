<template>
  <div class="miner-control">
    <div class="control-header">
      <div class="status-badge" :class="{ running: isRunning }">
        {{ isRunning ? '运行中' : '已停止' }}
      </div>
      <button @click="showConfig" class="config-btn" title="配置">
        ⚙️
      </button>
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
  background: transparent;
  padding: 0;
  overflow-y: auto;
  height: 100%;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.status-badge {
  padding: 6px 16px;
  background: rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s ease;
}

.status-badge.running {
  background: rgba(52, 211, 153, 0.2);
  color: #34d399;
  box-shadow: 0 0 12px rgba(52, 211, 153, 0.3);
}

.config-btn {
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  color: #93c5fd;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  transition: all 0.2s ease;
}

.config-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.rules-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  font-weight: 600;
}

.add-rule-btn {
  padding: 6px 16px;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: #3b82f6;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.add-rule-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.rule-item {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.rule-item:hover {
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.rule-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.rule-enable {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.rule-type {
  flex: 1;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rule-type:hover {
  border-color: rgba(59, 130, 246, 0.3);
}

.rule-color {
  width: 40px;
  height: 32px;
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  cursor: pointer;
  background: none;
  transition: all 0.2s ease;
}

.rule-color:hover {
  border-color: rgba(59, 130, 246, 0.5);
  transform: scale(1.05);
}

.remove-rule-btn {
  width: 32px;
  height: 32px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  color: #ef4444;
  cursor: pointer;
  font-size: 18px;
  font-weight: 500;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-rule-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.rule-params {
  padding-left: 30px;
  margin-top: 8px;
}

.rule-params label {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
}

.param-input {
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  width: 140px;
  transition: all 0.2s ease;
}

.param-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.threads-section {
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(30, 41, 59, 0.4);
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.threads-section label {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  font-weight: 500;
}

.threads-input {
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  width: 80px;
  transition: all 0.2s ease;
}

.threads-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.control-buttons {
  display: flex;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.start-btn, .stop-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.start-btn {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2));
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.start-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3));
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
}

.stop-btn {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2));
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.stop-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.3));
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
}

.start-btn:disabled, .stop-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 滚动条样式 */
.miner-control::-webkit-scrollbar {
  width: 6px;
}

.miner-control::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 3px;
}

.miner-control::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}

.miner-control::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}
</style>
