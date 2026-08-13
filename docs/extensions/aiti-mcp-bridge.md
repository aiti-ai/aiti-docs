---
title: aiti-mcp-bridge
icon: 🔗
ext:
  id: aiti-mcp-bridge
  name: aiti-mcp-bridge
  description: MCP 桥 —— 让任意 AI agent 操作页面、直达 IDE AI 窗口
  type: bridge
  category: MCP 桥
  version: 0.2.0
  status: active
  author: aiti-ai
  repo: ""
  npm: "@justdb/aiti-mcp-bridge"
  install: |
    npx @justdb/aiti-mcp-bridge --http 8777
    # 配置成 MCP server 后，AI 即可 page_exec / page_snapshot / user_confirm ...
  license: MIT
  tags: [mcp, bridge, ai-agent]
---

# aiti-mcp-bridge

MCP 桥把"页面调试能力"变成任意 AI agent 的工具：配置 aiti-devtools 使用、改造 AI agent、消息直达 IDE AI agent 窗口。

- 详细文档：[MCP 桥](/guide/mcp/) · [产品页](/products/aiti-mcp-bridge.md)
