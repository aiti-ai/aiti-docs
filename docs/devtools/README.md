---
title: aiti-devtools
icon: 🛠️
description: 页面内 AI 调试助手 — SDK 本体、框架集成、示例矩阵
keywords: 页面内 AI 调试, 浏览器调试注入, CDP 命令, Vite 插件, webpack 插件, Nuxt Astro 集成, Inspector
---

# aiti-devtools

把 AI 请到页面开发现场：注入调试客户端 + Inspector + MCP 桥，AI 和人真正在**同一个页面**上协作。

> ⚠️ **同名不同物**：[扩展注册表](/extensions/)里的 `aiti-devtools` 是 **pi-web 扩展**（pi-web 场景下的注入器/桥/MCP server 端）；本大类讲的是 npm 发布的 **SDK 与各框架插件**——它不是扩展。

## 文档地图

| 文档 | 内容 |
|---|---|
| [快速开始](quick-start.md) | 最快接入路径 |
| [SDK 本体](core.md) | SDK/资产形态（core+inject，经框架插件或独立桥分发，无独立 npm 包）：手动 script 接入 + 集成矩阵总览 |
| [注入原理](inject.md) | 本地 inject 细节、三种形态、宿主/iframe 路由 |
| [CDP 命令集](cdp-commands.md) | 8 域命令参考 |
| [aiti-agent 扩展点](extension-points.md) | 扩展框架：插槽、契约、生命周期 |

## 框架集成（integrations/）

| 载体 | npm 包 | 接入方式 | 文档 | 状态 |
|---|---|---|---|---|
| Vite / SvelteKit / 任意 Vite 工程 | `@aiti-ai/aiti-devtools-vite` | `aitiDevtools()` 插件 | [vite](integrations/vite.md) | ✅ |
| webpack-dev-server | `@aiti-ai/aiti-devtools-webpack` | `new AitiDevtoolsWebpackPlugin()` | [webpack-rspack](integrations/webpack-rspack.md) | ✅ |
| Rspack | `@aiti-ai/aiti-devtools-webpack`（同一包复用） | 零改动 | [webpack-rspack](integrations/webpack-rspack.md) | ✅ 实测 |
| Nuxt | `@aiti-ai/aiti-devtools-nuxt` | `modules: ['@aiti-ai/aiti-devtools-nuxt']` 一行 | [nuxt](integrations/nuxt.md) | ✅ |
| Astro | `@aiti-ai/aiti-devtools-vite` 的 `/astro` 子导出 | `integrations: [aitiAstro()]` 一行 | [astro](integrations/astro.md) | ✅ |
| Vue 工程 | 复用 `@aiti-ai/aiti-devtools-vite` | Vite 插件兜底 | [vue](integrations/vue.md) | 📋 规划独立包 |
| Express / Next / 其他 Node 服务 | `@aiti-ai/aiti-devtools-core` | 中间件手动接线 | [manual](integrations/manual.md) | ✅ 指南 |

> npm scope 全家：`@aiti-ai/aiti-devtools-{vite,webpack,nuxt,core,inject,agent,pi}` + `@aiti-ai/aiti-bridge`——包与载体对应关系详见 [插件矩阵](/products/aiti-devtools-plugins.md)。

## 示例

每个载体都有最小可运行示例（统一端口段 5199-5899），见 [示例矩阵](examples.md)。

## 相关

- [产品页](/products/aiti-devtools.md) · [devtools 插件矩阵](/products/aiti-devtools-plugins.md)
- [IDE 插件](/ide/)（vscode / idea，规划中）
- [MCP 桥](/guide/mcp/)
