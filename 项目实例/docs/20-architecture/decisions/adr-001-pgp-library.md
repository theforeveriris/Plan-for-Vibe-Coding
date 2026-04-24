# ADR-001: 使用 node-openpgp 而非 GnuPG

## 状态
已接受（Accepted）| 日期：2026-04-20 | 作者：@developer

## 背景
需要生成PGP密钥对，但有多种实现方式可选：
1. 使用系统安装的GnuPG通过child_process调用
2. 使用node-openpgp纯JavaScript库

## 决策
使用 node-openpgp 库实现PGP密钥生成。

## 考虑过的选项

| 选项 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| GnuPG CLI | 成熟稳定，性能好 | 需安装系统包，跨平台部署复杂 | [X] 拒绝 |
| node-openpgp | 纯JS，无依赖，跨平台 | 性能略低于GnuPG | [O] 接受 |

## 后果
- 正面：无需在目标机器安装GnuPG，部署简单
- 负面：密钥生成速度约为GnuPG的50-70%
- 风险缓解：考虑后续使用Worker线程并行提升性能

## 性能对比
- GnuPG: ~100 keys/sec (4 threads)
- node-openpgp: ~30-50 keys/sec (4 threads)

## 相关
- 影响：T001 密钥生成核心逻辑
- 关联ADR：ADR-002（多线程并行）