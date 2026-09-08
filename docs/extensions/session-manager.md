---
title: session-manager
icon: 📋
ext:
  id: session-manager
  name: session-manager
  description: 跨项目会话面板 —— tag 树+颜色 / 收藏 / 搜索 / 归档 / 看板
  soul: 会话不是用完即走的流水，是每天都在累积的资产。
  type: dev-repo
  category: 会话管理
  version: 0.2.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/session-manager/ 后 reload：
    curl -X POST http://127.0.0.1:<端口>/api/extensions/reload
  license: MIT
  tags: [sessions, tag, search, archive]
---

# session-manager

> ❝ **会话不是用完即走的流水，是每天都在累积的资产。** ❞

aiti-agent（pi-web）的跨项目会话管理扩展：tag 树 + 颜色、收藏、FTS5 全文搜索、`.pwarc` 归档、看板视图。All Sessions 侧栏 dock 的承载扩展。

## 近期能力（2026-08 下旬～09）

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
| `session-manager.sessions` | `parseSession(compositeId)` 各 agent 历史解析（只读）+ `archivedIds()` 归档名单 | aiti-zcode/qoder/codex-agent、aiti-doc-center |
| `session-manager.tags` | `snapshot()` TagData 全量（乐观锁 version） | aiti-doc-center |
| `session-manager.hotwords` | ASR 热词提取 `get(params)` | aiti-ai-input |

### AI 帮助点（ai.helpers）

| 帮助点 | 作用 | 落地 |
|---|---|---|
| `session-archive` AI 帮我归档旧会话 | 描述条件 → AI 读归档候选 → 挑旧会话 | `POST archive/run`（mapping ids 数组） |
| `session-find` AI 帮我找会话 | 描述会话特征 → AI 查会话列表找到它 | 纯建议（自然语言） |

声明在 `index.ts` 的 `ai.helpers`，由 ai-helper 主动聚合（无需注册）。

- 扩展框架见 [aiti-agent 扩展点](/devtools/extension-points.md)
