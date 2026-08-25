---
title: Vue 工程插件
icon: 🍃
ext:
  id: aiti-devtools-vue
  name: aiti-devtools-vue
  description: Vue 工程插件 —— dev 自动本地注入（规划中）
  soul: 接入成本每多一步，就多一个永远不接的人。
  type: vue-plugin
  version: 0.1.0
  status: planned
  publisher: aiti-ai
  website: https://aiti.pw
  npm: "@aiti-ai/aiti-devtools-vue"
  license: MIT
  tags: [vue, inject]
---

# aiti-devtools-vue

> 📋 **规划中（未发布）**：本包尚未实现；Vue 工程当前可复用 [Vite 插件](vite.md)接入。

Vue 工程的本地注入插件，dev 模式自动注入，与 Vite 插件同构的桥协议。

## 当前接入方式（无需等包）

绝大多数 Vue 工程就是 Vite 工程——直接装 [aiti-devtools-vite](vite.md)：

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue';
import { aitiDevtools } from '@aiti-ai/aiti-devtools-vite';

export default defineConfig({
  plugins: [vue(), aitiDevtools({ mcp: { register: true } })],
});
```

Vue dev 构建自带 `__file` 组件源码信息，AI 点选元素即可定位到 SFC 文件。

## 规划中的独立包

- `app.use()` 一行接入（覆盖非 Vite 构建链的 Vue 工程）
- **组件级定位**：选区 → `{ framework:'vue', file, line, component }`（基于 SFC 编译信息，比 `__file` 更精确）
- 与 Vite 插件叠加使用时自动跳过（避免双注入）

> 路线图见 [aiti-devtools 产品页](/products/aiti-devtools-plugins.md)。
