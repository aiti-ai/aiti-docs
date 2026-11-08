---
title: MCP 桥
icon: 🔗
description: aiti-bridge 使用文档 —— 让任意 AI agent 操作页面、与用户协作
tags: [guide, aiti-bridge, mcp, ai-agent]
---

# MCP 桥（aiti-bridge）

让 AI 与你的页面对话。配置 aiti-devtools 使用、改造任意 AI agent、直达 IDE AI 窗口、通用 AI 窗口（cockpit）接入引导。

| 文档 | 内容 |
|---|---|
| [Server](/guide/mcp/server.md) | 启动、端点、传输（含 Streamable HTTP）、MCP 工具参考（含 aiti_inbox） |
| [会话体系](/guide/mcp/session.md) | pageId = instanceId/frameId、发现、复用、不断线 |
| [接入 AI agent](/guide/mcp/ai-agents.md) | 能力矩阵、分 agent 接入、aiti_inbox 主通道 |
| [agent prompt 示例](/guide/mcp/prompts.md) | 无 AI 窗直接集成时，各 agent 的引导 prompt（复制即用） |
| [通用 AI 窗口 cockpit](/guide/mcp/cockpit.md) | 引导页 + 地址配置中枢 + 操作台、三条接入路径 |

## 一句话

**aiti-bridge 把"页面调试能力"变成任意 AI agent 的标准 MCP 工具**：任何支持 MCP 的 agent（Claude Code / Cursor / IDE AI / aiti-agent / 任意 CLI）配置后即可操作页面、点选元素、询问用户；人侧的**通用 AI 窗口（cockpit）**负责显示/配置桥地址、引导 agent 接入、并在 MCP 降级方式下作为人机协作操作台。

## 快速开始

```bash
# 1. 启动桥（本地服务，默认 8777）
npx @aiti-ai/aiti-bridge --port 8777

# 2. 页面注入 aiti-devtools（Vite 示例）
pnpm add -D @aiti-ai/aiti-devtools-vite
# vite.config.ts 启用插件，dev 页面右下角出现 💬 / <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-2px"><path d="M22 12h-4"/><path d="M6 12H2"/><path d="M12 6V2"/><path d="M12 22v-4"/><path d="M12 12"/></svg>（Inspector）

# 3. 把桥配给任意 MCP 客户端（一键注册 stdio shim，幂等）
npx @aiti-ai/aiti-bridge --register-shim   # agent 启动带 env AITI_BRIDGE_URL 即接入
# 或 MCP client 直连 HTTP 端点：http://127.0.0.1:8777/aiti/mcp/mcp

# 4. 让 AI 开始调试
# 「用 bridge_status 看有哪些 pageId，对 01234/f0 执行 page_snapshot」
```

## 核心概念速览

| 概念 | 说明 |
|---|---|
| `pageId` | `instanceId/frameId`，AI 只用一个词定位目标页面（见 [会话体系](/guide/mcp/session.md)） |
| `page_*` 工具 | 操作/读取页面（page_exec / page_snapshot / bridge_status） |
| `user_*` 工具 | 人机协作（点选/确认/选择/输入/在线/通知） |
| `aiti_inbox` | **消息主通道**：人发消息/异步作答/页面事件进队列，agent 调工具取走——任何 agent 100% 可用（见 [接入 AI agent](/guide/mcp/ai-agents.md)） |
| cockpit | 通用 AI 窗口：引导接入 + 地址配置 + 人侧操作台（见 [cockpit](/guide/mcp/cockpit.md)） |

> 相关：[产品页 · aiti-bridge](/products/aiti-bridge.md) · [架构](/guide/architecture.md)
