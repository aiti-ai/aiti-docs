---
title: session-manager
icon: 📋
ext:
  id: session-manager
  name: session-manager
  description: 跨项目会话面板 —— tag 树+颜色 / 收藏 / 搜索 / 归档 / 看板
  soul: 会话不是用完即走的流水，是每天都在累积的资产。
  type: dev-repo
  category: 会话管理
  version: 0.2.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/session-manager/ 后 reload：
    curl -X POST http://127.0.0.1:30142/dev/api/extensions/reload
  license: MIT
  tags: [sessions, tag, search, archive]
---

# session-manager

> ❝ **会话不是用完即走的流水，是每天都在累积的资产。** ❞

aiti-agent（pi-web）的跨项目会话管理扩展：tag 树 + 颜色、收藏、FTS5 全文搜索、`.pwarc` 归档、看板视图。

### AI 帮助点（ai.helpers）

| 帮助点 | 作用 | 落地 |
|---|---|---|
| `session-archive` AI 帮我归档旧会话 | 描述条件 → AI 读归档候选 → 挑旧会话 | `POST archive/run`（mapping ids 数组） |
| `session-find` AI 帮我找会话 | 描述会话特征 → AI 查会话列表找到它 | 纯建议（自然语言） |

声明在 `index.ts` 的 `ai.helpers`，由 ai-helper 主动聚合（无需注册）。

- 扩展框架见 [aiti-agent 扩展点](/devtools/extension-points.md)
