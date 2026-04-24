# 功能优化技术文档

## 1. 筛选条件组合逻辑配置功能

### 1.1 功能概述
实现了筛选条件的组合逻辑配置功能。此功能为**规则引擎的基础版本**，后续已被完整的规则引擎替代。保留此文档用于说明演进过程。

> **注意**：当前系统已采用完整的规则引擎（见 [rule-engine.md](rule-engine.md)），支持独立规则、规则组、优先级配置和冲突解决策略。原有的简单 AND/OR 逻辑已被规则引擎的灵活配置所取代。

### 1.2 技术实现（历史版本）

#### 1.2.1 后端实现
- **类型定义更新**：在 `types.ts` 中添加了 `logicOperator` 字段
  ```typescript
  export interface MiningTask {
    // ... 其他字段
    logicOperator?: 'AND' | 'OR'; // 筛选条件组合逻辑（向后兼容）
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
    logicOperator: z.enum(['AND', 'OR']).default('OR'), // 向后兼容字段
    ruleConfig: RuleConfigurationSchema.optional(), // 规则引擎配置
  });
  ```

#### 1.2.2 前端实现（已演进）
- **类型定义更新**：在 `types/index.ts` 中添加逻辑运算符和规则引擎类型
  ```typescript
  export interface StartMinerRequest {
    patterns: PatternRule[];
    threads?: number;
    logicOperator?: 'AND' | 'OR'; // 向后兼容
    ruleConfig?: RuleConfiguration; // 规则引擎配置
  }
  ```

- **状态管理演进**：
  - 原 `miner.ts` 中的 `logicOperator` 状态保留用于向后兼容
  - 新增 `ruleEngine.ts` Pinia Store 管理完整的规则引擎状态
  - `MinerControl.vue` 已转型为任务控制面板，不再直接管理规则

- **UI 组件演进**：
  - 原 `MinerControl.vue` 中的逻辑关系选择控件已移除
  - 规则管理功能已迁移至 `RuleGroupManager.vue`
  - `MinerControl.vue` 现在显示规则配置摘要，引导用户到"规则引擎"标签页进行配置

### 1.3 功能演进说明

#### 从简单逻辑到规则引擎
| 特性 | 原实现 | 当前规则引擎 |
|------|--------|-------------|
| 规则组合 | 全局 AND/OR | 独立规则(OR) + 规则组(AND/OR) |
| 优先级 | 无 | 1-100 可配置 |
| 规则组 | 不支持 | 支持多组，可嵌套引用 |
| 冲突解决 | 无 | 4种策略可选 |
| 配置界面 | MinerControl | RuleGroupManager |

