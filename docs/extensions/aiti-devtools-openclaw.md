---
title: aiti-devtools-openclaw（OpenClaw 宿主适配）
icon: 🦞
ext:
  id: aiti-devtools-openclaw
  name: aiti-devtools OpenClaw 适配
  description: OpenClaw 插件直连跳过 MCP —— 16 工具注册进 agent 会话 + 会话自动上线 + chat.send 消息注入 + 答复回传 + 占位符对照表，cockpit 伴生 AI 窗
  soul: 好用的调试助手不该被协议门槛挡住——能 registerTool，就能开门。
  type: host-adapter
  category: 宿主适配
  version: 0.6.3
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: "@aiti-ai/aiti-devtools-openclaw"
  install: |
    # 源码安装（--link 本地目录）
    openclaw plugins install <dev-repo/aiti-devtools-openclaw> --link
    openclaw plugins enable aiti-devtools && 重启 gateway
    # 桥地址：plugins.entries.aiti-devtools.config.bridgeUrl > env AITI_BRIDGE_URL > http://127.0.0.1:8777
    # 工具定义构建：node tools/build.mjs（拉桥 tools/list 内嵌 16 工具）
  license: MIT
  tags: [openclaw, adapter, plugin, bridge-rest, chat-send, placeholder]
---

# aiti-devtools-openclaw（OpenClaw 宿主适配）

> ❝ **好用的调试助手不该被协议门槛挡住——能 registerTool，就能开门。** ❞

把 `aiti-devtools` 完整接入 [OpenClaw](https://openclaw.ai)——**插件直连跳过 MCP**：`api.registerTool` × 16 注册 `aiti_*` 工具进 OpenClaw agent 会话，execute 直调桥 REST `POST /bridge/agent/tools/call`（与 pi-web 扩展同款无状态直连）。

- **会话自动上线**：`session_start` + `before_message_write` 兑底 → 注册桥 + 开 SSE——不等调过工具，cockpit 的 agents 列表实时出现新会话
- **消息注入双路**：`enqueueNextTurnInjection`（下一轮可见）+ `chat.send` 网关派发（立即触发一轮）——cockpit 主动发消息马上进循环
- **答复回传**：`before_message_write`（assistant 终稿落盘前）→ `POST /bridge/agent/answer`，AI 窗/页面实时显示
- **占位符改写**（v0.6，DSH pre-step 等价物）：`before_prompt_build` 注入「展开对照表」进系统段 + `before_message_write` 用 pickedCache 同步展开落盘；只展开与本文匹配的 tag（桥 picked 全局单键，多宿主并发防互踩）；桥收到 `aiti_consumed` 权威清 picked
- **client 面**：nginx `/aiti/` 同源挂桥（launcher / cockpit.html / bridge / mcp）+ `/aiti-demo/` 演示页；浏览器 E2E 已验——`user_confirm` 确认卡在 cockpit 渲染、点 ✅ 工具返回 `answered`

工具定义源是桥 `tools/list`（build 时拉取内嵌；桥加工具后重跑构建即可）。
