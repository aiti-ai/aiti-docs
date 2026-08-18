---
title: aiti-devtools
icon: 🛠️
ext:
  id: aiti-devtools
  name: aiti devtools
  description: 页面内 AI 调试助手 —— 注入 aiti-devtools + Inspector + MCP 桥
  soul: AI 不该对着屏幕瞎猜，它该真正看见页面。
  type: devtools-plugin
  category: 页面调试注入
  version: 0.2.1
  status: active
  author: aiti-ai
  repo: ""
  npm: "@justdb/aiti-devtools"
  install: |
    pnpm add -D @justdb/aiti-devtools
  license: MIT
  tags: [inject, inspector, mcp, aiti-devtools]
---

# aiti-devtools

> ❝ **AI 不该对着屏幕瞎猜，它该真正看见页面。** ❞

把 AI 请到页面开发现场：注入 `aiti-devtools` + Inspector 悬浮 UI + MCP 桥，AI 和人真正在**同一个页面**上协作。

- 形态① 开发者主动适配（本包）→ ② 平台内置 → ③ IDE 插件（vscode/idea）
- 详细文档：[开发者工具](/devtools/) · [产品页](/products/aiti-devtools.md)

## AI 自管理能力

> AI 能为你：**调试任意页面，也调试自己的窗口——AI 管自己。**

```yaml
ai:
  manage: true
  skills:
    - 多面调试目标：aiti_page_exec/snapshot/logs/network/bridge_status（class-CDP 到任意页面）
    - AI 管自己：**AI 主窗口（非 iframe）** 多注册自己 pageId `xxx/ai` 进桥 → CDP 自己的窗口（读 dialog/填扩展弹窗表单/截屏审核）；**没有 host 宿主时主窗口自己也在被管理之列（`xxx/ai` 在，通道就在）**
    - 用户交互：点选元素/确认/选项/输入/在场探测/通知
    - 注入与特性：inject-ports 注入开关、features 逐项启停
  storage_dir: <dataDir>
  source_dir: dev-repo/aiti-devtools（core 在 dev-repo/core）
  page: 工具栏 🧰 AITI
```

接入 ai-helper 后：结果回填走「API 直写」或「CDP 回填扩展弹窗表单」两条通道，后者即经本扩展的 AI 窗自桥接（见 [aiti-helper](/extensions/aiti-helper.html)）。
