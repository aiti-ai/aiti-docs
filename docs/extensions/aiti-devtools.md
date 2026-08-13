---
title: aiti-devtools
icon: 🛠️
ext:
  id: aiti-devtools
  name: aiti devtools
  description: 页面内 AI 调试助手 —— 注入 __dbg + Inspector + MCP 桥
  soul: AI 不该对着屏幕瞎猜，它该真正看见页面。
  type: devtools-plugin
  category: 页面调试注入
  version: 0.2.1
  status: active
  author: aiti-ai
  repo: ""
  npm: "@justdb/aiti-devtools"
  install: |
    pnpm add -D @justdb/aiti-devtools
  license: MIT
  tags: [inject, inspector, mcp, __dbg]
---

# aiti-devtools

> ❝ **AI 不该对着屏幕瞎猜，它该真正看见页面。** ❞

把 AI 请到页面开发现场：注入 `__dbg` + Inspector 悬浮 UI + MCP 桥，AI 和人真正在**同一个页面**上协作。

- 形态① 开发者主动适配（本包）→ ② 平台内置 → ③ IDE 插件（vscode/idea）
- 详细文档：[开发者工具](/devtools/) · [产品页](/products/aiti-devtools.md)
