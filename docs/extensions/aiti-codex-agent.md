---
title: Codex 会话后端（aiti-codex-agent）
icon: 🟦
ext:
  id: aiti-codex-agent
  name: Codex 会话后端
  description: OpenAI Codex CLI driver —— exec --json + resume 接入 All Sessions；认证双轨（auth.json OAuth / openrouter env），直播与冷回放同形原生工具卡
  soul: Codex 在哪儿跑，面板就在哪儿看。
  type: aiti-ext
  category: 多 agent 后端
  version: "0.1.8"
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
- **直播与回放同形（方案 X 已落地）**：直播工具项发原生 `assistant.toolCall`+`toolResult`（按 callID 折叠）——不再发 🛠 custom 卡，冷回放与直播同一渲染
- **能力面**：prompt/abort/contextUsage/getMessages/followUp/queueManage/setModel（下轮 `-m`）/getUsage/listModels/fileAttachments（`-i --image`）✅；steer ❌

## 认证双轨

`~/.codex/auth.json`（ChatGPT OAuth）与第三方 provider（`~/.codex/config.toml` 的 `model_providers.*` 决定实际路由，如 openrouter、key 走 env）并存——**auth.json 在场 ≠ 生效凭据**。登录态探测顺序：auth.json → env `OPENAI_API_KEY` → env `OPENROUTER_API_KEY`（命中即 ready）。账号额度面板读 auth.json token（`chatgpt.com/backend-api/wham/usage`）。

## 🔑 受控登录（ext-controlled-login 标准，2026-09-08）

工具条 **🔑 登录**（经 aiti-agent-manager 面板发起）一键：后端 spawn 官方 CLI 设备码登录（`codex login --device-auth`），**在任意设备的浏览器打开授权页完成授权即可**，凭据由官方 CLI 自动落盘，扩展现有凭据链路自动感知。

- API：`POST /api/extensions/aiti-codex-agent/login/start`（幂等）· `GET /login/status` · `POST /login/cancel`
- 状态机：waiting（转圈）→ success ✅ / failed / timeout / cancelled，均带重试；弹窗打开期间 2s 轮询状态、关闭即停
