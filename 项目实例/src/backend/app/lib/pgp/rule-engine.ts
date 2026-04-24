// 规则引擎核心实现
import type {
  PatternRule,
  RuleGroup,
  RuleConfiguration,
  RuleReference,
  ExecutionResult,
  MatchDetail,
  TriggeredRule,
  TriggeredGroup,
  MatchedRuleInGroup,
  MatchResult,
  ConflictResolutionStrategy,
} from './types';
import { matchesPattern } from './patterns';

/**
 * 规则引擎类
 * 实现规则组、优先级、冲突解决等高级功能
 */
export class RuleEngine {
  private config: RuleConfiguration;

  constructor(config: RuleConfiguration) {
    this.config = config;
  }

  /**
   * 执行规则匹配
   * @param fingerprint 公钥指纹
   * @returns 执行结果
   */
  execute(fingerprint: string): ExecutionResult {
    const matchDetails: MatchDetail[] = [];
    const triggeredRules: TriggeredRule[] = [];
    const triggeredGroups: TriggeredGroup[] = [];

    // 1. 评估独立规则（默认OR逻辑）
    const independentResults = this.evaluateIndependentRules(fingerprint);
    matchDetails.push(...independentResults.matchDetails);
    triggeredRules.push(...independentResults.triggeredRules);

    // 2. 评估规则组
    const groupResults = this.evaluateRuleGroups(fingerprint);
    matchDetails.push(...groupResults.matchDetails);
    triggeredGroups.push(...groupResults.triggeredGroups);

    // 3. 根据冲突解决策略确定最终结果
    const finalResult = this.resolveConflicts(
      matchDetails,
      triggeredRules,
      triggeredGroups
    );

    return {
      matched: matchDetails.length > 0,
      matchDetails,
      triggeredRules,
      triggeredGroups,
      finalResult,
    };
  }

  /**
   * 评估独立规则
   * 独立规则默认采用OR逻辑：任一规则匹配即触发
   */
  private evaluateIndependentRules(fingerprint: string): {
    matchDetails: MatchDetail[];
    triggeredRules: TriggeredRule[];
  } {
    const matchDetails: MatchDetail[] = [];
    const triggeredRules: TriggeredRule[] = [];

    const enabledRules = this.config.independentRules.filter(r => r.enabled);

    for (const rule of enabledRules) {
      const result = matchesPattern(fingerprint, [rule], 'OR');

      if (result.matched) {
        const priority = rule.priority ?? this.config.defaultRulePriority;

        matchDetails.push({
          ruleId: rule.id,
          ruleName: rule.name,
          patternType: rule.type,
          patternId: result.patternId,
          position: result.position,
          matchedText: result.matchedText,
          color: result.color,
          priority,
          isGroupResult: false,
        });

        triggeredRules.push({
          ruleId: rule.id,
          ruleName: rule.name,
          priority,
          matchResult: result,
        });
      }
    }

    return { matchDetails, triggeredRules };
  }

  /**
   * 评估规则组
   */
  private evaluateRuleGroups(fingerprint: string): {
    matchDetails: MatchDetail[];
    triggeredGroups: TriggeredGroup[];
  } {
    const matchDetails: MatchDetail[] = [];
    const triggeredGroups: TriggeredGroup[] = [];

    const enabledGroups = this.config.ruleGroups.filter(g => g.enabled);

    for (const group of enabledGroups) {
      const groupResult = this.evaluateSingleGroup(fingerprint, group);

      if (groupResult.matched) {
        matchDetails.push(...groupResult.matchDetails);
        triggeredGroups.push(groupResult.triggeredGroup);
      }
    }

    return { matchDetails, triggeredGroups };
  }

