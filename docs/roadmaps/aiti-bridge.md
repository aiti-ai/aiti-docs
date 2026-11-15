---
title: aiti-bridge 规划
icon: 🔗
description: 桥接层计划 — server、会话、IDE 插件、消息直达 IDE AI 窗口
tags: [roadmap, aiti-bridge, ide]
---

# aiti-bridge 规划（AI agent 改造层）

> 核心目标：**配置 aiti-devtools 使用**、**改造 AI agent**、支持 aiti-devtools 与 vscode/idea 插件完成注入、**aiti-bridge 直接发消息到 IDE 里的 AI agent 窗口**。
> **现状基准**：[`@aiti-ai/aiti-bridge`](https://www.npmjs.com/package/@aiti-ai/aiti-bridge) 0.2.x 已上架 npm（含 stdio⇄HTTP MCP shim）；逐项状态以[产品矩阵](/products/README.md)为准。

## 阶段计划

| 阶段 | 目标 | 交付 | 状态 |
|---|---|---|---|
| **R0 · 桥链路** | 协议打通 | 桥端点全量（claim/sessions/register/sse/result/event + MCP）；pageId 会话体系 + user_* 工具族全链路 | ✅ |
| **R1 · 配置最小化** | AI 只告诉一个 pageId | `AITI_BRIDGE_URL` shim 接入 ✅ 已实现（单环境变量接 stdio MCP）；剩 claim/secret/TTL 全量验证 + sessions 发现文档化 | 🚧 |
| **R2 · agent 改造** | 任意 AI 可接入 | [AI agent 接入文档](/guide/mcp/ai-agents.md)（能力矩阵 + 分 agent 引导 prompt + aiti_inbox 主通道）✅；pi-web 侧 12 家 CLI 适配扩展 ✅；示例随 agent 生态持续补 | ✅ |
| **R3 · IDE 插件** | 消息直达 IDE AI 窗口 | devtools-vscode 0.3.x 源码就绪（反代注入 + 桥生命周期 + `.vscode/mcp.json` 接线 + AI 窗口跳转），市场发布待办；devtools-idea 📋 | 🚧 |
| **R4 · 平台化** | 生态开放 | MCP 工具扩展注册、桥插件化、公开协议文档 | 📋 |

## R3 验收场景（IDE 修 bug）

```
1. vscode 打开工程 → aiti: 启用页面调试（注入 + 起桥 + 写 .vscode/mcp.json）
2. Copilot Chat：「首页按钮没反应，帮我查」
3. AI：page_exec 点击 → 采集报错 → 定位 LoginForm.vue:23（open_file 打开源码）
4. AI：user_confirm「是否加 Content-Type 头？」→ Chat 弹出确认卡 → 批准
5. AI 改代码 → 页面刷新验证 → 报错消失
```

> vscode 0.3.x 已打通步骤 1 的全部链路（注入 + 桥 + MCP 接线 + AI 窗口跳转）；步骤 2-5 依赖所选 IDE agent 的 MCP 表现，待端到端验收成片。

## 待办清单

- [ ] **claim/secret/TTL 回归测试**：reload 不断线、跨页面防串台、TTL 过期回收
- [ ] **sessions 发现 API 文档化** + AI 引导 prompt（收进 guide/skills 模板）
- [ ] **JetBrains `mcp.xml` 互操作**（`.vscode/mcp.json` 已由 vscode 扩展自动写入 ✅）
- [ ] **JetBrains AI Assistant 插件 API 调研**（Copilot Chat 路径已由 vscode 扩展走通；兜底统一走 cockpit）
- [ ] **多 IDE 窗口**：同工程多窗口共享 instanceId；冲突时 secret 仲裁
- [ ] **user_* 工具族 IDE 场景体验打磨**：倒计时/暂停/通知/拒绝语义全链路测试
- [ ] **vscode 扩展市场发布**：VS Code Marketplace + Open VSX

> ✅ 已完成：`AITI_BRIDGE_URL`（shim 单环境变量接入）。

## 架构备忘

```
IDE AI agent 窗口 / Claude Code / Cursor / aiti-agent
        │ MCP (stdio / HTTP / SSE)
        ▼
aiti-bridge（本地服务，npx 可跑）→ pageId 会话 → SSE → aiti-devtools 注入页
        ▲
        └── 页面事件（open_file / 元素选中 / user_* 作答）实时回推 AI 窗口
```

> 协议细节见 [MCP 桥 · Server](/guide/mcp/server.md)，会话见 [会话体系](/guide/mcp/session.md)。
