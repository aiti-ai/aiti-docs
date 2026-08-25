---
title: Astro Integration
icon: 🚀
ext:
  id: aiti-devtools-astro
  name: aiti-devtools-astro
  description: Astro Integration —— 一行 integrations = 桥/MCP + 全页自动注入（含 SSR 页面）
  soul: 官方机制能做的，就不该发明私有姿势。
  type: astro-integration
  version: 0.2.1
  status: active
  publisher: aiti-ai
  website: https://aiti.pw
  npm: "@aiti-ai/aiti-devtools-vite"
  install: |
    pnpm add -D @aiti-ai/aiti-devtools-vite
    # astro.config.mjs: integrations: [aitiAstro()]
  license: MIT
  tags: [astro, inject]
---

# aitiAstro() — Astro Integration

Astro **官方 Integration 机制**的接入（随 `@aiti-ai/aiti-devtools-vite` 附带，无独立包）：内部挂 Vite 插件（桥/MCP/资产在 `/aiti/`）+ `injectScript('head-inline')` 自动注入 launcher——SSR 渲染的 HTML 也注入，无需改任何页面文件。

## 安装

::: code-tabs

@tab npm

```bash
npm install -D @aiti-ai/aiti-devtools-vite
```

@tab yarn

```bash
yarn add -D @aiti-ai/aiti-devtools-vite
```

@tab pnpm

```bash
pnpm add -D @aiti-ai/aiti-devtools-vite
```

@tab bun

```bash
bun add -D @aiti-ai/aiti-devtools-vite
```

:::

## 配置

```js
// astro.config.mjs —— 用户侧只需一行
import { defineConfig } from 'astro/config';
import { aitiAstro } from '@aiti-ai/aiti-devtools-vite/astro';

export default defineConfig({
  integrations: [aitiAstro({ mcp: { register: false } })],
});
```

## 行为

- `astro:config:setup` 钩子里：
  - `updateConfig` 挂 [aitiDevtools()](vite.md) Vite 插件 → 桥/MCP/操作台同源 `/aiti/`
  - `injectScript('head-inline')` 动态创建 launcher script 标签（Astro 5 无 head-prepend stage，用内联代码兜底）
- dev-only：`command !== 'dev'` 直接返回，`astro build` 生产产物零注入
- 选项与 Vite 插件完全一致（prefix/bridgeUrl/aiUrl/name…）

## 为什么不用裸 Vite 插件接 Astro？

可以（SvelteKit 就是这么接的），但 Astro 的 SSR 页面不走 Vite transform 流程，裸插件注不到；Integration 的 `injectScript` 是官方机制，全页覆盖且升级安全。

## 验证

```bash
pnpm dev --port 5499
curl -s http://localhost:5499/ | grep -o aiti-launcher   # HTML 里应出现 launcher 脚本
```

可运行示例：[examples/aiti-astro-demo](examples.md)（端口 5499）
