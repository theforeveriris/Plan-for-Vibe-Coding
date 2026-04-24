<template>
  <div class="rule-group-manager">
    <!-- 全局配置 -->
    <div class="global-config">
      <h4>全局配置</h4>
      <div class="config-item">
        <label>冲突解决策略:</label>
        <select v-model="ruleEngineStore.conflictResolution" class="config-select">
          <option value="priority">按优先级</option>
          <option value="first-match">首个匹配</option>
          <option value="all">全部执行</option>
          <option value="group-first">规则组优先</option>
        </select>
      </div>
      <div class="config-item">
        <label>默认规则优先级: {{ ruleEngineStore.defaultRulePriority }}</label>
        <input
          type="range"
          v-model.number="ruleEngineStore.defaultRulePriority"
          min="1"
          max="100"
          class="priority-slider"
        />
      </div>
      <div class="config-item">
        <label>默认规则组优先级: {{ ruleEngineStore.defaultGroupPriority }}</label>
        <input
          type="range"
          v-model.number="ruleEngineStore.defaultGroupPriority"
          min="1"
          max="100"
          class="priority-slider"
        />
      </div>
    </div>

    <!-- 独立规则区域 -->
    <div class="independent-rules-section">
      <div class="section-header">
        <h4>独立规则 (默认OR逻辑)</h4>
        <button @click="addNewRule" class="ghost-btn add-btn">+ 添加规则</button>
      </div>
      <div class="rules-list">
        <div
          v-for="rule in ruleEngineStore.independentRules"
          :key="rule.id"
          class="rule-card"
          :class="{ disabled: !rule.enabled }"
        >
          <div class="rule-main">
            <input
              type="checkbox"
              v-model="rule.enabled"
              class="rule-enable"
            />
            <input
              v-model="rule.name"
              class="rule-name line-input"
              placeholder="规则名称"
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
            />
            <input
              type="number"
              v-model.number="rule.priority"
              min="1"
              max="100"
              class="priority-input"
              title="优先级"
            />
            <button @click="removeRule(rule.id)" class="ghost-btn remove-btn">×</button>
          </div>
          <div class="rule-params-compact">
            <template v-if="rule.type === 'consecutive' || rule.type === 'repeating'">
              <span>最小长度: {{ rule.params.minLength }}</span>
            </template>
            <template v-if="rule.type === 'palindrome'">
              <span>最小长度: {{ rule.params.minLength }}</span>
            </template>
            <template v-if="rule.type === 'special_date' || rule.type === 'custom_regex'">
              <span>模式: {{ rule.params.pattern || '未设置' }}</span>
            </template>
            <template v-if="rule.type === 'leading_zeros'">
              <span>零个数: {{ rule.params.zeroCount }}</span>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 规则组区域 -->
    <div class="rule-groups-section">
      <div class="section-header">
        <h4>规则组</h4>
        <button @click="addNewGroup" class="ghost-btn add-btn">+ 添加规则组</button>
      </div>
      
      <div v-if="ruleEngineStore.ruleGroups.length === 0" class="empty-hint">
        暂无规则组，点击上方按钮创建
      </div>
      
      <div class="groups-list">
        <div
          v-for="group in ruleEngineStore.ruleGroups"
          :key="group.id"
          class="group-card"
          :class="{ disabled: !group.enabled }"
        >
          <div class="group-header">
            <input
              type="checkbox"
              v-model="group.enabled"
              class="group-enable"
            />
            <input
              v-model="group.name"
              class="group-name line-input"
              placeholder="规则组名称"
            />
            <div class="group-logic">
              <button
                class="pill-tab"
                :class="{ active: group.logicOperator === 'OR' }"
                @click="group.logicOperator = 'OR'"
              >
                OR
              </button>
              <button
                class="pill-tab"
                :class="{ active: group.logicOperator === 'AND' }"
                @click="group.logicOperator = 'AND'"
              >
                AND
              </button>
            </div>
            <input
              type="number"
              v-model.number="group.priority"
              min="1"
              max="100"
              class="priority-input"
              title="优先级"
            />
            <button @click="removeGroup(group.id)" class="ghost-btn remove-btn">×</button>
          </div>
          
          <div class="group-rules">
            <div class="group-rules-header">
              <span>组内规则:</span>
              <select v-model="selectedRuleForGroup[group.id]" class="add-rule-select">
                <option value="">选择规则添加</option>
                <option
                  v-for="rule in availableRulesForGroup(group.id)"
                  :key="rule.id"
                  :value="rule.id"
                >
                  {{ rule.name }}
                </option>
              </select>
              <button
                @click="addRuleToGroup(group.id)"
                class="ghost-btn add-rule-btn"
                :disabled="!selectedRuleForGroup[group.id]"
              >
                添加
              </button>
            </div>
            
            <div v-if="group.ruleRefs.length === 0" class="empty-hint">
              暂无规则，请从上方选择添加
            </div>
            
            <div class="group-rule-items">
              <div
                v-for="ref in group.ruleRefs"
                :key="ref.ruleId"
                class="group-rule-item"
              >
                <input
                  type="checkbox"
                  v-model="ref.enabled"
                  class="ref-enable"
                />
                <span class="ref-name">{{ getRuleName(ref.ruleId) }}</span>
                <button
                  @click="removeRuleFromGroup(ref.ruleId, group.id)"
                  class="ghost-btn remove-ref-btn"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button @click="exportConfig" class="ghost-btn action-btn">导出配置</button>
      <button @click="importConfig" class="ghost-btn action-btn">导入配置</button>
      <button @click="resetConfig" class="ghost-btn action-btn danger">重置</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRuleEngineStore } from '../stores/ruleEngine'
