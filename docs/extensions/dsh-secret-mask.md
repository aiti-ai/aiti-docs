---
title: dsh-secret-mask（DSH 粘贴防泄密）
icon: 🥷
ext:
  id: dsh-secret-mask
  name: dsh-secret-mask 粘贴防泄密
  description: DeepSeek Harness（DSH）的会话级秘密脱敏——贴进消息的密钥/token/凭据在进入模型之前替换为形似凭据的 rsec_<hash8> 令牌，模型在工具参数里回显令牌时于执行前还原真实值；未挂载令牌会被 guard 拦截，工具输出同步脱敏，可选审计证明无真值上线。检测核心与 pi 版共用 @aiti-ai/secret-mask-core
  descriptionEn: "Paste-safe by default — session-level secret redaction for DSH (DeepSeek Harness): values pasted into prompts become opaque rsec_<hash8> tokens before a step enters the model and are restored inside whitelisted tool arguments before execution; unresolved tokens are guarded; sensitive-key extraction and a weak-password dictionary catch low-entropy passwords; tool results are redacted at tools/post-execute and an opt-in llm/stream audit proves no raw value reaches the provider. Detection/placeholder engine shared with the pi editions via @aiti-ai/secret-mask-core."
  soul: 随手贴，不泄密——换一个 harness 也是。
  type: host-adapter
  installable: false  # DSH 插件——装进 DSH profile，不进 aiti-agent/pi-web：extman 不列出、extensions.json 归 integrations
  category: 宿主适配
  version: 0.3.1
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: "@aiti-ai/dsh-secret-mask"
  install: |
    dsh plugin --profile web add @aiti-ai/dsh-secret-mask
    dsh --profile web --dump-config   # 确认 bundle 行已挂载
  license: MIT
  tags: [dsh, deepseek-harness, plugin, secrets, redaction, paste-safe, placeholder, security]
---

# dsh-secret-mask（DSH 粘贴防泄密）

> ❝ **随手贴，不泄密——换一个 harness 也是。** ❞

[DeepSeek Harness（DSH）](https://github.com/deepseek-ai/deepseek-harness)的**会话级秘密脱敏**插件，[pi 版](./pi-secret-mask.md)的姊妹篇——检测核心逐字同源（共享包 `@aiti-ai/secret-mask-core`），占位符格式与还原语义完全一致：

```text
你:        我的 api key 是 sk-ant-api03-<80 chars> —— 帮我写进 .env 的 ANTHROPIC_KEY
模型看到:  我的 api key 是 rsec_a1b2c3d4 —— 帮我写进 .env ...
bash 工具: ANTHROPIC_KEY=sk-ant-api03-<80 chars>   ← shadow 包装层执行时还原
会话日志:  占位符持久落盘（pre-step 替换是 durable 的——与 pi 的「转录留原文」不同，见下）
```

## 工作机制（五层钩子）

| 环节 | 钩子 | 行为 |
|---|---|---|
| 发送边界 | `agent/pre-step` | 对本步 claim 的 `UserMessage[]` 批（followup / steering / 注入上下文全走这里）逐 text block 脱敏；高置信规则**只从用户手写文本**自动注册新秘密。替换是**持久的**：会话日志存占位符 |
| 约定注入 | `systemPrompt.section` | `secret_masking` 系统提示节（仅本会话已登记值时渲染）：占位符不透明、原样照抄进工具参数、不许猜值 |
| 执行边界 | shadow 工具 | `bash` / `write` / `edit` / `str_replace_editor` 在 agent 域重注册同名同 schema 的包装定义：参数占位符还原进深拷贝再委托原定义；冻结参数与模型可见的调用记录保持占位符 |
| 工具输出 | `tools/post-execute` | canonical value 先替换（过 output schema 重校验，失败即阻断不放行原值），退化为替换呈现 content 的 text block |
| 证明层 | `llm/stream` | `/secret audit on` 时扫描**最终上线载荷**（会话请求 + compaction/title 辅助调用）：`leaks=0 + placeholders>0` 即"只出占位符"的直接证据；任何真值立即 `secret-mask LEAK` 报警。证据追加 `~/.dsh/secret-mask-audit.log`（0600，永不含真值） |

## 命令

| 命令 | 效果 |
|---|---|
| `/secret add <value> [as <alias>]` | 注册值。**`recordInput: false`——值不进模型、也不落会话日志**（DSH 命令不成为面向模型的消息） |
| `/secret list` | 已注册值（掩码预览 `…****abcd`）、来源与规则 id |
| `/secret remove <alias\|label>` / `clear` | 注销单个 / 全部 |
| `/secret on` / `off` | 本会话脱敏开关 |
| `/secret status` | 状态摘要（含审计状态与最近审计结果） |
| `/secret save` / `unload` | 按 workspace 持久化到 `~/.dsh/secret-mask.json`（0600，opt-in）/ 丢弃 |
| `/secret audit on\|off` / `show` | 每次发送的线上载荷证明日志 |

## 与 DSH 生态的关系

- **官方 `@deepseek-ai/dsh-client-ui-secret-mask`** 只遮挡**浏览器显示**（README 原文：模型输入保留原始字符）；本插件工作在**模型边界**，两者互补可同装。
- **社区 `dsh-redact`** 只做 `tools/post-execute` 输出令牌化；本插件额外覆盖用户输入脱敏、占位符还原与审计；钩子链兼容（waterfall 链式，令牌格式不相交）。

## 检测规则

与 pi 版共享同一引擎（[`@aiti-ai/secret-mask-core`](./secret-mask-core.md)）：确定性正则 + 校验和 + 香农熵阈值 + 误报三重护栏 + 中文关键词（`密码：xxx` 全角冒号、CJK 词边界）+ base64 包装 token 解码捕获；11 个锁定公开仓（6 万+ 文件）误报复测 **0 误报**基线。

## 已知差异（与 pi 版）

- pre-step 替换在 DSH 是**持久的**：本地会话日志存占位符而非原文（pi 版转录留原文）。
- shadow 白名单刻意收窄（bash + 文件写家族），避免与 `tools.restrict` 交互放大权限面。
- 防意外泄露，不防恶意 agent——审计层能发现真值出现在模型边界，发现不了还原后经 Bash 外传的值。

## 安装

```sh
dsh plugin --profile web add @aiti-ai/dsh-secret-mask
```

web / headless / acp profile 通用（同一 Cordis 服务面）；配置项 `enabled` / `autoDetect` / `restoreToolArgs` / `audit` / `workspaceDir` / `auditPath` 详见 npm README。
