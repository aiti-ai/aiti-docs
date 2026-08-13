---
title: aiti-cmd
icon: ⌨️
ext:
  id: aiti-cmd
  name: aiti-cmd
  description: 命令管理器 —— 真 PTY 终端 + 常用命令 + 消息识别执行
  soul: 常用命令不该靠记，该被收藏、复用、一键执行。
  type: dev-repo
  category: 命令工具
  version: 0.1.0
  status: beta
  author: aiti-ai
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-cmd/ 后 reload
  license: MIT
  tags: [terminal, command, pty]
---

# aiti-cmd

> ❝ **常用命令不该靠记，该被收藏、复用、一键执行。** ❞

aiti-agent 的命令管理器扩展：node-pty 真 TTY 终端、常用命令 CRUD（参数化占位符）、消息点击识别执行（PopoverAction 扩展点）、append-only 审计日志。

- 扩展框架见 [aiti-agent 扩展点](/devtools/extension-points.md)
