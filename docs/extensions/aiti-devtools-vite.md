---
title: aiti-devtools-vite
icon: ⚡
ext:
  id: aiti-devtools-vite
  name: aiti-devtools-vite
  description: Vite 插件 —— dev 自动本地注入，零配置
  soul: 注入不该打断开发，它该像空气一样存在。
  type: devtools-plugin
  category: 页面调试注入
  version: 0.2.1
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: "@justdb/aiti-devtools-vite"
  install: |
    pnpm add -D @justdb/aiti-devtools-vite
    # vite.config.ts: plugins: [aitiDevtools()]
  license: MIT
  tags: [vite, inject]
---

# aiti-devtools-vite

> ❝ **注入不该打断开发，它该像空气一样存在。** ❞

Vite 工程的零配置注入插件：dev 模式自动注入 `aiti-devtools`，不上生产、不改业务代码。

- 详细文档：[Vite 插件](/devtools/vite-plugin.md) · [插件矩阵](/products/aiti-devtools-plugins.md)
