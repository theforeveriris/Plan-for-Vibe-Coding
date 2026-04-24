# 规则引擎技术文档

## 1. 功能概述

规则引擎实现了高级筛选条件组合功能，支持：
- 独立规则（默认OR逻辑）
- 规则组（支持AND/OR逻辑）
- 优先级配置
- 冲突解决策略

## 2. 架构设计

### 2.1 核心概念

#### 独立规则
- 默认采用OR逻辑关系
- 任一规则匹配即触发对应结果
- 各规则之间互不影响
- 可配置优先级（1-100，默认50）

#### 规则组
- 允许创建规则组并将多条规则添加到同一组
- 支持AND和OR两种逻辑关系
- AND逻辑：所有规则都必须匹配才触发
- OR逻辑：任一规则匹配即触发
- 可配置优先级（1-100，默认50）

#### 规则引用
- 规则可以独立存在，也可以被添加到一个或多个规则组
- 在不同规则组中可应用不同的逻辑关系
- 规则组内可单独启用/禁用某个规则

### 2.2 执行优先级

当同时满足多个条件时，按照以下优先级顺序执行：
1. 优先级数值高的先执行（1-100，数值越大优先级越高）
2. 规则组和独立规则具有同等优先级地位
3. 最终根据冲突解决策略确定结果

### 2.3 冲突解决策略

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
  logicOperator: 'AND' | 'OR';
  priority: number;
  enabled: boolean;
  ruleRefs: RuleReference[];
}

// 规则引用
interface RuleReference {
  ruleId: string;
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

// 执行结果
interface ExecutionResult {
  matched: boolean;
  matchDetails: MatchDetail[];
  triggeredRules: TriggeredRule[];
  triggeredGroups: TriggeredGroup[];
  finalResult: MatchDetail | null;
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

### 3.3 前端实现

#### 状态管理（Pinia Store）
```typescript
const useRuleEngineStore = defineStore('ruleEngine', () => {
  // 状态
  const independentRules = ref<PatternRule[]>([])
  const ruleGroups = ref<RuleGroup[]>([])
  
  // 规则操作
  const addRule = () => PatternRule
  const removeRule = (ruleId: string) => void
  const updateRule = (ruleId: string, updates: Partial<PatternRule>) => void
  
  // 规则组操作
  const addRuleGroup = () => RuleGroup
  const removeRuleGroup = (groupId: string) => void
  const addRuleToGroup = (ruleId: string, groupId: string) => void
  
  // 配置操作
  const setConflictResolution = (strategy: ConflictResolutionStrategy) => void
  const exportConfiguration = () => RuleConfiguration
  const importConfiguration = (config: RuleConfiguration) => void
})
```

#### UI组件
- **RuleGroupManager**：规则组管理主界面
  - 全局配置（冲突策略、默认优先级）
  - 独立规则管理
  - 规则组管理
  - 规则组内规则引用管理
  - 配置导入/导出

## 4. 使用流程

### 4.1 创建规则
1. 在"规则引擎"标签页中
2. 点击"添加规则"创建独立规则
3. 配置规则类型、参数、颜色、优先级

### 4.2 创建规则组
1. 点击"添加规则组"
2. 设置规则组名称
3. 选择逻辑关系（AND/OR）
4. 设置优先级
5. 从独立规则中选择添加到组内

### 4.3 配置冲突策略
1. 在全局配置区域
2. 选择冲突解决策略
3. 设置默认优先级

### 4.4 导出/导入配置
1. 点击"导出配置"保存当前配置
2. 点击"导入配置"加载已有配置

## 5. 文件清单

### 后端文件
- `src/backend/app/lib/pgp/types.ts` - 类型定义
- `src/backend/app/lib/pgp/rule-engine.ts` - 规则引擎核心

### 前端文件
- `src/frontend/src/types/index.ts` - 类型定义
- `src/frontend/src/stores/ruleEngine.ts` - 状态管理
- `src/frontend/src/components/RuleGroupManager.vue` - UI组件
- `src/frontend/src/views/Dashboard.vue` - 集成规则引擎标签页

## 6. 测试建议

### 6.1 独立规则测试
1. 创建多个独立规则
2. 验证OR逻辑（任一匹配即触发）
3. 验证优先级配置

### 6.2 规则组测试
1. 创建规则组并添加规则
2. 验证AND逻辑（所有规则必须匹配）
3. 验证OR逻辑（任一规则匹配）
4. 验证规则组优先级

### 6.3 冲突解决测试
1. 配置不同冲突策略
2. 验证优先级策略
3. 验证规则组优先策略

### 6.4 导入导出测试
1. 导出配置
2. 修改配置
3. 导入配置
4. 验证配置一致性
