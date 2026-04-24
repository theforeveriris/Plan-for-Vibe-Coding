# 术语表（Glossary）

| 术语 | 英文 | 定义 | 禁止的替代说法 |
|------|------|------|-------------|
| PGP | Pretty Good Privacy | 一种加密程序，用于加密数字签名 | GPG（虽然相关但指代不同） |
| 公钥指纹 | Public Key Fingerprint | 公钥的SHA-1/SHA-256哈希，用于唯一标识 | 密钥ID（容易混淆） |
| Vanity Key | Vanity Key | 具有特殊模式（如连续数字、回文）的PGP密钥 | 靓号密钥（可接受） |
| 挖掘 | Mining | 批量生成密钥并筛选符合模式的过程 | 挖矿（容易与加密货币混淆） |
| SSE | Server-Sent Events | 服务器向浏览器推送事件的技术 | WebSocket（完全不同） |
| ADR | Architecture Decision Record | 架构决策记录 | 设计文档（太泛） |
| 任务 | Task | 一个独立的挖掘任务，包含pattern和状态 | 任务ID（任务本身不是ID） |

## 缩写规范
- DO NOT USE: `PGP Key`（歧义：公钥/私钥/密钥对）
- USE: `Public Key`（公钥）、`Private Key`（私钥）、`Key Pair`（密钥对）
- DO NOT USE: `Key`（单独使用容易混淆）
- USE: `Fingerprint`（指纹）、`Key ID`（密钥ID）