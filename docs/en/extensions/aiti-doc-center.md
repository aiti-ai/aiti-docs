---
title: aiti-doc-center
icon: 📚
description: "workspace markdown collection/organization/search — FTS5 trigram Chinese full-text + tag seven-source two-layer + 📚 float dialog four views"
---

# aiti-doc-center

workspace markdown collection/organization/search extension: node:sqlite FTS5 trigram Chinese full-text search + Obsidian-compatible tag system + 📚 float dialog with four views + tag tree.

- **tag seven-source two-layer**: 5 static sources (front-matter / inline `#tag` anywhere / path-derived / UI write-back / manual tags added in the doc center — non-md files can be tagged via 🏷 too) + 2 dynamic sources (plan-first plan binding → the "Plan" tag, session-manager vocabulary session tag inheritance); the dynamic layer is joined in memory.
- **All Sessions tag tree = the system's unified vocabulary**: AI tagging / UI completion / plan-first vocabulary all defer to it first.
- **Associated sessions**: via `services.trace` (the git-trace ledger), reverse-lookup the sessions a document has touched; archived-session linkage (`.pwarc` archive rows are searchable too).
- **Service outlet** `aiti-doc-center.docs`, six methods: `tagsAll/search/query/searchFull/docsOfSession/sessionsOfDoc` — consumers aiti-plan-first, aiti-folder, session-manager.
- **Service consumption**: `aiti-git-trace.trace`, `session-manager.tags/sessions`, `aiti-plan-first.plans`.
- **AI tools**: `aiti_doc_search` (FTS full-text + weight-fused ranking, with snippet) and `aiti_doc_tags_set` (writes tags back into front-matter) — off by default (enable via `agentTools.enabled`); there is also a doc-search skill that goes through `GET /search`.
- On the plan-first side, the "🏷 Add tags" and "Update plan doc" one-click inserts both go through this extension's vocabulary and search.

