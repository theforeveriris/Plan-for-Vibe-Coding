---

description: 本规则定义了外部记忆系统的组织结构、文档规范和访问方式。适用于需要维护项目上下文、追踪任务进度、管理会话历史的场景。

---

# Memory System Rules - 外部记忆系统规则

## 系统架构

### 文档体系全景图

```
docs/
|-- 00-meta/                  # 元信息（项目本身）
|   |-- project-brief.md      # 项目一句话描述
|   |-- glossary.md           # 术语表（防歧义）
|   |-- changelog.md          # 项目级变更日志
|
|-- 10-requirements/          # 需求层（为什么做）
|   |-- prd.md                # 产品需求文档
|   |-- user-stories.md       # 用户故事
|
|-- 20-architecture/           # 架构层（怎么做-设计）
|   |-- overview.md           # 架构全景图
|   |-- tech-stack.md         # 技术栈及选型理由
|   |-- decisions/            # 架构决策记录（ADR）
|   |-- diagrams/             # 架构图（Mermaid）
|   |-- constraints/          # 约束条件
|
|-- 30-tasks/                 # 任务层（当前做什么）
|   |-- task-index.md         # 任务总览（看板）
|   |-- T001-feature-name.md  # 具体任务
|
|-- 40-context/               # 上下文层（AI 记忆）
|   |-- active-context.md     # 当前活跃上下文（必读）
|   |-- progress.md          # 项目进度总览
|   |-- system-patterns.md    # 代码模式
|   |-- sessions/             # 会话记录
|
|-- 50-knowledge/             # 知识层（外部信息）
|   |-- api-docs/            # 第三方 API 文档
|   |-- libraries/           # 库的使用笔记
|   |-- troubleshooting/      # 问题排查记录
|
|-- 90-templates/            # 模板层（快速创建）
    |-- new-task.md          # 新建任务模板
    |-- new-adr.md           # 新建 ADR 模板
    |-- session-start.md     # 会话启动模板
    |-- session-end.md       # 会话结束模板
```

## 文档规范

### 1. 项目元信息（docs/00-meta/）

#### project-brief.md
```markdown
# Project Brief - [项目名称]

## 电梯演讲（30秒版本）
[一句话描述项目核心价值]

## 核心指标
- [关键业务指标]

## 关键约束
- [必须遵守的技术/业务约束]

## 技术标签
`[tech1]` `[tech2]` `[tech3]`
```

#### glossary.md
```markdown
# 术语表（Glossary）

| 术语 | 英文 | 定义 | 禁止的替代说法 |
|------|------|------|-------------|
| [术语] | [英文] | [定义] | [错误理解] |
```

### 2. 任务文档（docs/30-tasks/TXXX-name.md）

```markdown
# TXXX: [任务名称]

## 元信息
- 状态：[待开始/进行中/已完成]
- 优先级：[P0/P1/P2]
- 故事点：[数字]
- 负责人：[名字]
- 迭代：[Sprint X]
- 关联：[US-XXX, ADR-XXX]

## 目标
[一句话目标]

## 已完成 [DONE]
- [x] [完成项 1]
- [x] [完成项 2]

## 进行中 [IN PROGRESS]
- [ ] [进行中项]

## 待开始 [TODO]
- [ ] [待开始项]

## 代码地图（Code Map）
/src/
|-- [目录结构]

## 关键决策（链接 ADR）
- [ADR-XXX] [决策内容]

## 风险与阻塞
| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| [风险描述] | [概率] | [影响] | [缓解] |

## 会话记录
| 日期 | 会话 | 完成 | 下一步 |
|------|------|------|--------|
| YYYY-MM-DD | #N | [完成] | [下一步] |

## 交接摘要（Last Session）
- 时间：YYYY-MM-DD HH:MM
- 完成：[完成内容]
- 阻塞：[阻塞描述]
- 下一步：[下一步操作]
```

