---
title: aiti-devtools
icon: 🛠️
ext:
  id: aiti-devtools
  name: aiti devtools
  description: pi-web 扩展 —— 注入器/桥/MCP server 端 + 方案 M agent 工具进程内注入
  soul: AI 不该对着屏幕瞎猜，它该真正看见页面。
  type: dev-repo
  category: 页面调试注入
  version: 0.2.2
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  license: MIT
  tags: [inject, inspector, mcp, bridge, aiti-devtools]
---

# aiti-devtools（pi-web 扩展）

> ❝ **AI 不该对着屏幕瞎猜，它该真正看见页面。** ❞

> ⚠️ **同名不同物**：本页说的是部署在 `~/.pi/web/extensions/aiti-devtools/` 的 **pi-web 扩展**；npm 发布的注入 SDK 本体与各框架插件（vite/webpack/nuxt…）**不是扩展**，归在独立大主题 → **[aiti-devtools 集成](/devtools/)**（SDK 本体见 [core](/devtools/core.html)，框架集成见 [integrations](/devtools/integrations/vite.html)，示例见 [examples](/devtools/examples.html)）。

## 这个扩展做什么

pi-web 场景下 aiti-devtools 的服务端与接线层：

- **注入器**：向经 pi-web 访问的页面注入 launcher（fab/HUD/工具条/AI 窗）+ client（选区、事件冻结、类 CDP 命令集）
- **桥**：页面 ⇄ agent 的消息/会话核心（claim/SSE/result 协议，浏览器端在 `bridge-client.js`）
- **MCP server 端**：`aiti_*` 工具族经方案 M（`server.agent` 扩展点）进程内注入每个 agent 会话，零 MCP 配置文件

## AI 自管理能力

> AI 能为你：**调试任意页面，也调试自己的窗口——AI 管自己。**

```yaml
ai:
  manage: true
  skills:
    - 多面调试目标：aiti_page_exec/snapshot/logs/network/bridge_status（class-CDP 到任意页面）
    - AI 管自己：**AI 主窗口（非 iframe）** 多注册自己 pageId `xxx/ai` 进桥 → CDP 自己的窗口（读 dialog/填扩展弹窗表单/截屏审核）；**没有 host 宿主时主窗口自己也在被管理之列（`xxx/ai` 在，通道就在）**
    - 用户交互：点选元素/确认/选项/输入/在场探测/通知
  storage_dir: <dataDir>
  source_dir: dev-repo/aiti-devtools（core 在 dev-repo/core）
  page: 工具栏 🧰 AITI
```

接入 ai-helper 后：结果回填走「API 直写」或「CDP 回填扩展弹窗表单」两条通道，后者即经本扩展的 AI 窗自桥接（见 [aiti-helper](/extensions/aiti-helper.html)）。

## 大主题导航

| 想了解 | 去哪 |
|---|---|
| SDK 本体（`@aiti-ai/aiti-devtools`） | [/devtools/core](/devtools/core.html) |
| Vite/webpack/Nuxt/Astro 插件 | [/devtools/integrations/*](/devtools/integrations/vite.html) |
| 各载体可运行示例 | [/devtools/examples](/devtools/examples.html) |
| 注入原理 / CDP 命令集 | [/devtools/inject](/devtools/inject.html) · [/devtools/cdp-commands](/devtools/cdp-commands.html) |
