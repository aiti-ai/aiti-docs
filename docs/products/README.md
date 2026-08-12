---
title: 产品矩阵
icon: 🗂️
description: aiti 完整产品矩阵 — 覆盖入口层 / 注入层 / 桥接层 / Agent 层
---

# 产品矩阵

aiti 不是单一产品，而是一个 **AI 开发工具生态**。所有产品统一品牌、统一协议、统一 npm scope（`@justdb`）。

## 一、矩阵总览

| # | 产品 | npm 包名 | 形态 | 一句话定位 | 状态 |
|---|---|---|---|---|---|
| 1 | **aiti-agent** | `@justdb/aiti-agent` | Web 应用 + Docker 镜像 | 自托管个人 AI 开发工作台（**pi-web 自有分支**），浏览器是唯一操作面 | 🚧 M0-M4 |
| 2 | **aiti-core** | `@justdb/aiti` | SDK（协议/类型/共享库） | 全产品共享：桥协议、`pageId` 会话模型、注入脚本、MCP 工具定义 | 📋 |
| 3 | **aiti-devtools** | `@justdb/aiti-devtools` | 注入 SDK（`inject.js`） | 页面内 AI 调试助手：`__dbg` + Inspector + MCP 桥（形态① 主动适配） | ✅ 0.2.x |
| 4 | **aiti-devtools-vite** | `@justdb/aiti-devtools-vite` | Vite 插件 | dev server 自动注入，**本地 inject** | 📋 |
| 5 | **aiti-devtools-vue** | `@justdb/aiti-devtools-vue` | Vue 插件 | Vue 应用内注入（app.use 一行接入） | 📋 |
| 6 | **aiti-devtools-next** | `@justdb/aiti-devtools-next` | Next.js 插件 | 框架级注入（dev 构建 + `_debugSource` 源码定位） | 📋 |
| 7 | **aiti-devtools-react** | `@justdb/aiti-devtools-react` | React 插件 | React 工程注入 | 📋 |
| 8 | **aiti-devtools-svelte** | `@justdb/aiti-devtools-svelte` | Svelte 插件 | Svelte 工程注入 | 📋 |
| 9 | **aiti-mcp-bridge** | `@justdb/aiti-mcp-bridge` | 本地桥服务（CLI） | **配置 aiti-devtools 使用**、改造任意 AI agent、消息直达 IDE AI 窗口 | 🚧 桥已通 |
| 10 | **aiti-mcp-server** | `@justdb/aiti-mcp-server` | MCP server | stdio + HTTP + SSE 三 transport 的 MCP 端点（含 `page_exec` / `user_*` 工具族） | ✅ 0.2.x |
| 11 | **aiti-devtools-vscode** | `@justdb/aiti-devtools-vscode` | VS Code 扩展 | 完成注入 + 直连 IDE 内置 AI agent 窗口 | 📋 |
| 12 | **aiti-devtools-idea** | `@justdb/aiti-devtools-idea` | JetBrains 插件 | 同上（IntelliJ / PyCharm / WebStorm / GoLand） | 📋 |
| 13 | **aiti-devtools-chrome** | `@justdb/aiti-devtools-chrome` | Chrome 扩展 | 免改代码注入（形态②），任意站点可调试 | 📋 |
| 14 | **aiti-docs** | `@justdb/aiti-docs` | 文档站（本网站） | VuePress 文档 + 产品矩阵 + 路线图 | ✅ 本页 |

> 品牌与身份：GitHub 组织 `aiti-ai` · 官网 `https://aiti.py` · npm scope `@justdb` · 协议 MIT。

## 二、分层架构

```
┌─────────────────────────────────────────────────────────────┐
│ L4 入口层    aiti-agent (Web 工作台) · IDE 插件 · Chrome 扩展      │
│              统一操作面：会话 / 服务 / 终端 / 桌面 / 调试           │
├─────────────────────────────────────────────────────────────┤
│ L3 Agent 层 改造任意 AI agent（MCP client）                      │
│              Claude Code · Cursor · IDE 内置 AI · aiti-agent  │
├─────────────────────────────────────────────────────────────┤
│ L2 桥接层    aiti-mcp-bridge / aiti-mcp-server                 │
│             配置 aiti-devtools · pageId 会话 · SSE 页面桥       │
├─────────────────────────────────────────────────────────────┤
│ L1 注入层    aiti-devtools + vite/vue/next/react/svelte 插件    │
│             __dbg client · Inspector · 类 CDP 命令集 · 本地注入  │
└─────────────────────────────────────────────────────────────┘
```

