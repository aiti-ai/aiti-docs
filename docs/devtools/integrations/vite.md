---
title: Vite 插件
icon: ⚡
ext:
  id: aiti-devtools-vite
  name: aiti-devtools-vite
  description: Vite 插件 —— dev 自动本地注入，一行插件 = 同源 /aiti/ 全套
  soul: 接入成本每多一步，就多一个永远不接的人。
  type: vite-plugin
  version: 0.2.1
  status: active
  publisher: aiti-ai
  website: https://aiti.pw
  npm: "@aiti-ai/aiti-devtools-vite"
  install: |
    pnpm add -D @aiti-ai/aiti-devtools-vite
    # vite.config.ts: plugins: [aitiDevtools()]
  license: MIT
  tags: [vite, inject]
---

# aiti-devtools-vite

> ❝ **接入成本每多一步，就多一个永远不接的人。** ❞

Vite 工程的零配置注入插件：dev server 内置桥/MCP（同源 `/aiti/`）+ launcher 自动注入 + 操作台 + 启动自动注册 agent 工具。**dev-only、生产零残留、不改业务代码。** SvelteKit 等基于 Vite 的框架同样适用。

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

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { aitiDevtools } from '@aiti-ai/aiti-devtools-vite';

export default defineConfig({
  plugins: [
    aitiDevtools({
      // name: 'aiti-devtools-demo',   // 多项目并存：改名后 MCP 条目/日志/来源标注/操作台文案全跟随
      // bridgeUrl: '',                // 外部桥地址（可带多余路径，自动协商）；空 = 与应用同源
      // aiUrl: '',                    // aiti-agent 地址（AI 窗）；空 = 同源 cockpit.html
      mcp: {
        register: true,   // 启动自动注册 MCP 到 agent 工具
        targets: 'auto',  // 只写已存在的配置文件
        // dryRun: true,  // 预览不写盘
      },
    }),
  ],
});
```

## 选项（AitiDevtoolsOptions）

| 选项 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `name` | string | `'aiti-devtools'` | 标识名：MCP 配置条目/日志/来源标注/操作台文案全跟随；多项目并存改这个 |
| `bridgeUrl` | string | 同源 | 外部桥地址（可带 `/aiti`、`/bridge` 等多余路径，自动协商） |
| `aiUrl` | string | 同源 `cockpit.html` | AI 窗地址 |
| `mcp` | object | — | MCP 注册选项 `{ register, targets, dryRun }` |
| `prefix` | string | `/aiti` | 桥/MCP/资产挂载前缀 |
| `inject` | boolean \| object | `true` | 注入 launcher 脚本；`{ include, exclude }` 控制范围 |
| `assetsDir` | string | 包内 `assets/` | 资产目录（调试口子：指仓库 inject/dist 看 launcher 即时改动） |
| `dataDir` | string | `~/.pi/aiti-bridge` | 桥数据目录（消息 session 等） |
| `log` | function | `console.log` | 日志回调 |

## 行为

- dev-only：`astro build` / `vite build` 生产产物零注入
- launcher 注入 = 响应 HTML prepend 脚本；桥/MCP/操作台同源挂在 `/aiti/`
- 双注入防护：`window.__aiti` 已存在则跳过
- 框架识别：Vite dev 构建下 React/Vue/Svelte 自动带源码定位信息（`_debugSource`/`__file`/`__svelte_meta`）

## 验证

```bash
pnpm dev
curl -s http://localhost:5173/ | grep -o aiti-launcher   # HTML 里应出现 launcher 脚本
# 打开页面 → 工具条出现；/aiti/cockpit.html 可开操作台
```

可运行示例：[examples/aiti-vite-demo](https://github.com/aiti-ai)（端口 5199）· [SvelteKit 示例](examples.md)

> Astro 工程请用封装好的 [aitiAstro()](astro.md)——内部就是本插件 + head-inline 注入。
