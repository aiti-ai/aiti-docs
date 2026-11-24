---
title: pi-secret-mask（粘贴防泄密）
icon: 🎭
ext:
  id: pi-secret-mask
  name: pi-secret-mask 粘贴防泄密
  description: pi 的会话级秘密脱敏——贴进 prompt 的密钥/token/凭据在模型看到之前替换为形似凭据的不透明令牌 rsec_<hash8>（模型不再拒用），模型在工具参数里回显令牌时于执行前还原真实值；随手贴，不泄密。零依赖，TUI 与全部 pi-web 会话一次安装全覆盖
  descriptionEn: "Paste-safe by default — session-level secret redaction for pi: values pasted into prompts become opaque, credential-shaped tokens (rsec_<hash8>) before the model sees them and are restored inside tool arguments before execution. Adds on-disk redaction (landing plain|ephemeral), unresolved-placeholder guard, custom rules, compaction/tree scrubbing, `!`-command gate, provider payload rewrite + audit, and explicit /secret save|load snapshots. Engine shared with @aiti-ai/pi-secret-vault (encrypted persistent edition) and the DSH edition via @aiti-ai/secret-mask-core."
  soul: 随手贴，不泄密。
  type: pi-plugin
  category: pi 插件
  version: 0.4.2
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: "@aiti-ai/pi-secret-mask"
  install: |
    pi install npm:@aiti-ai/pi-secret-mask
  license: MIT
  tags: [pi, plugin, secrets, redaction, paste-safe, placeholder, security]
  installable: false  # pi 插件——装进 ~/.pi/agent，不进 aiti-agent/pi-web 扩展体系：extman 不列出、extensions.json 归 integrations
---

# pi-secret-mask（粘贴防泄密）

> ❝ **随手贴，不泄密。** ❞

pi 的**会话级秘密脱敏**插件——"贴安全"默认开启：

```text
你:        my api key is sk-ant-api03-<80 chars> — put it into .env under ANTHROPIC_KEY
模型看到:  my api key is rsec_a1b2c3d4 — put it into .env ...
写文件时:  ANTHROPIC_KEY=sk-ant-api03-<80 chars>   ← 执行时还原
会话文件:  plain 档原文 / ephemeral 档仅令牌
```

## 工作机制（五阶段钩子）

| 阶段 | 钩子 | 行为 |
|---|---|---|
| 输入边界 | `input` | vault/ephemeral 落盘档：用户 prompt 里的值在**成为会话消息之前**检测并改写（只靠 message_end 会晚于原文落盘）；plain 档原样放行 |
| 发送边界 | `context` | 全角色脱敏（user / assistant 正文与 thinking / 工具结果 / `!` bash 命令与输出 / compaction 摘要）；高置信规则**只从用户 authored 文本**自动注册新秘密；钩子拿到深拷贝 |
| system 段 | `context_with_system` | 补 `context` 看不到的 system prompt（AGENTS.md/项目说明里的值） |
| 协议约定 | `before_agent_start` | 注入 `secret_masking` prompt 段：令牌**就是**可用凭据、原样拷进工具参数、不许拒用/索要明文/改写 |
| 守卫 | `tool_call` | 未挂载占位符（resume、forget、轮换）→ **阻断并给出恢复命令**；已挂载 → 工具参数内**原位还原**（pi 从事件对象读字段）；bash 有意包含 |
| 工具输出 | `tool_result` | 工具输出重回上下文与会话记录前脱敏（`cat .env` 不再二次泄进转录） |
| 落盘副本 | `message_end` | vault/ephemeral 档返回脱敏替换消息（role 不变），会话 JSONL 只存令牌 |
| 摘要 | `session_before_compact` / `session_before_tree` | 深替换摘要模型输入（messagesToSummarize / turnPrefixMessages / previousSummary / 树条目） |
| `!` 命令 | `user_bash` | 命中已登记值默认告警放行；`strict` 直接拒绝 |
| 证据层 | `before_provider_request` | 先改写兜底（raw 值 → 令牌，默认开），再在 `/secret audit on` 时扫描**最终线上载荷**：`leaks=0 + placeholders>0` 即"只出令牌"的直接证据；任何原值立即告警 |

## 命令

