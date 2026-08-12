---
title: aiti-mcp-bridge 规划
icon: 🔗
description: 桥接层计划 — server、会话、IDE 插件、消息直达 IDE AI 窗口
tags: [roadmap, aiti-mcp-bridge, ide]
---

# aiti-mcp-bridge 规划（AI agent 改造层）

> 核心目标：**配置 aiti-devtools 使用**、**改造 AI agent**、支持 aiti-devtools 与 vscode/idea 插件完成注入、**mcp-bridge 直接发消息到 IDE 里的 AI agent 窗口**。

## 阶段计划

| 阶段 | 目标 | 交付 | 状态 |
|---|---|---|---|
| **R0 · 桥链路** | 协议打通 | 桥端点全量（claim/sessions/register/sse/result/event + MCP）；方案 D/E 完成 | ✅ |
| **R1 · 配置最小化** | AI 只告诉一个 pageId | claim/secret/TTL 全量验证；sessions 发现文档化；`AITI_*` 收口 | 🚧 |
| **R2 · agent 改造** | 任意 AI 可接入 | Claude Code / Cursor 接入文档 + 示例；system prompt 引导模板 | 📋 |
| **R3 · IDE 插件** | 消息直达 IDE AI 窗口 | devtools-vscode（Copilot Chat 面板 + 作答卡）；devtools-idea（AI Assistant Tool Window） | 📋 |
| **R4 · 平台化** | 生态开放 | MCP 工具扩展注册、桥插件化、公开协议文档 | 📋 |

## R3 验收场景（IDE 修 bug）

```
1. vscode 打开工程 → aiti: 启用页面调试（注入 + 起桥 + 写 .vscode/mcp.json）
2. Copilot Chat：「首页按钮没反应，帮我查」
3. AI：page_exec 点击 → 采集报错 → 定位 LoginForm.vue:23（open_file 打开源码）
4. AI：user_confirm「是否加 Content-Type 头？」→ Chat 弹出确认卡 → 批准
5. AI 改代码 → 页面刷新验证 → 报错消失
```

## 待办清单

- [ ] **claim/secret/TTL 回归测试**：reload 不断线、跨页面防串台、TTL 过期回收
- [ ] **sessions 发现 API 文档化** + AI 引导 prompt（写入 skills/模板）
- [ ] **AITI_* 环境变量收口**：`AITI_MCP_TOKEN`、`AITI_OPEN_CMD`、`AITI_BRIDGE_PORT`
- [ ] **IDE 配置互操作**：`.vscode/mcp.json` / JetBrains `mcp.xml` 双向同步
- [ ] **AI 窗口扩展点调研**：Copilot Chat Webview、JetBrains AI Assistant 插件 API（含回退方案 ai.html）
- [ ] **多 IDE 窗口**：同工程多窗口共享 instanceId；冲突时 secret 仲裁
- [ ] **user_* 工具族体验打磨**：倒计时/暂停/通知/拒绝语义全链路测试

## 架构备忘

```
IDE AI agent 窗口 / Claude Code / Cursor / aiti-agent
        │ MCP (stdio / HTTP / SSE)
        ▼
aiti-mcp-bridge（本地服务）→ pageId 会话 → SSE → aiti-devtools 注入页
        ▲
        └── 页面事件（open_file / 元素选中 / user_* 作答）实时回推 AI 窗口
```

> 协议细节见 [MCP 桥 · Server](/mcp-bridge/server.md)，会话见 [会话体系](/mcp-bridge/session.md)。
