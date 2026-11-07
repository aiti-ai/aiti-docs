---
title: 模型可用性管理（aiti-model-check）
icon: 📡
ext:
  id: aiti-model-check
  name: 模型可用性管理
  description: 模型健康度探测 —— 对每个模型发极小探针消息，看是否可用 / 429 限流 / 异常；解析限流恢复时间（Retry-After 等），记录历史识别可用窗口；长期限流到期提醒（纯本地时间检查零探测）
  soul: 模型在不在家，敲门问问它。
  type: dev-repo
  category: AI 能力
  version: "0.1.7"
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-model-check/ 后 reload
  license: MIT
  tags: [model, probe, 429, rate-limit, availability, recovery-notify]
---

# aiti-model-check

> ❝ **模型在不在家，敲门问问它。** ❞

模型可用性管理扩展：对 models.json 里每个 model 用**类 suggest 的轻量直连**发一条极小探针消息（`"ping" → 期望回 "ok"`），看返回：**200=可用 / 429=限流（解析 Retry-After、X-RateLimit-Reset、错误提示 → 预测恢复时间）/ 其它=异常**。每次探测记录入 `history.jsonl` + `state.json`，后台哨兵周期复测非可用模型 → **观测到实际恢复时间**，识别可用窗口。

- **模型清单两源合并**：每次打开都按「models.json 显式配置 ∪ pi ModelRuntime 快照」合并——快照是扩展启动时建的，之后向导新加的 provider/模型不在快照里也会从 models.json 补上（`source: models.json`），不依赖重建；runtime 有的仍以 runtime 为准（store 补全 + baseUrl/api 规范化）。检查列表永不只基于自己的历史 state
- **探测**：全模型一键探测（并发 2 路 · 15s 超时 · ~8 token/次 · 多 key provider 默认分 key 检查 `probe.perKey`），支持 openai-completions / anthropic-messages / openai-responses 三种接口
- **429 识别**：`Retry-After`（秒/HTTP 日期）、`X-RateLimit-Reset`、错误体提示（"Weekly usage limit reached. Resets in 4 days."、"GLM 套餐已到期"…）→ 预计恢复时间
- **记录**：history.jsonl 全量 + state.json 每模型最近状态 / 20 条时间线 / 连续 429 计数 / `recoveredAt` 恢复时间
- **后台哨兵（默认关，`watch.enabled` 开启）**：每 60s 只复测 429/异常 的模型，远期限流按 `watch.farFactor` 自动降频 → 自动识别"什么时候恢复"
- **运行期观测 + 分 key（带外零探测）**：多 key provider 逐 key 状态；tail pi-models-combo 代理日志 + 直连会话事件摄入的 429/402/401/5xx（key 归因、1h/24h 窗口、只提示不标记）；`POST /blocked-execution`「大量 429 且真阻断」的执行上报 → 标记模型不可用（`runtime.minBlockCount` 默认 3）；OAuth 订阅型做 provider 级状态检查（如 qoder 配额/登录态）
- **限流到期提醒（recover，2026-09-19）**：长期限流（已持续 ≥ 阈值，默认 72h=3 天）的模型在 429 记录的预计恢复时间到点时提醒——**纯本地时间检查零探测**：浏览器通知 + 面板「⏰ 待验证」清单 + 逐模型/provider 🔔 开关（模型级 > provider 级 > `recover.notifyDefault`，`POST /recover-notify`）；到期检查默认 30min 一轮、启动与面板加载幂等补发（`POST /recover-check`）。方案：`docs/aiti-model-check-recovery-notify-plan.md`
- **agent 工具**（8 个，见下，整组默认禁用）：AI 直接调，如「检查模型可用性」
- **ai-helper 帮助点**（skills，🤖 弹窗可唤）：`model-check`（检查可用性）/ `model-config`（调配置），详见 aiti-helper 接入指南（内部文档）
- **📡 网页面板**：状态总览（✅/🔴/⚠️/⚪ + 预计恢复）/ 一键探测 / 历史时间线
- **mc:avail 事件驱动**：429/恢复经 `aiti-event-bus.publish` 广播 `mc:avail` 帧（持续限流按 key 2min 节流，消除事件风暴）；model-wizard 横幅直供数据免反查、后台不拉取
- **服务化**：服务端 features 收口 `ctx.features`、客户端跨扩展服务双轨（`ctx.services` 优先 + 旧全局兜底），见 [ext-services](/guide/ext-services.html)

## agent 工具

```
aiti_model_status          # 状态总览（读最近状态，快；含分 key 状态/运行期错误/到期提醒清单）
aiti_model_keys            # 多 key 检查（provider.apiKeys 打码列出，逐 key 可用/429/延迟）
aiti_model_availability    # 有无可用模型（全不可用判定 + 最近被阻断执行记录）
aiti_model_probe           # 现测（默认全量，可 provider/model 过滤；聚合组不直接探测）+ 记录
aiti_model_report_blocked  # 报告被限流阻断的执行（≥runtime.minBlockCount 且真阻断才标记）
aiti_model_history         # 探测历史（识别可用窗口）
aiti_model_balance         # 余额/套餐用量（公开余额 API，缓存 ≤10min）
aiti_model_config          # 读/改配置
```

> 8 个工具**默认禁用**（feature `tool.aiti_model_*` / `agentTools.enabled` 默认 false），扩展管理器或 ai-helper 🤖 帮助点开启。

## 配置 `config.json`（aiti-model-check dataDir）

```jsonc
{
  "modelsPath": "~/.pi/agent/models.json",
  "probe": { "timeoutMs": 15000, "concurrency": 2, "maxTokens": 8, "perKey": true },
  "watch": { "enabled": false, "intervalSec": 60, "onlyNotOk": true, "farThresholdMin": 30, "farFactor": 30 },
  "history": { "maxEntriesPerModel": 500 },
  "state": { "windowSize": 20 },
  "runtime": { "minBlockCount": 3 },
  "recover": { "enabled": true, "minLimitedHours": 72, "checkIntervalSec": 1800, "notifyDefault": true }
}
```

> 设计全文：内部方案文档
