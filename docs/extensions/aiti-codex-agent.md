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
