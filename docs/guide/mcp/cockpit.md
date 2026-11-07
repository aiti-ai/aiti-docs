---
title: 通用 AI 窗口 cockpit
icon: 🛰️
description: 引导页 + 地址配置中枢 + 人机协作操作台；三条接入路径；消息窗
tags: [guide, aiti-bridge, cockpit, ai-window]
---

# 通用 AI 窗口（cockpit.html）

**cockpit** 是 aiti 的通用 AI 窗口：三个角色合一 —— **引导页**（无可用 AI 界面时默认打开）、**地址配置中枢**（显示/设置桥地址与 AI 服务器地址，把任意 agent 纳入体系）、**人机协作操作台**（连桥后与 agent 协作）。

## 1. 三个地址概念（别混）

| 地址 | 含义 | 谁用 | 来源 |
|---|---|---|---|
| **AI 服务器地址**（aiUrl） | AI 窗 iframe 加载的页面 = 适配了 aiti 协议的带 Web agent（aiti-agent / pi-web / 任何实现 `aiti-devtools` 协议 + aiti 扩展 client 的页面） | launcher 打开 AI 窗 | 自动推断（注入时 script src → 服务根）；`data-ai-url`；用户在 cockpit 设置 |
| **MCP 桥地址**（bridge URL） | MCP server 端点（`…/mcp/mcp`）；agent 的 mcp.json 指向它；窗口的 bridge-client 连它 | agent + 窗口 | 自动推断（注入时 script src → 同目录 mcp）；`data-bridge-url`；手动编辑 |
| **agent 的 MCP 配置片段** | 由桥地址派生的接入配置（mcp.json / claude mcp add 命令） | 用户复制到 agent | 窗口生成显示 |

> 适配规则（开放协议）：**任何带 Web 界面的 agent**，只要它的页面注入 aiti-devtools 扩展 client（或实现 `aiti-devtools` postMessage 协议），就可以作为 AI 服务器地址被配置——即"主动纳入 aiti 体系"。

## 2. 三条接入路径

### 路径一：AI 服务器地址（带 Web agent 适配，最完整体验）

1. 用户在 cockpit 设置 AI 服务器地址 → postMessage `aiti_ai_set_url` 推给宿主 inject。
2. launcher 重建 AI iframe 加载新地址。
3. **协议探测**：10s 内收到该 iframe 的 `aiti_ai_ready`（扩展 client 心跳）= 协议通 → **inject 确认后才记 localStorage** → 下次自动打开该界面，不再需要引导页。
4. **10s 不通**（普通网站/未适配）→ 提示"是否回到引导页"；不记录地址。

### 路径二：MCP 桥地址（降级方式，任何 agent）

1. 在 cockpit 设置桥地址 → 窗口自己加载 bridge-client.js 连桥（role=ai）。
2. 连桥成功 → 显示"agent 需配置的 MCP 地址"（复制 mcp.json 片段 / claude mcp add 命令）→ 用户粘到任意 agent。
3. 成功后 cockpit 进入**消息窗**（见 §4）。
4. 完整分 agent 引导 → [接入 AI agent](/guide/mcp/ai-agents.md)。

### 路径三：零配置（扩展注入）

页面注入了 aiti-devtools 的 inject js → 桥地址**自动推断**（script src 同目录 mcp）→ 自动连桥验证 → 成功则显示 agent 需配置的 MCP 地址，并显示连接状态。**用户无需手动配桥地址。**

## 3. 分发途径与同域

- 分发：① aiti-devtools 扩展 assets ② mcp bridge 服务自带（`--port 8777` 静态目录）③ aiti.pw 官方托管 ④ CDN / 生态插件（aiti-devtools-vite 等）
- **硬性要求：与宿主 inject 同域**（或 CORS 可通信）——postMessage 协议、localStorage 记忆（aiUrl/bridge）、协议探测都依赖同域；跨域时提示改用扩展/aiti.pw 路径。

## 4. 消息窗（路径二成功后）

- **消息列表**：来往消息（人 push 的话、agent 回答、页面事件），**滑动窗口显示**（默认最近 50 条，可翻页加载更多）
- **消息消费状态**：每条显示 已送达 / 待消费 / 已消费（`pending → delivered → consumed`；consumed 历史持久保留，见 [MCP Server · 消息存储](/guide/mcp/server.md#消息-session-存储-参照-pi-session-同款-jsonl)）
- **输入框 + 待选区**：发消息给 agent（`POST /bridge/push`），带 [元素N]/[回答N]/[错误N] 占位符替换
- **一次性 prompt**：复制发送到 AI 会话，引导 AI 立即消费收件箱：
  ```
  检查 aiti-devtools 收件箱：调 aiti_inbox 查看是否有发给你的消息（人的指示/作答/页面事件），有则处理（处理完带 ack 确认）。
  ```

## 5. 设置入口

- AI 窗口设置页（⚙ 弹窗）带地址设置与显示：AI 服务器地址 / 桥地址 / 生成的 MCP 配置；可修改重新探测
- 「重置」重置位置/尺寸 + 所有地址（aiUrl/bridge）
- 扩展注入但想用其他 agent：设置页提供"改用 cockpit"入口（清 aiUrl 指向 cockpit）

> 相关：[接入 AI agent](/guide/mcp/ai-agents.md) · [MCP Server](/guide/mcp/server.md) · [会话体系](/guide/mcp/session.md)
