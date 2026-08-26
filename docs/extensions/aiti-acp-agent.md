---
title: ACP 会话后端（aiti-acp-agent）
icon: 🔗
ext:
  id: aiti-acp-agent
  name: ACP 会话后端
  description: 泛用 ACP 驱动 —— 一个适配器接所有 Agent Client Protocol agent
  soul: 协议统一了，适配器只需要写一次。
  type: dev-repo
  category: 多 agent 后端
  version: 0.3.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-acp-agent/ 后 reload
  license: MIT
  tags: [acp, agent-client-protocol, session, multi-agent]
---

# aiti-acp-agent

> ❝ **协议统一了，适配器只需要写一次。** ❞

泛用 Agent Client Protocol（ACP）驱动：一个适配器接入所有讲 ACP 的 agent，作为多 agent 前端的通用会话后端。专属 CLI（qoder 等）有更深的定制需求时走各自专属扩展。

## 机制

- ACP 是 Zed 主导的 agent↔编辑器 JSON-RPC stdio 标准——协议统一了，适配器只需要写一次
- **装机才接原则**：启动时探测 PATH，装了对应 CLI 才注册该后端
- 已知后端自动探测：`claude-code-acp`（agentKey `claude`）、`gemini --experimental-acp`（agentKey `gemini`）等

## 相关

- 多 agent 前端与 All Sessions：[session-manager](session-manager.md)
- 专属深度定制后端：[aiti-pi-agent](aiti-pi-agent.md) / [aiti-qoder-agent](aiti-qoder-agent.md)
