---
title: webpack / Rspack 插件
icon: 📦
ext:
  id: aiti-devtools-webpack
  name: aiti-devtools-webpack
  description: webpack-dev-server 插件 —— 一个插件 = dev server 内置 MCP + 自动注入（Rspack 直接复用）
  soul: 接入成本每多一步，就多一个永远不接的人。
  type: webpack-plugin
  version: 0.1.0
  status: active
  publisher: aiti-ai
  website: https://aiti.pw
  npm: "@aiti-ai/aiti-devtools-webpack"
  install: |
    pnpm add -D @aiti-ai/aiti-devtools-webpack html-webpack-plugin
    # webpack.config.js: plugins: [new AitiDevtoolsWebpackPlugin()]
  license: MIT
  tags: [webpack, rspack, inject]
---

# aiti-devtools-webpack

> ❝ **接入成本每多一步，就多一个永远不接的人。** ❞

webpack-dev-server 插件：与 [Vite 插件](vite.md)同能力的薄载体层——dev server 内置桥/MCP（同源 `/aiti/`）+ launcher 注入 + 操作台 + 启动自动注册 agent 工具。复用 `aiti-devtools-core` 全部公共能力。

**Rspack 直接复用**：`@rspack/dev-server` 的 `setupMiddlewares` 与 webpack 同格式，html-webpack-plugin 有兼容层，无需换包。

## 安装

::: code-tabs

@tab npm

```bash
npm install -D aiti-devtools-webpack html-webpack-plugin
```

@tab yarn

```bash
yarn add -D @aiti-ai/aiti-devtools-webpack html-webpack-plugin
```

@tab pnpm

```bash
pnpm add -D @aiti-ai/aiti-devtools-webpack html-webpack-plugin
```

@tab bun

```bash
bun add -D @aiti-ai/aiti-devtools-webpack html-webpack-plugin
```

:::

## 配置

```js
// webpack.config.js
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { AitiDevtoolsWebpackPlugin } from '@aiti-ai/aiti-devtools-webpack';

export default {
  mode: 'development',
  entry: './src/index.js',
  devServer: { port: 5299, hot: true },
  plugins: [
    new HtmlWebpackPlugin({ template: 'src/index.html' }),
    new AitiDevtoolsWebpackPlugin({
      // name: 'aiti-devtools-demo',  // 多项目并存标识
      // bridgeUrl: '',               // 外部桥地址；空 = 同源
      mcp: { register: true, targets: 'auto' },
    }),
  ],
};
```

### Rspack

```js
// rspack.config.mjs —— 同一个包，零改动
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { AitiDevtoolsWebpackPlugin } from '@aiti-ai/aiti-devtools-webpack';

export default {
  mode: 'development',
  entry: './src/index.js',
  devServer: { port: 5399 },
  plugins: [
    new HtmlWebpackPlugin({ template: 'src/index.html' }),
    new AitiDevtoolsWebpackPlugin({ mcp: { register: false } }),
  ],
};
```

验证点：① `@rspack/dev-server` 的 `setupMiddlewares` ② html-webpack-plugin 兼容层——两者均已实测通过。

## 行为

- 通过 `devServer.setupMiddlewares` 挂桥/MCP/资产（同源 `/aiti/`），html-webpack-plugin 注入 launcher 脚本
- dev-only，生产构建零残留
- 无 HTML 页面的纯 API 工程：launcher 不注入，但桥/MCP 照常可用（手动 script 或经操作台连）

## 验证

```bash
pnpm dev
curl -s http://localhost:5299/ | grep -o aiti-launcher   # HTML 里应出现 launcher 脚本
```

可运行示例：[examples/aiti-webpack-demo](examples.md)（5299）· [aiti-rspack-demo](examples.md)（5399）
