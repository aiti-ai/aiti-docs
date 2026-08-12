---
title: aiti-devtools 插件矩阵
icon: 🧩
description: Vite / Vue / Next / React / Svelte 插件 — 嵌入各个主流开发工具，本地 inject
tags: [product, aiti-devtools, vite, vue, next, inject]
---

# aiti-devtools 插件矩阵 — 嵌入主流开发工具，本地 inject

> **一句话**：把 aiti-devtools 的注入能力打包成各主流开发工具的**零配置插件**，dev 模式自动注入，**本地 inject** —— 不改业务代码、不依赖 CDN、不上生产。

## 1. 设计原则

| 原则 | 说明 |
|---|---|
| 本地注入 | 插件在构建/dev 阶段把注入脚本打进产物，不走远程加载 |
| dev-only | 默认仅 dev 模式注入，生产构建零残留、零体积 |
| 零配置 | `pnpm add -D` + 一行启用，自动识别框架 |
| 与形态①②③ 兼容 | 插件注入的 `__dbg` client 与手动 `<script>` 引入完全同构，桥协议一致 |
| 源码定位 | dev 构建下自动带上 `_debugSource` / `__file` / `__svelte_meta`，AI 报错可定位到源码 |

## 2. 插件矩阵

| 插件 | 包名 | 接入方式 | 注入点 | 状态 |
|---|---|---|---|---|
| Vite | `@justdb/aiti-devtools-vite` | `vite.config.ts` 里 `plugins: [aitiDevtools()]` | transformIndexHtml / 中间件，dev server 响应头注入 | 📋 |
| Vue | `@justdb/aiti-devtools-vue` | `app.use(aitiDevtools)` | 应用启动时挂载 + 组件层级信息 | 📋 |
| Next.js | `@justdb/aiti-devtools-next` | `next.config.js` 包一层 | 开发 server 响应注入 + `_debugSource` | 📋 |
| React | `@justdb/aiti-devtools-react` | Babel 插件 / 入口一行 | JSX 编译期注入组件名 | 📋 |
| Svelte | `@justdb/aiti-devtools-svelte` | `vite-plugin-svelte` 组合 | `__svelte_meta` 源码定位 | 📋 |
| Webpack | `@justdb/aiti-devtools-webpack` | webpack 插件 | html-webpack-plugin 钩子注入 | 📋(可选) |

## 3. 接入示例

### Vite（最常用）

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { aitiDevtools } from '@justdb/aiti-devtools-vite';

export default defineConfig({
  plugins: [
    aitiDevtools({
      // 可选：MCP 桥地址，devtools 自动连桥
      bridge: { base: 'http://localhost:8777', token: 'dev' },
      // 可选：AI 会话页（aiti-agent / IDE AI 窗）
      aiUrl: 'http://localhost:30141/dbg/chat',
      // 默认仅 dev 生效
      enabled: process.env.NODE_ENV !== 'production',
    }),
  ],
});
```

### Vue

```ts
// main.ts
import { createApp } from 'vue';
import aitiDevtools from '@justdb/aiti-devtools-vue';

const app = createApp(App);
if (import.meta.env.DEV) {
  app.use(aitiDevtools, { bridge: { base: 'http://localhost:8777' } });
}
app.mount('#app');
```

### Next.js

```js
// next.config.js
const { withAitiDevtools } = require('@justdb/aiti-devtools-next');

module.exports = withAitiDevtools({
  aiti: { enabled: process.env.NODE_ENV === 'development' },
  // 原配置...
});
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

> 产品定位见 [aiti-mcp-bridge](/products/aiti-mcp-bridge.md)，IDE 插件见 [IDE 插件](/products/aiti-ide-plugins.md)，使用文档见 [开发者工具 · Vite 插件](/devtools/vite-plugin.md)。
