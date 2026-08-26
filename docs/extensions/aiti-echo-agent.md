---
title: Echo 会话后端（aiti-echo-agent）
icon: 🔁
ext:
  id: aiti-echo-agent
  name: Echo 会话后端
  description: Echo agent —— session-provider slot 演示（多 agent 前端最小示例）
  soul: 先让一声回声上线，再让千军万马接入。
  type: dev-repo
  category: 多 agent 后端
  version: 0.1.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-echo-agent/ 后 reload
  license: MIT
  tags: [echo, demo, session-provider, slot]
---

# aiti-echo-agent

> ❝ **先让一声回声上线，再让千军万马接入。** ❞

Echo agent：session-provider slot 的最小演示后端，多 agent 前端契约的可运行示例。想写自己的会话后端，先读它。

## 机制

- 注册名为 `<id>/echo` 的 SessionProvider——一个不依赖任何 LLM 的假 agent
- prompt 收到文本后按打字机节奏流式回显，完整演示 SessionHandle 最小事件协议：`message_start → message_update* → message_end → agent_settled`

## 用途

1. 验证 lib/session 的 provider slot 端到端可用（注册/解析/注销）
2. 作为自定义会话后端的**最小参考实现**
