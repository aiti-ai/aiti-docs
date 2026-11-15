---
title: pi-session-search（pi 会话搜索）
icon: 🔎
ext:
  id: pi-session-search
  name: pi-session-search 会话搜索
  description: 给 pi 编码代理加 session_search / session_read 只读工具——跨历史会话全文搜索（经 pi-web session-manager 索引可覆盖所有 agent 家族）+ 读原始消息，恢复被 compaction 吃掉的上下文、找回"上次怎么做的"
  soul: compaction 吃掉的上下文，一句搜索全找回来。
  type: pi-plugin
  category: pi 插件
  version: 0.1.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: ""  # 无 npm 包：npmjs 上的 pi-session-search 是第三方同名包（samfp），勿混淆
  install: |
    # 尚未公开发布（npmjs 同名包为第三方所有，勿装）——源码直连：
    pi -e /path/to/pi-session-search/src/index.ts
    # pi-web 会话无需安装：session_search/session_read 由 session-manager 注入
  license: MIT
  tags: [pi, plugin, session, search, compaction, memory, history]
  installable: false  # pi 插件——装进 ~/.pi/agent，不进 aiti-agent/pi-web 扩展体系：extman 不列出、extensions.json 归 integrations
---

# pi-session-search（pi 会话搜索）

> ❝ **compaction 吃掉的上下文，一句搜索全找回来。** ❞

给 **pi 编码代理**两个只读工具，专为"上下文刚被 compaction"或"用户说上次讨论过"的时刻设计。

## 工具

### `session_search(q, scope?, agent?, cwd?, role?, limit?)`

跨历史会话全文关键词搜索：

| 参数 | 语义 |
|---|---|
| `scope: "current"` | 仅本会话（实时，含刚被 compaction 掉的内容） |
| `scope: "pi"` | 仅 pi 自己的会话 |
| `scope: "all"`（默认） | 索引认识的所有 agent 家族 |
| `scope: "<id>"` / `["<id1>","<id2>"]` | 将上一次搜索收窄到指定会话（uuid / uuid 前缀 / jsonl 路径） |

可选 `agent`（pi/claude/codex/opencode/zcode/kimi/gemini/cursor/…）、`cwd` 前缀、`role`、`limit` 过滤。

### `session_read(session, role?="user", limit?, offset?, maxChars?, entry?)`

读一个会话的原始消息，默认取**用户消息**——compaction 后恢复用户原始请求的最快路径。`entry` 锚定
search 命中的单条消息；长文按 `maxChars` 截断、`offset` 翻页续读。

典型流：`session_search("压缩 命令", "all")` → `session_search("resize", ["id1","id2"])` →
`session_read("id1")` → `session_read("id1", entry)`。

## 数据源（按查询逐级，全程只读）

| 级 | 来源 | 覆盖 |
|---|---|---|
| 1 | **pi-web session-manager 索引**——SQLite FTS5 三元组索引，覆盖 ~20 个 agent 家族（pi/claude/codex/opencode/zcode/kimi/gemini/copilot/cursor/cline/trae/windsurf/zed/antigravity/openclaw…），输出标注索引快照时间 | 最广 |
| 2 | **pi 会话文件**——流式扫描 `~/.pi/agent/sessions`（`$PI_SESSION_SEARCH_SESSION_DIR` 可覆写），最新优先、有界 | 永远实时 |
| 3 | `scope:"current"`——直读活跃会话管理器，100% 新鲜（几秒前刚压缩的内容也在） | 本会话 |

索引候选路径：`$PI_SESSION_SEARCH_DB`、`$PI_WEB_DATA_DIR/session-manager/cache/index.sqlite`、
`~/.pi/web/data/…`、`~/.pi/web-dev/data/…`；`PI_SESSION_SEARCH_DB=off` 关闭索引源。

## 细节

- **中文查询**：CJK 需 ≥3 字符（FTS5 三元组索引），更短查询回退子串匹配
- **人类通道**：`/session-search <query> [scope:current|pi|all]`
- **只读红线**：从不写会话文件或任何索引；零原生依赖（node:sqlite 内建，Node ≥ 22.5）
- **pi-web 会话无需安装**：同一工具契约经 `server.agent.agentTools` 注入 pi-web 会话，权威实现在
  session-manager 扩展（aiti 源仓 docs/pi-session-search-tools-plan.md）；独立 pi 用户的本插件
  **尚未公开发布**——npmjs 上的同名包 `pi-session-search` 为第三方所有，勿混淆
