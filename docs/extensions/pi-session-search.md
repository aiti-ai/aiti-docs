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
  npm: "pi-session-search"
  install: |
    pi install npm:pi-session-search
    # 或本地路径：
    pi -e /path/to/pi-session-search/src/index.ts
  license: MIT
  tags: [pi, plugin, session, search, compaction, memory, history]
  installable: false  # pi 插件——装进 ~/.pi/agent，不进 aiti-agent/pi-web 扩展体系：extman 不列出、extensions.json 归 integrations
---

# pi-session-search（pi 会话搜索）

> ❝ **compaction 吃掉的上下文，一句搜索全找回来。** ❞

给 **pi 编码代理**两个只读工具：

- **session_search**：跨历史会话全文搜索——本会话精确找回、全 agent 家族扫描（经 pi-web
  session-manager 索引）、按 role/仓路径过滤、中文 ≥3 字三元组索引
- **session_read**：按 session/entry 读原始消息，长文分页截断续读

典型场景：上下文被 compaction 后恢复细节、用户说"上次我们讨论过"时考古、跨会话复用既有方案。
