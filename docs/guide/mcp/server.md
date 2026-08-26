---
title: MCP Server
icon: 🖥️
description: 启动、端点、传输（含 Streamable HTTP）、MCP 工具参考（含 aiti_inbox）
tags: [guide, mcp-bridge, server, reference]
---

# aiti-mcp-server

MCP 端点：**stdio + HTTP（stateless）+ Streamable HTTP（持久流）** 三 transport；桥侧另有会话登记/路由/广播 REST 端点。

## 启动

```bash
# 桥（本地服务，含会话登记/路由/广播）
npx @aiti-ai/aiti-mcp-bridge --http 8777

# 或直接跑 MCP server（等同，桥的 MCP 面）
npx @aiti-ai/aiti-mcp-server --http 8777
# stdio 模式（给 Claude Code / Cursor 等用）
npx @aiti-ai/aiti-mcp-server --bridge http://localhost:8777
```

## 传输

| 传输 | 端点 | 说明 |
|---|---|---|
| stdio | 子进程 | 本地 MCP client（Claude Code / Cursor） |
| HTTP（stateless） | `POST /mcp/mcp` | 即时 JSON-RPC 响应；无会话，兼容老 client |
| **Streamable HTTP** | `GET /mcp/mcp` + `POST /mcp/mcp` | **持久 GET 流 + `Mcp-Session-Id`**：服务端可主动写消息（sampling 请求/进度）；pi 等现代 client 自动优先探测 |

### Streamable HTTP 协议要点

1. `POST /mcp/mcp` 发 `initialize` → 返回结果 + **`Mcp-Session-Id` 响应头**（新建会话）。
2. `POST /mcp/mcp`（带 `Mcp-Session-Id` 头）发 `notifications/initialized` / `tools/call` 等 → 即时响应（通知为 204）。
3. `GET /mcp/mcp`（`Accept: text/event-stream` + `Mcp-Session-Id`）→ SSE 持久流，服务端把 server→client 消息写进该流（ping 15s 保活）。
4. 无 `Mcp-Session-Id` 的 POST = stateless（老 client 兼容）。
5. GET 流断开 → 会话销毁，agent 标记离线（注册信息 + outbox 保留 TTL）。

## 桥端点一览

| 端点 | 说明 |
|---|---|
| `POST /bridge/claim` | 连接登记/复用（instanceId + secret + pageKey） |
| `GET /bridge/sessions` | 发现：按 frame 展开 `[{instanceId, frameId, pageId, url, frameworks, active, lastSeen}]` |
| `POST /bridge/register` | iframe 动态补报 frameId |
| `GET /bridge/sse?instanceId=&role=page\|ai&frameId=&url=&frameworks=` | 持久连接（SSE；role=page 页面 / role=ai 人侧窗口） |
| `POST /bridge/result` | `{pageId, requestId, ok, result}`（pageId 校验 + 全局 pendingRequests） |
| `POST /bridge/event` | `{pageId, type, payload}`（open_file 等页面事件） |
| `POST /bridge/push` | **人 → AI 主动发消息**：`{to?: agentId\|"all", text, kind?, ref?}` → 按能力降级（sampling 推 / inbox 入队） |
| `GET /bridge/inbox-status` | 消息消费状态（pending/delivered/consumed），供窗口显示 |
| `GET /bridge/messages` | 消息历史（滑动窗口 + 翻页，读 JSONL 重放） |
| `POST /mcp/mcp`、`GET /mcp/mcp` | MCP JSON-RPC（tools/list / tools/call；Streamable HTTP） |

## MCP 工具

### page_*（页面操作）

