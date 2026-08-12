---
title: aiti-devtools-vscode
icon: 🟦
description: VS Code 扩展 — 注入 + 桥 + Copilot Chat 集成
tags: [ide, vscode]
---

# aiti-devtools-vscode

> 状态：📋 规划中。目标：**让 VS Code 的 AI（Copilot Chat / Cursor）直接操作你在跑的页面**。

## 功能

| 功能 | 说明 |
|---|---|
| 一键注入 | 代理 dev server（Vite/Webpack/Next），响应 prepend 注入 aiti-devtools |
| 自动起桥 | 启动/停止 `aiti-mcp-bridge`（默认 8777） |
| 自动配置 MCP | 写 `.vscode/mcp.json`，让 Copilot Chat 具备 `page_*` / `user_*` 工具 |
| AI 窗口 aiti 面板 | pageId、目标 URL、框架、连接状态、危险命令确认队列 |
| 作答卡直达 | `user_confirm` / `user_choose` / `user_input` 直接在 Copilot Chat 作答 |
| 源码直达 | `open_file` 事件用 VS Code API 打开文件并定位行 |

## 命令面板

```
aiti: 启用页面调试      # 注入 + 起桥 + 配置 MCP
aiti: 停止调试
aiti: 打开桥面板        # pageId / sessions / 事件日志
aiti: 重新注入          # 检测到双注入时修复
```

## 用户旅程

```
1. 打开工程 → 「aiti: 启用页面调试」
2. 起 dev server（插件自动代理注入）
3. Copilot Chat 问：「登录页报 500，帮我查」
4. AI：page_exec 提交表单 → 采集报错 → 定位 LoginForm.vue:23
5. AI：user_confirm「是否加 Content-Type 头？」→ Chat 弹出确认卡 → 批准
6. AI 改代码 → 页面刷新验证 → 报错消失
```

## 实现要点

| 要点 | 方案 |
|---|---|
| 注入检测 | `window.__dbg` 存在则跳过（防双注入） |
| 代理 | 本地反向代理 dev server，`transformResponse` 同语义 prepend |
| 桥生命周期 | 插件管理子进程；窗口关闭优雅停桥（TTL 保留 pageId） |
| AI 窗口注入 | VS Code Webview（Copilot Chat 扩展点）；无扩展点时回退「打开 ai.html」 |
| 多窗口 | 每工程一个 instanceId；同工程多窗口共享 |

> 相关：[IDE 插件产品页](/products/aiti-ide-plugins.md) · [改造 AI agent](/mcp-bridge/ai-agents.md)
