---
title: 子代理（aiti-subagents）
icon: 👥
ext:
  id: aiti-subagents
  name: 子代理
  description: 子代理扩展 —— aiti_subagent 工具委托 scout/worker/reviewer/oracle 等，进程内会话零 spawn，Fleet 监控面板 + doctor 自检
  soul: 主 agent 负责思考，脏活累活分给专职的它。
  type: dev-repo
  category: AI 能力
  version: 0.1.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-subagents/ 后 reload
  license: MIT
  tags: [subagent, delegate, fleet, parallel, chain]
---

# aiti-subagents

> ❝ **主 agent 负责思考，脏活累活分给专职的它。** ❞

子代理扩展（pi-subagents 的 pi-web 适配版）：

- **aiti_subagent 工具**：单委托 / 并行 fan-out（上限 8、并发 4）/ 链式 `{previous}` 传递三种模式；内置 scout/worker/reviewer/oracle/researcher/delegate
- **进程内子代理会话**：复用 pi-web SDK `createAgentSessionFromServices`，零 spawn 零配置
- **Fleet 监控面板**：Web UI 实时查看所有子代理状态；检查器看运行详情/日志/工具调用/输出
- **doctor 自检**：诊断 agent 定义/模型可用性/权限配置
