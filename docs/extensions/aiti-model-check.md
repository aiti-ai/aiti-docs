---
title: 模型可用性管理（aiti-model-check）
icon: 📡
ext:
  id: aiti-model-check
  name: 模型可用性管理
  description: 模型健康度探测 —— 对每个模型发极小探针消息，看是否可用 / 429 限流 / 异常；解析限流恢复时间（Retry-After 等），记录历史识别可用窗口
  soul: 模型在不在家，敲门问问它。
  type: dev-repo
  category: AI 能力
  version: 0.1.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-model-check/ 后 reload
  license: MIT
  tags: [model, probe, 429, rate-limit, availability]
---

# aiti-model-check

> ❝ **模型在不在家，敲门问问它。** ❞

模型可用性管理扩展：对 models.json 里每个 model 用**类 suggest 的轻量直连**发一条极小探针消息（`"ping" → 期望回 "ok"`），看返回：**200=可用 / 429=限流（解析 Retry-After、X-RateLimit-Reset、错误提示 → 预测恢复时间）/ 其它=异常**。每次探测记录入 `history.jsonl` + `state.json`，后台哨兵周期复测非可用模型 → **观测到实际恢复时间**，识别可用窗口。

- **模型清单两源合并**：每次打开都按「models.json 显式配置 ∪ pi ModelRuntime 快照」合并——快照是扩展启动时建的，之后向导新加的 provider/模型不在快照里也会从 models.json 补上（`source: models.json`），不依赖重建；runtime 有的仍以 runtime 为准（store 补全 + baseUrl/api 规范化）。检查列表永不只基于自己的历史 state
- **探测**：全模型一键探测（并发 4 路 · 10s 超时 · ~8 token/次），支持 openai-completions / anthropic-messages / openai-responses 三种接口
- **429 识别**：`Retry-After`（秒/HTTP 日期）、`X-RateLimit-Reset`、错误体提示（"Weekly usage limit reached. Resets in 4 days."、"GLM 套餐已到期"…）→ 预计恢复时间
- **记录**：history.jsonl 全量 + state.json 每模型最近状态 / 20 条时间线 / 连续 429 计数 / `recoveredAt` 恢复时间
- **后台哨兵**：每 60s 只复测 429/异常 的模型，全可用时不打搅 → 自动识别"什么时候恢复"
- **agent 工具**（`aiti_model_status/probe/history/config`）：AI 直接调，如「检查模型可用性」
- **ai-helper 帮助点**（skills，🤖 弹窗可唤）：`model-check`（检查可用性）/ `model-config`（调配置），详见 aiti-helper 接入指南（内部文档）
- **📡 网页面板**：状态总览（✅/🔴/⚠️/⚪ + 预计恢复）/ 一键探测 / 历史时间线
- **mc:avail 事件驱动**：429/恢复经 `aiti-event-bus.publish` 广播 `mc:avail` 帧（持续限流按 key 2min 节流，消除事件风暴）；model-wizard 横幅直供数据免反查、后台不拉取
- **服务化**：服务端 features 收口 `ctx.features`、客户端跨扩展服务双轨（`ctx.services` 优先 + 旧全局兜底），见 [ext-services](/guide/ext-services.html)

## agent 工具

```
aiti_model_status    # 状态总览（读最近状态，快）
aiti_model_probe     # 现测（默认全量，可 provider/model 过滤）+ 记录
aiti_model_history   # 探测历史（识别可用窗口）
aiti_model_config    # 读/改配置
```

## 配置 `config.json`（aiti-model-check dataDir）

```jsonc
{
  "modelsPath": "~/.pi/agent/models.json",
  "probe": { "timeoutMs": 10000, "concurrency": 4, "maxTokens": 8 },
  "watch": { "enabled": true, "intervalSec": 60, "onlyNotOk": true },
  "history": { "maxEntriesPerModel": 500 },
  "state": { "windowSize": 20 }
}
```

> 设计全文：内部方案文档
