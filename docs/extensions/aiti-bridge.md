---
title: aiti-bridge
icon: 🔗
ext:
  id: aiti-bridge
  name: aiti-bridge
  description: MCP 桥 —— 让任意 AI agent 操作页面、直达 IDE AI 窗口
  soul: 隔着玻璃看页面的 AI，永远只是个旁观者。
  type: bridge
  installable: false  # 独立本地服务（npx 运行），不装进 aiti-agent/pi-web：extman 不列出、extensions.json 不入 extensions 数组（归 integrations）
  category: MCP 桥
  version: 0.2.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: "@aiti-ai/aiti-bridge"
  install: |
    npx @aiti-ai/aiti-bridge --port 8777
    # 配置成 MCP server 后，AI 即可 page_exec / page_snapshot / user_confirm ...
  license: MIT
  tags: [mcp, bridge, ai-agent]
---

# aiti-bridge

> ❝ **隔着玻璃看页面的 AI，永远只是个旁观者。** ❞

MCP 桥把"页面调试能力"变成任意 AI agent 的工具：配置 aiti-devtools 使用、改造 AI agent、消息直达 IDE AI agent 窗口。

- 详细文档：[MCP 桥](/guide/mcp/) · [产品页](/products/aiti-bridge.md)
