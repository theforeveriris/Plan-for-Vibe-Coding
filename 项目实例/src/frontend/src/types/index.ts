// 前端类型定义 - 与后端类型保持一致

export type PatternType =
  | 'consecutive'
  | 'repeating'
  | 'palindrome'
  | 'special_date'
  | 'custom_regex'
  | 'leading_zeros';

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
}

export interface PatternConfig {
  type: PatternType;
  params: {
    minLength?: number;
    pattern?: string;
    zeroCount?: number;
  };
}

export interface MiningTask {
  id: string;
  status: 'running' | 'stopped' | 'completed';
  patterns: PatternRule[]; // 支持多条规则
  threads: number;
  startedAt: string;
  stoppedAt?: string;
  totalAttempts: number;
  matchesFound: number;
  logicOperator?: 'AND' | 'OR'; // 筛选条件组合逻辑
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
  logicOperator?: 'AND' | 'OR'; // 筛选条件组合逻辑
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