  /**
   * 评估单个规则组
   */
  private evaluateSingleGroup(
    fingerprint: string,
    group: RuleGroup
  ): {
    matched: boolean;
    matchDetails: MatchDetail[];
    triggeredGroup: TriggeredGroup;
  } {
    const matchedRules: MatchedRuleInGroup[] = [];
    const matchDetails: MatchDetail[] = [];

    // 获取组内启用的规则
    const enabledRuleRefs = group.ruleRefs.filter(ref => ref.enabled);

    for (const ref of enabledRuleRefs) {
      const rule = this.findRuleById(ref.ruleId);
      if (!rule || !rule.enabled) continue;

      const result = matchesPattern(fingerprint, [rule], 'OR');

      if (result.matched) {
        matchedRules.push({
          ruleId: rule.id,
          ruleName: rule.name,
          matchResult: result,
        });

        matchDetails.push({
          ruleId: rule.id,
          ruleName: rule.name,
          patternType: rule.type,
          patternId: result.patternId,
          position: result.position,
          matchedText: result.matchedText,
          color: result.color,
          priority: group.priority,
          isGroupResult: true,
          groupId: group.id,
          groupName: group.name,
        });
      }
    }

    // 根据规则组的逻辑关系判断是否触发
    let groupMatched: boolean;

    if (group.logicOperator === 'AND') {
      // AND逻辑：所有规则都必须匹配
      groupMatched = matchedRules.length === enabledRuleRefs.length && enabledRuleRefs.length > 0;
    } else {
      // OR逻辑：任一规则匹配即可
      groupMatched = matchedRules.length > 0;
    }

    return {
      matched: groupMatched,
      matchDetails: groupMatched ? matchDetails : [],
      triggeredGroup: {
        groupId: group.id,
        groupName: group.name,
        priority: group.priority,
        logicOperator: group.logicOperator,
        matchedRules,
      },
    };
  }

  /**
   * 冲突解决
   * 根据配置的冲突解决策略确定最终结果
   */
  private resolveConflicts(
    matchDetails: MatchDetail[],
    triggeredRules: TriggeredRule[],
    triggeredGroups: TriggeredGroup[]
  ): MatchDetail | null {
    if (matchDetails.length === 0) return null;

    const strategy = this.config.conflictResolution;

    switch (strategy) {
      case 'priority':
        return this.resolveByPriority(matchDetails);
      case 'first-match':
        return matchDetails[0];
      case 'all':
        // 返回优先级最高的结果，但所有结果都会记录
        return this.resolveByPriority(matchDetails);
      case 'group-first':
        return this.resolveGroupFirst(matchDetails, triggeredGroups);
      default:
        return this.resolveByPriority(matchDetails);
    }
  }

  /**
   * 按优先级解决冲突
   * 优先级数字越大，优先级越高
   */
  private resolveByPriority(matchDetails: MatchDetail[]): MatchDetail | null {
    if (matchDetails.length === 0) return null;

    return matchDetails.reduce((highest, current) => {
      return current.priority > highest.priority ? current : highest;
    });
  }

  /**
   * 规则组优先策略
   * 优先返回规则组的结果，如果没有规则组匹配，则返回独立规则结果
   */
  private resolveGroupFirst(
    matchDetails: MatchDetail[],
    triggeredGroups: TriggeredGroup[]
  ): MatchDetail | null {
    // 先找规则组的结果
    const groupResults = matchDetails.filter(m => m.isGroupResult);
    if (groupResults.length > 0) {
      return this.resolveByPriority(groupResults);
    }

    // 没有规则组匹配，返回独立规则结果
    const independentResults = matchDetails.filter(m => !m.isGroupResult);
    if (independentResults.length > 0) {
      return this.resolveByPriority(independentResults);
    }

    return null;
  }

  /**
   * 根据规则ID查找规则
   */
  private findRuleById(ruleId: string): PatternRule | undefined {
    // 先在独立规则中查找
    const independentRule = this.config.independentRules.find(r => r.id === ruleId);
    if (independentRule) return independentRule;

    // 再在规则组中查找
    for (const group of this.config.ruleGroups) {
      const ref = group.ruleRefs.find(r => r.ruleId === ruleId);
      if (ref && ref.rule) return ref.rule;
    }

    return undefined;
  }

  /**
   * 更新规则配置
   */
  updateConfig(config: RuleConfiguration): void {
    this.config = config;
  }

  /**
   * 获取当前配置
   */
  getConfig(): RuleConfiguration {
    return this.config;
  }
}

/**
 * 创建默认规则配置
 */
export function createDefaultRuleConfiguration(
  rules: PatternRule[]
): RuleConfiguration {
  return {
    independentRules: rules.map(rule => ({
      ...rule,
      priority: rule.priority ?? 50,
    })),
    ruleGroups: [],
    defaultRulePriority: 50,
    defaultGroupPriority: 50,
    conflictResolution: 'priority',
  };
}

/**
 * 创建规则组
 */
export function createRuleGroup(
  name: string,
  logicOperator: 'AND' | 'OR' = 'OR',
  priority: number = 50
): RuleGroup {
  return {
    id: generateId(),
    name,
    description: '',
    logicOperator,
    priority,
    enabled: true,
    ruleRefs: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * 创建规则引用
 */
export function createRuleReference(
  ruleId: string,
  enabled: boolean = true
): RuleReference {
  return {
    ruleId,
    enabled,
  };
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
