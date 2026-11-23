---
title: secret-mask-core（脱敏基础能力包）
icon: 🧬
ext:
  id: secret-mask-core
  name: secret-mask-core 脱敏引擎
  description: 宿主无关的秘密脱敏基础能力包——确定性凭据检测规则、rsec_<hash8> 令牌 Registry（legacy [REDACTED:*] 兼容）、深遍历还原/脱敏、pi 消息适配、未挂载占位符 guard、落盘三态、自定义规则、payload 审计与 /secret 命令逻辑。零运行时依赖；pi 版与 DSH 版的生产实现共用，任何 TS/JS agent 四步接入
  soul: 一套检测引擎，所有 agent 共享同一份"随手贴，不泄密"。
  type: other
  installable: false  # 基础库——不是 aiti-agent/pi-web 扩展：extman 不列出、extensions.json 归 integrations
  category: 基础库
  version: 0.4.3
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: "@aiti-ai/secret-mask-core"
  install: |
    npm i @aiti-ai/secret-mask-core
  license: MIT
  tags: [library, secrets, redaction, detection, dlp, engine, shared]
---

# secret-mask-core（脱敏基础能力包）

> ❝ **一套检测引擎，所有 agent 共享同一份"随手贴，不泄密"。** ❞

宿主无关的秘密脱敏基础能力包（零运行时依赖）——把"贴安全"拆成**引擎**与**宿主接线**两层：引擎在本包，钩子/消息形状/不可变语义/存储位置留给宿主。两个生产实现共用同一份代码与测试语料：

- [`@aiti-ai/pi-secret-mask`](./pi-secret-mask.md)——pi 编码代理（runtime dependency 引入）
- [`@aiti-ai/dsh-secret-mask`](./dsh-secret-mask.md)——DeepSeek Harness（esbuild 内联，线上零依赖）

## 模块

| 模块 | 导出 | 职责 |
|---|---|---|
| `detect` | `scan` / `RULES` / `entropy` / `fnv1a` / `plausibleSecret` | 确定性凭据检测（AWS/GitHub/GitLab/Slack/Stripe/SendGrid/Twilio/Google/Anthropic/OpenAI/HF/npm/PyPI/Azure/JWT/PEM/DB URL/Authorization 头/泛型赋值 + 中文关键词 + base64 包装 token），香农熵地板 + 误报护栏；无网络、无模型调用 |
| `mask` | `Registry` / `redactForms` / `restoreDeep` / `redactDeep` / `restoreDeepInPlace` / `auditPayload` | 值↔令牌 Registry（`rsec_<hash8>`；会话盐 / vault 稳定命名空间，legacy `[REDACTED:*]` 可还原）、深遍历、最终 payload 泄露证明 |
| `spans` | `redactTextSpans` / `spanOf` | 发送边界循环：把消息形状映射为 text span；**只有标记为用户手写的 span** 做自动检测登记 |
| `commands` | `handleSecretCommand` / `savePersist` / `appendAuditLog` | `/secret` 全套命令逻辑（存储路径由宿主经 state 注入） |

## 加密持久层：secret-vault-core

需要「AI 只能拿令牌、值加密落盘、跨会话稳定」时用配套引擎 `@aiti-ai/secret-vault-core`：

- `VaultStore`：AES-256-GCM 库（keyfile / OS 钥匙串双解锁模式，切换模式重新生成密钥并重加密）、global + project 分桶、轮换 version 与 `lastUsed*` 归因
- `vault_list` / `vault_get`：只读 AI 面；`vault_get` 用 `Registry.registerStable(value, alias)` 生成跨会话稳定的 `rsec_<hash8>`
- `/vault` 命令逻辑、capture/import/import-env、vault landing、零真值 session-state
- pi 装配见 `@aiti-ai/pi-secret-vault`；DSH 侧仍是进程内 vendored core（无持久库）

## 四步接入任意 TS/JS agent

```ts
import { Registry, redactTextSpans, spanOf, restoreDeep, auditPayload } from "@aiti-ai/secret-mask-core";

// ① 每会话一个 Registry（随机盐——同会话同值同占位符，跨会话不可预测）
const registry = new Registry();
const salt = crypto.randomBytes(4).toString("hex");

// ② 发送边界：消息 → text span，只有用户手写 span 开 autoDetect
for (const m of outgoingMessages) {
  const spans = textBlocksOf(m).map(b => spanOf(() => b.text, t => { b.text = t; }));
  redactTextSpans(spans, registry, salt, { autoDetect: m.role === "user" });
}

// ③ 工具执行前：模型回抄的占位符还原为真值（参数被冻结就先 structuredClone）
const args2 = restoreDeep(structuredClone(args), registry).value;

// ④ 请求发出前：扫描最终 payload——leaks=0 = 只有占位符上线的直接证据
const a = auditPayload(payload, registry);
if (a.leaks > 0) alarm(`raw secret on the wire: ${a.leakedLabels.join(", ")}`);
```

可选：`handleSecretCommand` 提供整套 `/secret add/list/remove/clear/on/off/status/save/unload/audit` 命令逻辑，套上你自己的命令分发器即可。

## 保证与取舍（与两个宿主一致）

- 会话级：每会话新盐；登记值在内存，opt-in 持久化到宿主自己的文件；
- 无关键字上下文的裸高熵串**不**自动检测（防压缩 JS 误报的刻意取舍）——暴露手动登记入口；
- 防意外泄露，不防恶意 agent；图片不扫描；`redactForms` 之外的变换逃逸如实存在。

## 测试

`npm test`（37 项引擎/命令/span 用例）· `npm run fp-corpus`（11 个锁定公开仓、6 万+ 文件误报复测，0 误报基线）。两个宿主的宿主级测试与误报基线经共享 dist 双向一致。
