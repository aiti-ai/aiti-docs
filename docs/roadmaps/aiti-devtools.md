---
title: aiti-devtools 规划
icon: 🛠️
description: 本地注入生态计划 — 核心包 + 载体插件矩阵
tags: [roadmap, aiti-devtools]
---

# aiti-devtools 规划（本地注入生态）

> 核心目标：**嵌入各个主流开发工具，本地 inject**，把 AI 请到页面开发现场。
> **现状基准**：aiti-devtools 无独立 npm 包，随 pi-web 内置 + 载体插件分发；逐项状态以[产品矩阵](/products/README.md)为准。

## 阶段计划

| 阶段 | 目标 | 交付 | 状态 |
|---|---|---|---|
| **R0 · 协议** | 注入/桥/会话协议打通 | 注入脚本 + MCP 桥 + pageId 会话体系 + user_* 交互工具族全链路；桥端点全量 | ✅ |
| **R1 · 核心可用** | 开发者开箱即用 | npm 包矩阵已上架：core / inject / vite / webpack / nuxt / bridge（独立版本管理）；剩 `DBG_*` → `AITI_*` 收口、自检清单实体化 30+、README/demo 打磨 | 🚧 |
| **R2 · 插件矩阵** | 嵌入主流开发工具 | vite/webpack/nuxt ✅ 已上架；browser-ext（形态②）🚧 源码就绪待三市场上架；vue/react/svelte 现阶段复用 Vite 插件（深度集成 📋）；aiti-bridge 配置最小化收官 | 🚧 |
| **R3 · IDE 插件** | 完成注入 + 直达 AI 窗口 | vscode 0.3.x 源码就绪（见 [aiti-bridge 规划](/roadmaps/aiti-bridge.md)）；idea 📋 | 🚧 |
| **R4 · 平台化** | 生态开放 | 公开注入协议/脚本规范、扩展市场、贡献指南 | 📋 |

## 插件矩阵（R2）

| 插件 | 包名 | 注入点 | 状态 |
|---|---|---|---|
| Vite | `@aiti-ai/aiti-devtools-vite` | transformIndexHtml / 中间件 prepend | ✅ 0.1.x 已上架（含 Astro Integration；Vue/SvelteKit 直接复用） |
| Webpack / Rspack | `@aiti-ai/aiti-devtools-webpack` | setupMiddlewares + html-webpack-plugin 钩子 | ✅ 0.1.x 已上架（Rspack 直接复用） |
| Nuxt | `@aiti-ai/aiti-devtools-nuxt` | `modules` 一行接入：挂桥 + head 自动注入 | ✅ 0.1.x 已上架 |
| Chrome 扩展（形态②） | browser-ext（`@aiti-ai/aiti-devtools-browser-ext`，暂未发 npm） | 免改代码注入任意站点 | 🚧 v0.1.x 源码就绪；商店素材/发布手册齐备，三市场提交待执行 |
| Next.js | — | dev server 响应注入 + `_debugSource` | 📋 待立项 |
| Vue / React / Svelte 深度集成 | — | 组件层级 / 框架元信息 | 📋 P2 评估（现阶段直接复用 Vite 插件） |
| JetBrains（idea） | — | 见 [aiti-bridge 规划](/roadmaps/aiti-bridge.md) | 📋 |

## 技术债务与待办

- [ ] `DBG_*` → `AITI_*` 环境变量统一（进行中：产品源码残留 22 处，如 `DBG_OPEN_CMD` → `AITI_OPEN_CMD`）
- [ ] 自检清单实体化：当前仅源码注释级引用，落成可运行清单并扩展到 30+（跨域 iframe 枚举、SSE 断线重连、TTL 复用回归）
- [ ] 双注入互斥检测标准化（`window.__aiti` 探测 + 防抖）

> ✅ 已完成：npm 包拆分（client/launcher 与 core/mcp 独立版本管理，均已上架）。

## 里程碑验收标准

- **R1**：包矩阵开箱即用（`npx @aiti-ai/aiti-bridge` + 载体插件 5 分钟内跑通）；自检 30+ 全过；无 `DBG_*` 残留
- **R2**：browser-ext 三市场上架；vite/webpack/nuxt 在真实工程持续回归
- **R3**：vscode 市场发布 + Copilot Chat 端到端修 bug 演示成片
