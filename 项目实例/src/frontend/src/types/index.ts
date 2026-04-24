// 前端类型定义 - 与后端类型保持一致

export type PatternType =
  | 'consecutive'
  | 'repeating'
  | 'palindrome'
  | 'special_date'
  | 'custom_regex'
  | 'leading_zeros';

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
  pattern: PatternConfig;
  threads: number;
  startedAt: string;
  stoppedAt?: string;
  totalAttempts: number;
  matchesFound: number;
}

export interface SpecialKey {
  id: string;
  taskId: string;
  fingerprint: string;
  patternType: string;
  matchPosition: number;
  attemptsToFind: number;
  publicKeyArmored: string;
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
  attemptsToFind: number;
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
  patternType: PatternType;
  patternConfig: PatternConfig['params'];
  threads?: number;
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