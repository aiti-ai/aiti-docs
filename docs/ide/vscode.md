---
title: aiti-devtools-vscode
icon: 🟦
description: VS Code 扩展 — 注入 + 桥 + Copilot Chat 集成
tags: [ide, vscode]
---

# aiti-devtools-vscode

> 状态：🚧 **MVP 已实施**（2026-11-07，本仓 `vscode-ext/`，测试 7/7 全绿）。已交付：四命令 + dev server 反向代理注入 + 桥生命周期 + `.vscode/mcp.json` 自动配置 + 桥面板（手动刷新，零轮询）。
> R3 余项（规划中）：Copilot Chat 内嵌作答卡（`user_*` 直答）、`open_file` 源码直达、AI 窗口 aiti 面板 Webview 嵌入。

## 功能

| 功能 | 说明 | 状态 |
|---|---|---|
| 一键注入 | 代理 dev server（Vite/Webpack/Next），响应 prepend 注入 aiti-devtools | ✅ MVP |
| 自动起桥 | 启动/停止 `aiti-bridge`（默认 8777；外部已在跑的桥复用不代杀） | ✅ MVP |
| 自动配置 MCP | 写 `.vscode/mcp.json`（stdio shim + env `AITI_BRIDGE_URL`，URL 不落配置），让 Copilot Chat 具备 `page_*` / `user_*` 工具 | ✅ MVP |
| 桥面板 | 桥/代理状态、sessions 页面清单、日志 tail、cockpit 直达（webview，手动刷新） | ✅ MVP |
| AI 窗口 aiti 面板 | pageId、目标 URL、框架、连接状态、危险命令确认队列 | 📋 |
| 作答卡直达 | `user_confirm` / `user_choose` / `user_input` 直接在 Copilot Chat 作答 | 📋 |
| 源码直达 | `open_file` 事件用 VS Code API 打开文件并定位行 | 📋 |

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
| 注入检测 | 代理侧：首 chunk 已含 `aiti-launcher.js` 则跳过（目标应用自带 vite 插件等时不双注入）；仅 `text/html` + navigate（`Sec-Fetch-Mode`）注入——与 core `htmlInjectMiddleware` 同语义 |
| 代理 | 本地反向代理 dev server（默认 8788），首 chunk prepend launcher 标签（绝对 URL 指桥 origin）、删 content-length 转 chunked、WebSocket upgrade 隧道透传（HMR） |
| 桥生命周期 | 子进程 `node aiti-bridge.mjs --port <n>`（ELECTRON_RUN_AS_NODE）；外部桥复用、只停自己拉起的；Windows taskkill 树杀 |
| MCP 配置 | stdio shim 条目（`node aiti-mcp-shim.cjs` + env `AITI_BRIDGE_URL`）；既有 mcp.json 含注释/非法 JSON 时不覆盖（防 clobber） |
| AI 窗口注入 | MVP 回退「打开 cockpit」（桥面板一键直达）；Webview 嵌入规划中 |
| 多窗口 | 每工程一个 instanceId；同工程多窗口共享 |

> 源码：`vscode-ext/`（esbuild 构建 `dist/extension.js`；`node --test test/smoke.test.mjs` 7 用例含真实桥 spawn/stop 闭环）。

> 相关：[IDE 插件产品页](/products/aiti-ide-plugins.md) · [改造 AI agent](/guide/mcp/ai-agents.md)
