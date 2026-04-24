// 前端类型定义 - 与后端类型保持一致

export type PatternType =
  | 'consecutive'
  | 'repeating'
  | 'palindrome'
  | 'special_date'
  | 'custom_regex'
  | 'leading_zeros';

// ========== 规则引擎类型定义 ==========

export interface PatternRule {
  id: string;
  type: PatternType;
  params: {
    minLength?: number;
    pattern?: string;
    zeroCount?: number;
  };
  color: string; // 自定义高亮颜色
  enabled: boolean;
  // 规则引擎扩展字段
  priority?: number;        // 独立规则优先级 (1-100, 默认50)
  name?: string;            // 规则名称
  description?: string;     // 规则描述
}

// 规则组定义
export interface RuleGroup {
  id: string;
  name: string;             // 规则组名称
  description?: string;     // 规则组描述
  logicOperator: 'AND' | 'OR'; // 组内逻辑关系
  priority: number;         // 规则组优先级 (1-100, 默认50)
  enabled: boolean;         // 是否启用
  ruleRefs: RuleReference[]; // 组内规则引用列表
  createdAt: string;
  updatedAt: string;
}

// 规则引用（规则组中的规则）
export interface RuleReference {
  ruleId: string;           // 引用的规则ID
  rule?: PatternRule;       // 规则实例（运行时填充）
  enabled: boolean;         // 在此组中是否启用
}

// 规则配置（包含独立规则和规则组）
export interface RuleConfiguration {
  independentRules: PatternRule[];  // 独立规则列表
  ruleGroups: RuleGroup[];          // 规则组列表
  // 全局配置
  defaultRulePriority: number;      // 默认规则优先级
  defaultGroupPriority: number;     // 默认规则组优先级
  conflictResolution: ConflictResolutionStrategy; // 冲突解决策略
}

// 冲突解决策略
export type ConflictResolutionStrategy =
  | 'priority'      // 按优先级执行，高优先级覆盖低优先级
  | 'first-match'   // 第一个匹配的结果生效
   | 'all'           // 所有匹配结果都执行
  | 'group-first';  // 规则组结果优先于独立规则

// 执行结果
export interface ExecutionResult {
  matched: boolean;
  matchDetails: MatchDetail[];      // 所有匹配详情
  triggeredRules: TriggeredRule[];  // 触发的独立规则
  triggeredGroups: TriggeredGroup[]; // 触发的规则组
  finalResult: MatchDetail | null;  // 最终生效的结果（根据冲突策略）
}

// 匹配详情
export interface MatchDetail {
  ruleId: string;
  ruleName?: string;
  patternType: PatternType;
  patternId: string;
  position: number;
  matchedText: string;
  color: string;
  priority: number;
  isGroupResult: boolean;   // 是否来自规则组
  groupId?: string;         // 所属规则组ID
  groupName?: string;       // 所属规则组名称
}

// 触发的独立规则
export interface TriggeredRule {
  ruleId: string;
  ruleName?: string;
  priority: number;
  matchResult: MatchResult;
}

// 触发的规则组
export interface TriggeredGroup {
  groupId: string;
  groupName: string;
  priority: number;
  logicOperator: 'AND' | 'OR';
  matchedRules: MatchedRuleInGroup[];
}

// 规则组内匹配的规则
export interface MatchedRuleInGroup {
  ruleId: string;
  ruleName?: string;
  matchResult: MatchResult;
}

export interface MatchResult {
  matched: boolean;
  position: number;
  matchedText: string;
  patternId: string;
  color: string;
}

// ========== 任务和密钥类型 ==========

export interface MiningTask {
  id: string;
  status: 'running' | 'stopped' | 'completed';
  patterns: PatternRule[]; // 支持多条规则
  threads: number;
  startedAt: string;
  stoppedAt?: string;
  totalAttempts: number;
  matchesFound: number;
  // 规则引擎配置
  ruleConfig?: RuleConfiguration;
}

export interface SpecialKey {
  id: string;
  taskId: string;
  fingerprint: string;
  patternType: string;
  patternId: string; // 匹配的规则ID
  matchPosition: number;
  matchedText: string; // 匹配到的文本
  attemptsToFind: number;
  publicKeyArmored: string;
  color: string; // 高亮颜色
  createdAt: string;
  // 规则引擎扩展字段
  triggeredByGroup?: string;    // 由哪个规则组触发
  triggeredByRule?: string;     // 由哪个独立规则触发
  executionResult?: ExecutionResult; // 完整的执行结果
}

export interface PatternConfig {
  type: PatternType;
  params: {
    minLength?: number;
    pattern?: string;
    zeroCount?: number;
  };
}

export type SSEMessageType = 'progress' | 'match' | 'error' | 'complete';

export interface ProgressMessage {
  type: 'progress';
  taskId: string;
  attempts: number;
  hashrate: number;
  matchesFound: number;
  timestamp: number;
}

export interface MatchMessage {
  type: 'match';
  taskId: string;
  fingerprint: string;
  patternType: string;
  patternId: string;
  matchedText: string;
  color: string;
  attemptsToFind: number;
  publicKeyArmored: string; // 添加公钥内容
  // 规则引擎扩展字段
  executionResult?: ExecutionResult;
  triggeredByGroup?: string;
  triggeredByRule?: string;
}

export interface ErrorMessage {
  type: 'error';
  taskId: string;
  error: string;
}

export interface CompleteMessage {
  type: 'complete';
  taskId: string;
  totalAttempts: number;
  totalMatches: number;
}

export type SSEMessage = ProgressMessage | MatchMessage | ErrorMessage | CompleteMessage;

export interface StartMinerRequest {
  patterns: PatternRule[]; // 多条规则
  threads?: number;
  logicOperator?: 'AND' | 'OR'; // 筛选条件组合逻辑（向后兼容）
  ruleConfig?: RuleConfiguration; // 规则引擎配置
}

export interface StartMinerResponse {
  success: boolean;
  taskId?: string;
  error?: string;
}

export interface KeysListResponse {
  success: boolean;
  keys?: SpecialKey[];
  total?: number;
  page?: number;
  pageSize?: number;
}
