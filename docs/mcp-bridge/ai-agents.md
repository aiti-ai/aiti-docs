---
title: 改造 AI agent
icon: 🧠
description: Claude Code / Cursor / IDE AI / aiti-agent 接入 MCP 桥
tags: [mcp-bridge, ai-agent]
---

# 改造 AI agent

aiti-mcp-bridge 的核心价值：**让任意 AI agent 拥有操作页面、询问用户的能力**。接入 = 配置一个 MCP server。

## 1. 支持的 agent

| agent | 接入方式 | 体验 |
|---|---|---|
| Claude Code | `claude mcp add aiti -- npx @justdb/aiti-mcp-server --bridge ...` | 终端内直接对话页面 |
| Cursor | MCP 设置添加 stdio server | Cursor 对话直接操作页面 |
| VS Code Copilot Chat | `.vscode/mcp.json` 添加 server | **消息直达 IDE AI 窗口** |
| JetBrains AI Assistant | MCP 配置添加 server | **消息直达 IDE AI 窗口** |
| aiti-agent（Web） | 会话内配置桥地址 | Web 工作台同构桥 |

## 2. 接入示例

### Claude Code

```bash
claude mcp add aiti -- npx @justdb/aiti-mcp-server --bridge http://localhost:8777
claude mcp list   # 确认 aiti 已连接
```

### VS Code（.vscode/mcp.json）

```json
{
  "servers": {
    "aiti": {
      "type": "stdio",
      "command": "npx",
      "args": ["@justdb/aiti-mcp-server", "--bridge", "http://localhost:8777"]
    }
  }
}
```

### aiti-devtools-vscode 插件（规划）

插件自动完成：注入 + 起桥 + 写 MCP 配置 + AI 窗口 aiti 面板（pageId、作答卡、连接状态）。

## 3. 给 AI 的引导（建议写入 agent 的 system prompt / skills）

```
可用工具：
- bridge_status: 查看桥状态与可操作 pageId
- page_exec {pageId, cmd, args}: 在页面执行类 CDP 命令（DOM/CSS/Input/Page/Runtime/Storage/Performance/Browser）
- page_snapshot {pageId}: 页面快照
- user_confirm / user_choose / user_input / user_pick_element / user_presence / user_notify: 与用户交互

工作流：
1. 先 bridge_status 或 page_snapshot 确认目标页面与框架
2. 需要用户决策时用 user_* 工具，不要猜
3. 报错时结合框架 fileLocation（framework/file/line）定位源码
4. 需要打开源码时调 open_file（page_exec / bridge 事件）
```

## 4. 典型问答

```
用户：帮我看看登录页为什么报 500
AI：page_snapshot 确认页面 → page_exec 提交表单 → 采集 console → 发现 /api/login 缺少 Content-Type
用户：user_confirm 弹出「是否在 api 层统一加 Content-Type 头？」→ 批准
AI：修改代码 + 验证（页面自动刷新，报错消失）
```

> 协议细节见 [MCP Server](/mcp-bridge/server.md)，会话见 [会话体系](/mcp-bridge/session.md)。
