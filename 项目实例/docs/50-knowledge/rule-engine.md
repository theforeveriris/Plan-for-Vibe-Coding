# 规则引擎技术文档

## 1. 功能概述

规则引擎实现了高级筛选条件组合功能，支持：
- 独立规则（默认OR逻辑）
- 规则组（支持AND/OR逻辑）
- 优先级配置
- 冲突解决策略

> **设计原则**：规则引擎专注于**规则配置管理**，与**任务控制**完全分离。规则配置在"规则引擎"标签页进行，任务控制在"控制面板"标签页进行。

## 2. 架构设计

### 2.1 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                         Dashboard                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    TabContainer                       │   │
│  │  ┌──────────────┐  ┌──────────────────────────────┐  │   │
│  │  │  控制面板     │  │        规则引擎               │  │   │
│  │  │  MinerControl│  │    RuleGroupManager          │  │   │
│  │  │              │  │                              │  │   │
│  │  │ • 状态显示    │  │ • 独立规则管理               │  │   │
│  │  │ • 配置摘要(只读)│ • 规则组管理                 │  │   │
│  │  │ • 线程设置    │  │ • 全局配置                   │  │   │
│  │  │ • 开始/停止   │  │ • 导入/导出                  │  │   │
│  │  └──────────────┘  └──────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              useRuleEngineStore (Pinia)               │   │
│  │  • independentRules  • ruleGroups  • globalConfig    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 核心概念

#### 独立规则
- 默认采用OR逻辑关系
- 任一规则匹配即触发对应结果
- 各规则之间互不影响
- 可配置优先级（1-100，默认50）
- 规则可以被多个规则组引用

#### 规则组
- 允许创建规则组并将多条规则添加到同一组
- 支持AND和OR两种逻辑关系
- AND逻辑：所有规则都必须匹配才触发
- OR逻辑：任一规则匹配即触发
- 可配置优先级（1-100，默认50）
- 规则组内可单独启用/禁用某个规则引用

#### 规则引用
- 规则可以独立存在，也可以被添加到一个或多个规则组
- 在不同规则组中可应用不同的逻辑关系
- 规则组内可单独启用/禁用某个规则
- 删除独立规则时，自动从所有规则组中移除引用

### 2.3 执行优先级

当同时满足多个条件时，按照以下优先级顺序执行：
1. 优先级数值高的先执行（1-100，数值越大优先级越高）
2. 规则组和独立规则具有同等优先级地位
3. 最终根据冲突解决策略确定结果

### 2.4 冲突解决策略

- **priority**：按优先级执行，高优先级覆盖低优先级
- **first-match**：第一个匹配的结果生效
- **all**：所有匹配结果都执行
- **group-first**：规则组结果优先于独立规则

## 3. 技术实现

### 3.1 类型定义

```typescript
// 规则组
interface RuleGroup {
  id: string;
  name: string;
  description?: string;
  logicOperator: 'AND' | 'OR';
  priority: number;
  enabled: boolean;
  ruleRefs: RuleReference[];
  createdAt: string;
  updatedAt: string;
}

// 规则引用
interface RuleReference {
  ruleId: string;
  rule?: PatternRule;
  enabled: boolean;
}

// 规则配置
interface RuleConfiguration {
  independentRules: PatternRule[];
  ruleGroups: RuleGroup[];
  defaultRulePriority: number;
  defaultGroupPriority: number;
  conflictResolution: ConflictResolutionStrategy;
}

// 冲突解决策略
export type ConflictResolutionStrategy =
  | 'priority'      // 按优先级执行
  | 'first-match'   // 首个匹配
  | 'all'           // 全部执行
  | 'group-first';  // 规则组优先

// 执行结果
interface ExecutionResult {
  matched: boolean;
  matchDetails: MatchDetail[];
  triggeredRules: TriggeredRule[];
  triggeredGroups: TriggeredGroup[];
  finalResult: MatchDetail | null;
}

// 匹配详情
interface MatchDetail {
  ruleId: string;
  ruleName?: string;
  patternType: PatternType;
  patternId: string;
  position: number;
  matchedText: string;
  color: string;
  priority: number;
  isGroupResult: boolean;
  groupId?: string;
  groupName?: string;
}
```

### 3.2 后端实现

#### RuleEngine 类
```typescript
class RuleEngine {
  // 执行规则匹配
  execute(fingerprint: string): ExecutionResult
  
  // 评估独立规则（默认OR逻辑）
  private evaluateIndependentRules(fingerprint: string)
  
  // 评估规则组
  private evaluateRuleGroups(fingerprint: string)
  
  // 评估单个规则组
  private evaluateSingleGroup(fingerprint: string, group: RuleGroup)
  
  // 冲突解决
  private resolveConflicts(matchDetails, triggeredRules, triggeredGroups)
}
```