### 各层职责

| 层 | 产品 | 职责 |
|---|---|---|
| **L1 注入层** | aiti-devtools 系列 | 把调试客户端注入到**正在开发的页面**：`__dbg` 迷你 client、Inspector 悬浮 UI、8 域 42 命令类 CDP 命令集、框架源码定位（React/Next/Vue/Svelte） |
| **L2 桥接层** | aiti-mcp-bridge / server | 让 AI 与页面对话：MCP 工具（`page_exec` / `page_snapshot` / `bridge_status` / `user_*`）、`pageId = instanceId/frameId` 会话体系、SSE 长连、事件广播（open_file 等） |
| **L3 Agent 层** | 任意 MCP 客户端 | 把桥接结果接入你的 AI：Claude Code、Cursor、IDE 内置 AI、aiti-agent 均可作为宿主 agent |
| **L4 入口层** | aiti-agent / IDE 插件 | 最终用户操作面：浏览器工作台；IDE 插件负责一键完成注入 + 把消息送进 IDE 的 AI agent 窗口 |

## 三、三条主线

### 主线 A：aiti-agent — Web 主战场

以 **pi** 为引擎、自托管的个人 AI 开发工作台。地基是 **agegr/pi-web 的自有分支**（146 commits 领先，含全生态唯一的 service-tunnels / queue 恢复），产品身份独立。

- 形态：Docker 单容器（lite/full）→ 浏览器 + 移动端
- 能力五层：UI 层 → 调试可视化层（CDP/VNC/ttyd）→ 暴露层（service-tunnels）→ 执行层（pi agent SDK）→ 数据层（共享 JSONL + queue 持久化）
- 详见 [aiti-agent](/products/aiti-agent.md)

### 主线 B：aiti-devtools — 本地注入生态

把 AI 请到页面开发现场。**嵌入各个主流开发工具**（Vite / Vue / Next / React / Svelte），**本地 inject**，无需改业务代码。

- 形态①：开发者主动适配（`<script src="aiti-devtools/inject.js">`）
- 形态②：Chrome 扩展 / 平台内置（免改代码）
- 形态③：IDE 插件（vscode / idea）自动注入
- 详见 [aiti-devtools](/products/aiti-devtools.md) 与 [devtools 插件矩阵](/products/aiti-devtools-plugins.md)

### 主线 C：aiti-mcp-bridge — AI agent 改造

桥接层产品。**配置 aiti-devtools 使用**、**改造 AI agent**，支持 aiti-devtools 及 aiti-devtools-vscode/idea 等插件**完成注入**；通过 **mcp-bridge 直接把消息发到 IDE 里的 AI agent 窗口**。

- 详见 [aiti-mcp-bridge](/products/aiti-mcp-bridge.md) 与 [IDE 插件](/products/aiti-ide-plugins.md)

## 四、端到端场景

### 场景 1：IDE 内 AI 修 bug（vscode/idea 插件 + mcp-bridge）

```
IDE 打开工程 → aiti-devtools-vscode 自动注入（dev server 或预构建）
  → 用户问 AI：「首页这个按钮点了没反应，帮我查」
  → IDE AI agent 经 aiti-mcp-bridge 调用 page_exec（点击按钮 → 采集 console 报错）
  → bridge 把结果送回 IDE AI 窗口，AI 定位到源码文件（open_file 自动打开）
  → AI 给出修复建议，甚至 user_confirm 询问用户是否直接改
```

### 场景 2：aiti-agent 远程调试

```
docker run aiti → 浏览器打开工作台 → 页面 dev 环境注入 aiti-devtools
  → 工作台 AI 会话经 service-tunnels 暴露 → CDP 9222 / noVNC 6080 可视化远程调试
```

## 五、协议与约定

| 约定 | 值 |
|---|---|
| 桥协议 | `__dbg` 消息信封 + MCP JSON-RPC + SSE 页面桥 |
| 会话 ID | `pageId = instanceId/frameId`（如 `01234/f0`），TTL 保留、secret 防串台 |
| 命名 | `token → instanceId`（连接身份）、`uid → frameId`（目标 frame）、组合 = `pageId` |
| 环境变量 | 统一 `AITI_*`（如 `AITI_OPEN_CMD`、`AITI_MCP_TOKEN`） |
| npm scope | `@justdb/*`（裸名 3-4 字母被 npm 防抢注风控拒绝） |
| 域名 | `aiti.py`（官网 / 文档 / MCP 端点） |

> 下一节：[指南 · 什么是 aiti](/guide/what-is-aiti.md)