| 工具 | 参数 | 说明 |
|---|---|---|
| `page_exec` | `{pageId, cmd, args}` | 执行类 CDP 命令（见 [命令集](/devtools/cdp-commands.md)） |
| `page_snapshot` | `{pageId?}` | 页面快照：DOM 概要 + 视口 + 框架识别 |
| `bridge_status` | — | 桥状态、活跃连接、可操作 pageId 列表、**已连 agent 列表** |
| `page_logs` / `page_network` | `{pageId, level/since/limit}` | 页面 console 日志 / 请求完成态（服务端环形缓冲，断连也能查） |
| `self_ui` | `{pageId?}` | 扫描目标页面当前打开的弹窗/表单字段/按钮清单（弹窗标题+字段 label/selector/type），配合 `form_fill` 定位回填 |
| `form_fill` | `{pageId?, dialog?, fields, button?}` | 向目标页面弹窗/表单回填字段值（React 兼容原生 setter + input/change 事件），可选回填后点按钮 |
| `file_stat` | `{path}` | 查询文件存在性/类型/大小/修改时间（绝对路径；源码定位、「后端打开」前置校验用） |

### user_*（人机交互）

| 工具 | 参数 | 用户在哪作答 |
|---|---|---|
| `user_pick_element` | `{pageId, prompt}` | 页面（点选面板 + Inspector） |
| `user_confirm` | `{pageId, prompt, async?}` | AI 窗口/宿主面板作答卡（是/否/补充说明） |
| `user_choose` | `{pageId, prompt, choices, multiple?}` | AI 窗口作答卡（单选/多选） |
| `user_input` | `{pageId, prompt, defaultValue?}` | AI 窗口作答卡（文本） |
| `user_presence` | `{pageId, prompt?}` | AI 窗口作答卡（在/不在） |
| `user_notify` | `{pageId, body, title?}` | 浏览器 Notification（非阻塞） |

统一语义：同步/异步（`async:true` 立即返回，结果进 `aiti_inbox`）；超时可控（前端倒计时 + 服务器同步暂停）；拒绝有语义（预设 + 自定义理由）。

### aiti_*（agent 接入与消息主通道）

| 工具 | 参数 | 说明 |
|---|---|---|
| `aiti_hello` | `{agentId?, pageId?, subEvents?}` | agent 自我介绍 + 绑定默认目标页 + 订阅页面事件（page_error/page_log/page_network） |
| `aiti_inbox` | `{ack?: [msgId]}` | **消息主通道**：拉取发给本 agent 的消息（人发消息/异步作答/页面事件），处理完带 ack 确认 |

**aiti_inbox 返回**：
```jsonc
{ "messages": [
    { "id": "ab12cd34", "kind": "user_message" | "user_answer" | "page_error" | "page_log" | "page_network" | "agent_note",
      "from": "window" | "page", "agentId", "text?", "payload?",
      "at": "ISO", "status": "pending" | "delivered" | "consumed" } ],
  "queueSize": 3 }
```
- 状态机：`pending`（入队未取）→ `delivered`（取走未 ack）→ `consumed`（ack 确认）
- **consumed 一直保留**（历史持久化，见下），窗口滑动窗口显示

### 消息 session 存储（参照 pi session 同款 JSONL）

```
<bridge dataDir>/aiti-bridge/sessions/<agentId>/<ISO-timestamp>_<uuid>.jsonl
```
- 每行一个事件（append-only 事件流）：`session` 首行元数据 + `message` 消息行 + `status_change` 状态行
- 按 (agentId, 天) 滚动，超 2MB 开新文件；桥重启从 JSONL 重放（pending/delivered 恢复为 pending）

## 配置与环境变量

| 变量 | 默认 | 说明 |
|---|---|---|
| `AITI_MCP_TOKEN` | `dev` | 桥 token（兼容旧 `DBG_MCP_TOKEN`） |
| `AITI_OPEN_CMD` | `code --goto file:line` | open_file 编辑器命令（fallback xdg-open） |
| `AITI_BRIDGE_TTL` | `600000` | 断开后注册保留（ms） |
| `--http` | — | 监听端口（默认 8777） |

## 安全

- token/secret 认证：SSE / result / event 全部校验
- 兼容路径：不带 secret（老 client / dev token）放行
- 危险命令确认 + 手势桥（见 [安全边界](/products/aiti-devtools.md#3-安全边界)）
- **MCP 端点鉴权（TODO）**：公网暴露的桥无独立鉴权——计划适配 service-tunnels（改造为 auth + token 并存，token 作额外开关）；当前维持内网/隧道限定
- 页面事件订阅默认不投递（显式订阅才推，防框架 error 噪音）
