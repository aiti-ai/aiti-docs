---
title: aiti-cmd
icon: ⌨️
ext:
  id: aiti-cmd
  name: aiti-cmd
  description: 命令管理器 —— 真 PTY 终端 + 常用命令 + 消息识别执行 + agent 命令实时观察
  soul: 大脑留给思考，命令交给收藏夹。
  type: dev-repo
  category: 命令工具
  version: 0.1.0
  status: beta
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-cmd/ 后 reload
  license: MIT
  tags: [terminal, command, pty, agent]
---

# aiti-cmd

> ❝ **大脑留给思考，命令交给收藏夹。** ❞

aiti-agent 的命令管理器扩展：node-pty 真 TTY 终端、常用命令 CRUD（参数化占位符）、消息点击识别执行（PopoverAction 扩展点）、append-only 审计日志、agent 会话运行中命令实时视图（pi-commands：进程内订阅 `tool_execution_*` 事件 → 列表/实时输出/中止，不打断 agent 思考）。

- 面板三页签（📋 总览 / 命令 / 历史）：总览聚合 agent 命令 + 终端会话，点行进详情
- 设计文档：内部方案文档 §七（pi-commands 实时视图）、§7.6（pi-web `AgentSessionInfo` 契约补丁）、§8.1（总览制 UI）
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

### AI 帮助点（ai.helpers）

| 帮助点 | 作用 | 落地 |
|---|---|---|
| `command-create` AI 帮我写命令 | 描述需求 → AI 写命令 JSON → 入库 | `POST /commands`（mapping name/cmd/tags/confirm） |
| `command-fill` AI 帮我填命令表单 | 从命令详情弹窗 AI 按钮唤起 → AI 工具链直接回填表单 | `fill`（self_ui/form_fill + JSON 契约 `{filled:{字段:值},note}`） |
| `command-fix` AI 优化/修复命令 | AI 读命令列表 → 找目标 → 改进 → 更新 | `PUT /commands/{id}`（path 模板） |

声明在 `index.ts` 的 `ai.helpers`，由 ai-helper 主动聚合（无需注册）。
