---
title: 附着会话后端（aiti-attach-agent）
icon: 🔌
ext:
  id: aiti-attach-agent
  name: 附着会话后端
  description: Socket 附着已运行 agent 进程 —— 连接 pi TUI bridge，不 spawn 新进程
  soul: 不抢方向盘——agent 已经在跑，附着上去看就好。
  type: dev-repo
  category: 多 agent 后端
  version: 0.1.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-attach-agent/ 后 reload
  license: MIT
  tags: [attach, socket, tui, session, multi-agent]
---

# aiti-attach-agent

> ❝ **不抢方向盘——agent 已经在跑，附着上去看就好。** ❞

Socket 附着型会话后端：连接一个已在运行的 agent 进程（pi TUI bridge），不 spawn 新进程。适合「终端里跑着的 pi」直接挂进 All Sessions 面板旁观/交互。

## 机制

- 「一切后端皆扩展」原则下的第一个真实后端：核心只剩抽象层，本扩展经 `ctx.sessionProviders.register()` 注册 `attach` 后端
- 接入方式：pi TUI 侧桥扩展 `/web` 命令 spawn pi-web（detached）时传 `--socket <path>`，即完成附着
- 场景：用户在终端跑 pi TUI → 输入 `/web` → 浏览器工作台直接接管同一会话
