---
title: aiti-mcp-bridge / aiti-mcp-server
icon: 🔗
description: 配置 aiti-devtools 使用、改造 AI agent、消息直达 IDE AI agent 窗口
tags: [product, aiti-mcp-bridge, mcp, ai-agent]
---

# aiti-mcp-bridge / aiti-mcp-server — AI agent 改造层

> **一句话**：MCP 桥把"页面调试能力"变成**任意 AI agent 的工具** —— 配置 aiti-devtools 使用；改造 AI agent；支持 aiti-devtools、aiti-devtools-vscode/idea 等插件完成注入；**通过 mcp-bridge 直接把消息发到 IDE 里的 AI agent 窗口**。

## 1. 产品构成

| 包 | 形态 | 职责 |
|---|---|---|
| `@justdb/aiti-mcp-bridge` | 本地桥服务（CLI） | 配置 aiti-devtools 的桥地址/token/pageId；会话登记与路由；事件广播；对接 IDE AI 窗口 |
| `@justdb/aiti-mcp-server` | MCP server | stdio + HTTP + SSE 三 transport 的 MCP 端点，暴露 `page_*` / `user_*` 工具族 |

## 2. 它解决了什么

| 痛点 | 解决 |
|---|---|
| AI 看不到页面 | `page_exec`（类 CDP 命令）/ `page_snapshot` 让 AI 操作并读取真实页面 |
| AI 需要用户配合 | `user_*` 工具族：点选元素、是/否确认、方案选择、文本输入、在线探测、非阻塞通知 |
| 配置繁琐 | **配置最小化**：inspect 只需传 AI 地址，宿主把环境（`pageId`）构建好，AI 窗口打开即用 |
| token 写死、多连接混淆 | `token → instanceId`（连接身份，短数字/字母数字），`uid → frameId`（目标 frame），组合 `pageId` |
| 刷新就断线 | instanceId 持久化 + TTL 保留 + secret 校验，**reload 不断线** |
| 消息到不了 IDE 的 AI | IDE 插件 + bridge 直连：AI agent 窗口实时收到页面事件/交互结果 |

## 3. 架构链路

```
IDE AI agent 窗口 / Claude Code / Cursor / aiti-agent
        │  MCP (stdio / HTTP / SSE)
        ▼
┌─────────────────────────────┐
│ aiti-mcp-bridge（本地服务）      │  session 登记 / 路由 / 广播
│  ├─ /bridge/claim             │  连接登记/复用（instanceId + secret）
│  ├─ /bridge/sessions          │  发现：全部可操作 pageId
│  ├─ /bridge/sse               │  持久连接（role=page|ai）
│  ├─ /bridge/result            │  执行结果回桥
│  ├─ /bridge/event             │  页面事件（open_file 等）
│  └─ /mcp/sse + /mcp           │  MCP JSON-RPC（tools/list / tools/call）
└────────────┬────────────────┘
             │ SSE
             ▼
   aiti-devtools（页面注入）→ __dbg client → 目标 frame 执行
```

## 4. MCP 工具族

### page_*（页面操作，单向命令）

| 工具 | 说明 |
|---|---|
| `page_exec` | 在 `pageId` 目标 frame 执行类 CDP 命令（DOM/CSS/Input/Page/Runtime/Storage/Performance/Browser） |
| `page_snapshot` | 采集页面快照（DOM 概要 + 视口 + 框架识别） |
| `bridge_status` | 桥连接状态、活跃连接、可操作 pageId 列表 |

### user_*（人机交互，AI 把人叫到现场）

| 工具 | 场景 | 用户在哪作答 |
|---|---|---|
| `user_pick_element` | AI 请用户点选页面元素 | 页面（点选面板 + Inspector） |
| `user_confirm` | 是/否（批准/拒绝，带理由） | AI 窗口作答卡 |
| `user_choose` | 方案 A/B/C 选择（可多选） | AI 窗口作答卡 |
| `user_input` | 文本输入 | AI 窗口作答卡 |
| `user_presence` | 探测用户是否在线 | AI 窗口作答卡 |
| `user_notify` | 非阻塞通知 | 浏览器 Notification |

统一语义：超时可控（前端倒计时 + 服务器同步暂停）、通知到位（Notification + 标题闪烁 + 提示音）、拒绝有语义（预设 + 自定义理由）。

## 5. 快速使用

```bash
# 1. 启动桥
npx @justdb/aiti-mcp-bridge --http 8777

# 2. 配置任意 MCP 客户端
# Claude Code: claude mcp add aiti -- npx @justdb/aiti-mcp-server --bridge http://localhost:8777
# Cursor / IDE AI: 在 MCP 设置里添加 aiti-mcp-server（stdio）

# 3. 告诉 AI 目标页面
# 「用 bridge_status 看一下当前有哪些 pageId，然后对 01234/f0 执行 page_snapshot」
```

## 6. 安全

- token/secret 认证（SSE / result / event 全部校验）
- secret 防跨页面冲突：只有原页面能复用自己的 instanceId
- 危险命令确认 + 手势桥（transient activation）
- 桥端点默认本机监听，支持 `AITI_MCP_TOKEN` 环境变量

> 会话体系详解见 [MCP 桥 · 会话](/mcp-bridge/session.md)，改造 AI agent 见 [MCP 桥 · AI agent](/mcp-bridge/ai-agents.md)。
