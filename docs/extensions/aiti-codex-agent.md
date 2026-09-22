---
title: Codex 会话后端（aiti-codex-agent）
icon: 🟦
ext:
  id: aiti-codex-agent
  name: Codex 会话后端
  description: OpenAI Codex CLI driver —— exec --json + resume 接入 All Sessions
  soul: Codex 在哪儿跑，面板就在哪儿看。
  type: dev-repo
  category: 多 agent 后端
  version: 0.1.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-codex-agent/ 后 reload
  license: MIT
  tags: [codex, openai, cli, session, multi-agent]
---

# aiti-codex-agent

> ❝ **Codex 在哪儿跑，面板就在哪儿看。** ❞

OpenAI Codex CLI 会话后端：以 `exec --json` 驱动 codex CLI，支持 resume，接入 All Sessions 多 agent 前端。

## 机制

- 协议：`codex exec --json`（codex-cli 0.149 实测）
- 事件流：`thread.started` → `item.completed`（agent_message / command_execution 等）→ `turn.completed`（含 usage）或 `turn.failed`
- 支持 resume：从 thread_id 恢复既有会话
- **接管/冷恢复回放**：历史经 session-manager codex adapter 解析 rollout（`function_call` 与 `function_call_output`
  按 `call_id` 配成结构化工具行）→ `seedHistory` 经共享层 `@aiti-ai/ext-shared/seed-tool` 回放成 pi 原生工具卡（v0.1.1）；
  会话根可 `AITI_CODEX_HOME` 覆盖；真实模型源是 `turn_context.payload.model`（codex 无 init 帧）
- ⚠ **直播路径仍是 custom 卡**（`item.started`→🛠、`item.completed`→✅/❌）：接管后继续对话会同时出现回放的原生卡与直播的 custom 卡，统一化待做（`docs/aiti-codebuddy-agent-tool-result-fold-plan.md` §8）

## 🔑 受控登录（ext-controlled-login 标准，2026-09-08）

工具条 **🔑 登录**（或本面板）一键发起：后端 spawn 官方 CLI 的无浏览器登录（`openai.com` 通道），把授权链接推到本弹窗——**在任意设备的浏览器打开完成授权即可**，凭据由官方 CLI 自动落盘，扩展现有凭据链路自动感知。

- API：`POST /api/extensions/aiti-codex-agent/login/start`（幂等）· `GET /login/status` · `POST /login/cancel`
- 状态机：waiting（转圈）→ success ✅ / failed / timeout / cancelled，均带重试；弹窗打开期间 2s 轮询状态、关闭即停
- 标准与五家 driver 契约：`docs/ext-controlled-login-standard.md`
