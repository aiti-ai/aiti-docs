---
title: aiti-debug-inject
icon: 🧥
ext:
  id: aiti-debug-inject
  name: AITI Debug Inject
  description: 极简远程调试注入 —— 把另一个 pi-web 实例的调试器注入本实例页面，服务地址是 extman 里的文本 feature，默认关闭
  soul: 调试器该穿在哪件衣服里，由你说了算。
  type: dev-repo
  category: 页面调试注入
  version: "0.3.7"
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-debug-inject/ 后 reload
  license: MIT
  tags: [inject, launcher, cross-instance, debug, fab]
---

# aiti-debug-inject

> ❝ **调试器该穿在哪件衣服里，由你说了算。** ❞

把 **dev-exts/aiti-inject**（dev 专用、硬编码生产地址、始终注入）演变成的**正经扩展**，极简版：无 toolbar / 无弹窗 / 无自带配置 UI——「就是简单注入 JS」。

- **无 UI**：不声明 `ui`，client 不 `registerItems`。
- **服务地址是 feature 配置**：`service.url` 是一个 **string feature**——扩展管理器（aiti-extman）功能管理面板里直接一个文本框填目标 pi-web 地址（回车/失焦保存）。*依赖 core 的 string-valued feature 支持（`ExtFeature.type === "string"`）。*
- **默认关闭**：`inject.enabled` 是 boolean feature（默认关），面板里勾选开关。
- **跨实例调试**：开关打开 + 地址配好后，把目标 pi-web 的 aiti-devtools launcher（带内容哈希）注入本实例页面 → 本实例页面接入目标桥 → 目标 pi-web 的 agent 调试本实例页面（「用一个 pi-web 调试另一个」）。

## 用法

1. 扩展管理器 → aiti-debug-inject → 功能管理：
   - 「服务地址（目标 pi-web）」文本框填目标站点地址（如 `https://pi-web.example.com` 或 `http://127.0.0.1:<端口>`），回车保存。
   - 「启用注入」开关打开。
2. 本实例页面即时注入目标 launcher（feature 变更监听，无需刷新）。

> 与 `aiti-devtools` 自注入（`inject.ts`，service-tunnels 服务端拼 HTML = 本实例自注入自己的 launcher）的区别：本扩展是**注入另一个 pi-web 的 launcher**，纯 client 浏览器侧注入，无服务端逻辑。
