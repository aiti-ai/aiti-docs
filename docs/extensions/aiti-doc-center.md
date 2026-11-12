---
title: aiti-doc-center
icon: 📚
ext:
  id: aiti-doc-center
  name: 文档中心
  description: workspace md 收集/整理/检索——FTS5 trigram 中文全文 + tag 七来源两层 + 📚 float 弹窗四视图
  soul: 文档不检索，等于没写。
  type: dev-repo
  category: 知识管理
  version: "0.1.9"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  license: MIT
  tags: [docs, search, fts5, tag]
---

# aiti-doc-center

workspace markdown 收集/整理/检索扩展：node:sqlite FTS5 trigram 中文全文检索 + Obsidian 兼容 tag 体系 + 📚 float 弹窗四视图 + tag 树。

- **tag 七来源两层**：静态 5 来源（front-matter / 任意位置 inline `#tag` / 路径派生 / UI 写回 / 文档中心手工 tag——非 md 文件 🏷 亦可打）+ 动态 2 来源（plan-first 方案绑定 →「方案」tag、session-manager 词表会话标签继承），动态层内存 join。
- **All Sessions tag 树 = 系统统一词表**：AI 打 tag / UI 补全 / plan-first 词汇均以其优先。
- **关联会话**：经 `services.trace`（git-trace 台账）反查文档触达过的 session；归档会话联动（`.pwarc` 归档行同样可查）。
- **服务出口** `aiti-doc-center.docs` 六方法：`tagsAll/search/query/searchFull/docsOfSession/sessionsOfDoc`——消费方 aiti-plan-first、aiti-folder、session-manager。
- **服务消费**：`aiti-git-trace.trace`、`session-manager.tags/sessions`、`aiti-plan-first.plans`。
- **AI 工具**：`aiti_doc_search`（FTS 全文 + 权重融合排序，带 snippet）与 `aiti_doc_tags_set`（写回 front-matter tags）——默认关（`agentTools.enabled` 开）；另有 doc-search skill 走 `GET /search`。
- plan-first 侧「🏷 添加 tags」「更新方案文档」一键插入均走本扩展词表与检索。

