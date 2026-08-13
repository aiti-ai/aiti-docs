---
title: Vue 插件
icon: 🍃
description: "@justdb/aiti-devtools-vue 用法"
tags: [devtools, vue]
---

# aiti-devtools-vue

Vue 应用内注入。`app.use()` 一行接入，附带组件层级信息（组件名 → 源码定位）。

## 安装

```bash
pnpm add -D @justdb/aiti-devtools-vue
```

## 配置

```ts
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import aitiDevtools from '@justdb/aiti-devtools-vue';

const app = createApp(App);

if (import.meta.env.DEV) {
  app.use(aitiDevtools, {
    bridge: { base: 'http://localhost:8777' },
    // 开启组件定位：AI 点选元素时输出 { framework:'vue', file, line, component }
    componentLocation: true,
  });
}

app.mount('#app');
```

## 选项

| 选项 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `bridge.base` | string | — | MCP 桥地址 |
| `bridge.token` | string | `dev` | 桥 token |
| `componentLocation` | boolean | `true` | 组件源码定位（基于 Vue SFC 编译信息） |

## 能力

- 注入 `aiti-devtools` + Inspector UI（与注入核心包同构）
- **组件级定位**：选区 → `{framework:'vue', file, line, component}` → AI 可直接定位到 SFC 文件
- 与 Vite 插件叠加使用时自动跳过（避免双注入）

## 验证

```bash
pnpm dev
# 打开页面 → 🎯 点选任意组件 → HUD 显示组件名与源文件位置
```
