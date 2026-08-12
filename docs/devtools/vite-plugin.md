---
title: Vite 插件
icon: ⚡
description: "@justdb/aiti-devtools-vite 用法"
tags: [devtools, vite]
---

# aiti-devtools-vite

Vite 工程一键注入。dev server 响应 prepend 注入 aiti-devtools，**本地 inject、dev-only、生产零残留**。

## 安装

```bash
pnpm add -D @justdb/aiti-devtools-vite
```

## 配置

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { aitiDevtools } from '@justdb/aiti-devtools-vite';

export default defineConfig({
  plugins: [
    aitiDevtools({
      // MCP 桥（可选）：devtools 自动连桥并登记 pageId
      bridge: { base: 'http://localhost:8777', token: 'dev' },
      // AI 会话页（可选）：aiti-agent 或 IDE AI 窗口
      aiUrl: 'http://localhost:30141/dbg/chat',
      // 默认 dev-only；生产构建强制关闭
      enabled: process.env.NODE_ENV !== 'production',
      // 注入模式：'prepend'（默认，响应开头最早执行）
      injectMode: 'prepend',
    }),
  ],
});
```

## 选项

| 选项 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `bridge.base` | string | — | MCP 桥地址 |
| `bridge.token` | string | `dev` | 桥 token（兼容别名） |
| `aiUrl` | string | — | AI 会话页地址 |
| `enabled` | boolean | dev 自动开 | 是否注入 |
| `injectMode` | `'prepend' \| 'append'` | `prepend` | 注入位置 |

## 行为

- 仅对 dev server（或开启的 preview）响应注入；生产 build 输出不含注入代码
- 注入脚本内联进 HTML 响应，无额外网络请求
- 与手动 `<script>` 引入、IDE 插件注入互斥检测（`window.__dbg` 已存在则跳过）

## 验证

```bash
curl -s http://localhost:5173/ | head -5   # 响应开头应出现注入脚本
# 打开页面 → 右下角 💬 / 🎯 按钮
```

> 框架识别：Vite dev 构建下 React/Vue/Svelte 自动带源码定位信息（`_debugSource`/`__file`/`__svelte_meta`）。
