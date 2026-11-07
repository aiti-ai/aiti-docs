---
title: aiti-devtools 插件矩阵
icon: 🧩
description: Vite / Webpack / Nuxt / Astro / Next / Express / SvelteKit 载体插件 — 嵌入主流开发工具，dev server 内置 MCP + 本地 inject
tags: [product, aiti-devtools, vite, webpack, nuxt, astro, next, inject]
---

# aiti-devtools 插件矩阵 — 嵌入主流开发工具，本地 inject

> **一句话**：把 aiti-devtools 的注入能力打包成各主流开发工具的**零配置插件**，dev 模式自动注入，**本地 inject** —— 不改业务代码、不依赖 CDN、不上生产。

## 1. 设计原则

| 原则 | 说明 |
|---|---|
| 本地注入 | 插件在构建/dev 阶段把注入脚本打进产物，不走远程加载 |
| dev-only | 默认仅 dev 模式注入，生产构建零残留、零体积 |
| 零配置 | `pnpm add -D` + 一行启用，自动识别框架 |
| 与形态①②③ 兼容 | 插件注入的 `aiti-devtools` client 与手动 `<script>` 引入完全同构，桥协议一致 |
| 源码定位 | dev 构建下自动带上 `_debugSource` / `__file` / `__svelte_meta`，AI 报错可定位到源码 |

## 2. 插件矩阵

| 载体 | 包名 / 接入 | 接入方式 | 能力 | 状态 |
|---|---|---|---|---|
| Vite | `aiti-devtools-vite` | `vite.config.ts` 里 `plugins: [aitiDevtools()]` | dev server 内置桥/MCP（同源 `/aiti/`）+ launcher 注入 + 自动注册 | ✅ 0.1.x |
| Webpack / Rspack | `aiti-devtools-webpack` | `plugins: [new AitiDevtoolsWebpackPlugin()]` | 同上（setupMiddlewares + html-webpack-plugin 注入；Rspack 直接复用） | ✅ 0.1.x |
| Nuxt | `aiti-devtools-nuxt` | `modules: ['@aiti-ai/aiti-devtools-nuxt']` 一行 | 同上（module 挂桥 + head 自动注入） | ✅ 0.1.x |
| Astro | `aiti-devtools-vite/astro` | `integrations: [aitiAstro()]` 一行 | 内部挂 Vite 插件：桥/MCP + 自动注入，不改页面文件 | ✅ |
| Next.js | 经 `aiti-devtools-core` 直接接入 | `instrumentation.ts` 启动桥 + 响应注入 | 桥/MCP + 注入（无独立 next 包） | ✅ 示例 |
| Express | 经 `aiti-devtools-core` 中间件 | `app.use()` 挂桥 + 注入 | 桥/MCP + 注入 | ✅ 示例 |
| SvelteKit | 复用 Vite 插件 | `vite.config.js` 里 `aitiDevtools()` | 与 Vite 载体相同 | ✅ 示例 |
| Vue 专属 / React / Svelte 专属插件 | — | — | 组件层级信息等框架深度集成 | 📋 规划 |

> 各插件的完整选项与验证方法见使用文档：[Vite](/devtools/integrations/vite.md) · [webpack/Rspack](/devtools/integrations/webpack-rspack.md) · [Nuxt](/devtools/integrations/nuxt.md) · [Astro](/devtools/integrations/astro.md) · [Vue（规划中）](/devtools/integrations/vue.md) · [手动接线](/devtools/integrations/manual.md) · [示例矩阵](/devtools/examples.md)

## 3. 接入示例

### 安装（npm / yarn / pnpm / bun）

按载体选包装，包管理器随意：

::: code-tabs

@tab Vite / SvelteKit / Astro

```bash
# npm
npm install -D @aiti-ai/aiti-devtools-vite
# yarn
yarn add -D @aiti-ai/aiti-devtools-vite
# pnpm
pnpm add -D @aiti-ai/aiti-devtools-vite
# bun
bun add -D @aiti-ai/aiti-devtools-vite
```

@tab Webpack / Rspack

```bash
# npm
npm install -D aiti-devtools-webpack html-webpack-plugin
# yarn
yarn add -D @aiti-ai/aiti-devtools-webpack html-webpack-plugin
# pnpm
pnpm add -D @aiti-ai/aiti-devtools-webpack html-webpack-plugin
# bun
bun add -D @aiti-ai/aiti-devtools-webpack html-webpack-plugin
```

@tab Nuxt

```bash
# npm
npm install -D aiti-devtools-nuxt
# yarn
yarn add -D @aiti-ai/aiti-devtools-nuxt
# pnpm
pnpm add -D @aiti-ai/aiti-devtools-nuxt
# bun
bun add -D @aiti-ai/aiti-devtools-nuxt
```

:::

### Vite（最常用）

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { aitiDevtools } from '@aiti-ai/aiti-devtools-vite';

export default defineConfig({
  plugins: [
    aitiDevtools({
      // name: 'aiti-devtools-demo',   // 多项目并存标识
      // bridgeUrl: '',                // 外部桥地址；空 = 与应用同源
      // aiUrl: '',                    // AI 窗地址；空 = 同源 cockpit.html
      mcp: { register: true, targets: 'auto' },   // 启动自动注册 MCP
    }),
  ],
});
```

### Nuxt（一行 modules）

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@aiti-ai/aiti-devtools-nuxt'],
});
```

### Astro（一行 integrations）

```mjs
// astro.config.mjs
import { aitiAstro } from '@aiti-ai/aiti-devtools-vite/astro';

export default defineConfig({
  integrations: [aitiAstro()],   // 内部挂 Vite 插件：桥/MCP + 自动注入
});
```

### Webpack / Rspack

```js
// webpack.config.js
import { AitiDevtoolsWebpackPlugin } from '@aiti-ai/aiti-devtools-webpack';

export default {
  plugins: [new AitiDevtoolsWebpackPlugin()],
};
```

## 4. 注入原理（本地 inject 链路）

```
插件注册 → dev server 响应（HTML 或首屏脚本）
  → prepend 注入（transformResponse 同一语义，最早执行）
  → createDbgLauncher 初始化 → window.__dbg 暴露
  → Inspector UI 挂载 → (可选) 连 MCP 桥 SSE
  → 宿主页/同源 iframe 注入（injectAllIframes / MutationObserver 兜底动态 iframe）
  → 跨域 iframe 跳过（可枚举、不可定向执行）
```

- 注入回调语义与 `service-tunnels` 的 `transformResponse` 一致（`scriptFor` 返回 prepend），**同一套注入脚本可被三种形态复用**。
- `pageId = instanceId/frameId`：每个可寻址 document/frame 一个 `frameId`（`host` / `f0` / `f1`…），AI 只需一个 `pageId` 即可定向。

## 5. 与 IDE 插件的关系

IDE 插件（vscode/idea）可以**替代或叠加**这里的工程内插件：

| 场景 | 用哪个 |
|---|---|
| 工程在 IDE 里开发，且允许装 dev 依赖 | 工程内插件（vite/vue/…） |
| 不想动工程、想零依赖注入 | IDE 插件自动注入（代理 dev server / 端口转发） |
| 两者都有 | IDE 插件检测到已注入则跳过，避免双注入 |

> 产品定位见 [aiti-bridge](/products/aiti-bridge.md)，IDE 插件见 [IDE 插件](/products/aiti-ide-plugins.md)，使用文档见 [aiti-devtools · 框架集成](/devtools/integrations/vite.md)。
