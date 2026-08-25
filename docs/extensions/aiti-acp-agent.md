---
title: aiti-acp-agent
icon: 🔗
ext:
  id: aiti-acp-agent
  name: ACP 会话后端
  description: 泛用 ACP 驱动 —— 一个适配器接所有 Agent Client Protocol agent
  soul: 协议统一了，适配器只需要写一次。
  type: dev-repo
  category: 多 agent 后端
  version: 0.1.0
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
