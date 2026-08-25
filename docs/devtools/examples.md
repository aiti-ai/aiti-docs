---
title: 示例矩阵
icon: 🧪
description: examples/ 各载体可运行示例 —— 运行命令与验证点
tags: [examples, demo]
---

# 示例矩阵（examples/）

仓库 `examples/` 下每个主流载体一个**最小可运行示例**，全部遵循同一约定：dev server 同源挂 `/aiti/`、launcher 自动注入、启动自动注册 MCP（示例默认 `mcp.register: false` 或测试期不写盘，避免污染本机配置）。

## 矩阵

| 示例 | 载体 | 接入方式 | 端口 | 启动命令 | 对应集成文档 |
|---|---|---|---|---|---|
| aiti-vite-demo | Vite | `aitiDevtools()` 插件 | 5199 | `pnpm dev` | [vite](integrations/vite.md) |
| aiti-webpack-demo | webpack-dev-server | `AitiDevtoolsWebpackPlugin` | 5299 | `pnpm dev` | [webpack-rspack](integrations/webpack-rspack.md) |
| aiti-rspack-demo | Rspack | 复用 webpack 插件 | 5399 | `pnpm dev` | [webpack-rspack](integrations/webpack-rspack.md) |
| aiti-astro-demo | Astro | `aitiAstro()` integration | 5499 | `pnpm dev` | [astro](integrations/astro.md) |
| aiti-nuxt-demo | Nuxt | `modules: ['@aiti-ai/aiti-devtools-nuxt']` | 5599 | `pnpm dev` | [nuxt](integrations/nuxt.md) |
| aiti-express-demo | Express | core `connectBridge` 手动接线 | 5699 | `pnpm dev` | [manual](integrations/manual.md) |
| aiti-next-demo | Next.js | `instrumentation.ts` + `patchProcessHttp()` | 5799 | `pnpm dev` | [manual](integrations/manual.md) |
| aiti-sveltekit-demo | SvelteKit | 裸 Vite 插件（SSR 页面也注入） | 5899 | `pnpm dev` | [vite](integrations/vite.md) |

另有共享测试页：`examples/aiti-test-page.html`（复杂 DOM 场景）与 `aiti-test-page-iframe.html`（iframe 宿主路由场景），express demo 直接复用。

## 统一验证法

每个示例用同一套验证点（以 vite demo / 5199 为例）：

```bash
cd examples/aiti-vite-demo && pnpm install && pnpm dev

# ① 注入生效：HTML 里出现 launcher 脚本
curl -s http://localhost:5199/ | grep -o aiti-launcher

# ② 桥/MCP 同源可达
curl -s http://localhost:5199/aiti/aiti-launcher.js -o /dev/null -w '%{http_code}\n'   # 200

# ③ 页面内：工具条出现 → 🧰 打开操作台；/aiti/cockpit.html 可独立打开 AI 窗
```

## 各示例要点

### aiti-vite-demo

最简接入范本。演示 `name` 多项目并存、外部桥协商、MCP 自动注册（`register/targets/dryRun`）、`assetsDir` 调试口子（指到仓库 inject/dist 看 launcher 即时改动）。含 iframe 测试页（宿主/iframe 路由）。

### aiti-webpack-demo / aiti-rspack-demo

webpack 用 html-webpack-plugin 注入 + setupMiddlewares 挂桥；rspack 配置零差异复用同一个包——验证「薄载体层」设计：core 出能力，载体只做适配。

### aiti-astro-demo

一行 `integrations: [aitiAstro()]`。验证 SSR 渲染页面同样被注入（head-inline 官方机制）。

### aiti-nuxt-demo

一行 `modules`。验证 Nuxt（底层 Vite）下 module 自动完成一切、用户不改应用文件。

### aiti-express-demo

手动接线范本：`connectBridge` 标准 connect 中间件直接 `app.use`，页面 script 手动加；启动时 `registerMcp` 与其他载体对齐。

### aiti-next-demo

无 middleware 钩子载体的解法：`instrumentation.ts` 里 `patchProcessHttp()` 单端口打补丁；`next.config.mjs` 把 core 保持 external（运行时解析 + import.meta.url 资产路径有效）。

### aiti-sveltekit-demo

裸 Vite 插件接 SSR 框架的代表：`plugins: [sveltekit(), aitiDevtools()]` 即可。
