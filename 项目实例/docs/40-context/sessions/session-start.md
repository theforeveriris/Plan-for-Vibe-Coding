# Session Start Template

## 会话目标
[一句话说清楚这次要做什么]

## 前置上下文（必须读取）
- [ ] @/docs/40-context/active-context.md
- [ ] @/docs/30-tasks/T001-pgp-keygen.md

## 代码状态
- 分支：`main`
- 最后提交：`[commit-hash]`
- 未提交更改：[如果有，描述]

## 本次约束
- 只修改 `backend/app/lib/pgp/` 目录
- 必须使用 TypeScript
- 必须处理错误情况

## 验收标准
完成时，必须能：
1. 生成有效的 PGP 密钥对
2. 提取公钥指纹
3. 多线程并行生成