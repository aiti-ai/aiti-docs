---
title: 第三方会话源示例（sm-demo-source）
icon: 🧫
ext:
  id: sm-demo-source
  name: 第三方会话源示例
  description: session-manager 第三方 agent source 贡献方示例 —— §4.8 slot 契约最小可运行模板
  soul: 想给 All Sessions 贡献会话源？抄这个就对了。
  type: dev-repo
  category: 示例
  version: 0.1.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/sm-demo-source/ 后 reload
  license: MIT
  tags: [session-manager, demo, agent-source, slot, example]
---

# sm-demo-source

> ❝ **想给 All Sessions 贡献会话源？抄这个就对了。** ❞

session-manager 第三方 agent source 贡献方示例（§4.8 slot 契约最小可运行模板）。契约三步：

1. `ui.provides: ["session-agent-source"]` 声明能力 → session-manager 发现你
2. `GET agent-source/manifest` → `{ agents: [{ id, label, dependencyHint? }] }`
3. `GET agent-source/list?agent=` / `agent-source/session?agent=&sid=` → 归一化 JSON（对齐 session-manager 内部 SessionFileMeta + IndexedMessage）

解析逻辑跑在你自己的进程里（你的代码你的依赖）；本示例用内置 fixture 数据演示。