import type { PatternRule } from '../types'

const ruleEngineStore = useRuleEngineStore()

// 为每个规则组选择的规则
const selectedRuleForGroup = reactive<Record<string, string>>({})

// 添加新规则
function addNewRule() {
  ruleEngineStore.addRule()
}

// 删除规则
function removeRule(ruleId: string) {
  if (confirm('确定要删除此规则吗？')) {
    ruleEngineStore.removeRule(ruleId)
  }
}

// 添加新规则组
function addNewGroup() {
  const group = ruleEngineStore.addRuleGroup(`规则组 ${ruleEngineStore.ruleGroups.length + 1}`)
  selectedRuleForGroup[group.id] = ''
}

// 删除规则组
function removeGroup(groupId: string) {
  if (confirm('确定要删除此规则组吗？')) {
    ruleEngineStore.removeRuleGroup(groupId)
    delete selectedRuleForGroup[groupId]
  }
}

// 获取可用于规则组的规则（排除已在组中的）
function availableRulesForGroup(groupId: string): PatternRule[] {
  const group = ruleEngineStore.ruleGroups.find(g => g.id === groupId)
  if (!group) return ruleEngineStore.independentRules
  
  const existingRuleIds = group.ruleRefs.map(ref => ref.ruleId)
  return ruleEngineStore.independentRules.filter(rule => !existingRuleIds.includes(rule.id))
}

// 添加规则到组
function addRuleToGroup(groupId: string) {
  const ruleId = selectedRuleForGroup[groupId]
  if (!ruleId) return
  
  ruleEngineStore.addRuleToGroup(ruleId, groupId)
  selectedRuleForGroup[groupId] = ''
}

// 从组中移除规则
function removeRuleFromGroup(ruleId: string, groupId: string) {
  ruleEngineStore.removeRuleFromGroup(ruleId, groupId)
}

// 获取规则名称
function getRuleName(ruleId: string): string {
  const rule = ruleEngineStore.independentRules.find(r => r.id === ruleId)
  return rule?.name || ruleId
}

