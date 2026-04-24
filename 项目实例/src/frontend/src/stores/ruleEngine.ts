// 规则引擎状态管理
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  PatternRule,
  RuleGroup,
  RuleConfiguration,
  RuleReference,
  ConflictResolutionStrategy,
} from '../types'

// 生成唯一ID
function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// 创建默认规则
export function createDefaultRule(): PatternRule {
  return {
    id: generateId(),
    type: 'consecutive',
    params: { minLength: 5 },
    color: '#00f0ff',
    enabled: true,
    priority: 50,
    name: '连续字符规则',
    description: '匹配连续的相同字符',
  }
}

// 创建规则组
export function createRuleGroup(
  name: string = '新规则组',
  logicOperator: 'AND' | 'OR' = 'OR',
  priority: number = 50
): RuleGroup {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    name,
    description: '',
    logicOperator,
    priority,
    enabled: true,
    ruleRefs: [],
    createdAt: now,
    updatedAt: now,
  }
}

// 创建规则引用
export function createRuleReference(ruleId: string, enabled: boolean = true): RuleReference {
  return {
    ruleId,
    enabled,
  }
}

export const useRuleEngineStore = defineStore('ruleEngine', () => {
  // ========== 状态 ==========
  
  // 独立规则列表
  const independentRules = ref<PatternRule[]>([createDefaultRule()])
  
  // 规则组列表
  const ruleGroups = ref<RuleGroup[]>([])
  
  // 全局配置
  const defaultRulePriority = ref(50)
  const defaultGroupPriority = ref(50)
  const conflictResolution = ref<ConflictResolutionStrategy>('priority')
  
  // ========== 计算属性 ==========
  
  // 所有规则（包括独立规则和规则组中的规则）
  const allRules = computed(() => {
    const rules = [...independentRules.value]
    
    // 添加规则组中的规则引用
    ruleGroups.value.forEach(group => {
      group.ruleRefs.forEach(ref => {
        if (!rules.find(r => r.id === ref.ruleId)) {
          // 如果引用的规则不在独立规则中，创建一个占位
          const placeholderRule = independentRules.value.find(r => r.id === ref.ruleId)
          if (placeholderRule) {
            rules.push(placeholderRule)
          }
        }
      })
    })
    
    return rules
  })
  
  // 启用的独立规则
  const enabledIndependentRules = computed(() => 
    independentRules.value.filter(r => r.enabled)
  )
  
  // 启用的规则组
  const enabledRuleGroups = computed(() => 
    ruleGroups.value.filter(g => g.enabled)
  )
  
  // 规则配置
  const ruleConfiguration = computed<RuleConfiguration>(() => ({
    independentRules: independentRules.value,
    ruleGroups: ruleGroups.value,
    defaultRulePriority: defaultRulePriority.value,
    defaultGroupPriority: defaultGroupPriority.value,
    conflictResolution: conflictResolution.value,
  }))
  
  // ========== 独立规则操作 ==========
  
  function addRule(rule?: Partial<PatternRule>): PatternRule {
    const colors = ['#00f0ff', '#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94']
    const newRule: PatternRule = {
      ...createDefaultRule(),
      id: generateId(),
      color: colors[independentRules.value.length % colors.length],
      name: `规则 ${independentRules.value.length + 1}`,
      ...rule,
    }
    independentRules.value.push(newRule)
    return newRule
  }
  
  function removeRule(ruleId: string) {
    const index = independentRules.value.findIndex(r => r.id === ruleId)
    if (index > -1) {
      independentRules.value.splice(index, 1)
    }
    
    // 同时从所有规则组中移除引用
    ruleGroups.value.forEach(group => {
      const refIndex = group.ruleRefs.findIndex(ref => ref.ruleId === ruleId)
      if (refIndex > -1) {
        group.ruleRefs.splice(refIndex, 1)
      }
    })
  }
  
  function updateRule(ruleId: string, updates: Partial<PatternRule>) {
    const rule = independentRules.value.find(r => r.id === ruleId)
    if (rule) {
      Object.assign(rule, updates)
    }
  }
  
  function toggleRule(ruleId: string) {
    const rule = independentRules.value.find(r => r.id === ruleId)
    if (rule) {
      rule.enabled = !rule.enabled
    }
  }
  
  // ========== 规则组操作 ==========
  
  function addRuleGroup(
    name?: string,
    logicOperator?: 'AND' | 'OR',
    priority?: number
  ): RuleGroup {
    const newGroup = createRuleGroup(name, logicOperator, priority)
    ruleGroups.value.push(newGroup)
    return newGroup
  }
  
  function removeRuleGroup(groupId: string) {
    const index = ruleGroups.value.findIndex(g => g.id === groupId)
    if (index > -1) {
      ruleGroups.value.splice(index, 1)
    }
  }
  
  function updateRuleGroup(groupId: string, updates: Partial<RuleGroup>) {
    const group = ruleGroups.value.find(g => g.id === groupId)
    if (group) {
      Object.assign(group, updates)
      group.updatedAt = new Date().toISOString()
    }
  }
  
  function toggleRuleGroup(groupId: string) {
    const group = ruleGroups.value.find(g => g.id === groupId)
    if (group) {
      group.enabled = !group.enabled
    }
  }
  
  // ========== 规则组内规则引用操作 ==========
  
  function addRuleToGroup(ruleId: string, groupId: string) {
    const group = ruleGroups.value.find(g => g.id === groupId)
    if (!group) return
    
    // 检查是否已存在
    if (group.ruleRefs.find(ref => ref.ruleId === ruleId)) return
    
    group.ruleRefs.push(createRuleReference(ruleId))
    group.updatedAt = new Date().toISOString()
  }
  
  function removeRuleFromGroup(ruleId: string, groupId: string) {
    const group = ruleGroups.value.find(g => g.id === groupId)
    if (!group) return
    
    const index = group.ruleRefs.findIndex(ref => ref.ruleId === ruleId)
    if (index > -1) {
      group.ruleRefs.splice(index, 1)
      group.updatedAt = new Date().toISOString()
    }
  }
  
  function toggleRuleInGroup(ruleId: string, groupId: string) {
    const group = ruleGroups.value.find(g => g.id === groupId)
    if (!group) return
    
    const ref = group.ruleRefs.find(r => r.ruleId === ruleId)
    if (ref) {
      ref.enabled = !ref.enabled
      group.updatedAt = new Date().toISOString()
    }
  }
  
  // ========== 全局配置操作 ==========
  
  function setConflictResolution(strategy: ConflictResolutionStrategy) {
    conflictResolution.value = strategy
  }
  
  function setDefaultRulePriority(priority: number) {
    defaultRulePriority.value = Math.max(1, Math.min(100, priority))
  }
  
  function setDefaultGroupPriority(priority: number) {
    defaultGroupPriority.value = Math.max(1, Math.min(100, priority))
  }
  
  // ========== 导入/导出 ==========
  
  function exportConfiguration(): RuleConfiguration {
    return ruleConfiguration.value
  }
  
  function importConfiguration(config: RuleConfiguration) {
    independentRules.value = config.independentRules
    ruleGroups.value = config.ruleGroups
    defaultRulePriority.value = config.defaultRulePriority
    defaultGroupPriority.value = config.defaultGroupPriority
    conflictResolution.value = config.conflictResolution
  }
  
  // ========== 重置 ==========
  
  function resetToDefault() {
    independentRules.value = [createDefaultRule()]
    ruleGroups.value = []
    defaultRulePriority.value = 50
    defaultGroupPriority.value = 50
    conflictResolution.value = 'priority'
  }
  
  return {
    // 状态
    independentRules,
    ruleGroups,
    defaultRulePriority,
    defaultGroupPriority,
    conflictResolution,
    
    // 计算属性
    allRules,
    enabledIndependentRules,
    enabledRuleGroups,
    ruleConfiguration,
    
    // 独立规则操作
    addRule,
    removeRule,
    updateRule,
    toggleRule,
    
    // 规则组操作
    addRuleGroup,
    removeRuleGroup,
    updateRuleGroup,
    toggleRuleGroup,
    
    // 规则组内规则引用操作
    addRuleToGroup,
    removeRuleFromGroup,
    toggleRuleInGroup,
    
    // 全局配置操作
    setConflictResolution,
    setDefaultRulePriority,
    setDefaultGroupPriority,
    
    // 导入/导出
    exportConfiguration,
    importConfiguration,
    
    // 重置
    resetToDefault,
  }
})
