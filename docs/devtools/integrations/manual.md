---
title: 手动接线（Express / Next 等）
icon: 🔌
ext:
  id: aiti-devtools-manual
  name: manual wiring
  description: 无专用插件的载体 —— 用 aiti-devtools-core 中间件手动接线（Express / Next / 任意 Node HTTP 服务）
  soul: 桥协议是公共能力，不该被某个框架绑架。
  type: integration-guide
  status: active
  publisher: aiti-ai
  website: https://aiti.pw
  license: MIT
  tags: [express, next, manual, core]
---

# 手动接线：Express / Next / 任意 Node 服务

没有专用插件的载体，直接用公共能力包 `aiti-devtools-core` 接线。core 提供**载体无关**的四件事：

| 能力 | API | 说明 |
|---|---|---|
| 桥 | `createBridge(dataDir)` | 桥核心实例 |
| HTTP 挂载 | `connectBridge(bridge, opts)` | 标准 connect 中间件（express/koa/connect 直接 `app.use`） |
| 资产 | `loadAssets()` | launcher/cockpit/bridge-client 静态资产 |
| MCP 注册 | `registerMcp(opts)` | 启动时把 MCP 端点写进 agent 配置 |

## Express

```js
// server.js —— 完整可运行示例：examples/aiti-express-demo
import express from 'express';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createBridge, connectBridge, loadAssets, registerMcp } from '@aiti-ai/aiti-devtools-core';

const app = express();
const bridge = createBridge(join(homedir(), '.pi', 'aiti-bridge'));

// 不挂路径前缀——中间件自己判断 /aiti/*，其余 next() 放行给应用路由
app.use(connectBridge(bridge, { prefix: '/aiti', staticFiles: loadAssets() }));

// 页面里手动加 launcher script
// <script src="/aiti/aiti-launcher.js" data-ai-url="/aiti/cockpit.html" data-bridge-url="/aiti"></script>

app.listen(5699, () => {
  // 与其他载体能力对齐：启动自动注册 MCP（谁持有端口谁拼地址——core 不碰端口）
  registerMcp({ url: 'http://localhost:5699/aiti/mcp', serverName: 'aiti-devtools', targets: 'auto' });
});
```

## Next.js（单端口 instrumentation）

Next 没有 middleware 注出 HTML 响应的官方钩子，用 `instrumentation.ts` 在 server 启动时给 Node HTTP 打补丁——一行接线，桥/资产/HTML 注入/MCP 注册全在 core：

```ts
// instrumentation.ts —— 完整可运行示例：examples/aiti-next-demo
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.NODE_ENV !== 'development') return;
  const { createRequire } = await import('node:module');
  const core = createRequire(process.cwd() + '/')('@aiti-ai/aiti-devtools-core');
  core.patchProcessHttp();   // 桥路由 + HTML 注入 + MCP 自动注册（PORT env 拼地址）
}
```

```js
// next.config.mjs —— core 保持 external（运行时 node 解析 + import.meta.url 资产路径有效）
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({ '@aiti-ai/aiti-devtools-core': 'commonjs aiti-devtools-core' });
      config.externals.push(/^node:/);
    }
    return config;
  },
};
```

## 其他 Node HTTP 服务

通用公式（Koa / Fastify / Hapi / 裸 http 同理）：

1. `createBridge(dataDir)` 建桥；
2. 把 `connectBridge(bridge, { prefix: '/aiti', staticFiles: loadAssets() })` 适配成该框架的中间件格式挂上（Fastify 用 `middleware` 兼容层，裸 http 手动判断 URL 前缀）;
3. HTML 响应里 prepend launcher script 标签；
4. （可选）`registerMcp({ url, ... })` 自动注册 MCP。

> 有成熟接线姿势的框架值得升级为一等插件（像 vite/webpack/nuxt 那样），欢迎提 issue 讨论。