| 命令 | 效果 |
|---|---|
| `/secret add [<value>] [as <alias> \| --alias <alias>]` | 注册值（缺省掩码交互输入）；alias 让令牌可读 |
| `/secret list` | 令牌 → 别名/规则 映射（掩码预览） |
| `/secret remove <alias\|label>` / `clear` | 注销单个 / 全部（旧令牌本会话内仍可还原） |
| `/secret on` / `off` | 本会话脱敏开关 |
| `/secret landing [plain\|ephemeral]` | 落盘策略：原文 / 只存令牌（找不回） |
| `/secret guard [on\|off]` | 未挂载占位符拦截（默认开） |
| `/secret strict [on\|off]` | 旁路一律拒绝（`!` 命令/摘要）而不是告警放行 |
| `/secret rule list\|add\|remove\|reload` | 自定义规则（`~/.pi/agent/secret-mask-rules.json`，热加载） |
| `/secret save <file>` / `load <file>` | 显式明文快照（文件名自选，无隐式持久化） |
| `/secret audit on\|off` / `show` | 每发送线上载荷证明日志 |
| `/secret status` | 状态摘要（landing/guard/strict/规则数/审计） |

## 持久版：pi-secret-vault（加密库）

需要**跨会话持久、加密落盘、按别名查询**时改用 `@aiti-ai/pi-secret-vault`（本包的超集）：

```bash
pi install npm:@aiti-ai/pi-secret-vault   # 与 mask 二选一；两个都装时握手让位给 vault
```

- 值经 `/vault add <alias>`（掩码输入）进本机 AES-256-GCM 库；模型用 `vault_list` 看别名、`vault_get` 拿到 `rsec_<hash8>` 稳定令牌（跨重启/轮换不变），工具执行前自动还原
- AI 只读：没有写库/查看明文的工具；`/vault reveal` 只走本机弹窗+剪贴板
- 解锁默认 keyfile（无口令、首写自动建库），支持切到系统钥匙串（macOS `security` / Linux `secret-tool` / Windows DPAPI）；pi-web 侧有同名管理扩展 `aiti-secret-vault`
- 落盘默认 `vault` 档：session JSONL 只存令牌

> 迁移：把 mask 从 settings 的 packages 换成 vault（或同时保留，vault 优先）；旧 `secret-mask.json` 快照用 `/secret load <file>` 导入后 `/vault add` 重建长期条目。

## 检测规则

确定性正则 + 校验和规则，**无网络、无模型调用**：AWS、GitHub、GitLab、Slack（token+webhook）、
Stripe live、SendGrid、Twilio、Google API/OAuth、Anthropic、OpenAI、Hugging Face、npm、PyPI、
Azure storage、JWT（校验 alg 头）、PEM 私钥（完整+截断）、带真密码的 DB URL、`Authorization` 头、
通用 `key = "value"` 赋值（香农熵阈值 + 代码标识符/模板/URL 排除）；Base64 前缀 token 解码后整只
捕获；<6 字符忽略（噪声护栏）。

**中文关键词**（v0.1.x）：通用赋值关键词表含 `密码/密钥/秘钥/口令/令牌/授权码/授权密钥/访问令牌/
访问密钥/凭证/凭据/私钥`；赋值分隔符接受全角冒号（`密码：xxx`）；拉丁-CJK 邻接（`API密钥`）与纯
CJK 前缀（`数据库密码`）均算词边界。已知取舍：不带引号的纯 CJK 短语值需 ~8 个不同字符过熵阈
（3.0 bits/char）——加引号可靠，或用 `/secret add`。

误报三重护栏：`plausibleSecret` 排除集（模板槽/`${VAR}`/路径/URL/`process.env.*`/`example`/
`changeme` 填充词）、熵地板（带引号 ≥2.0 / 裸值 ≥3.0 bits-per-char）、代码标识符与成员链排除
（`Uint8Array` 不是值）。规则形状对齐 gitleaks / GitHub secret-scanning 公开语料（MIT 的
claude-code-redact 实现），`tools/fp-corpus.mjs` 用其 11 个固定公开仓（42k+ 文件）测误报。

## 占位符格式

- 统一 `rsec_<hash8>`：会话登记/自动检测 = `fnv1a(会话盐+值)`；vault 别名 = `fnv1a("vault:"+alias)`（跨会话稳定）。legacy `[REDACTED:*]` 仍可还原
- 早期 `[REDACTED:github-token]` 形态已不再生成
- 自动检测与手动登记同一形态；同值同盐 → 同令牌，**会话内稳定**（prompt cache 友好）
  （同值同占位符，cache 友好），跨会话无意义

## 安装

```sh
pi install npm:@aiti-ai/pi-secret-mask@latest
```

新启动的会话生效（每个 TUI/pi-web 会话都是新 pi 进程）。aiti-agent（pi-web 工作台）**默认预装**
并随启动自动供给；独立 pi 用户单装即得全部能力，不依赖任何 aiti 组件。
