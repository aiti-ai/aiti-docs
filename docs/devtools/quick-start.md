---
title: devtools 快速开始
icon: 🚀
description: 最快接入路径
tags: [devtools, quick-start]
---

# aiti-devtools 快速开始

## 方式一：Vite 工程（推荐）

```bash
pnpm add -D @justdb/aiti-devtools-vite
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { aitiDevtools } from '@justdb/aiti-devtools-vite';

export default defineConfig({
  plugins: [
    aitiDevtools({
      // 可选：MCP 桥
      bridge: { base: 'http://localhost:8777', token: 'dev' },
      // 可选：AI 会话页
      aiUrl: 'http://localhost:30141/dbg/chat',
    }),
  ],
});
```

`pnpm dev` 后，页面右下角出现 💬（AI）/ 🎯（Inspector）按钮。

## 方式二：原生 HTML / 任意工程

```html
<script src="aiti-devtools/inject.js"></script>
<script>
  createDbgLauncher('http://localhost:3000/todo', {
    aiUrl: 'http://localhost:30141/dbg/chat?session=abc', // 可选
    bridgeBase: 'http://localhost:8777',                  // 可选
    bridgeToken: 'dev',
  });
</script>
```

## 方式三：IDE 插件（零改代码）

安装 `aiti-devtools-vscode` / `aiti-devtools-idea`（规划中），一键注入 + 自动配置桥。

## 验证

1. 打开页面，确认 💬 / 🎯 按钮出现
2. 点击 🎯 进入 Inspector，三步点选任意元素，HUD 显示元素信息
3. （有桥时）`curl http://localhost:8777/bridge/sessions` 能看到本页面 `pageId`

## 下一步

- 了解注入原理：[inject](/devtools/inject.md)
- 接入 AI：[MCP 桥 · AI agent](/mcp-bridge/ai-agents.md)
- 命令参考：[CDP 命令集](/devtools/cdp-commands.md)