// 导出配置
function exportConfig() {
  const config = ruleEngineStore.exportConfiguration()
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `rule-config-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

// 导入配置
function importConfig() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target?.result as string)
        ruleEngineStore.importConfiguration(config)
        alert('配置导入成功')
      } catch (error) {
        alert('配置导入失败: ' + (error instanceof Error ? error.message : '未知错误'))
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

// 重置配置
function resetConfig() {
  if (confirm('确定要重置所有配置吗？此操作不可恢复。')) {
    ruleEngineStore.resetToDefault()
  }
}
</script>

<style scoped>
.rule-group-manager {
  padding: 16px;
  max-height: 100%;
  overflow-y: auto;
}

/* 全局配置 */
.global-config {
  margin-bottom: 20px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

@media (prefers-color-scheme: dark) {
  .global-config {
    background: #2a2a2a;
    border-color: #333;
  }
}

.global-config h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #333;
}

@media (prefers-color-scheme: dark) {
  .global-config h4 {
    color: #f0f0f0;
  }
}

.config-item {
  margin-bottom: 10px;
}

.config-item label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

@media (prefers-color-scheme: dark) {
  .config-item label {
    color: #ccc;
  }
}

.config-select {
  padding: 6px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  background: #fff;
  color: #333;
}

@media (prefers-color-scheme: dark) {
  .config-select {
    background: #333;
    border-color: #444;
    color: #f0f0f0;
  }
}

.priority-slider {
  width: 100%;
  height: 4px;
  margin-top: 4px;
}

/* 区域标题 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h4 {
  margin: 0;
  font-size: 14px;
  color: #333;
}

@media (prefers-color-scheme: dark) {
  .section-header h4 {
    color: #f0f0f0;
  }
}

/* 幽灵按钮 */
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

.ghost-btn.danger {
  color: #dc2626;
}

.ghost-btn.danger:hover {
  background: rgba(220, 38, 38, 0.1);
  border-color: rgba(220, 38, 38, 0.2);
}

.add-btn {
  font-size: 12px;
}

/* 规则卡片 */
.rule-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

@media (prefers-color-scheme: dark) {
  .rule-card {
    background: #2a2a2a;
    border-color: #333;
  }
}

.rule-card.disabled {
  opacity: 0.5;
}

.rule-main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.rule-enable {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.rule-name {
  flex: 1;
  min-width: 100px;
  font-size: 13px;
}

.rule-type {
  padding: 4px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 12px;
  background: #fff;
  color: #333;
}

@media (prefers-color-scheme: dark) {
  .rule-type {
    background: #333;
    border-color: #444;
    color: #f0f0f0;
  }
}

.rule-color {
  width: 28px;
  height: 22px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
}

.priority-input {
  width: 50px;
  padding: 4px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}

.remove-btn {
  padding: 2px 6px;
  font-size: 16px;
  color: #dc2626;
}

.rule-params-compact {
  margin-top: 6px;
  padding-left: 24px;
  font-size: 12px;
  color: #999;
}

@media (prefers-color-scheme: dark) {
  .rule-params-compact {
    color: #777;
  }
}

/* 规则组卡片 */
.group-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

@media (prefers-color-scheme: dark) {
  .group-card {
    background: #2a2a2a;
    border-color: #333;
  }
}

.group-card.disabled {
  opacity: 0.5;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.group-enable {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.group-name {
  flex: 1;
  min-width: 120px;
  font-size: 14px;
  font-weight: 600;
}

.group-logic {
  display: flex;
  gap: 4px;
}

.pill-tab {
  padding: 4px 10px;
  border-radius: 12px;
  background: transparent;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  transition: all 0.3s ease;
}

@media (prefers-color-scheme: dark) {
  .pill-tab {
    border-color: #444;
    color: #ccc;
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

/* 组内规则 */
.group-rules {
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
}

@media (prefers-color-scheme: dark) {
  .group-rules {
    background: #333;
  }
}

.group-rules-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.group-rules-header span {
  font-size: 12px;
  color: #666;
}

@media (prefers-color-scheme: dark) {
  .group-rules-header span {
    color: #ccc;
  }
}

.add-rule-select {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 12px;
  background: #fff;
  color: #333;
}

@media (prefers-color-scheme: dark) {
  .add-rule-select {
    background: #2a2a2a;
    border-color: #444;
    color: #f0f0f0;
  }
}

.add-rule-btn {
  font-size: 12px;
  padding: 4px 10px;
}

.group-rule-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-rule-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #fff;
  border-radius: 4px;
  font-size: 12px;
}

@media (prefers-color-scheme: dark) {
  .group-rule-item {
    background: #2a2a2a;
  }
}

.ref-enable {
  width: 14px;
  height: 14px;
}

.ref-name {
  flex: 1;
  color: #333;
}

@media (prefers-color-scheme: dark) {
  .ref-name {
    color: #f0f0f0;
  }
}

.remove-ref-btn {
  padding: 0 4px;
  font-size: 14px;
  color: #dc2626;
}

/* 空提示 */
.empty-hint {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 13px;
}

@media (prefers-color-scheme: dark) {
  .empty-hint {
    color: #777;
  }
}

/* 操作按钮 */
.actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
}

@media (prefers-color-scheme: dark) {
  .actions {
    border-top-color: #333;
  }
}

.action-btn {
  font-size: 12px;
}

/* 线条输入框 */
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
</style>
