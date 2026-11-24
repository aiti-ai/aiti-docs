---
title: pi-models-combo（pi 模型治理插件）
icon: 🎛️
ext:
  id: pi-models-combo
  name: pi-models-combo 模型治理
  description: pi 编码代理的模型治理插件——模型列表过滤治理 + apiKeys 多 key 粘性轮转防 429 + 多 provider 聚合（combo 虚拟模型）+ 质量监控；装进 ~/.pi/agent/pi-plugins/
  descriptionEn: "Keep your model list tidy and rotate API keys to prevent 429 rate limits — model filtering, sticky multi-key rotation, multi-provider aggregation (combo models), quality monitoring"
  soul: 模型列表不疯长、429 不打断手——过滤、轮转、聚合各司其职。
  type: pi-plugin
  category: pi 插件
  version: 0.4.16
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: "@aiti-ai/pi-models-combo"
  install: |
    # pi 源仓部署（推荐，install-plugin.mjs 处理 pi-web 内置副本）：
    pi install npm:@aiti-ai/pi-models-combo
  license: MIT
  tags: [pi, plugin, models, api-keys, rotation, 429, combo, provider, aggregation]
  installable: false  # pi 插件——装进 ~/.pi/agent，不进 aiti-agent/pi-web 扩展体系：extman 不列出、extensions.json 归 integrations
---

# pi-models-combo（pi 模型治理插件）

> ❝ **模型列表不疯长、429 不打断手——过滤、轮转、聚合各司其职。** ❞

pi 编码代理的模型治理插件（原 pi-models-respect）。pi 的 `models.json` 是叠加式的：内置 provider
保留全量目录、你的条目合并其上——openrouter 一类 provider 动辄 300+ 内置模型晃眼；而 429 限流时
pi 也没有换 key 重试的机制。本插件在不改变 pi provider 解析方式的前提下补齐这两个缺口。

## 1. 模型过滤

`models.json` 里显式配了 `models` 列表的 provider，只保留你配置的模型——几百个内置目录模型
（如 openrouter 全目录）安静让位。未配 `models` 列表的 provider 完全不动。允许清单 100% 生成自
`models.json`（按文件 mtime 自动重读）：向导里加减模型，下一次查询即生效——零插件编辑、零重启。

## 2. apiKeys 多 key 轮转（本地代理）

provider 配多个 `apiKeys` 时自动起**随机端口本地代理**并经 `pi.registerProvider()` 注册进会话
（扩展级覆盖优先于 models.json，路由必经代理）。pi 只看到一个普通 URL 与随机哑 token，
**永不接触真实 key、看不到原始限流响应头**。代理行为：

| 行为 | 细节 |
|---|---|
| 按 API 类型注入轮换 key | `Authorization: Bearer`（openai-completions/responses）、`x-api-key`+`anthropic-version`（anthropic-messages）、`x-goog-api-key`（google-generative-ai） |
| 429 自动重试 | 最多 5 次，指数退避 + 抖动；限流 key 进冷却（`Retry-After` 或默认 30s） |
| per-key rpm 节流 | 均匀间隔自动推导 60000/rpm；`minIntervalMs: 0` 退回突发-静默滑窗 |
| 角色改写兼容 | openai-completions 的 `role:"developer"`→`system`（GLM 系中转拒收 developer 角色；`PMC_NO_ROLE_REWRITE=1` 关闭） |
| OpenCode Go 兼容 | 自动为 Console Go 上游注入 `x-opencode-session`（会话内稳定哈希，prompt-cache 友好；`compat.xOpenCodeSession` 强制/关闭） |
| 上游超时 | 默认 120s → 504；天级 `retry-after` 截断为 ≤60s 小响应，避免堵死轮转 |
| 代理状态单例 | `globalThis` 单例：CLI 调用与每个 aiti-ai 会话重复加载复用同一代理，不漏端口 |

## 3. 模型聚合（combo 虚拟模型）

`models.json` 里建自定义 provider、`"combo": true` + `combo.members`（可带 `weight`，默认 10）——
多个真实模型合成**一个虚拟模型**，代理负责：

- **粘性会话**：空闲 TTL 内同一成员（最大化上游 prompt cache 命中）
- **429 冷却故障转移**、**按权重选成员**
- **视觉感知路由**（`types`，v0.4.4）：成员可声明 `["text"]`/`["vision"]`/`["other"]` 服务类
  （未设=全服务）；`["vision"]` 专属成员只接图像请求、纯文本永不命中（要求模型声明 `image` 输入）；
  请求类嗅探覆盖 openai（`image_url`/`input_audio`）、anthropic（`image`/`document`）、google
  （`inline_data`/`file_data`）；图文混合请求只由无类型（catch-all）成员服务

## 4. 质量监控与三段超时

| 阶段 | 预算 | 行为 |
|---|---|---|
| TTFB | 90s | 超时轮换下一 key/成员 |
| 流空闲 | 45s | 掐死停滞 SSE 流——会话挂几十分钟的元凶 |
| 总时长 | 15min | 单请求硬顶 |
| **池预算** | 300s | 跨全部重试/换成员的墙钟预算——免费池成员串行 TTFB 超时曾烧掉 6×90s≈11.5 分钟，现以结构化 504 截断 |

任何超时把该成员**权重减半**（按惯例错误冷却冻结）直至下次真实成功；持续慢成员（近 8 次 TTFB
中位数 >30s）即使粘性 TTL 有效也立即跳过；任何 ≥400 响应过期粘性指针。

## 与 aiti-agent 的协同

🧙 模型向导可视化编辑本插件声明的多 key 池与 combo 模型（"模型聚合"标签页、粘性轮转配置）；
📡 模型检查展示 combo 成员构成与限流状态——免手写 `models.json` 的多 key/多 provider 编排。
i18n（v0.4.3）：代理日志/结构化错误/`/combo` 输出全本地化（`PMC_LANG` > `PMC_LOCALE` > POSIX
链，原生 Windows 无 LANG 时探测 OS 区域语言）；协议锚点（`error.type`、`[quota exceeded: …]`）
保持不翻译。

## 安装

```sh
pi install npm:@aiti-ai/pi-models-combo
# aiti 源仓：deploy-all --only combo（install-plugin.mjs 处理 pi-web 内置副本）
```
