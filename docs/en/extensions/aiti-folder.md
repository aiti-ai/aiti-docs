---
title: Folder Browser (aiti-folder)
icon: 📂
description: fileViewer folder take-over + pathPicker directory picker — browse / delete to trash + git toolbar, nested-repo commits and grouped commit plans (soft-depends on aiti-git-ops)
---

# aiti-folder

> ❝ **The directory tree is not the end of navigation — it is the start of action.** ❞

pi-web folder browser extension:

- **fileViewer folder slot take-over**: directory-type entries are rendered and browsed by the extension component
- **pathPicker**: generic directory picker (reused by other extensions to pick paths)
- **Trash deletion**: deletion goes through the `trash` library into the system trash — recoverable, no panic
- **git toolbar (GitBar)**: soft-depends on aiti-git-ops (the whole bar hides when the engine is absent) — ⎇ branch chip (shared BranchPanel) · ↑↓ ahead/behind sync (SyncBar confirmation flow) · ✎ manual commit (check → stage → commit) · per-line stage/unstage/discard; subscribes to the `aiti-git-ops:changed:*` topic for zero-polling refresh
- **Grouped commit plans (git-plan)**: heuristic grouping (directory clustering / type rules / status modifiers) + local preference learning + AI refinement and AI commit messages (relayed via aiti-git-review.aiReview); plans are stored in the state tier and executed directly through the engine `/git/plan/execute` (breakpoints / rollback)
- **Nested repositories (nested git)**: child directories carrying their own `.git` (standalone repo / submodule / worktree) show an always-visible `⎇ branch ·N` chip on their row — click it to toggle the inline changes panel (GitBar + staged/worktree buckets, all scoped to the nested directory: stage/discard/commit/group-commit independently); the expanded fused header row = chip + ↑↓ sync counts + hover action row (group/☰/commit) + a `…` more menu (branch panel / Git Review / refresh this repo / open as folder tab / terminal / new window / collapse changes); a per-row hover refresh button refreshes only that subtree; nested dirty files merge into file badges and ancestor dots; detection scans one level when a directory expands (TTL cache — deeper repos surface naturally as you expand), falling back to a read-only view when the engine is absent
- **File operations**: new file/folder (409 when it already exists), nested upload (single file 25MB / total 100MB), rename/move (EXDEV cross-device = copy + source into trash) / copy, directory tar.gz streaming download (5-minute ticket to prevent path leaks), open a terminal in a directory, reveal in the OS file manager (a directory opens itself, an entry opens its folder selected), entry-info, doc-search (proxies aiti-doc-center FTS5 with `<mark>` highlighting); all write paths go through unified realpath checks to prevent symlink escape
