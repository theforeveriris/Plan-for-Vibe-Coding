// 筛选规则实现
import type { PatternType, PatternRule, MatchResult } from './types';

/**
 * 检查指纹是否匹配给定的规则列表
 * @param fingerprint 公钥指纹
 * @param rules 规则列表
 * @param logicOperator 逻辑关系: 'AND' 或 'OR' (默认 'OR')
 * @returns 匹配结果
 */
export function matchesPattern(
  fingerprint: string,
  rules: PatternRule[],
  logicOperator: 'AND' | 'OR' = 'OR'
): MatchResult {
  const enabledRules = rules.filter(rule => rule.enabled);

  if (enabledRules.length === 0) {
    return {
      matched: false,
      position: -1,
      matchedText: '',
      patternId: '',
      color: '',
    };
  }

  if (logicOperator === 'AND') {
    // AND 逻辑：所有启用的规则都必须匹配
    let allMatched = true;
    let firstMatchResult: MatchResult | null = null;

    for (const rule of enabledRules) {
      const result = matchSinglePattern(fingerprint, rule);
      if (!result.matched) {
        allMatched = false;
        break;
      }
      // 保存第一个匹配结果用于返回
      if (!firstMatchResult) {
        firstMatchResult = {
          matched: true,
          position: result.position,
          matchedText: result.matchedText,
          patternId: rule.id,
          color: rule.color,
        };
      }
    }

    if (allMatched && firstMatchResult) {
      return firstMatchResult;
    }

    return {
      matched: false,
      position: -1,
      matchedText: '',
      patternId: '',
      color: '',
    };
  } else {
    // OR 逻辑：任一规则匹配即返回（原有逻辑）
    for (const rule of enabledRules) {
      const result = matchSinglePattern(fingerprint, rule);
      if (result.matched) {
        return {
          matched: true,
          position: result.position,
          matchedText: result.matchedText,
          patternId: rule.id,
          color: rule.color,
        };
      }
    }

    return {
      matched: false,
      position: -1,
      matchedText: '',
      patternId: '',
      color: '',
    };
  }
}

function matchSinglePattern(fingerprint: string, rule: PatternRule): { matched: boolean; position: number; matchedText: string } {
  switch (rule.type) {
    case 'consecutive':
      return matchConsecutive(fingerprint, rule.params.minLength || 5);
    case 'repeating':
      return matchRepeating(fingerprint, rule.params.minLength || 3);
    case 'palindrome':
      return matchPalindrome(fingerprint, rule.params.minLength || 5);
    case 'special_date':
      return matchSpecialDate(fingerprint, rule.params.pattern || '');
    case 'custom_regex':
      return matchCustomRegex(fingerprint, rule.params.pattern || '');
    case 'leading_zeros':
      return matchLeadingZeros(fingerprint, rule.params.zeroCount || 5);
    default:
      return { matched: false, position: -1, matchedText: '' };
  }
}

export function matchConsecutive(fingerprint: string, minLength: number): { matched: boolean; position: number; matchedText: string } {
  const hexPattern = new RegExp(`(\\w)\\1{${minLength - 1},}`, 'g');
  const match = hexPattern.exec(fingerprint);

  if (match) {
    return {
      matched: true,
      position: match.index,
      matchedText: match[0],
    };
  }

  return { matched: false, position: -1, matchedText: '' };
}

export function matchRepeating(fingerprint: string, minLength: number): { matched: boolean; position: number; matchedText: string } {
  // 匹配重复的数字序列，如 "123123"
  const pattern = new RegExp(`(\\w{${minLength}})\\1+`, 'g');
  const match = pattern.exec(fingerprint);

  if (match) {
    return {
      matched: true,
      position: match.index,
      matchedText: match[0],
    };
  }

  return { matched: false, position: -1, matchedText: '' };
}

export function matchPalindrome(fingerprint: string, minLength: number): { matched: boolean; position: number; matchedText: string } {
  for (let i = 0; i <= fingerprint.length - minLength; i++) {
    const substring = fingerprint.substring(i, i + minLength);
    if (isPalindrome(substring)) {
      return {
        matched: true,
        position: i,
        matchedText: substring,
      };
    }
  }

  return { matched: false, position: -1, matchedText: '' };
}

function isPalindrome(str: string): boolean {
  const cleaned = str.toLowerCase();
  return cleaned === cleaned.split('').reverse().join('');
}

export function matchSpecialDate(fingerprint: string, datePattern: string): { matched: boolean; position: number; matchedText: string } {
  if (!datePattern) return { matched: false, position: -1, matchedText: '' };

  const index = fingerprint.indexOf(datePattern);
  if (index !== -1) {
    return {
      matched: true,
      position: index,
      matchedText: datePattern,
    };
  }

  return { matched: false, position: -1, matchedText: '' };
}

export function matchCustomRegex(fingerprint: string, regex: string): { matched: boolean; position: number; matchedText: string } {
  if (!regex) return { matched: false, position: -1, matchedText: '' };

  try {
    const pattern = new RegExp(regex, 'g');
    const match = pattern.exec(fingerprint);

    if (match) {
      return {
        matched: true,
        position: match.index,
        matchedText: match[0],
      };
    }
  } catch (error) {
    console.error('Invalid regex:', error);
  }

  return { matched: false, position: -1, matchedText: '' };
}

export function matchLeadingZeros(fingerprint: string, zeroCount: number): { matched: boolean; position: number; matchedText: string } {
  const zeros = '0'.repeat(zeroCount);
  const index = fingerprint.indexOf(zeros);

  if (index !== -1) {
    return {
      matched: true,
      position: index,
      matchedText: zeros,
    };
  }

  return { matched: false, position: -1, matchedText: '' };
}
