---
title: aiti-ai-usage
icon: 📊
ext:
  id: aiti-ai-usage
  name: aiti-ai-usage
  description: AI token 用量统计 —— provider/model/key/session/workspace/时段多维报表，任意两维组合透视，事件驱动零轮询，独立 SQLite 存储
  soul: 用量不是账单来了才知道——每一枚 token 都该有去向。
  type: dev-repo
  category: 系统工具
  version: 0.1.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-ai-usage/ 后 reload
  license: MIT
  tags: [usage, token, statistics, sqlite, dashboard]
---

# aiti-ai-usage

> ❝ **每一枚 token 都该有去向。** ❞

AI token 用量统计扩展：provider / model / key / session / workspace / 时段多维统计，支持任意两维组合透视（如每个 workspace 的 keys 分布、时段分布），Web 报表 + 月视图上卷查询，独立 SQLite（node:sqlite）存储（明细幂等 PK + 日汇总分区重算）。

**数据三路汇入（全事件驱动，零轮询）**：

1. 启动/手动 sync：增量扫描活跃会话 JSONL + session-manager `.pwarc` 归档
2. `server.agent.onAgentSession → subscribeEvent("message_end")` 实时摄入
3. pi-models-respect v0.2.1+ key 日志：fs.watch tail（含 client→sessionId 归因）

带 AI 自管理帮助点：AI 能帮用户解读用量报表、排查费用异常。
