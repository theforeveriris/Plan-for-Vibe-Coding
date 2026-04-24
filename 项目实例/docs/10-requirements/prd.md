# PRD: PGP Vanity Key Miner v1.0

## 背景
需要一个专门工具来生成具有特殊模式的PGP公钥指纹，类似加密货币的vanity address生成器。用户可能需要：
- 生成包含自己名字缩写的PGP密钥
- 创建带有特殊日期的密钥作为礼物
- 收集"漂亮"的密钥指纹用于展示

## 目标
构建一个全栈Web应用，后端用Next.js API批量生成PGP密钥对，前端用Vue3实时展示挖掘进度和筛选出的特殊公钥。

## P0（必须）
- PGP密钥对生成（使用node-openpgp或GnuPG）
- 多种筛选规则支持（连续数字、回文、特殊日期等）
- SSE实时推送挖掘进度
- SQLite存储已发现密钥元数据
- 一键复制/导出公钥

## P1（应该）
- 多线程并行挖掘
- 实时hasrate图表
- 宝藏卡片展示已发现密钥
- 任务暂停/恢复

## P2（可以）
- GPU加速（WASM）
- 多规则AND/OR组合
- 排行榜
- Docker Compose部署

## 功能清单

### 挖掘引擎 (Next.js API)
- `POST /api/miner/start` - 启动挖掘任务
- `POST /api/miner/stop/:taskId` - 停止任务
- `GET /api/miner/stream/:taskId` - SSE实时流
- `GET /api/keys` - 分页查询已发现密钥

### 筛选规则
| 规则名称 | 描述 | 示例 |
|---------|------|------|
| consecutive | N位以上连续数字 | `...1234567...` |
| repeating | 重复数字序列 | `...888888...` |
| palindrome | 回文数字 | `...1234321...` |
| special_date | 特殊日期 | `...19990101...` |
| custom_regex | 用户自定义正则 | `^.*1337.*$` |
| leading_zeros | 前导零数量 | `00000...` |

### 前端界面
- 控制面板：开始/停止、规则选择、难度滑块
- 实时终端：滚动日志、彩色高亮
- 宝库展示：密钥卡片网格
- 统计看板：总尝试次数、发现数量、top 10

## 验收标准

### Feature: 密钥挖掘
- Scenario: 成功挖掘到特殊密钥
  - Given 用户选择了"连续数字"规则并设置最少7位
  - When 点击"开始挖掘"
  - Then 显示实时进度（已尝试次数、hashrate）
  - And 发现符合条件的密钥时显示卡片
  - And 密钥自动保存到数据库

- Scenario: SSE实时推送
  - Given 挖掘任务运行中
  - When 有新的进度更新
  - Then 在 < 100ms 内推送到前端
  - And 更新hasrate图表

### Feature: 密钥导出
- Scenario: 导出公钥
  - Given 发现了一个特殊密钥
  - When 用户点击"复制公钥"
  - Then 公钥复制到剪贴板
  - And 显示"已复制"提示

## 性能要求
- 密钥生成：10-50 keys/秒（取决于CPU）
- SSE延迟：< 100ms
- 前端首屏加载：< 2s