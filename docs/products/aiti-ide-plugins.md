---
title: aiti IDE 插件
icon: 💻
description: aiti-devtools-vscode / aiti-devtools-idea — 完成注入 + 直连 IDE AI agent 窗口
tags: [product, ide, vscode, idea]
---

# aiti IDE 插件 — vscode / idea

> **一句话**：IDE 插件是"注入 + 桥 + AI 窗口"的**最后一公里** —— 一键完成注入，经 aiti-bridge **直接把消息发到 IDE 里的 AI agent 窗口**（Copilot Chat / Cursor / JetBrains AI Assistant 等）。

## 1. 插件矩阵

| 插件 | 包名 / 市场名 | 目标 IDE | 状态 |
|---|---|---|---|
| aiti-devtools-vscode | `@aiti-ai/aiti-devtools-vscode` | VS Code / Cursor / Windsurf | 📋 |
| aiti-devtools-idea | `@aiti-ai/aiti-devtools-idea` | IntelliJ / PyCharm / WebStorm / GoLand / Android Studio | 📋 |

## 2. 三大职责

### ① 完成注入（Inject）
- 监听工程 dev server（Vite/Webpack/Next…），经**代理/端口转发**在响应里注入 aiti-devtools（与 `transformResponse` 同语义的 prepend）
- 未检测到 dev server 时：启动内置代理或提示用户启动
- 检测到页面已注入（`window.__aiti` 存在）→ 跳过，避免双注入
- 跨端一致：注入脚本与工程内插件、Chrome 扩展**同一份**，桥协议不变

### ② 配置桥（Bridge）
- 一键启动/停止 `aiti-bridge`（本地 8777，端口可配）
- 自动登记当前工程页面 → 生成 `pageId` → 写入 MCP 配置
- 自动配置 IDE 内置 AI agent 的 MCP 客户端（VS Code 写 `.vscode/mcp.json` 或 settings；JetBrains 写 MCP 配置 XML）

### ③ 直连 AI agent 窗口（Direct to IDE AI）
- 页面事件（`open_file` / `aiti_element_selected` / `user_*` 作答卡）经 bridge 实时推送到 **IDE 的 AI agent 窗口**
- 插件在 AI 窗口注入"aiti 面板"：当前 pageId、目标 URL、框架识别、连接状态、危险命令确认队列
- 用户直接在 IDE AI 窗口作答 `user_confirm` / `user_choose` / `user_input`，答案回桥 → AI
- `open_file` 事件直接用 IDE API 打开源码文件并定位到行（`code --goto file:line` 同语义，IDE 内更顺滑）

## 3. 用户旅程（VS Code 示例）

```
1. 打开工程 → 命令面板 → "aiti: 启用页面调试"
2. 插件启动 dev server 代理注入 + 拉起 aiti-bridge（自动配置 .vscode/mcp.json）
3. 在 Copilot Chat（或 Cursor）里直接问：
   「首页按钮点了没反应，帮我查一下」
4. AI 调用 page_exec 点击按钮 → 采集 console 报错 → 回 IDE AI 窗口
5. AI 调 user_confirm：「检测到 onClick 里 null 解引用，是否帮你改成可选链？」
   → IDE AI 窗口弹出确认卡 → 你点"批准" → AI 自动改代码
6. AI 调 user_pick_element 时，页面进入 Inspector 点选，选中元素直接定位到源码文件并在 IDE 打开
```

## 4. 实现要点

| 要点 | 方案 |
|---|---|
| 注入检测 | 页面 `window.__aiti` / `performance.getEntriesByType('resource')` 探测 |
| 代理 | 本地反向代理 dev server（Vite 默认 5173），响应 prepend 注入 |
| 桥生命周期 | 插件管理子进程；IDE 关闭时优雅停桥（TTL 保留 pageId） |
| 配置互操作 | `.vscode/mcp.json` / JetBrains `mcp.xml` 双向同步 |
| AI 窗口注入 | VS Code Webview（Copilot Chat 扩展点） / JetBrains Tool Window 嵌入 |
| 多窗口 | 每个工程一个 instanceId；同一工程多窗口共享 |

> 使用文档见 [IDE 插件](/ide/)，产品链路见 [产品矩阵](/products/README.md)。
