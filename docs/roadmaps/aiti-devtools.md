---
title: aiti-devtools 规划
icon: 🛠️
description: 本地注入生态计划 — 核心包 + 框架插件
tags: [roadmap, aiti-devtools]
---

# aiti-devtools 规划（本地注入生态）

> 核心目标：**嵌入各个主流开发工具，本地 inject**，把 AI 请到页面开发现场。

## 阶段计划

| 阶段 | 目标 | 交付 | 状态 |
|---|---|---|---|
| **R0 · 协议** | 注入/桥/会话协议打通 | 方案 B/C/D/E ✅；aiti-devtools 0.2.x（自检 21/21）；桥端点全量 | ✅ |
| **R1 · 核心可用** | 开发者开箱即用 | `@justdb/aiti-devtools` 正式发布；`AITI_*` 环境变量统一；自检扩展到 30+ | 🚧 |
| **R2 · 插件矩阵** | 嵌入主流开发工具 | devtools-**vite** 优先，vue/next/react/svelte 跟进；Chrome 扩展（形态②） | 📋 |
| **R3 · IDE 插件** | 完成注入 + 直达 AI 窗口 | devtools-vscode / devtools-idea（见 [aiti-mcp-bridge 规划](/roadmaps/aiti-mcp-bridge.md)） | 📋 |
| **R4 · 平台化** | 生态开放 | 公开注入协议/脚本规范、扩展市场、贡献指南 | 📋 |

## 插件矩阵（R2）

| 插件 | 包名 | 注入点 | 优先级 |
|---|---|---|---|
| Vite | `@justdb/aiti-devtools-vite` | transformIndexHtml / 中间件 prepend | P0 |
| Vue | `@justdb/aiti-devtools-vue` | app.use + 组件定位 | P0 |
| Next.js | `@justdb/aiti-devtools-next` | dev server 响应注入 + `_debugSource` | P1 |
| React | `@justdb/aiti-devtools-react` | Babel 插件 / 入口 | P1 |
| Svelte | `@justdb/aiti-devtools-svelte` | `__svelte_meta` 源码定位 | P1 |
| Webpack | `@justdb/aiti-devtools-webpack` | html-webpack-plugin 钩子 | P2(可选) |

## 技术债务与待办

- [ ] `DBG_*` → `AITI_*` 环境变量统一（`DBG_MCP_TOKEN` → `AITI_MCP_TOKEN`、`DBG_OPEN_CMD` → `AITI_OPEN_CMD`）
- [x] 同步链路统一：旧 `packages/` 发布副本 + `dbg-launcher.js` monolith 已删除——唯一开发源 `examples/dbg-widget/src/` + `dev-repo/`，构建部署走 `tools/build-launcher.mjs` → `tools/deploy-ext.mjs`
- [ ] 自检扩展：跨域 iframe 枚举、SSE 断线重连、TTL 复用回归
- [ ] npm 包拆分：client/launcher（`aiti-launcher.js`）与 mcp-server/client 独立版本管理
- [ ] 双注入互斥检测标准化（`window.__aiti` 探测 + 防抖）

## 里程碑验收标准

- **R1**：`npx aiti-mcp-server` + `<script src>` 5 分钟内跑通；自检 30+ 全过；无 `DBG_*` 残留
- **R2**：Vite/Vue 插件在三个真实工程验证；Chrome 扩展可注入任意站点
- **R3**：vscode 插件在 Copilot Chat 完成端到端修 bug 演示
