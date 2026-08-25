---
title: 接入 AI agent
icon: 🧠
description: 能力矩阵、分 agent 接入与引导 prompt、aiti_inbox 主通道
tags: [guide, mcp-bridge, ai-agent]
---

# 接入 AI agent

aiti-mcp-bridge 的核心价值：**让任意 AI agent 拥有操作页面、询问用户、接收消息的能力**。接入 = 配置一个标准 MCP server；**任何 agent 100% 可用的消息通道是 `aiti_inbox`（agent 主动取）**，不是推送。

## 1. 能力矩阵（2026-08 调研实证）

**结论先行**："服务端推一条消息、agent 模型立刻看到"在几乎所有主流 agent 上都不成立（`notifications/message` 已被 MCP 规范废弃；`notifications/progress` 只显示 UI 进度条；sampling 极少实现）。**唯一 100% 通用的是 agent 调 `aiti_inbox` 拉取。**

| agent | Streamable HTTP | sampling | elicitation | 泛通知模型可见 |
|---|---|---|---|---|
| **pi**（pi-mcp-adapter） | ✅ 优先探测 | ✅ 默认启用（UI 审批，`samplingAutoApprove` 可关） | ✅ 默认启用（表单收集） | ❌ |
| Claude Code | ✅ | ❌（issue #1785） | ❌ | ❌ |
| Claude Desktop | stdio 为主 | ❌ | ❌ | ❌ |
| Cursor | ✅ | ❌（issue #3023） | ❌ | ❌ |
| VS Code + Copilot | ✅ | ⚠️ 平台支持但实际不稳 | ❌ | ❌ |
| Gemini CLI | ✅ | ❌（issue #10704） | ❌ | ❌ |
| OpenAI Codex | ✅ | ❌ | ❌ | ❌ |

**设计含义**：
- `aiti_inbox` 是**主通道**（任何 agent 都能调工具）
- sampling 推是**增强**（仅 pi 等少数 agent 支持，pi 默认开启）
- 页面事件默认不投递，显式订阅才推

## 2. 接入示例

### Claude Code

```bash
claude mcp add aiti -- npx @aiti-ai/aiti-mcp-server --bridge http://localhost:8777
claude mcp list   # 确认 aiti 已连接
```

### VS Code（.vscode/mcp.json）

```json
{
  "servers": {
    "aiti": {
      "type": "stdio",
      "command": "npx",
      "args": ["@aiti-ai/aiti-mcp-server", "--bridge", "http://localhost:8777"]
    }
  }
}
```

### 任意 MCP client（mcp.json）

```json
{
  "mcpServers": {
    "aiti": {
      "type": "http",
      "url": "http://localhost:8777/mcp/mcp"
    }
  }
}
```

### aiti-agent（Web 工作台）

会话内配置桥地址（或经注入自动推断）；aiti-agent 页面自带 aiti-devtools 扩展 client，天然是 AI 窗宿主。

## 3. 给 AI 的引导（完整分 agent 版见 [agent prompt 示例](/guide/mcp/prompts.md)）

### 通用模板（所有 agent——推荐）

> **重要：这是唯一 100% 兼容的接入方式，任何 agent 都用它。**
>
> ```
> 你已连接 aiti-devtools MCP。核心工作流：
> 1. 会话开始 / 关键决策前（刷新、改码、提问之前）：先调 aiti_inbox 查看是否有发给你的消息
>    （人的指示 / 异步 user_* 作答 / 页面事件），取到后处理，处理完带 ack 确认。
> 2. 需要用户配合：user_confirm / user_choose / user_input / user_pick_element / user_presence /
>    user_notify。默认同步等待；async:true 立即返回，结果会进你的 aiti_inbox。
> 3. 操作页面：page_snapshot / page_exec（DOM/CSS/Input/Page/Runtime/...）；排查先看
>    page_logs（level:warn/error）与 page_network（errorOnly:true）。
> 4. 页面现场定位：消息里 [发自: <pageId> · <url>] 的 pageId 就是 page_exec 的 pageId 参数。
> ```

### pi / aiti-agent 模板（增加 sampling 增强）

> 在通用模板基础上追加：
> ```
> 如果你的客户端支持 MCP sampling（本环境支持），人发来的消息可能以 sampling/createMessage
> 直接推给你（模型立即作答）。但不要把推送当唯一通道——每轮开头仍调 aiti_inbox 兜底。
> ```

### 一次性 prompt（用户已用 cockpit 发消息后，让 AI 立即消费）

```
检查 aiti-devtools 收件箱：调 aiti_inbox 查看是否有发给你的消息（人的指示/作答/页面事件），有则处理（处理完带 ack 确认）。
```

## 4. 消息怎么到 agent（能力降级链）

| 来源 | 通道 | 说明 |
|---|---|---|
| 人在 cockpit 发消息 | **sampling 推**（支持者，如 pi）→ **inbox 队列**（所有 agent） | 前者模型立即作答；后者 agent 调 `aiti_inbox` 取 |
| 异步 `user_*` 作答 | **inbox 队列**（回发起 agent） | `async:true` 时结果不阻塞返回，进 inbox |
| 页面事件（显式订阅） | **inbox 队列 / 推送** | `aiti_hello` 的 subEvents 订阅后才投，默认不投 |

## 5. 典型问答

```
用户：帮我看看登录页为什么报 500
AI：page_snapshot 确认页面 → page_exec 提交表单 → 采集 console → 发现 /api/login 缺少 Content-Type
用户：user_confirm 弹出「是否在 api 层统一加 Content-Type 头？」→ 批准
AI：修改代码 + 验证（页面自动刷新，报错消失）
```

> 协议细节见 [MCP Server](/guide/mcp/server.md)，会话见 [会话体系](/guide/mcp/session.md)，人侧界面见 [cockpit](/guide/mcp/cockpit.md)。
