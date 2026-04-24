# 功能优化技术文档

## 1. 筛选条件组合逻辑配置功能

### 1.1 功能概述
实现了筛选条件的组合逻辑配置功能，允许用户为多个筛选条件设置"与(AND)"或"或(OR)"的逻辑关系。

### 1.2 技术实现

#### 1.2.1 后端实现
- **类型定义更新**：在 `types.ts` 中添加了 `logicOperator` 字段
  ```typescript
  export interface MiningTask {
    // ... 其他字段
    logicOperator?: 'AND' | 'OR'; // 筛选条件组合逻辑
  }
  ```

- **匹配逻辑实现**：在 `patterns.ts` 中实现了 AND/OR 逻辑
  ```typescript
  export function matchesPattern(
    fingerprint: string,
    rules: PatternRule[],
    logicOperator: 'AND' | 'OR' = 'OR'
  ): MatchResult {
    const enabledRules = rules.filter(rule => rule.enabled);

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

      return allMatched && firstMatchResult ? firstMatchResult : { matched: false, ... };
    } else {
      // OR 逻辑：任一规则匹配即返回
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
      return { matched: false, ... };
    }
  }
  ```

- **任务管理器更新**：在 `task-manager.ts` 中传递逻辑运算符
  ```typescript
  async startTask(patterns: PatternRule[], threads: number = 4, logicOperator: 'AND' | 'OR' = 'OR'): Promise<string> {
    const task: MiningTask = {
      // ... 其他字段
      logicOperator,
    };
    // ...
  }
  ```

- **API 路由更新**：在 `start/route.ts` 中接收逻辑运算符参数
  ```typescript
  const StartMinerSchema = z.object({
    patterns: z.array(PatternRuleSchema).min(1),
    threads: z.number().min(1).max(8).default(4),
    logicOperator: z.enum(['AND', 'OR']).default('OR'),
  });
  ```

#### 1.2.2 前端实现
- **类型定义更新**：在 `types/index.ts` 中添加逻辑运算符
  ```typescript
  export interface StartMinerRequest {
    patterns: PatternRule[];
    threads?: number;
    logicOperator?: 'AND' | 'OR';
  }
  ```

- **状态管理更新**：在 `miner.ts` 中添加逻辑运算符状态
  ```typescript
  const logicOperator = ref<'AND' | 'OR'>('OR')
  ```

- **UI 组件更新**：在 `MinerControl.vue` 中添加逻辑关系选择控件
  ```vue
  <div class="logic-section">
    <label class="logic-label">筛选逻辑关系:</label>
    <div class="logic-toggle">
      <button
        class="pill-tab"
        :class="{ active: logicOperator === 'OR' }"
        @click="logicOperator = 'OR'"
        title="任一条件匹配即通过"
      >
        或 (OR)
      </button>
      <button
        class="pill-tab"
        :class="{ active: logicOperator === 'AND' }"
        @click="logicOperator = 'AND'"
        title="所有条件都必须匹配"
      >
        与 (AND)
      </button>
    </div>
    <div class="logic-hint">
      {{ logicOperator === 'OR' ? '任一规则匹配即视为特殊密钥' : '所有启用的规则都必须匹配' }}
    </div>
  </div>
  ```

### 1.3 功能特点
- **视觉反馈**：当前选中的逻辑关系按钮会高亮显示
- **提示信息**：根据选择的逻辑关系显示相应的提示文字
- **实时切换**：用户可以在任务启动前随时切换逻辑关系
- **默认状态**：默认使用 OR 逻辑，保持向后兼容

## 2. 密钥下载功能修复

### 2.1 问题分析
原代码中存在以下问题：
1. **公钥内容为空**：`handleMatch` 方法没有将公钥内容传递给 SSE 消息
2. **前端未保存公钥**：`miner.ts` 中的 `handleSSEMessage` 没有保存 `publicKeyArmored`
3. **下载函数未校验**：`KeyCard.vue` 中的下载函数没有校验公钥内容是否为空

### 2.2 修复方案

