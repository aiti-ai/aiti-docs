---
title: 产品矩阵
icon: 🗂️
description: aiti 完整产品矩阵 — 覆盖入口层 / 注入层 / 桥接层 / Agent 层
keywords: aiti-agent, aiti-devtools, aiti-bridge, 自托管 AI 工作台, 页面注入 SDK, docker AI 开发
---

# 产品矩阵

aiti 不是单一产品，而是一个 **AI 开发工具生态**。所有产品统一品牌、统一协议、统一 npm scope（`@aiti-ai`）。

## 一、矩阵总览

> 状态图例：✅ 已发布可用 · 🚧 源码就绪 / 进行中 · 📋 规划中

| # | 产品 | npm 包 / 发布形态 | 形态 | 一句话定位 | 状态 |
|---|---|---|---|---|---|
| 1 | **aiti-agent** | [`@aiti-ai/pi-web`](https://www.npmjs.com/package/@aiti-ai/pi-web) · Docker [`aitiai/pi-web`](https://hub.docker.com/r/aitiai/pi-web)（core/full） | Web 应用 + Docker 镜像 | 自托管个人 AI 开发工作台（基于 pi-web 构建，自带 63+ 内置扩展），浏览器为主操作面，与 pi CLI / pi IDE 扩展同源兼容 | ✅ 0.15.x |
| 2 | **aiti-devtools** | 随 pi-web 内置扩展 + 载体插件分发（无独立 npm 包） | 注入 SDK（`aiti-launcher.js`） | 页面内 AI 调试助手：client + Inspector + MCP 桥（形态① 主动适配） | ✅ 0.2.x |
| 3 | **aiti-devtools-vite** | [`@aiti-ai/aiti-devtools-vite`](https://www.npmjs.com/package/@aiti-ai/aiti-devtools-vite) | Vite 插件 | dev server 自动注入（含 Astro Integration；SvelteKit 直接复用），**本地 inject** | ✅ 0.1.x |
| 4 | **aiti-devtools-webpack** | [`@aiti-ai/aiti-devtools-webpack`](https://www.npmjs.com/package/@aiti-ai/aiti-devtools-webpack) | Webpack/Rspack 插件 | dev server 注入（setupMiddlewares + html-webpack-plugin），Rspack 直接复用 | ✅ 0.1.x |
| 5 | **aiti-devtools-nuxt** | [`@aiti-ai/aiti-devtools-nuxt`](https://www.npmjs.com/package/@aiti-ai/aiti-devtools-nuxt) | Nuxt 模块 | `modules` 一行接入：挂桥 + head 自动注入 | ✅ 0.1.x |
| 6 | **aiti-bridge** | [`@aiti-ai/aiti-bridge`](https://www.npmjs.com/package/@aiti-ai/aiti-bridge) | 本地桥服务（CLI） | 把页面调试能力变成任意 AI agent 的 MCP 工具（`page_*` / `user_*`），消息直达 IDE AI 窗口 | ✅ 0.2.x |
| 7 | **aiti-devtools-vscode** | 源码就绪（VS Code / Cursor / Windsurf，应用市场未发布） | VS Code 扩展 | 完成注入 + 直连 IDE 内置 AI agent 窗口 | 🚧 MVP |
| 8 | **aiti-devtools-idea** | 📋 规划 | JetBrains 插件 | 同上（IntelliJ / PyCharm / WebStorm / GoLand） | 📋 |
| 9 | **aiti-devtools-chrome** | 📋 规划 | Chrome 扩展 | 免改代码注入（形态②），任意站点可调试 | 📋 |
| 10 | **aiti-devtools-vue / -react / -svelte** | 📋 规划（Vue / SvelteKit 现阶段直接复用 Vite 插件） | 框架专属插件 | 组件层级信息等框架深度集成 | 📋 |
| 11 | **aiti-core** | 📋 规划（`@aiti-ai/aiti`） | SDK（协议/类型/共享库） | 全产品共享：桥协议、`pageId` 会话模型、注入脚本、MCP 工具定义 | 📋 |
| 12 | **扩展生态** | npm `@aiti-ai/*` 已发布扩展包 + pi-web 内置 63+ | pi-web 扩展 | session-manager / git 工具链 / 多 agent 后端（Claude Code、Codex、Cursor…）/ 模型向导 / service-tunnels / 文档查看器… | ✅ [浏览全部](/extensions/) |
| 13 | **周边独立件** | [GitHub `aiti-ai` org](https://github.com/orgs/aiti-ai/repositories) | 服务 / CLI / 库 | service-tunnels（端口隧道）、pi-subagents（pi 子代理编排）、grdpwasm（Web RDP）、pi-models-respect、ddns | ✅ |
| 14 | **aiti-docs** | [github.com/aiti-ai/aiti-docs](https://github.com/aiti-ai/aiti-docs)（本站源码） | 文档站（本网站） | VuePress 文档 + 产品矩阵 + 路线图 | ✅ 本页 |

> 品牌与身份：GitHub 组织 `aiti-ai` · 官网 `https://aiti.pw` · npm scope `@aiti-ai` · 协议 MIT。

**现在就能用**：

```bash
# 自托管工作台（三选一）
npx @aiti-ai/pi-web@latest                       # npm 免安装直跑
curl -fsSL https://aiti.pw/install.sh | sh       # macOS / Linux（无需 npm）
docker run -d -p 30142:30142 aitiai/pi-web:core  # Docker（:full 加 GUI/语音/隧道）

# 本地 MCP 桥（任意 AI agent 接入页面调试）
npx @aiti-ai/aiti-bridge --port 8777
```

## 二、分层架构

```
┌ L4 入口层 ──────────────────────────────────────
│ aiti-agent（Web 工作台）· IDE 插件 · Chrome 扩展
│ 统一操作面：会话 / 服务 / 终端 / 桌面 / 调试
├ L3 Agent 层 ────────────────────────────────────
│ 改造任意 AI agent（MCP client）
│ Claude Code · Cursor · IDE 内置 AI · aiti-agent
├ L2 桥接层 ──────────────────────────────────────
│ aiti-bridge（MCP 端点内置）
│ 桥接 aiti-devtools · pageId 会话 · SSE 页面桥
├ L1 注入层 ──────────────────────────────────────
│ aiti-devtools + vite / webpack / nuxt 插件
│ client · Inspector · 类 CDP 命令集 · 本地注入
└─────────────────────────────────────────────────
```

### 各层职责

| 层 | 产品 | 职责 |
|---|---|---|
| **L1 注入层** | aiti-devtools 系列 | 把调试客户端注入到**正在开发的页面**：`aiti-devtools` 迷你 client、Inspector 悬浮 UI、8 域 42 命令类 CDP 命令集、框架源码定位（React/Next/Vue/Svelte） |
| **L2 桥接层** | aiti-bridge / server | 让 AI 与页面对话：MCP 工具（`page_exec` / `page_snapshot` / `bridge_status` / `user_*`）、`pageId = instanceId/frameId` 会话体系、SSE 长连、事件广播（open_file 等） |
| **L3 Agent 层** | 任意 MCP 客户端 | 把桥接结果接入你的 AI：Claude Code、Cursor、IDE 内置 AI、aiti-agent 均可作为宿主 agent |
| **L4 入口层** | aiti-agent / IDE 插件 | 最终用户操作面：浏览器工作台；IDE 插件负责一键完成注入 + 把消息送进 IDE 的 AI agent 窗口 |

## 三、三条主线

### 主线 A：aiti-agent — Web 主战场

以 **pi** 为引擎、自托管的个人 AI 开发工作台（npm 包 **`@aiti-ai/pi-web`**）。构建于开源项目 **agegr/pi-web** 之上（含全生态唯一的 service-tunnels / queue 恢复），产品身份独立。来历见[项目起源](/guide/origin.md)。

- 形态：npm 全局安装 / 一键脚本 / Docker 单容器（core/full）→ 浏览器 + 移动端
- 现状：✅ 已发布（0.15.x）——三种安装入口详见 [aiti-agent](/products/aiti-agent.md) 与 [安装指南](/guide/install.md)
- 能力五层：UI 层 → 调试可视化层（CDP/VNC/ttyd）→ 暴露层（service-tunnels）→ 执行层（pi agent SDK）→ 数据层（共享 JSONL + queue 持久化）

### 主线 B：aiti-devtools — 本地注入生态

把 AI 请到页面开发现场。**嵌入各个主流开发工具**（Vite / Webpack / Nuxt / Astro；Next / Express / SvelteKit 经 core 接入），**本地 inject**，无需改业务代码。

- 形态①：开发者主动适配（`<script src="…/aiti-launcher.js" defer></script>`）
- 形态②：Chrome 扩展 / 平台内置（免改代码，规划中）
- 形态③：IDE 插件（vscode 源码就绪 / idea 规划）自动注入
- 详见 [aiti-devtools](/products/aiti-devtools.md) 与 [devtools 插件矩阵](/products/aiti-devtools-plugins.md)

### 主线 C：aiti-bridge — AI agent 改造

桥接层产品。**把页面调试能力变成任意 AI agent 的 MCP 工具**（`page_*` / `user_*`），为 aiti-devtools 及 aiti-devtools-vscode/idea 等插件提供桥接配套；通过 **aiti-bridge 直接把消息发到 IDE 里的 AI agent 窗口**。

- 详见 [aiti-bridge](/products/aiti-bridge.md) 与 [IDE 插件](/products/aiti-ide-plugins.md)

## 四、端到端场景

### 场景 1：IDE 内 AI 修 bug（vscode/idea 插件 + aiti-bridge）

```
IDE 打开工程 → aiti-devtools-vscode 自动注入（dev server 或预构建）
  → 用户问 AI：「首页这个按钮点了没反应，帮我查」
  → IDE AI agent 经 aiti-bridge 调用 page_exec（点击按钮 → 采集 console 报错）
  → bridge 把结果送回 IDE AI 窗口，AI 定位到源码文件（open_file 自动打开）
  → AI 给出修复建议，甚至 user_confirm 询问用户是否直接改
```

### 场景 2：aiti-agent 远程调试

```
docker run -d -p 30142:30142 aitiai/pi-web:core → 浏览器打开工作台
  → 页面 dev 环境注入 aiti-devtools → 工作台 AI 会话经 service-tunnels 暴露
  → CDP 9222 / noVNC 6080 可视化远程调试
```

## 五、协议与约定

| 约定 | 值 |
|---|---|
| 桥协议 | `aiti-devtools` 消息信封 + MCP JSON-RPC + SSE 页面桥 |
| 会话 ID | `pageId = instanceId/frameId`（如 `01234/f0`），TTL 保留、secret 防串台 |
| 命名 | `token → instanceId`（连接身份）、`uid → frameId`（目标 frame）、组合 = `pageId` |
| 环境变量 | 统一 `AITI_*`（如 `AITI_OPEN_CMD`、`AITI_BRIDGE_PORT`） |
| npm scope | `@aiti-ai/*`（裸名 3-4 字母被 npm 防抢注风控拒绝） |
| 域名 | `aiti.pw`（官网 / 文档 / MCP 端点） |

> 下一节：[指南 · 什么是 aiti](/guide/what-is-aiti.md)
