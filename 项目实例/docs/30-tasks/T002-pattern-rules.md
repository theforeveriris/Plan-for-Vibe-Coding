# T002: 筛选规则实现

## 元信息
- 状态：待开始 | 优先级：P0 | 故事点：5
- 负责人：Claude（编码）+ @developer（验收）
- 迭代：Sprint 1（2026-04-20 ~ 2026-05-03）
- 关联：US-001, US-004

## 目标
实现多种筛选规则，支持连续数字、回文、特殊日期、正则匹配等模式。

## 已完成 [DONE]
- [ ] （未开始）

## 进行中 [IN PROGRESS]
- [ ] （未开始）

## 待开始 [TODO]
- [ ] 实现 Pattern 接口定义
- [ ] 实现 consecutive 规则（连续数字）
- [ ] 实现 repeating 规则（重复数字）
- [ ] 实现 palindrome 规则（回文）
- [ ] 实现 special_date 规则（特殊日期）
- [ ] 实现 custom_regex 规则（自定义正则）
- [ ] 实现 leading_zeros 规则（前导零）
- [ ] 实现规则组合（AND/OR）

## 代码地图（Code Map）
/backend/
|-- app/
|   |-- lib/
|   |   |-- pgp/
|   |   |   |-- patterns.ts    # 筛选规则实现

## 规则定义

```typescript
// 规则配置
type PatternType =
  | 'consecutive'    // 连续数字
  | 'repeating'      // 重复数字
  | 'palindrome'      // 回文
  | 'special_date'    // 特殊日期
  | 'custom_regex'    // 自定义正则
  | 'leading_zeros';  // 前导零

interface PatternConfig {
  type: PatternType;
  params: {
    minLength?: number;        // consecutive, repeating
    pattern?: string;          // custom_regex, special_date
    zeroCount?: number;        // leading_zeros
  };
}

// 匹配结果
interface MatchResult {
  matched: boolean;
  position: number;           // 匹配位置
  matchedText: string;        // 匹配的文本
}
```

## 风险与阻塞
| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 正则表达式危险输入 | 中 | 高 | 校验并限制正则复杂度 |

## 依赖
- 依赖：T001 完成