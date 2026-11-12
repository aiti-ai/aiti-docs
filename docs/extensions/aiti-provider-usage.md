---
title: aiti-provider-usage
icon: 📶
ext:
  id: aiti-provider-usage
  name: aiti-provider-usage
  description: Provider 余额/配额查询 —— 16 个适配器 id（DeepSeek/OpenRouter/Z.AI/OpenCode Go/Kimi/Codex/Copilot 等），会话信息面板「剩余额度」区块当前会话置顶展开，5min TTL 总览 + 手动刷新，事件驱动零轮询
  soul: 各家还剩多少额度，一面看尽。
  type: aiti-ext
  category: 系统工具
  version: "0.1.8"
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-provider-usage/ 后 reload（需宿主 pi-web ≥ sessionInfoPanel 插槽版本，defork B1）
  license: MIT
  tags: [provider, usage, quota, balance, defork]
---

# aiti-provider-usage

> ❝ **各家还剩多少额度，一面看尽。** ❞

Provider 余额/配额查询扩展（pi-web 去 fork 化 B1 外迁产物）：适配器注册表体系 + 会话信息面板「剩余额度」区块。

## 能力

- **16 个适配器 id**：DeepSeek / OpenRouter / Z.AI(+CN) / OpenCode Go / Kimi Coding / OpenAI Codex / GitHub Copilot / Baseten / MiniMax(+CN) / Moonshot(+CN) / Vercel AI Gateway / SiliconFlow(+CN)——声明式 JSON 适配器一行加一家，复杂窗口协议（Z.AI 配额窗、OpenCode 限流态）独立适配器
- **sessionInfoPanel 插槽**：会话信息面板整块余额区，当前会话 provider 置顶展开；严重度色阶进度条 + 窗口状态（限流/耗尽）+ 重置倒计时
- **总览聚合**：TTL 5min 进程内缓存、并发 3、allSettled 一家失败不拖全家；手动刷新强制穿透
- **多 key 轮转池**（2026-09-18）：provider 带 `apiKeys[]`（≥2 启用条目）时 pi-models-combo 会装本地代理并以 per-session dummy token 注册——额度查询改为读 models.json 真 key 池逐 key 查询，窗口按 key 标注（`Rolling · key-1`），单 key 失败降级为 notes；`enabled:false` 的 key 跳过
- **OpenCode 只认 Go**：`/zen/go/v1/usage` 是 OpenCode 唯一对 API key 开放的用量端点（Go 套餐窗口）；Zen 按次付费余额**没有 API**（只在网页控制台、需登录会话），故 `opencode` / `opencode-zen` 不登记（不显示行，也不把 Go 窗口挂 Zen 名下）
- **认证零配置**：宿主 loader 把 `@earendil-works/*` alias 到宿主 node_modules，ModelRuntime.getAuth 与 core 同源
- **feature 开关**：`providerUsage.enabled` 关停即时回落（上游同形 = 信息面板无余额区）

## API（宿主门禁分发）

- `POST /api/extensions/aiti-provider-usage/overview` `{force?}` → 全 provider 总览
- `POST /api/extensions/aiti-provider-usage/query` `{providerId}` → 单家详报
- **`ctx.services` 服务出口**：`provide "aiti-provider-usage.overview"`——`overview(force?) / query(providerId) / invalidate()` 三方法，复用同一份 TTL 缓存/并发闸门、不新增上游请求面（消费方如 model-wizard 余额健康条）；总线缺席静默，REST 兜底

## 来源

自 pi-web fork `lib/provider-usage/*`（2026-09-13 落地）外迁；core 侧恢复上游 v0.9.1 原形（`pi-web-defork-batch-2026-09-plan.md` §2）。