#### 2.2.1 后端修复
- **更新 MatchMessage 类型**：确保包含公钥内容
  ```typescript
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
  ```

- **修复 handleMatch 方法**：在 `task-manager.ts` 中传递公钥内容
  ```typescript
  private handleMatch(taskId: string, key: KeyPair, matchResult: MatchResult, attempts: number) {
    // ...
    const message: SSEMessage = {
      type: 'match',
      taskId,
      fingerprint: key.fingerprint,
      patternType: matchedRule?.type || 'unknown',
      patternId: matchResult.patternId,
      matchedText: matchResult.matchedText,
      color: matchResult.color,
      attemptsToFind: attempts,
      publicKeyArmored: key.publicKey, // 包含完整的公钥内容
    };
    // ...
  }
  ```

#### 2.2.2 前端修复
- **更新类型定义**：在 `types/index.ts` 中添加公钥字段
  ```typescript
  export interface SpecialKey {
    // ... 其他字段
    publicKeyArmored: string;
  }
  ```

- **保存公钥内容**：在 `miner.ts` 中保存公钥
  ```typescript
  case 'match':
    const newKey: SpecialKey = {
      // ... 其他字段
      publicKeyArmored: message.publicKeyArmored, // 保存公钥内容
    }
    matches.value.unshift(newKey)
  ```

- **添加下载校验**：在 `KeyCard.vue` 中添加内容校验
  ```typescript
  function downloadKey() {
    // 校验公钥内容
    if (!props.keyData.publicKeyArmored || props.keyData.publicKeyArmored.trim() === '') {
      alert('公钥内容为空，无法下载')
      console.error('公钥内容为空:', props.keyData)
      return
    }

    // 校验公钥格式
    if (!props.keyData.publicKeyArmored.includes('-----BEGIN PGP PUBLIC KEY BLOCK-----')) {
      alert('公钥格式不正确')
      console.error('公钥格式不正确:', props.keyData.publicKeyArmored)
      return
    }

    try {
      const blob = new Blob([props.keyData.publicKeyArmored], {
        type: 'text/plain;charset=utf-8'
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `pgp-key-${props.keyData.fingerprint}.asc`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      console.log('密钥下载成功:', props.keyData.fingerprint)
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
  }
  ```

### 2.3 校验机制
- **空内容校验**：检查公钥内容是否为空或仅包含空白字符
- **格式校验**：检查公钥是否包含 PGP 公钥的标准头标记
- **异常处理**：捕获并处理下载过程中的所有异常
- **用户提示**：在校验失败时给出明确的错误提示

## 3. 修改的文件清单

### 3.1 后端文件
- `src/backend/app/lib/pgp/types.ts` - 更新类型定义
- `src/backend/app/lib/pgp/patterns.ts` - 实现 AND/OR 逻辑
- `src/backend/app/lib/task-manager.ts` - 传递逻辑运算符和公钥内容
- `src/backend/app/api/miner/start/route.ts` - 接收逻辑运算符参数

### 3.2 前端文件
- `src/frontend/src/types/index.ts` - 更新类型定义
- `src/frontend/src/stores/miner.ts` - 保存逻辑运算符和公钥内容
- `src/frontend/src/components/MinerControl.vue` - 添加逻辑关系选择控件
- `src/frontend/src/components/KeyCard.vue` - 修复下载功能并添加校验

## 4. 测试建议

### 4.1 筛选逻辑测试
1. **OR 逻辑测试**：设置多个规则，验证任一规则匹配即通过
2. **AND 逻辑测试**：设置多个规则，验证所有规则都必须匹配
3. **单规则测试**：验证单规则时 AND/OR 表现一致
4. **规则切换测试**：验证运行中切换逻辑关系的行为

### 4.2 密钥下载测试
1. **正常下载**：验证包含有效公钥的密钥可以正常下载
2. **空内容测试**：验证空公钥会给出错误提示
3. **格式错误测试**：验证格式不正确的公钥会给出错误提示
4. **多浏览器测试**：在不同浏览器中测试下载功能
5. **网络异常测试**：模拟网络异常时的错误处理
