---
title: MCP Server
icon: 🖥️
description: 启动、端点、MCP 工具参考
tags: [mcp-bridge, server, reference]
---

# aiti-mcp-server

MCP 端点：stdio + HTTP + SSE 三 transport。

## 启动

```bash
# 桥（本地服务，含会话登记/路由/广播）
npx @justdb/aiti-mcp-bridge --http 8777

# 或直接跑 MCP server（等同，桥的 MCP 面）
npx @justdb/aiti-mcp-server --http 8777
# stdio 模式（给 Claude Code / Cursor 等用）
npx @justdb/aiti-mcp-server --bridge http://localhost:8777
```

## 桥端点一览

| 端点 | 说明 |
|---|---|
| `POST /bridge/claim` | 连接登记/复用（instanceId + secret + pageKey） |
| `GET /bridge/sessions` | 发现：按 frame 展开 `[{instanceId, frameId, pageId, url, frameworks, active, lastSeen}]` |
| `POST /bridge/register` | iframe 动态补报 frameId |
| `GET /bridge/sse?instanceId=&role=page\|ai&frameId=&url=&frameworks=` | 持久连接（SSE） |
| `POST /bridge/result` | `{pageId, requestId, ok, result}`（pageId 校验 + 全局 pendingRequests） |
| `POST /bridge/event` | `{pageId, type, payload}`（open_file 等页面事件） |
| `GET /mcp/sse`、`POST /mcp` | MCP JSON-RPC（tools/list / tools/call） |

## MCP 工具

### page_*（页面操作）

| 工具 | 参数 | 说明 |
|---|---|---|
| `page_exec` | `{pageId, cmd, args}` | 执行类 CDP 命令（见 [命令集](/devtools/cdp-commands.md)） |
| `page_snapshot` | `{pageId?}` | 页面快照：DOM 概要 + 视口 + 框架识别 |
| `bridge_status` | — | 桥状态、活跃连接、可操作 pageId 列表 |

### user_*（人机交互）

| 工具 | 参数 | 用户在哪作答 |
|---|---|---|
| `user_pick_element` | `{pageId, prompt}` | 页面（点选面板 + Inspector） |
| `user_confirm` | `{pageId, question}` | AI 窗口作答卡（是/否/自定义理由） |
| `user_choose` | `{pageId, question, options, multiple?}` | AI 窗口作答卡（单选/多选） |
| `user_input` | `{pageId, prompt}` | AI 窗口作答卡（文本） |
| `user_presence` | `{pageId, message?}` | AI 窗口作答卡（在/不在） |
| `user_notify` | `{pageId, message}` | 浏览器 Notification（非阻塞） |

## 配置与环境变量

| 变量 | 默认 | 说明 |
|---|---|---|
| `AITI_MCP_TOKEN` | `dev` | 桥 token（兼容旧 `DBG_MCP_TOKEN`） |
| `AITI_OPEN_CMD` | `code --goto file:line` | open_file 编辑器命令（fallback xdg-open） |
| `--http` | — | 监听端口（默认 8777） |

## 安全

- token/secret 认证：SSE / result / event 全部校验
- 兼容路径：不带 secret（老 client / dev token）放行
- 危险命令确认 + 手势桥（见 [安全边界](/products/aiti-devtools.md#3-安全边界)）
