---
title: 快速开始
icon: 🚀
description: 5 分钟跑通 aiti：装插件 → 起桥 → 接 AI
tags: [guide, quick-start]
---

# 快速开始

5 分钟跑通「AI 操作你的页面」。

## 前置

- Node.js ≥ 20
- 一个可跑的 Web 工程（Vite / Vue / Next / 原生 HTML 均可）

## 步骤 1：注入（选一种）

### 方式 A：工程插件（推荐，Vite 示例）

```bash
pnpm add -D @aiti-ai/aiti-devtools-vite
```

```ts
// vite.config.ts
import { aitiDevtools } from '@aiti-ai/aiti-devtools-vite';
export default defineConfig({
  plugins: [aitiDevtools({ bridgeUrl: 'http://localhost:8777' })],
});
```

### 方式 B：直接引入（原生 HTML / 任意工程）

```html
<script src="/aiti/aiti-launcher.js" data-ai-url="/aiti/cockpit.html" data-bridge-url="/aiti"></script>
```

launcher 读取 `data-ai-url` / `data-bridge-url` 属性自动启动，无需手动调用。

启动 dev server，页面右下角应出现 💬 / 🎯 两个按钮。

## 步骤 2：启动 MCP 桥

```bash
npx @aiti-ai/aiti-bridge --port 8777   # MCP 端点内置于桥
```

页面应自动连桥（也可刷新页面确认）。

## 步骤 3：接入 AI agent

### Claude Code

```bash
npx @aiti-ai/aiti-bridge --register-shim   # 一键注册 aiti 条目（幂等；agent 启动带 env AITI_BRIDGE_URL 即接入）
```

### Cursor / VS Code Copilot Chat

在 MCP 设置中添加 stdio server：

```json
{ "command": "node", "args": ["<桥安装目录>/bin/aiti-mcp-shim.cjs"], "env": { "AITI_BRIDGE_URL": "http://127.0.0.1:8777" } }
```

### aiti-agent（Web 工作台）

在 aiti-agent 的会话里配置同一桥地址即可（或经 service-tunnels 暴露）。

## 步骤 4：开始对话

```
我：用 bridge_status 看一下有哪些 pageId，然后对默认 pageId 执行 page_snapshot
AI：当前页面：http://localhost:5173（Vue 应用，frameId=host），已就绪。
我：点击「提交」按钮，然后把 console 报错给我
AI：已点击，控制台报错：TypeError: Cannot read properties of undefined (reading 'name') at src/components/Form.vue:42
我：（user_confirm 自动弹出确认卡）批准修复
AI：已修复 Form.vue:42 —— 增加空值兜底。
```

## 下一步

- [开发者工具 · 注入原理](/devtools/inject.md)
- [MCP 桥 · 会话体系](/guide/mcp/session.md)
- [MCP 桥 · 改造 AI agent](/guide/mcp/ai-agents.md)
- [整体规划](/roadmaps/master-plan.md)

## 另一条路：给 aiti-agent 写扩展

如果你的目标是给 aiti-agent（pi-web 工作台）写扩展（而非接入页面调试）：

1. 复制共享模板 `dev-repo/templates/ext-jsx-client/`（JSX + vite 构建，复制即用），或读 [扩展 client JSX 模板](/extensions/ext-jsx-client.md)；
2. 声明 entry（id/ui 插槽/server hooks）——完整契约见 `dev-repo/docs/dev-repo-authoring-reference.md`（注册总纲）；
3. **数据落盘先选层**：配置 → `ctx.configDir`；不可再生持久数据（归档/历史/统计）→ `ctx.stateDir`；可再生数据（索引/venv/日志）→ `ctx.cacheDir`——判定决策树与铁律见 [扩展数据与存储规范](/guide/ext-data.md)；
4. 跨扩展调用与服务出口遵守 [扩展服务规范](/guide/ext-services.md)；弹窗标 `data-ext-float="1"` 自动获得浮窗能力；重 bundle 走 [懒加载契约](/guide/ext-lazy-loading.md)；
5. 部署：`node tools/deploy.mjs` → `~/.pi/web/extensions/` → `POST /api/extensions/reload`。
