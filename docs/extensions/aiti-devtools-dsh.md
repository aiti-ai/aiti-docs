---
title: aiti-devtools-dsh（DSH 宿主适配）
icon: 🤧
ext:
  id: aiti-devtools-dsh
  name: aiti-devtools DSH 适配
  description: 把 aiti-devtools 完整移植到 DeepSeek Harness（DSH）—— 同款 launcher + 16 工具 + agent/pre-step 占位符替换（[元素N]/[回答N]/[错误N]）+ AI 窗候选条（元素/回答/错误三色 chip），官方 web UI 即 AI 窗
  soul: 页面里的 AI 不挑宿主——换一个 harness，同一场面对面调试照演。
  type: host-adapter
  category: 宿主适配
  version: 0.8.2
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: "@aiti-ai/aiti-devtools-dsh"
  install: |
    # npm（npm-registry.example.com 镜像），装进 DSH web profile：
    dsh plugin --profile web add @aiti-ai/aiti-devtools-dsh
    # npm 11 arborist 坑：peerDeps `*` 会崩，须 --legacy-peer-deps
    # profile 根级 core 是独立依赖行，core 升级后须显式：
    dsh plugin --profile web add @aiti-ai/aiti-devtools-core@^0.3.10
    # 源码：dev-repo/aiti-devtools-dsh/（host bundle + client plugin）
    # 构建：node tools/build.mjs（esbuild → lib/index.js + lib/client.js）
  license: MIT
  tags: [dsh, deepseek-harness, cordis, adapter, launcher, placeholder]
---

# aiti-devtools-dsh（DSH 宿主适配）

> ❝ **页面里的 AI 不挑宿主——换一个 harness，同一场面对面调试照演。** ❞

把 `aiti-devtools`（页面内 AI 调试助手）的主要功能移植到 [DSH（DeepSeek Harness）](https://github.com/deepseek-ai)——DeepSeek 的开源 agent harness（Cordis 插件化，内置 web UI）。

- **同样的集成 JS launcher**（`aiti-devtools-inject` 产物，复用不改）；AI 窗 = DSH web UI（`aiUrl` 指向 DSH 站点）
- **host bundle**（Cordis 插件入口 `apply`）：进程内桥挂 `/aiti`（launcher / cockpit / bridge / mcp 同端口）+ 16 个 `aiti_*` 工具 + `/aiti/picked` 候选上报端点 + `agent/pre-step` 占位符替换
- **client plugin**（浏览器面）：`conversation.input.overlay` slot 候选条两区 chip（占位符区 + 描述区 + ✕ + 清空）+ 详情弹窗（字段筛选/后台打开文件）+ 点选元素 → composer 插占位符 `[元素N]` + 发送后自动清理（`aiti_consumed` 权威信号）
- **交互卡**：模型调 `aiti_user_confirm/choose/input` → 桥推 AI 窗 → postMessage 转发宿主窗口（`dbg_mcp_interaction`）作答 → `dbg_mcp_result` 回桥；**回答候选自动入条 `[回答N]`，页面错误候选自动捕获**（红色 chip + errHint）
- **占位符方案**：DSH 的 `llm/stream` 消息 deep-frozen 不可改写，正规插入点是 `agent/pre-step`（agent-loop waterfall，plan-mode 同款）——替换后的消息同时进入模型输入与会话历史，与 pi-web 原版行为一致；消费信号经桥 `pushAiEvent('aiti_consumed')` 直推 AI 窗清候选（占位符三类：`[元素N]`/`[回答N]`/`[错误N]`）
- **端到端已验证**（Chrome DevTools 真实点击 + 2026-11-07 全链路复检 0.8.2/core 0.3.10）：Inspector → 点元素 → HUD → 候选条 → 详情 → 发送 → 消息含完整描述 + `[发自: pageId]` → 候选条自动清空

复用 `aiti-devtools-agent`（AgentBridgeClient + AgentHost + mapBridgeTools）、`aiti-devtools-core`（createBridge 进程内桥 + assets 产物）、`aiti-devtools-inject`——与 pi-web 集成同等体验。