#### 与任务管理器集成
```typescript
// task-manager.ts
async startTask(
  patterns: PatternRule[], 
  threads: number = 4, 
  ruleConfig?: RuleConfiguration
): Promise<string> {
  const task: MiningTask = {
    // ... 其他字段
    ruleConfig, // 传递规则引擎配置
  };
  
  // 如果提供了规则引擎配置，使用 RuleEngine 进行匹配
  if (ruleConfig) {
    const ruleEngine = new RuleEngine(ruleConfig);
    const result = ruleEngine.execute(fingerprint);
    // 处理执行结果...
  }
}
```

### 3.3 前端实现

#### 状态管理（Pinia Store）
```typescript
const useRuleEngineStore = defineStore('ruleEngine', () => {
  // 状态
  const independentRules = ref<PatternRule[]>([createDefaultRule()])
  const ruleGroups = ref<RuleGroup[]>([])
  const defaultRulePriority = ref(50)
  const defaultGroupPriority = ref(50)
  const conflictResolution = ref<ConflictResolutionStrategy>('priority')
  
  // 计算属性
  const allRules = computed(() => { /* ... */ })
  const enabledIndependentRules = computed(() => /* ... */)
  const enabledRuleGroups = computed(() => /* ... */)
  const ruleConfiguration = computed<RuleConfiguration>(() => ({
    independentRules: independentRules.value,
    ruleGroups: ruleGroups.value,
    defaultRulePriority: defaultRulePriority.value,
    defaultGroupPriority: defaultGroupPriority.value,
    conflictResolution: conflictResolution.value,
  }))
  
  // 独立规则操作
  const addRule = (rule?: Partial<PatternRule>) => PatternRule
  const removeRule = (ruleId: string) => void
  const updateRule = (ruleId: string, updates: Partial<PatternRule>) => void
  const toggleRule = (ruleId: string) => void
  
  // 规则组操作
  const addRuleGroup = (name?, logicOperator?, priority?) => RuleGroup
  const removeRuleGroup = (groupId: string) => void
  const updateRuleGroup = (groupId: string, updates: Partial<RuleGroup>) => void
  const toggleRuleGroup = (groupId: string) => void
  
  // 规则组内规则引用操作
  const addRuleToGroup = (ruleId: string, groupId: string) => void
  const removeRuleFromGroup = (ruleId: string, groupId: string) => void
  const toggleRuleInGroup = (ruleId: string, groupId: string) => void
  
  // 全局配置操作
  const setConflictResolution = (strategy: ConflictResolutionStrategy) => void
  const setDefaultRulePriority = (priority: number) => void
  const setDefaultGroupPriority = (priority: number) => void
  
  // 导入/导出
  const exportConfiguration = () => RuleConfiguration
  const importConfiguration = (config: RuleConfiguration) => void
  
  // 重置
  const resetToDefault = () => void
})
```

#### UI组件

##### RuleGroupManager（规则引擎标签页）
```vue
<template>
  <div class="rule-group-manager">
    <!-- 全局配置 -->
    <div class="global-config">
      <h4>全局配置</h4>
      <div class="config-item">
        <label>冲突解决策略:</label>
        <select v-model="ruleEngineStore.conflictResolution">
          <option value="priority">按优先级</option>
          <option value="first-match">首个匹配</option>
          <option value="all">全部执行</option>
          <option value="group-first">规则组优先</option>
        </select>
      </div>
      <div class="config-item">
        <label>默认规则优先级: {{ ruleEngineStore.defaultRulePriority }}</label>
        <input type="range" v-model.number="ruleEngineStore.defaultRulePriority" min="1" max="100" />
      </div>
      <div class="config-item">
        <label>默认规则组优先级: {{ ruleEngineStore.defaultGroupPriority }}</label>
        <input type="range" v-model.number="ruleEngineStore.defaultGroupPriority" min="1" max="100" />
      </div>
    </div>

    <!-- 独立规则区域 -->
    <div class="independent-rules-section">
      <div class="section-header">
        <h4>独立规则 (默认OR逻辑)</h4>
        <button @click="addNewRule">+ 添加规则</button>
      </div>
      <div class="rules-list">
        <div v-for="rule in ruleEngineStore.independentRules" :key="rule.id" class="rule-card">
          <!-- 规则编辑表单 -->
        </div>
      </div>
    </div>

    <!-- 规则组区域 -->
    <div class="rule-groups-section">
      <div class="section-header">
        <h4>规则组</h4>
        <button @click="addNewGroup">+ 添加规则组</button>
      </div>
      <div class="groups-list">
        <div v-for="group in ruleEngineStore.ruleGroups" :key="group.id" class="group-card">
          <!-- 规则组编辑表单 -->
          <!-- 组内规则引用列表 -->
        </div>
      </div>
    </div>
  </div>
</template>
```

