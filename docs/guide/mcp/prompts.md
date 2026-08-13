---
title: agent prompt 示例
icon: 📋
description: 无 aiti AI 窗直接集成时，MCP 工作流接入各 agent 的引导 prompt（复制即用）
tags: [guide, mcp-bridge, prompt]
---

# agent prompt 示例

> **适用场景**：没有 aiti 的 AI web 直接集成（未用 aiti-agent / cockpit / AI 窗）时，
> 在 Claude Code / Cursor / IDE 内置 AI 等 agent 的会话里粘贴下面的 prompt，
> 让 AI 知道自己有 aiti-devtools 的 MCP 工具、以及标准工作流怎么走。
>
> 前提：已把 `aiti-mcp-server` 配进该 agent（接入方式见 [接入 AI agent](/guide/mcp/ai-agents.md)）。

## 一、通用模板（所有 agent——推荐从这里开始）

```
你已连接 aiti-devtools MCP。核心工作流：

1. 会话开始 / 关键决策前（刷新、改码、提问之前）：先调 aiti_inbox 查看是否有发给你的消息
   （人的指示 / 异步 user_* 作答 / 页面事件），取到后处理，处理完带 ack 确认。
2. 需要用户配合：user_confirm / user_choose / user_input / user_pick_element / user_presence /
   user_notify。默认同步等待；async:true 立即返回，结果会进你的 aiti_inbox。
3. 操作页面：page_snapshot / page_exec（DOM/CSS/Input/Page/Runtime/...）；排查先看
   page_logs（level:warn/error）与 page_network（errorOnly:true）。
4. 页面现场定位：消息里 [发自: <pageId> · <url>] 的 pageId 就是 page_exec 的 pageId 参数。
```

## 二、Claude Code

```
你已连接 aiti-devtools MCP（页面调试桥）。工作流：

1. 每轮开头调 aiti_inbox：看有没有人发给你的消息（指示/异步作答/页面事件），
   处理完带 ack 确认——这是消息进入你这里的唯一通道。
2. 需要人在页面点选/确认时：user_pick_element / user_confirm / user_input，
   默认同步等待；async:true 时结果稍后进 aiti_inbox。
3. 排查页面问题：page_snapshot 看现场 → page_exec 操作（DOM/Input/Page 等）→
   page_logs(level:error) + page_network(errorOnly:true) 找证据。
4. 消息里的 [发自: <pageId> · <url>] 就是 page_exec 的 pageId 参数，直接填。
```

## 三、Cursor

```
你已连接 aiti-devtools MCP。工作流：

1. 会话开始和关键节点先调 aiti_inbox 取消息（人在别处给你的指示/异步作答），
   处理完 ack 确认。
2. 交互用 user_confirm / user_choose / user_input / user_notify；async:true 的
   结果进 aiti_inbox。
3. 页面操作：page_snapshot 定位 → page_exec 执行 → page_logs / page_network 排查。
4. [发自: <pageId> · <url>] 的 pageId 填给 page_exec。
```

## 四、VS Code + Copilot（.vscode/mcp.json 已配 aiti）

```
你已连接 aiti-devtools MCP。工作流：

1. 开始前先调 aiti_inbox：人的指示 / 异步作答 / 页面事件都从这里取，处理完 ack。
2. 需要用户配合时用 user_confirm / user_choose / user_input / user_pick_element。
3. 页面问题：page_snapshot → page_exec → page_logs / page_network 定位。
4. [发自: <pageId> · <url>] 的 pageId 填给 page_exec。
```

## 五、pi / aiti-agent（增加 sampling 增强）

在通用模板（第一节）基础上追加：

```
如果你的客户端支持 MCP sampling（本环境支持），人发来的消息可能以 sampling/createMessage
直接推给你（模型立即作答）。但不要把推送当唯一通道——每轮开头仍调 aiti_inbox 兜底。
```

## 六、一次性 prompt（AI 已经用了一段时间，让它立即消费收件箱）

```
检查 aiti-devtools 收件箱：调 aiti_inbox 查看是否有发给你的消息（人的指示/作答/页面事件），
有则处理（处理完带 ack 确认）。
```

## 设计说明

- **aiti_inbox 是唯一 100% 兼容通道**：`notifications/message` 已被 MCP 规范废弃、
  sampling 只有少数 agent 实现，所以所有 prompt 都围绕"每轮开头取 inbox"设计。
- **分 agent 提对应能力**：Claude Code / Cursor / VS Code 不提 sampling（它们不实现）；
  只有 pi / aiti-agent 提 sampling 增强。
- 页面事件默认不投递，显式订阅才推（见 [MCP Server](/guide/mcp/server.md)）。
