# node-openpgp 精简笔记

## 核心概念
| 概念 | 说明 | 对应我们的代码 |
|------|------|-------------|
| generateKey | 生成密钥对 | `lib/pgp/generator.ts` |
| readKey | 读取公钥 | 提取指纹用 |
| getFingerprint | 获取指纹 | 筛选匹配用 |

## 关键 API

### 生成密钥
```typescript
import * as openpgp from 'node-openpgp';

const { privateKey, publicKey } = await openpgp.generateKey({
  type: 'rsa',
  rsaBits: 2048,
  userIDs: [{ name: 'Miner', email: 'x@x.com' }],
  passphrase: '',
});
```

### 读取公钥获取指纹
```typescript
const key = openpgp.readKey({ armoredKey: publicKey });
const fingerprint = key.getFingerprint(); // 40位十六进制
const fingerprintUpper = key.getFingerprint().toUpperCase();
```

## 性能数据
| 操作 | 耗时（4线程） |
|------|--------------|
| 生成2048 RSA密钥 | ~50-80ms |
| 提取指纹 | <1ms |
| 总计 | ~50-80ms/key |

## 坑与解决方案
| 坑 | 解决方案 |
|------|---------|
| 密钥生成是同步的 | 必须用 Worker 线程，不能在主线程 |
| 内存占用高 | Worker 线程定期重启 |
| passphrase 为空 | 生成无密码密钥，便于自动化 |