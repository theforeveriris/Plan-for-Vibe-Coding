// PGP Key Pair Types

export interface KeyPair {
  publicKey: string;      // ASCII armored 公钥
  privateKey: string;     // ASCII armored 私钥（不存储）
  fingerprint: string;    // 公钥指纹
}

export interface MiningTask {
  id: string;
  status: 'running' | 'stopped' | 'completed';
  pattern: PatternConfig;
  threads: number;
  startedAt: Date;
  stoppedAt?: Date;
  totalAttempts: number;
  matchesFound: number;
}

export interface SpecialKey {
  id: string;
  taskId: string;
  fingerprint: string;
  patternType: PatternType;
  matchPosition: number;
  attemptsToFind: number;
  publicKeyArmored: string;
  createdAt: Date;
}

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

export interface MatchResult {
  matched: boolean;
  position: number;
  matchedText: string;
}

// SSE Message Types
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