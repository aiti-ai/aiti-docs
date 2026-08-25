---
title: aiti-pi-agent
icon: 🥧
ext:
  id: aiti-pi-agent
  name: pi 会话后端
  description: spawn pi --mode rpc 子进程作为会话 —— 多 agent 前端主路径
  soul: All Sessions 里最正统的一条路——pi 自己驱动自己。
  type: dev-repo
  category: 多 agent 后端
  version: 0.1.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-pi-agent/ 后 reload
  license: MIT
  tags: [pi, rpc, session, multi-agent]
---

# aiti-pi-agent

> ❝ **All Sessions 里最正统的一条路——pi 自己驱动自己。** ❞

多 agent 前端的 pi 会话后端：spawn `pi --mode rpc` 子进程作为会话，实现 session-provider 契约接入 All Sessions 面板。是多 agent 前端的主路径（其他 `aiti-*-agent` 后端与它同构）。

- 设计 + 结合点见 `docs/all-sessions-multi-agent-plan.md`；后端抽象层在 `pi-web/lib/session/`
