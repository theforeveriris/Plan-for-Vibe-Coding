# T001: PGP密钥生成核心逻辑

## 元信息
- 状态：进行中 | 优先级：P0 | 故事点：8
- 负责人：Claude（编码）+ @developer（验收）
- 迭代：Sprint 1（2026-04-20 ~ 2026-05-03）
- 关联：US-001, ADR-001

## 目标
实现基于 node-openpgp 的 PGP 密钥对生成核心逻辑，支持多线程并行生成。

## 已完成 [DONE]
- [x] 调研 node-openpgp API
- [x] 配置 node-openpgp 依赖

## 进行中 [IN PROGRESS]
- [ ] 实现基本密钥生成函数
- [ ] 实现 Worker 线程封装
- [ ] 实现多线程并行生成

## 待开始 [TODO]
- [ ] 实现任务队列管理
- [ ] 性能测试和优化

## 代码地图（Code Map）
/backend/
|-- app/
|   |-- lib/
|   |   |-- pgp/
|   |   |   |-- generator.ts    # 密钥生成核心
|   |   |-- workers/
|   |   |   |-- mining.worker.ts # Worker线程
|   |-- api/
|   |   |-- miner/
|   |   |   |-- start/
|   |   |   |   |-- route.ts    # 启动任务API

## 接口契约
```typescript
// 密钥生成配置
interface KeyGenConfig {
  rsaBits: 2048 | 4096;
  userIDs: { name: string; email: string }[];
}

// 密钥生成结果
interface KeyPair {
  publicKey: string;      // ASCII armored公钥
  privateKey: string;     // ASCII armored私钥
  fingerprint: string;    // 公钥指纹
}

// Worker消息
interface WorkerMessage {
  type: 'progress' | 'match' | 'error';
  attempts: number;
  hashrate: number;
  match?: KeyPair;
}
```

## 关键决策
- [ADR-001] 使用 node-openpgp 而非 GnuPG
- [ADR-002] 使用 SSE 而非 WebSocket 推送进度

## 风险与阻塞
| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| node-openpgp 性能不佳 | 低 | 中 | 考虑迁移到 GnuPG |
| Worker 内存泄漏 | 中 | 中 | 设置定期重启机制 |

## 会话记录
| 日期 | 会话 | 完成 | 下一步 |
|------|------|------|--------|
| 2026-04-20 | #1 | 项目初始化、依赖安装 | 实现密钥生成函数 |

## 交接摘要（Last Session）
- 时间：2026-04-20
- 完成：项目初始化，配置了 node-openpgp 依赖
- 下一步：实现 `generator.ts` 中的密钥生成函数