##### MinerControl（控制面板标签页）
```vue
<template>
  <div class="miner-control">
    <!-- 状态显示 -->
    <div class="control-header">
      <div class="status-badge" :class="{ running: isRunning }">
        {{ isRunning ? '运行中' : '已停止' }}
      </div>
    </div>

    <!-- 规则配置摘要（只读） -->
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
      <label>线程数: <input type="number" v-model.number="threads" min="1" max="8" /></label>
    </div>

    <!-- 控制按钮 -->
    <div class="control-buttons">
      <button @click="startMining" :disabled="isRunning || !hasEnabledRules">开始挖掘</button>
      <button @click="stopMining" :disabled="!isRunning">停止挖掘</button>
    </div>

    <!-- 提示信息 -->
    <div class="hint-text">
      💡 规则配置请切换到"规则引擎"标签页进行管理
    </div>
  </div>
</template>
```

## 4. 组件职责分离

### 4.1 职责划分

| 功能 | MinerControl (控制面板) | RuleGroupManager (规则引擎) |
|------|------------------------|----------------------------|
| **主要职责** | 任务控制 | 规则配置管理 |
| **规则编辑** | ❌ 不支持 | ✅ 完整支持 |
| **规则组管理** | ❌ 不支持 | ✅ 完整支持 |
| **全局配置** | ❌ 只读显示 | ✅ 可编辑 |
| **配置摘要** | ✅ 只读显示 | ❌ 不显示 |
| **线程设置** | ✅ 可编辑 | ❌ 不相关 |
| **任务控制** | ✅ 开始/停止 | ❌ 不相关 |
| **导入/导出** | ❌ 不支持 | ✅ 支持 |

### 4.2 数据流

```
RuleGroupManager (编辑)
    │
    ▼
useRuleEngineStore (状态更新)
    │
    ├──────────────────────┐
    ▼                      ▼
MinerControl (读取摘要)   后端 API (启动任务)
    │                      │
    │                      ▼
    │                  RuleEngine (执行匹配)
    │                      │
    │                      ▼
    │                  返回结果
    │                      │
    └──────────────────────┘
           (更新状态显示)
```

## 5. 使用流程

### 5.1 配置规则（在规则引擎标签页）
1. 切换到"规则引擎"标签页
2. 在"独立规则"区域点击"添加规则"
3. 配置规则类型、参数、颜色、优先级
4. （可选）在"规则组"区域点击"添加规则组"
5. 设置规则组名称、逻辑关系（AND/OR）、优先级
6. 从独立规则中选择规则添加到组内

### 5.2 启动任务（在控制面板标签页）
1. 切换到"控制面板"标签页
2. 查看规则配置摘要，确认配置正确
3. 设置线程数
4. 点击"开始挖掘"

### 5.3 配置导入/导出（在规则引擎标签页）
1. 点击"导出配置"保存当前配置到 JSON 文件
2. 点击"导入配置"加载已有配置

## 6. 文件清单

### 后端文件
- `src/backend/app/lib/pgp/types.ts` - 类型定义
- `src/backend/app/lib/pgp/rule-engine.ts` - 规则引擎核心
- `src/backend/app/lib/task-manager.ts` - 集成规则引擎到任务管理
- `src/backend/app/api/miner/start/route.ts` - 接收规则引擎配置

### 前端文件
- `src/frontend/src/types/index.ts` - 类型定义
- `src/frontend/src/stores/ruleEngine.ts` - 规则引擎状态管理
- `src/frontend/src/stores/miner.ts` - 挖掘状态管理（集成规则配置）
- `src/frontend/src/components/RuleGroupManager.vue` - 规则引擎管理界面
- `src/frontend/src/components/MinerControl.vue` - 任务控制面板（显示配置摘要）
- `src/frontend/src/views/Dashboard.vue` - 集成规则引擎标签页

## 7. 测试建议

### 7.1 独立规则测试
1. 创建多个独立规则
2. 验证OR逻辑（任一匹配即触发）
3. 验证优先级配置

### 7.2 规则组测试
1. 创建规则组并添加规则
2. 验证AND逻辑（所有规则必须匹配）
3. 验证OR逻辑（任一规则匹配）
4. 验证规则组优先级

### 7.3 冲突解决测试
1. 配置不同冲突策略
2. 验证优先级策略
3. 验证规则组优先策略

### 7.4 组件职责测试
1. 验证 MinerControl 不能编辑规则
2. 验证 RuleGroupManager 不能控制任务
3. 验证配置摘要在 MinerControl 中正确显示
4. 验证规则修改后在 MinerControl 中同步更新

### 7.5 导入导出测试
1. 导出配置
2. 修改配置
3. 导入配置
4. 验证配置一致性