### 3. 活跃上下文（docs/40-context/active-context.md）

```markdown
# Active Context - 当前活跃上下文

## [IMPORTANT] 会话启动强制指令
AI 在回答前必须：
1. 确认已读取本文档
2. 确认已读取关联的 Task 文档
3. 回复开头声明："已加载活跃上下文"

## 当前任务
**[TXXX]: [任务名称]**（[状态]）
- 下一步：[下一步操作]
- 阻塞：[阻塞描述]

## 最近变更（Last 3 Changes）
1. [YYYY-MM-DD] [变更描述] (`[文件路径]`)

## 当前代码状态
- 分支：`[branch-name]`
- 最后提交：`[commit-hash]` - [commit message]
- 未提交更改：[如有，描述]

## 必须遵守的规则（精简版）
1. [规则 1]
2. [规则 2]

## 当前环境
- [环境信息]
```

### 4. 会话记录（docs/40-context/sessions/YYYY-MM-DD-XXX.md）

```markdown
# Session - YYYY-MM-DD #N

## 会话目标
[一句话目标]

## 完成的工作
1. [完成项 1，带文件路径]
2. [完成项 2，带文件路径]

## 代码变更
| 文件 | 变更类型 | 说明 |
|------|---------|------|
| [path] | [新增/修改/删除] | [说明] |

## 遇到的阻塞
- [ ] [阻塞描述] -> [解决方案]

## 下一步（精确到文件/函数）
1. [ ] [下一步 1]
2. [ ] [下一步 2]
```

## 访问规范

### AI 会话启动顺序
1. `docs/00-meta/project-brief.md`（了解项目）
2. `docs/40-context/active-context.md`（了解当前状态）
3. `docs/30-tasks/TXXX.md`（了解具体任务）
4. `docs/40-context/system-patterns.md`（了解如何写代码）

### 文档更新时机
| 触发事件 | 更新文档 |
|---------|---------|
| 开始新任务 | 创建 TXXX.md，更新 active-context.md |
| 完成子任务 | 更新 TXXX.md 进度 |
| 遇到决策 | 创建 ADR，链接到 TXXX.md |
| 遇到坑 | 记录到 TXXX.md "风险"表格 |
| 会话结束 | 填写 session-end.md，更新 active-context.md |
| 代码变更 | 同步更新相关文档 |

### 归档规则
- 完成任务 7 天后移动到 `archive/` 目录
- 保留 `task-index.md` 中的简短记录
- 超过 3 个月的历史会话可删除

## 工作流

### 【任务开始】
1. 复制 `docs/90-templates/new-task.md` -> `docs/30-tasks/TXXX-name.md`
2. 填充目标、验收标准、代码地图
3. 更新 `active-context.md`：当前任务改为 TXXX
4. 开启 AI 会话

### 【工作中 - 每 30 分钟】
5. 完成子任务 -> 更新 TXXX.md 进度
6. 遇到坑 -> 记录到 TXXX.md "风险"表格
7. 做决策 -> 创建 ADR，链接到 TXXX.md

### 【会话结束】
8. 填写 `session-end.md`
9. 复制到 `docs/40-context/sessions/YYYY-MM-DD-XXX.md`
10. 更新 `active-context.md`
11. 提交 Git（用户自行提交）

## 关键原则

| 原则 | 说明 |
|------|------|
| 一个任务一个文件 | 不要所有任务写在一个文档里 |
| 代码地图必须精确到文件 | AI 需要知道去哪找代码 |
| 决策必须链接到 ADR | 防止 AI 重复问"为什么不用 X" |
| 会话记录必须包含"下一步" | 这是新会话的启动点 |
| 所有文档进 Git | 版本控制 + 团队协作 |

## 维护成本

这套体系的维护成本大约是每天 10-15 分钟，但能让 AI 在复杂项目中保持稳定的上下文理解，避免"失忆"导致的重复劳动。