#### 向后兼容
- `logicOperator` 字段在 API 中保留，确保旧版本客户端兼容
- 独立规则默认采用 OR 逻辑，与原行为一致
- 未提供 `ruleConfig` 时，系统回退到简单规则模式

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
    // 规则引擎扩展字段
    executionResult?: ExecutionResult;
    triggeredByGroup?: string;
    triggeredByRule?: string;
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
      // 规则引擎扩展字段
      executionResult: matchResult.executionResult,
      triggeredByGroup: matchResult.triggeredByGroup,
      triggeredByRule: matchResult.triggeredByRule,
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
    // 规则引擎扩展字段
    triggeredByGroup?: string;
    triggeredByRule?: string;
    executionResult?: ExecutionResult;
  }
  ```

- **保存公钥内容**：在 `miner.ts` 中保存公钥
  ```typescript
  case 'match':
    const newKey: SpecialKey = {
      // ... 其他字段
      publicKeyArmored: message.publicKeyArmored, // 保存公钥内容
      // 规则引擎扩展字段
      triggeredByGroup: message.triggeredByGroup,
      triggeredByRule: message.triggeredByRule,
      executionResult: message.executionResult,
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

## 3. 控制面板与规则引擎冲突解决

### 3.1 冲突分析
在规则引擎实现后，发现以下功能重叠和冲突：

| 冲突点 | MinerControl（原） | RuleGroupManager（新） |
|--------|-------------------|----------------------|
| 规则管理 | 有（添加/删除/编辑规则） | 有（完整规则管理） |
| 逻辑关系 | 有（AND/OR 切换） | 有（规则组 AND/OR + 独立规则 OR） |
| 规则列表 | 有（简单列表） | 有（支持规则组） |
| 优先级配置 | 无 | 有 |
| 冲突策略 | 无 | 有 |

### 3.2 解决方案

#### 职责分离
- **MinerControl**：专注于**任务控制**
  - 显示运行状态
  - 显示规则配置摘要（只读）
  - 线程数设置
  - 开始/停止挖掘按钮
  - 引导用户到规则引擎标签页进行配置

- **RuleGroupManager**：专注于**规则配置**
  - 独立规则管理
  - 规则组管理
  - 全局配置（冲突策略、优先级）
  - 配置导入/导出

#### 架构调整
```
Dashboard
├── 左侧面板 (TabContainer)
│   ├── 控制面板 (MinerControl) - 任务控制
│   ├── 规则引擎 (RuleGroupManager) - 规则配置
│   ├── 实时终端 (MinerTerminal)
│   └── 已发现的特殊密钥 (KeyCard列表)
└── 右侧面板
    ├── 统计面板 (StatsPanel)
    └── Hashrate 趋势/监控
```

### 3.3 MinerControl 转型实现

#### 模板结构
```vue
<template>
  <div class="miner-control">
    <!-- 状态显示 -->
    <div class="control-header">
      <div class="status-badge" :class="{ running: isRunning }">
        {{ isRunning ? '运行中' : '已停止' }}
      </div>
    </div>

    <!-- 规则配置摘要（只读） -->
    <div class="config-summary">
      <div class="summary-item">
        <span class="summary-label">独立规则:</span>
        <span class="summary-value">{{ enabledIndependentRulesCount }} / {{ totalIndependentRules }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">规则组:</span>
        <span class="summary-value">{{ enabledRuleGroupsCount }} / {{ totalRuleGroups }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">冲突策略:</span>
        <span class="summary-value">{{ conflictStrategyLabel }}</span>
      </div>
    </div>

    <!-- 线程数设置 -->
    <div class="threads-section">
      <label>线程数: <input type="number" v-model.number="threads" min="1" max="8" /></label>
    </div>

    <!-- 控制按钮 -->
    <div class="control-buttons">
      <button @click="startMining" :disabled="isRunning || !hasEnabledRules">开始挖掘</button>
      <button @click="stopMining" :disabled="!isRunning">停止挖掘</button>
    </div>

    <!-- 提示信息 -->
    <div class="hint-text">
      💡 规则配置请切换到"规则引擎"标签页进行管理
    </div>
  </div>
</template>
```

#### 逻辑实现
```typescript
const ruleEngineStore = useRuleEngineStore()

// 计算启用的规则数量
const enabledIndependentRulesCount = computed(() => {
  return ruleEngineStore.independentRules.filter(r => r.enabled).length
})

const enabledRuleGroupsCount = computed(() => {
  return ruleEngineStore.ruleGroups.filter(g => g.enabled && g.ruleRefs.some(ref => ref.enabled)).length
})

// 是否有启用的规则
const hasEnabledRules = computed(() => {
  const hasIndependentRules = ruleEngineStore.independentRules.some(r => r.enabled)
  const hasGroupRules = ruleEngineStore.ruleGroups.some(g => g.enabled && g.ruleRefs.some(ref => ref.enabled))
  return hasIndependentRules || hasGroupRules
})

function startMining() {
  const enabledRules = ruleEngineStore.independentRules.filter(rule => rule.enabled)
  const ruleConfig = ruleEngineStore.exportConfiguration()

  minerStore.startMining({
    patterns: enabledRules,
    threads: threads.value,
    ruleConfig: ruleConfig,
  })
}
```

## 4. UI细节优化

### 4.1 KeyCard 操作按钮简化

#### 变更内容
- 移除了操作按钮中的 emoji 图标
- 按钮文字从 "📋 复制"、"⬇️ 下载"、"👁️ 详情" 改为纯文本 "复制"、"下载"、"详情"

#### 实现位置
[KeyCard.vue](file:///c:/Lefts%20Workspace/%E5%88%9B%E6%84%8F/%E8%87%AA%E7%94%A8%E7%9A%84%20vibe%20coding%20%E6%8A%80%E5%B7%A7/%E9%A1%B9%E7%9B%AE%E5%AE%9E%E4%BE%8B/src/frontend/src/components/KeyCard.vue#L15-L23)
```vue
<div class="key-actions">
  <button @click="copyFingerprint" class="ghost-btn action-btn" title="复制指纹">
    复制
  </button>
  <button @click="downloadKey" class="ghost-btn action-btn" title="下载公钥">
    下载
  </button>
  <button @click="showDetails" class="ghost-btn action-btn" title="查看详情">
    详情
  </button>
</div>
```

#### 设计理由
- 保持界面简洁，减少视觉噪音
- 与整体现代简约风格保持一致
- 按钮文字本身已足够表达功能含义

### 4.2 实时终端白底黑字风格

#### 变更内容
- 背景色从半透明黑色 `rgba(0, 0, 0, 0.5)` 改为白色 `#ffffff`
- 边框从青色半透明 `rgba(0, 240, 255, 0.3)` 改为浅灰 `#e0e0e0`
- 文字颜色从白色系列改为深灰/黑色系列
- 匹配消息颜色从青色 `#00f0ff` 改为蓝色 `#0066cc`
- 错误消息颜色从红色 `#ff4444` 改为深红 `#cc0000`

#### 实现位置
[MinerTerminal.vue](file:///c:/Lefts%20Workspace/%E5%88%9B%E6%84%8F/%E8%87%AA%E7%94%A8%E7%9A%84%20vibe%20coding%20%E6%8A%80%E5%B7%A7/%E9%A1%B9%E7%9B%AE%E5%AE%9E%E4%BE%8B/src/frontend/src/components/MinerTerminal.vue#L64-L128)
```css
.miner-terminal {
  background: #ffffff;
  border: 1px solid #e0e0e0;
}

.timestamp {
  color: #999999;
}

.message {
  color: #333333;
}

.log-line.match .message {
  color: #0066cc;
}

.log-line.error .message {
  color: #cc0000;
}
```

#### 设计理由
- 与整体现代简约风格保持一致（白底黑字）
- 提高可读性，减少视觉疲劳
- 与 Dashboard 其他组件风格统一

## 5. 修改的文件清单

### 5.1 后端文件
- `src/backend/app/lib/pgp/types.ts` - 更新类型定义（添加规则引擎类型）
- `src/backend/app/lib/pgp/patterns.ts` - 实现 AND/OR 逻辑（基础版本）
- `src/backend/app/lib/pgp/rule-engine.ts` - 规则引擎核心（新增）
- `src/backend/app/lib/task-manager.ts` - 传递逻辑运算符、公钥内容和规则引擎结果
- `src/backend/app/api/miner/start/route.ts` - 接收逻辑运算符和规则引擎配置

### 5.2 前端文件
- `src/frontend/src/types/index.ts` - 更新类型定义（添加规则引擎类型和扩展字段）
- `src/frontend/src/stores/miner.ts` - 保存逻辑运算符、公钥内容和规则引擎结果
- `src/frontend/src/stores/ruleEngine.ts` - 规则引擎状态管理（新增）
- `src/frontend/src/components/MinerControl.vue` - 转型为任务控制面板（移除规则管理，添加配置摘要）
- `src/frontend/src/components/RuleGroupManager.vue` - 规则引擎管理界面（新增）
- `src/frontend/src/components/KeyCard.vue` - 修复下载功能并添加校验；移除按钮emoji
- `src/frontend/src/components/MinerTerminal.vue` - 改为白底黑字风格
- `src/frontend/src/views/Dashboard.vue` - 添加规则引擎标签页

## 6. 测试建议

### 6.1 筛选逻辑测试（规则引擎）
1. **独立规则 OR 测试**：验证任一独立规则匹配即触发
2. **规则组 AND 测试**：验证组内所有规则必须匹配才触发
3. **规则组 OR 测试**：验证组内任一规则匹配即触发
4. **优先级测试**：验证高优先级规则/组优先执行
5. **冲突策略测试**：验证不同冲突策略的行为

### 6.2 密钥下载测试
1. **正常下载**：验证包含有效公钥的密钥可以正常下载
2. **空内容测试**：验证空公钥会给出错误提示
3. **格式错误测试**：验证格式不正确的公钥会给出错误提示
4. **多浏览器测试**：在不同浏览器中测试下载功能
5. **网络异常测试**：模拟网络异常时的错误处理

### 6.3 控制面板与规则引擎集成测试
1. **配置同步**：验证 MinerControl 正确显示 RuleGroupManager 的配置摘要
2. **任务启动**：验证使用 RuleGroupManager 配置的规则启动任务
3. **标签切换**：验证在控制面板和规则引擎标签间切换正常
4. **权限分离**：验证 MinerControl 不能修改规则配置

### 6.4 UI细节测试
1. **KeyCard按钮**：验证按钮显示纯文本，无emoji
2. **终端风格**：验证白底黑字，匹配消息为蓝色，错误消息为深红色
3. **暗色模式**：验证各组件在暗色模式下显示正常
