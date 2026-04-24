// 筛选规则实现
import type { PatternConfig, MatchResult } from './types';

/**
 * 匹配连续数字
 * @param fingerprint 十六进制指纹
 * @param minLength 最小连续长度
 */
export function matchConsecutive(fingerprint: string, minLength: number): MatchResult {
  const hexPattern = /(\w)\1{${minLength - 1},}/g;
  const match = hexPattern.exec(fingerprint);
  
  if (match) {
    return {
      matched: true,
      position: match.index,
      matchedText: match[0],
    };
  }
  
  return {
    matched: false,
    position: -1,
    matchedText: '',
  };
}

/**
 * 匹配重复数字序列
 * @param fingerprint 十六进制指纹
 * @param minLength 最小重复长度
 */
export function matchRepeating(fingerprint: string, minLength: number): MatchResult {
  // 匹配重复的数字序列，如 "123123"
  const pattern = new RegExp(`(\w{${minLength}})\1+`, 'g');
  const match = pattern.exec(fingerprint);
  
  if (match) {
    return {
      matched: true,
      position: match.index,
      matchedText: match[0],
    };
  }
  
  return {
    matched: false,
    position: -1,
    matchedText: '',
  };
}

/**
 * 匹配回文数字
 * @param fingerprint 十六进制指纹
 */
export function matchPalindrome(fingerprint: string): MatchResult {
  // 查找长度 >= 6 的回文
  for (let length = Math.min(10, fingerprint.length); length >= 6; length--) {
    for (let i = 0; i <= fingerprint.length - length; i++) {
      const substring = fingerprint.substring(i, i + length);
      const reversed = substring.split('').reverse().join('');
      
      if (substring === reversed) {
        return {
          matched: true,
          position: i,
          matchedText: substring,
        };
      }
    }
  }
  
  return {
    matched: false,
    position: -1,
    matchedText: '',
  };
}

/**
 * 匹配特殊日期
 * @param fingerprint 十六进制指纹
 * @param pattern 日期模式，如 "19990101"
 */
export function matchSpecialDate(fingerprint: string, pattern: string): MatchResult {
  if (!pattern) {
    return {
      matched: false,
      position: -1,
      matchedText: '',
    };
  }
  
  const position = fingerprint.indexOf(pattern);
  if (position !== -1) {
    return {
      matched: true,
      position,
      matchedText: pattern,
    };
  }
  
  return {
    matched: false,
    position: -1,
    matchedText: '',
  };
}

/**
 * 匹配自定义正则
 * @param fingerprint 十六进制指纹
 * @param pattern 正则表达式字符串
 */
export function matchRegex(fingerprint: string, pattern: string): MatchResult {
  try {
    const regex = new RegExp(pattern, 'g');
    const match = regex.exec(fingerprint);
    
    if (match) {
      return {
        matched: true,
        position: match.index,
        matchedText: match[0],
      };
    }
  } catch (error) {
    console.error('Invalid regex pattern:', error);
  }
  
  return {
    matched: false,
    position: -1,
    matchedText: '',
  };
}

/**
 * 匹配前导零
 * @param fingerprint 十六进制指纹
 * @param zeroCount 前导零数量
 */
export function matchLeadingZeros(fingerprint: string, zeroCount: number): MatchResult {
  const pattern = new RegExp(`^0{${zeroCount},}`);
  const match = pattern.exec(fingerprint);
  
  if (match) {
    return {
      matched: true,
      position: 0,
      matchedText: match[0],
    };
  }
  
  return {
    matched: false,
    position: -1,
    matchedText: '',
  };
}

/**
 * 根据配置匹配指纹
 * @param fingerprint 十六进制指纹
 * @param config 规则配置
 */
export function matchesPattern(fingerprint: string, config: PatternConfig): MatchResult {
  // 预处理：移除空格，转换为大写
  const hexFingerprint = fingerprint.replace(/ /g, '').toUpperCase();
  
  switch (config.type) {
    case 'consecutive':
      return matchConsecutive(hexFingerprint, config.params.minLength || 5);
    case 'repeating':
      return matchRepeating(hexFingerprint, config.params.minLength || 3);
    case 'palindrome':
      return matchPalindrome(hexFingerprint);
    case 'special_date':
      return matchSpecialDate(hexFingerprint, config.params.pattern || '');
    case 'custom_regex':
      return matchRegex(hexFingerprint, config.params.pattern || '');
    case 'leading_zeros':
      return matchLeadingZeros(hexFingerprint, config.params.zeroCount || 5);
    default:
      return {
        matched: false,
        position: -1,
        matchedText: '',
      };
  }
}