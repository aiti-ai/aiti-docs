---
title: 快速开始
icon: 🚀
description: 5 分钟跑通 aiti：装插件 → 起桥 → 接 AI
tags: [guide, quick-start]
---

# 快速开始

5 分钟跑通「AI 操作你的页面」。

## 前置

- Node.js ≥ 20
- 一个可跑的 Web 工程（Vite / Vue / Next / 原生 HTML 均可）

## 步骤 1：注入（选一种）

### 方式 A：工程插件（推荐，Vite 示例）

```bash
pnpm add -D @justdb/aiti-devtools-vite
```

```ts
// vite.config.ts
import { aitiDevtools } from '@justdb/aiti-devtools-vite';
export default defineConfig({
  plugins: [aitiDevtools({ bridge: { base: 'http://localhost:8777' } })],
});
```

### 方式 B：直接引入（原生 HTML / 任意工程）

```html
<script src="aiti-devtools/inject.js"></script>
<script>
  createDbgLauncher('http://localhost:3000/todo', {
    bridgeBase: 'http://localhost:8777',
  });
</script>
```

启动 dev server，页面右下角应出现 💬 / 🎯 两个按钮。

## 步骤 2：启动 MCP 桥

```bash
npx @justdb/aiti-mcp-bridge --http 8777
# 或（等同，直接跑 server）
npx @justdb/aiti-mcp-server --http 8777
```

页面应自动连桥（也可刷新页面确认）。

## 步骤 3：接入 AI agent

### Claude Code

```bash
claude mcp add aiti -- npx @justdb/aiti-mcp-server --bridge http://localhost:8777
```

### Cursor / VS Code Copilot Chat

在 MCP 设置中添加 stdio server：

```json
{ "command": "npx", "args": ["@justdb/aiti-mcp-server", "--bridge", "http://localhost:8777"] }
```

### aiti-agent（Web 工作台）

在 aiti-agent 的会话里配置同一桥地址即可（或经 service-tunnels 暴露）。

## 步骤 4：开始对话

```
我：用 bridge_status 看一下有哪些 pageId，然后对默认 pageId 执行 page_snapshot
AI：当前页面：http://localhost:5173（Vue 应用，frameId=host），已就绪。
我：点击「提交」按钮，然后把 console 报错给我
AI：已点击，控制台报错：TypeError: Cannot read properties of undefined (reading 'name') at src/components/Form.vue:42
我：（user_confirm 自动弹出确认卡）批准修复
AI：已修复 Form.vue:42 —— 增加空值兜底。
```

## 下一步

- [开发者工具 · 注入原理](/devtools/inject.md)
- [MCP 桥 · 会话体系](/mcp-bridge/session.md)
- [MCP 桥 · 改造 AI agent](/mcp-bridge/ai-agents.md)
- [整体规划](/roadmaps/master-plan.md)
