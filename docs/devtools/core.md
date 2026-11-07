---
title: aiti-devtools 本体
icon: 🛠️
description: "aiti-devtools — 页面内 AI 调试助手 SDK（core+inject 资产形态）"
tags: [devtools, inject, inspector, mcp]
---

# aiti-devtools 本体

> ❝ **AI 不该对着屏幕瞎猜，它该真正看见页面。** ❞

把 AI 请到页面开发现场：注入调试客户端（launcher UI）+ Inspector 悬浮组件 + MCP 桥，AI 和人真正在**同一个页面**上协作。

- 形态① 开发者主动适配 → ② 平台内置 → ③ [IDE 插件](/ide/)（vscode / idea，规划中）

## 分发形态

SDK 本体以 core+inject 资产形态由框架插件（`@aiti-ai/aiti-devtools-vite` 等）或独立桥 serve，无需单独安装。

## 手动接入（script 标签）

最简方式：dev server 能 serve 的任意 HTML 里加一行：

```html
<script src="/aiti/aiti-launcher.js" data-ai-url="/aiti/cockpit.html" data-bridge-url="/aiti"></script>
```

- `data-bridge-url`：桥地址（同源 `/aiti/` 或独立桥 `http://127.0.0.1:8777`）
- `data-ai-url`：AI 窗（cockpit 操作台）地址

但**绝大多数场景不需要手动接**——用框架插件一行接入即可，见下方集成矩阵。

## 集成矩阵

| 载体 | 接入方式 | 文档 |
|---|---|---|
| Vite / SvelteKit | `aitiDevtools()` 插件 | [vite](integrations/vite.md) |
| webpack / Rspack | `AitiDevtoolsWebpackPlugin` | [webpack-rspack](integrations/webpack-rspack.md) |
| Nuxt | `modules: ['@aiti-ai/aiti-devtools-nuxt']` | [nuxt](integrations/nuxt.md) |
| Astro | `integrations: [aitiAstro()]` | [astro](integrations/astro.md) |
| Vue 工程（规划中） | 复用 Vite 插件兜底 | [vue](integrations/vue.md) |
| Express / Next 等其他载体 | core 中间件手动接线 | [manual](integrations/manual.md) |

各载体的可运行示例见[示例矩阵](examples.md)。

## 注入原理与命令集

- [快速开始](quick-start.md)：最快接入路径
- [注入原理](inject.md)：本地 inject 细节、三种形态、宿主/iframe 路由
- [CDP 命令集](cdp-commands.md)：8 域命令参考
- [产品页](/products/aiti-devtools.md)：定位与路线图

## 与 pi-web 扩展的关系

**同名不同物**：pi-web 里也有一个叫 `aiti-devtools` 的[扩展](/extensions/aiti-devtools.html)（部署在 `~/.pi/web/extensions/`，负责 pi-web 场景下的注入器/桥/MCP server 端）。本页说的是 npm 发布的注入 SDK 本体；两者共用同一套桥协议与注入产物。
