---
title: aiti-devtools
icon: 🛠️
description: 页面内 AI 调试助手 — 注入 aiti-devtools + Inspector + MCP 桥
tags: [product, aiti-devtools, inject]
---

# aiti-devtools — 页面内 AI 调试助手（注入核心包）

> **一句话**：把 AI 请到页面开发现场 —— 注入 `aiti-devtools` + Inspector 悬浮 UI + MCP 桥，AI 和人真正在**同一个页面**上有机协作。
> **形态**：① 开发者主动适配（本包）→ ② Chrome 扩展/平台内置 → ③ IDE 插件（vscode/idea）。
> 当前版本 **0.2.x**：自检 21/21 全过（原生 HTML + React 均验证），含华为 HarmonyOS 真机缩放修复。

## 1. 快速接入（形态①）

```html
<script src="aiti-devtools/inject.js"></script>
<script>
  createAitiLauncher('http://localhost:3000/todo', {
    aiUrl: 'http://localhost:30141/ai/chat?session=abc', // AI 会话页（可选）
    bridgeBase: 'http://localhost:8777',                   // MCP 桥（可选）
    bridgeToken: 'dev',
  });
</script>
```

页面右下角出现 💬 AI 消息 / 🎯 Inspector 两按钮，能力即插即用。

## 2. 能力清单

### Inspector 点选与导航
- 三步点选 + 选区微调（↑↓◀▶/#/✓）+ 触屏模式 + 键盘导航（DFS）
- 宿主页 / 嵌套同源 iframe 三区可选（`host` / `f0` / `f1`…）
- HUD 气泡 + 工具条完全避让选区、8 向导航、小屏 compact 放大
- 物理屏幕固定：getPhysViewport 归一化 + counter-zoom，浏览器缩放/滚动下 UI 恒贴边

### 事件冻结 → 放行矩阵
- 7 类事件分类冻结、真实点击穿透、放行方案多态（默认/全放/全冻/自定义）
- ⏱ 调速面板：动画减速、scroll/wheel 拦截、定时器慢放、网络模拟、强制报错、场景预设、现场快照、视口模拟 375-1440、触屏模拟

### 类 CDP 命令集（8 域 42 命令）
| 域 | 能力 |
|---|---|
| DOM | 查询/遍历/编辑元素、attribute 操作 |
| CSS | 样式读取/覆盖、computed style |
| Input | 点击/输入/键盘/滚轮（含手势桥） |
| Page | 导航/reload/截图/性能 |
| Runtime | eval（会话内默认放行 + 审计） |
| Storage | localStorage/sessionStorage/cookie |
| Performance | 指标采集 |
| Browser | 剪贴板/下载/弹窗/全屏/播放（宿主执行，transient activation 安全） |

### 框架识别 fileLocation
React / Next / Vue / Svelte（dev 构建 `_debugSource` / `__file` / `__svelte_meta`）→ 统一输出 `{framework, file, line, component}` —— **AI 报错直接定位到源码文件**，配合桥的 `open_file` 事件在编辑器打开。

### MCP 桥
- `node aiti-bridge --port 8777`（MCP 端点（stdio + HTTP + Streamable HTTP）+ SSE 页面桥）
- MCP 工具：`page_exec` / `page_snapshot` / `bridge_status` / `user_*`（用户交互工具族）

### 刷新恢复
AI 窗开关 + 位置尺寸、放行方案、视口、目标 URL 全部持久化（localStorage），刷新自动恢复。

## 3. 安全边界

- eval 会话内默认放行（面板审计可见）
- 危险命令（removeNode/reload/navigate/localStorage 持久类）弹确认卡 + 确认队列
- 浏览器受限操作走手势桥（用户真实点击，每次都要）
- 桥用 token 认证；右键/中键放行；跨源 iframe 跳过注入

## 4. 文件结构

开发源在 `dev-repo/inject/`（esbuild 构建注入产物），发布形态为 **aiti-agent 扩展**（`dev-repo/aiti-devtools/`，部署 `~/.pi/web/extensions/aiti-devtools/`）。

| 文件 | 职责 |
|---|---|
| `dev-repo/inject/src/client/index.js` | 注入的迷你 `aiti-devtools` client（元素画像：尺寸/样式/组件源码与位置/调用处/pageId/url） |
| `dev-repo/inject/src/launcher/` | 宿主 launcher（widget UI / inspector / MCP 桥 / 交互面板，模块化） |
| `dev-repo/inject/src/mcp/bridge-client.js` | 通用桥客户端（页面/AI 窗连桥） |
| `dev-repo/inject/tools/build.mjs` | 构建单文件 `dist/aiti-launcher.js`（client + launcher 打包） |
| `dev-repo/bridge/dev-repo/bridge/bin/aiti-bridge.mjs` | MCP 桥（stdio + HTTP + 页面 SSE）独立运行版 |
| `dev-repo/aiti-devtools/` | aiti-agent 扩展：`bridge.ts`（MCP 桥）/ `inject.ts`（service-tunnels 注入）/ `client/aiti-client.mjs`（AI 窗口） |
| `dev-repo/aiti-devtools/tools/deploy.mjs` | 构建 launcher + 部署扩展到 `~/.pi/web/extensions/aiti-devtools/` |

## 5. 开发 / 运行

```bash
node dev-repo/inject/tools/build.mjs          # → inject/dist/aiti-launcher.js（注入单文件）+ bridge-client.js + cdp-core.js
node dev-repo/core/tools/build-assets.mjs     # 重建 core/assets（构建产物集中地，桥/载体插件读它）
node dev-repo/aiti-devtools/tools/deploy.mjs              # → ~/.pi/web/extensions/aiti-devtools/（aiti-agent 热重载）
node dev-repo/bridge/dev-repo/bridge/bin/aiti-bridge.mjs --port 8777   # 独立 MCP 桥
node dev-repo/pi-ext/tools/build.mjs              # → dev-repo/pi-ext/dist/aiti-devtools-pi.js（pi 扩展）
```

> 插件矩阵见 [aiti-devtools 插件](/products/aiti-devtools-plugins.md)，使用文档见 [aiti-devtools](/devtools/)。
