---
title: aiti-devtools-opencode（OpenCode 宿主适配）
icon: 🔵
ext:
  id: aiti-devtools-opencode
  name: aiti-devtools OpenCode 适配
  description: OpenCode host 插件（16 工具进程内注册 + messages.transform 占位符改写）+ 官方 web UI 即 AI 窗（nginx 反代剥 CSP + sub_filter 注入，不 fork）
  soul: 官方的界面已经够好——我们只加一层，不抢整个门面。
  type: host-adapter
  installable: false  # 宿主适配器——装进 OpenCode，不进 aiti-agent/pi-web：extman 不列出、extensions.json 不入 extensions 数组（归 integrations）
  category: 宿主适配
  version: 0.3.1
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: "@aiti-ai/aiti-devtools-opencode"
  install: |
    # npm 包（opencode.json）
    { "plugin": ["@aiti-ai/aiti-devtools-opencode"] }
    # 或本地：cd opencode-ext/aiti-devtools-opencode && npm run deploy（→ ~/.config/opencode/plugins/）
    # 桥默认 http://127.0.0.1:8777（AITI_BRIDGE_URL 覆盖——裸 base，不带 /aiti，插件自补；带尾巴会变 /aiti/aiti）
  license: MIT
  tags: [opencode, adapter, plugin, messages-transform, webui, placeholder]
---

# aiti-devtools-opencode（OpenCode 宿主适配）

> ❝ **官方的界面已经够好——我们只加一层，不抢整个门面。** ❞

把 `aiti-devtools` 完整接入 [OpenCode](https://opencode.ai)（sst 开源编码 agent）——**host 插件 + 官方 web UI 即 AI 窗**：

- **host 插件**（`@opencode-ai/plugin` `tool()` 工厂，不走 MCP）：进程内注册 16 个 `aiti_*` 工具 + 桥 SSE 推送注入（cockpit 发消息 → 插件注入 → 模型主动调工具作答）+ `session.idle` 回答回桥；桥不可达时注册占位探测工具兜底（bridge_status/page_exec 给指引），不拖垮 opencode
- **占位符改写**：`experimental.chat.messages.transform` 原位改写只碰最后一条 user 消息——`[元素N]` → 完整 describe + `[发自: pageId · url]`；历史保留原占位符，只有 LLM 输入被展开；桥收到 `aiti_consumed` 同步清 picked（防冷启动僵尸候选）
- **web UI AI 窗（不 fork）**：nginx 反代剥 CSP + `sub_filter` 注入 `aiti-client-opencode.js` + `/aiti/` 同源挂桥——候选条 / 详情弹窗 / 交互卡 / 占位符全量长在官方界面上；桥经 `--assets-extra` serve 适配脚本，client 桥地址从脚本 src 自动推导（零配置）
- **交互卡**：模型调 `aiti_user_confirm/choose/input` → 桥推 AI 窗 → web UI 本地渲染卡（右下角）→ 作答回桥 → 模型收到
- **E2E 全环已验证**（2026-08-24 opencode 1.1.51；2026-11-07 复检 0.3.1 / opencode 1.19.5——core 0.3.10 重建 + devDep SDK 对齐 1.19.5，npm 路由 docker 全新装零磕碰 / 真实 Chrome）：工具改页面标题、推送注入、候选条、占位符替换 + 消费清空、交互卡作答
