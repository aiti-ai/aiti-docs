---
title: aiti-cmd
icon: ⌨️
ext:
  id: aiti-cmd
  name: aiti-cmd
  description: 命令管理器 —— 真 PTY 终端 + 常用命令 + 消息识别执行 + agent 命令实时观察
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
  tags: [terminal, command, pty, agent]
---

# aiti-cmd

> ❝ **常用命令不该靠记，该被收藏、复用、一键执行。** ❞

aiti-agent 的命令管理器扩展：node-pty 真 TTY 终端、常用命令 CRUD（参数化占位符）、消息点击识别执行（PopoverAction 扩展点）、append-only 审计日志、agent 会话运行中命令实时视图（pi-commands：进程内订阅 `tool_execution_*` 事件 → 列表/实时输出/中止，不打断 agent 思考）。

- 面板三页签（📋 总览 / 命令 / 历史）：总览聚合 agent 命令 + 终端会话，点行进详情
- 设计文档：`dev-repo/docs/aiti-cmd-extension-plan.md` §七（pi-commands 实时视图）、§7.6（pi-web `AgentSessionInfo` 契约补丁）、§8.1（总览制 UI）
- 扩展框架见 [aiti-agent 扩展点](/devtools/extension-points.md)

## AI 自管理能力

> AI 能为你：**一句话帮你写命令、整理命令库、把命令升级成正式 skill。**

```yaml
ai:
  manage: true
  skills:
    - 查看命令/分组/参数占位符（GET /commands，store=commands.json（<dataDir> 即 aiti-cmd 目录） v2 树形）
    - 新建命令（POST /commands：name/cmd/params/groupId）
    - 执行命令（POST /run，真 PTY + 审计；危险命令需一次性确认 token；沙箱三选一）
    - 导出 skill：skill=true 的命令同步写 ~/.pi/agent/skills/aiti-cmd-<name>/SKILL.md
  storage_dir: <dataDir>（= ~/.pi/web/data/aiti-cmd）
  source_dir: dev-repo/aiti-cmd
  page: 工具栏 ⚡ 命令 → 命令面板
```

接入 ai-helper 后：在命令详情点「AI 帮我写」→ 描述 → 预览 → 填入并保存（见 [aiti-helper](/extensions/aiti-helper.html)）。
