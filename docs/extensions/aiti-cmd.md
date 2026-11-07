---
title: aiti-cmd
icon: ⌨️
ext:
  id: aiti-cmd
  name: aiti-cmd
  description: 命令管理器 —— 真 PTY 终端 + 常用命令 + 消息识别执行 + agent 命令实时观察 + 跨扩展统一执行出口
  soul: 大脑留给思考，命令交给收藏夹。
  type: dev-repo
  category: 命令工具
  version: "0.1.8"
  status: beta
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-cmd/ 后 reload
  license: MIT
  tags: [terminal, command, pty, agent, audit, suggest]
---

# aiti-cmd

> ❝ **大脑留给思考，命令交给收藏夹。** ❞

命令管理器扩展：node-pty 真 TTY 终端、常用命令 CRUD（参数化占位符）、消息点击识别执行（PopoverAction 扩展点）、append-only 审计日志、agent 会话运行中命令实时视图（pi-commands：进程内订阅 `tool_execution_*` 事件 → 列表/实时输出/中止，不打断 agent 思考）、**跨扩展统一执行出口（services runner + /shell）**。

- 面板三页签（📋 总览 / 命令 / 历史）：总览聚合 agent 命令 + 终端会话，点行进详情；历史页含**来源分布**过滤条（按来源审计追责）
- **终端 dock 接管 / 页签**：终端可停靠 dock、多会话页签化（近期批次 1e7cd696/5f694b68/924ea6b9）
- **终端实时流**：增量帧走 aiti-event-bus 主题 `cmd-<id>` 唯一下行（旧 per-session SSE 已删），初始回放/大消息走 REST 快照 `/sessions/{id}/buffered`（seq 去重衔接）；订阅保活 `POST /alive`（前端 15s 心跳，45s 未刷新发布侧停推）；`GET /sessions/{id}/cwd` 取 shell 实时目录（「＋ 新建」/「新 pi-web 会话」用）。审计按天分片保留（启动+每日清理超期日志）；suggest 静态 provider 启动即注册进程内处理器（ai-input 免 HTTP 自环），`GET /commands/suggest` 同逻辑兜底
- **智能提示豁免**：系统自动创建的条目（如 skill 导出）默认不参与 aiti-ai-input 智能提示
- 已懒加载化（两段式转换，见 [懒加载契约](/guide/ext-lazy-loading.html)）
- 设计文档：内部方案文档 §七（pi-commands 实时视图）、§7.6（pi-web `AgentSessionInfo` 契约补丁）、§8.1（总览制 UI）、**执行链集成方案 §7（实施记录）**
- 扩展框架见 [aiti-agent 扩展点](/devtools/extension-points.md)

## 统一执行出口（其他扩展怎么接）

> 判据（已拍板）：**命令在后端 → 不传前端**（后端建会话、前端只拿 sid 渲染）；**命令在前端 → 直接前端 /run**（复用两段式确认）。

| 入口 | 用途 | 消费方 |
|---|---|---|
| `ctx.services.get("aiti-cmd.runner")` | 进程内共享 runner：`run/input/resize/kill/list/getInfo/diag/buffered/sessions`，run 缺省 `source="service"`，返回纯数据 `{ok, sessionId}` | aiti-ai-input ASR 自愈、aiti-codebuddy-agent 登录 PTY（方案中） |
| `POST /shell {cwd?, name?, source?, ttlMs?}` | 后端建交互 shell 会话（命令文本不落前端），返回 `{ok, sessionId}` | core 侧栏终端 / 工作区页签 / aiti-folder·editor 查看窗 / 本体面板（全部前端终端入口） |
| `window.__aitiCmd.openSession(sid, title)` | 前端渲染既有 sid（面板终端视图） | services 消费方交 sid 用 |
| `window.__aitiCmd.openShell(cwd, name)` / `aiti-cmd:open-shell` 事件 / postMessage `open-shell` | 打开终端（内部走 /shell） | 兼容入口（监听器唯一） |
| agent 工具 `aiti_cmd_run` | AI 会话内经后端 runner 执行命令（`source="ai-helper"` + 会话归因）；危险命令二次确认闸门 | ai-helper invoke 会话 / 任意 pi-web agent 会话（feature `tool.aiti_cmd_run` 可关） |

## 审计与来源

- append-only JSONL（`<cacheDir>/logs/<日期>.jsonl`，哈希链防篡改 `/history/verify`）
- source 开放语义：`manual | message | shell | favorite | asr-selfheal | schedule | suggest | ai-helper | codebuddy | service | unknown`——未知值收口为 `unknown`，缺省兜底 manual 并标 `sourceDefaulted`
- `GET /history?groupBy=source`：按来源汇总（数量/最近/失败率）；面板历史页「来源分布」chips 可视化 + 点击过滤

## AI 自管理能力

> AI 能为你：**一句话帮你写命令、执行命令、整理命令库、把命令升级成正式 skill。**

```yaml
ai:
  manage: true
  skills:
    - 查看命令/分组/参数占位符（GET /commands，store=commands.json（<configDir> 即 aiti-cmd 目录） v2 树形）
    - 新建命令（POST /commands：name/cmd/params/groupId）
    - 执行命令（POST /run，真 PTY + 审计；危险命令需一次性确认 token；沙箱三选一）
    - 执行命令会话（agent 工具 aiti_cmd_run：AI 会话内经后端 runner 起常驻 PTY，输出进面板，危险命令二次确认）
    - 导出 skill：skill=true 的命令同步写 ~/.pi/agent/skills/aiti-cmd-<name>/SKILL.md
  storage_dir: <configDir>（= ~/.pi/web/data/aiti-cmd；审计日志/沙箱在 <cacheDir> = …/cache）
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
| `command-run` AI 帮我执行命令 | AI 会话内经 `aiti_cmd_run` 起后端 PTY 会话（长驻/面板围观/审计归因）；危险命令先征得同意 | agent 工具（无落地 action） |

声明在 `index.ts` 的 `ai.helpers`，由 ai-helper 主动聚合（无需注册）。

### suggest ⚡ 一键执行（aiti-ai-input 联动，默认关）

命令联想候选项旁的 ⚡：点击直接前端 `POST /run`（`source="suggest"`，两段式确认）——命令已在前端不绕服务端。feature `ai-input.suggestRun`（extman → AI input → suggest 组）开启后生效；桌面联想弹窗与小屏建议条均支持。执行成功自动切到 ⚡命令 面板终端视图。
