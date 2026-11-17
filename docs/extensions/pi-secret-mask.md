---
title: pi-secret-mask（粘贴防泄密）
icon: 🎭
ext:
  id: pi-secret-mask
  name: pi-secret-mask 粘贴防泄密
  description: pi 的会话级秘密脱敏——贴进 prompt 的密钥/token/凭据在模型看到之前替换为稳定占位符 [REDACTED:*]，模型在工具参数里回显占位符时于执行前还原真实值；随手贴，不泄密。零依赖，TUI 与全部 pi-web 会话一次安装全覆盖
  soul: 随手贴，不泄密。
  type: pi-plugin
  category: pi 插件
  version: 0.2.3
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
模型看到:  my api key is [REDACTED:ANTHROPIC_KEY#a1b2c3d4] — put it into .env ...
写文件时:  ANTHROPIC_KEY=sk-ant-api03-<80 chars>   ← 执行时还原
会话文件:  原文保存（context 钩子非破坏性）
```

## 工作机制（五阶段钩子）

| 阶段 | 钩子 | 行为 |
|---|---|---|
| 发送边界 | `context` | 全角色脱敏（user / assistant 正文 / 工具结果 / `!` bash 命令与输出 / compaction 摘要）；高置信规则**只从用户 authored 文本**自动注册新秘密；钩子拿到深拷贝——会话记录保留原文 |
| 协议约定 | `before_agent_start` | 注入 `secret_masking` prompt 段：占位符不透明、原样拷进工具参数、不许猜值 |
| 返回边界 | `tool_call` | 工具参数内的占位符**原位还原**（pi 从事件对象读字段）；bash 有意包含——主用例就是"在命令里用这把 key" |
| 工具输出 | `tool_result` | 工具输出重回上下文与会话记录前脱敏（`cat .env` 不再二次泄进转录） |
| 证据层 | `before_provider_request` | `/secret audit on` 时扫描**最终线上载荷**（provider 序列化后、HTTP 前）：每次发送 `leaks=0 + placeholders>0` 即"只出占位符"的直接证据；任何原值立即告警。独立于脱敏流程——它看到的是前面所有钩子的产出 |

## 命令

| 命令 | 效果 |
|---|---|
| `/secret add <value> [as <alias>]` | 注册值（缺省交互输入）；alias 让占位符可读 |
| `/secret list` | 已注册值（掩码预览 `…****abcd`）、来源与规则 id |
| `/secret remove <alias\|label>` / `clear` | 注销单个 / 全部 |
| `/secret on` / `off` | 本会话脱敏开关 |
| `/secret status` | 状态摘要（含审计状态与最近审计结果） |
| `/secret save` / `unload` | 值按项目持久化到 `~/.pi/agent/secret-mask.json`（0600，opt-in）/ 丢弃 |
| `/secret audit on\|off` / `show` | 每发送线上载荷证明日志（开关 / 查看最近证据行） |

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

- 手动注册带 alias：`[REDACTED:github-token]`——alias 即语义
- 自动检测：`[REDACTED:GITHUB_TOKEN#a1b2c3d4]`——hash = fnv1a(会话盐 + 值)；**会话内稳定**
  （同值同占位符，cache 友好），跨会话无意义

## 安装

```sh
pi install npm:@aiti-ai/pi-secret-mask@latest
```

新启动的会话生效（每个 TUI/pi-web 会话都是新 pi 进程）。aiti-agent（pi-web 工作台）**默认预装**
并随启动自动供给；独立 pi 用户单装即得全部能力，不依赖任何 aiti 组件。
