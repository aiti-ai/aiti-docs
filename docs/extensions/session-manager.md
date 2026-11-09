---
title: session-manager
icon: 📋
ext:
  id: session-manager
  name: session-manager
  description: 跨项目会话面板 —— tag 树+颜色 / 收藏 / 搜索 / 归档 / 看板 / 新建会话分支·Worktree 选择器 / 23 家 agent 历史解析 / DockStack 编排
  soul: 会话不是用完即走的流水，是每天都在累积的资产。
  type: dev-repo
  category: 会话管理
  version: "0.2.14"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/session-manager/ 后 reload：
    curl -X POST http://127.0.0.1:<端口>/api/extensions/reload
  license: MIT
  tags: [sessions, tag, search, archive, worktree, dock, agents]
---

# session-manager

> ❝ **会话不是用完即走的流水，是每天都在累积的资产。** ❞

aiti-agent（pi-web）的跨项目会话管理扩展：tag 树 + 颜色、收藏、FTS5 全文搜索、[`.pwarc` 归档](/extensions/session-manager-archive.html)、看板视图。All Sessions 侧栏 dock 的承载扩展。

## 近期能力（2026-09 中旬～11）

- **新建会话「分支 / Worktree」选择器（2026-09-17）**：欢迎页 Workspace×Backend 之间（宿主 `newSessionSelectors`/`newSessionPreparers` 双插槽）——选择阶段零副作用，只暂存意图 + 显示意图条；发送首条消息时 preparer 统一执行写操作：建/复用 worktree 改写目标 cwd，或 checkout——遇 409 未提交文件冲突弹三选一卡（转 worktree / stash 后切 / 取消），**绝不丢文件**；远程分支先建同名本地分支。非 git 目录整器不渲染；aiti-git-ops 缺席（refs 404）→ 分支分区隐藏、worktree 模式强制按开。
- **分支 chip + BranchPanel（共享 git-ops 客户端）**：折叠头 `⎇` 分支 chip 与选择器复用 `_shared/git-ops-client` BranchPanel（分支/worktree 管理、stash 交互、冲突卡）；模块级 refs 缓存，切回已探测目录零请求；数据零轮询——`aiti-git-ops:changed:*` topic 订阅驱动刷新。
- **多 agent 解析器（lib/agents）**：**29 个内置 AgentAdapter**（claude-like 系 / codex / opencode 系 / zcode / codebuddy / cursor 系 / trae / kimi / gemini / openclaw / iflow / goose / amp，2026-11-09 ACP 家族批次再补 **grok**（updates.jsonl ACP 帧）/**omp**（pi-wire JSONL）/**kiro**（Q-CLI conversation_log）/**auggie**（turns/chunks）/**vibe**（logs/session）/**qwen**（gemini 形状复用）/**hermes**（state.db SQLite 只读）……id 对齐 aiti-acp-agent agentKey → ⚡接管直通 session/load），`services.sessions.parseSession` 唯一权威实现；真归档名单按 snapshot+removeSession+putBack 三原语自动筛选驱动 📦 菜单。
- **会话行数据帧化（2026-09-14/15）**：message_end 落盘即经 aiti-event-bus 广播 `sm:session-activity` 行数据帧，列表行消息数/时间实时 patch，零轮询零重拉。
- **左栏 DockStack 编排**：区块栈容器由 `aiti-float.dockstack` 能力提供（`dependsOn` 硬依赖，extman 阻止 aiti-float 被单独禁用）；全折叠空白 filler = 快速上手引导卡（aiti-quickstart）+ 应用中心（aiti-app-center），二者 optionalDependsOn 缺席各自回退。
- **外部 agent 行（ext 行）视图层管理**：dock/面板 📦 菜单对 zcode/cursor 等外部源行「从列表移除」——纯视图层收进**归档分组**，源数据不动，归档行可随时 reopen（恢复 + ⚡ 接管），永不丢数据；不提供彻底删除。
- **tag 数据实时同步**：tag 变更经 aiti-event-bus 帧驱动刷新——跨 tab/实例即时生效，无轮询。
- **高级搜索**（sider dock）：搜索框旁「高级」toggle——All Sessions 全量下按 agent/tag 过滤，结果行带 agent 徽标。
- **归档完整性守护**：归档/移动自动释放 idle handle；`.pwarc` 提取完整性校验。
- **多 agent 水位**：trae 等后台定时刷新以内容级时间戳判「有更新」，不再被 db mtime 误触发。
- **自愈**：zcode 双行/无标——列表请求驱动自愈 + 站位行注册表兜底 + sync GC 防误删。

## 服务出口（ctx.services）

本扩展是三个跨扩展服务的提供方（规范见 [ext-services](/guide/ext-services.html)）：

| key | 方法语义 | 消费方 |
|---|---|---|
| `session-manager.sessions` | `parseSession(compositeId)` 各 agent 历史解析（只读；`messages[].tool` 为结构化工具行——opencode 系 / claude-like 系 / codex adapter 产出，供后端回放成 pi 原生工具卡）+ `archivedIds()` 归档名单 | aiti-zcode/opencode/qoder/codebuddy/codex-agent（冷恢复 `seedHistory`）、aiti-doc-center |
| `session-manager.tags` | `snapshot()` TagData 全量（乐观锁 version） | aiti-doc-center |
| `session-manager.hotwords` | ASR 热词提取 `get(params)` | aiti-ai-input |

### AI 帮助点（ai.helpers）

| 帮助点 | 作用 | 落地 |
|---|---|---|
| `session-archive` AI 帮我归档旧会话 | 描述条件 → AI 读归档候选 → 挑旧会话 | `POST archive/run`（mapping ids 数组） |
| `session-find` AI 帮我找会话 | 描述会话特征 → AI 查会话列表找到它 | 纯建议（自然语言） |

声明在 `index.ts` 的 `ai.helpers`，由 ai-helper 主动聚合（无需注册）。

## 延伸阅读

- [`.pwarc` 归档格式规范](/extensions/session-manager-archive.html) —— 二进制布局 / manifest / 完整性校验 / 设计决策记录

- 扩展框架见 [aiti-agent 扩展点](/devtools/extension-points.md)
