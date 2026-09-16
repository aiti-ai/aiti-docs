---
title: OpenCode 会话后端（aiti-opencode-agent）
icon: 🟠
ext:
  id: aiti-opencode-agent
  name: OpenCode 会话后端
  description: OpenCode CLI 专属驱动 —— 历史会话在 pi-web 打开、续聊（oneshot run -s --format json）
  soul: OpenCode 会话在 pi-web 里打开、续聊、回放。
  type: dev-repo
  category: 多 agent 后端
  version: 0.1.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    node tools/deploy.mjs   # 拷贝 + 双实例热重载；要求 opencode CLI 已登录
  license: MIT
  tags: [opencode, agent, session-provider, cli]
---

# aiti-opencode-agent

> OpenCode（sst/opencode）CLI 会话后端扩展：All Sessions 里能看到并打开 opencode 历史会话、在 pi-web 里续聊。会话**读取**的权威实现仍在 session-manager（`lib/agents/opencode.ts`），本扩展只负责驱动。

## 机制

- **进程模型**：每轮一个单发进程 `opencode run -s <sid> --format json <prompt>`（aiti-zcode-agent oneshot 同款），`-s` 续接既有会话
- **流式**：stdout NDJSON part 事件（`step_start`/`text`/`tool`/`step_finish`）；text 是 **part 完成后的快照**（非逐 token），per-part 前缀差分出 delta
- **冷恢复**：cwd 以会话真实 directory 为准（session-manager `services.sessions.parseSession` → `meta.cwd`），历史经 parseSession 种子回填（IndexedMessage → pi 形状 toolCall/toolResult）——出生即带正确语义（claude 扩展曾因 cwd 落 process.cwd() 历史回放空白，2026-09-16 修复）
- **新会话**：`opencode:new-*` 占位，首轮从事件流捕获 `sessionID` → `session_backend_ready` 换绑复合 id
- **recycle**：`/session/recycle`（共享层 session-recycle.ts），存量 handle 升级到当前扩展代码

## 能力面（v1 刻意收窄）

核心四件套 + getMessages；模型跟随 opencode 配置默认（无 setModel/listModels，选择器隐藏）；steer/followUp/图片附件（`-f`）为后续项。

## 认证

CLI 自理：`~/.local/share/opencode/auth.json`（`opencode auth login`）。未装 CLI 时 provider 不注册（`PATH` → `~/.opencode/bin/opencode`，可用 `OPENCODE_CLI_PATH` 覆盖）。

## 关联

- 与 `aiti-acp-agent` 的 `ACP: opencode` 同 agentKey（`opencode`）共存：本扩展 priority 10 解析优先，ACP 自动降为兜底（fail-over）
- 方案与排查记录：dev-repo `docs/dev-repoernal-session-paging-plan.md`（§跨 agent 排查）
