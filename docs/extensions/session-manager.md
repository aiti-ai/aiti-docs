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

- 扩展框架见 [aiti-agent 扩展点](/devtools/extension-points.md)
