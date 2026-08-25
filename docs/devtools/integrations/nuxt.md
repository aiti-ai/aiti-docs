---
title: Nuxt Module
icon: 🟩
ext:
  id: aiti-devtools-nuxt
  name: aiti-devtools-nuxt
  description: Nuxt module —— 一行 modules 接入 = dev server 内置 MCP + 自动注入
  soul: 接入成本每多一步，就多一个永远不接的人。
  type: nuxt-module
  version: 0.1.0
  status: active
  publisher: aiti-ai
  website: https://aiti.pw
  npm: "@aiti-ai/aiti-devtools-nuxt"
  install: |
    pnpm add -D @aiti-ai/aiti-devtools-nuxt
    # nuxt.config.ts: modules: ['@aiti-ai/aiti-devtools-nuxt']
  license: MIT
  tags: [nuxt, inject]
---

# aiti-devtools-nuxt

> ❝ **接入成本每多一步，就多一个永远不接的人。** ❞

Nuxt module：一行 `modules` 接入 = dev server 内置 MCP（桥/MCP/launcher 在同源 `/aiti/`）+ head 自动注入 launcher + 启动自动注册 agent 工具。**用户不改任何应用文件。**

## 安装

::: code-tabs

@tab npm

```bash
npm install -D aiti-devtools-nuxt
```

@tab yarn

```bash
yarn add -D @aiti-ai/aiti-devtools-nuxt
```

@tab pnpm

```bash
pnpm add -D @aiti-ai/aiti-devtools-nuxt
```

@tab bun

```bash
bun add -D @aiti-ai/aiti-devtools-nuxt
```

:::

## 配置

```ts
// nuxt.config.ts —— 用户侧只需这一处
export default defineNuxtConfig({
  modules: ['@aiti-ai/aiti-devtools-nuxt'],
  aitiDevtools: { mcp: { register: false } },   // 可选，透传 AitiDevtoolsOptions
});
```

## 行为

- module 内部挂 [aiti-devtools-vite](vite.md) 插件（Nuxt dev 底层即 Vite）+ Nitro/head 注入兜底
- SSR 渲染的 HTML 同样注入（head script）
- dev-only：`nuxt build` 生产产物零注入
- `aitiDevtools` 键直接透传 Vite 插件的选项（name/bridgeUrl/aiUrl/mcp…）

## 验证

```bash
pnpm dev --port 5599
curl -s http://localhost:5599/ | grep -o aiti-launcher   # HTML 里应出现 launcher 脚本
```

可运行示例：[examples/aiti-nuxt-demo](examples.md)（端口 5599）
