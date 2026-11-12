---
title: Git Ops 共享引擎（aiti-git-ops）
icon: 🔀
ext:
  id: aiti-git-ops
  name: Git Ops 共享引擎
  description: 白名单 git 写引擎——checkout 预检 / stash / plan 断点 / 审计 / changed topic，供 folder 与 session-manager 消费
  soul: 一处写仓，处处安全。
  type: aiti-ext
  category: 服务端引擎
  version: "0.1.7"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-git-ops/ 后 reload
  license: MIT
  tags: [git, server-side, engine]
---

# aiti-git-ops · Git 操作共享引擎

零 UI 纯服务端扩展：aiti-folder（提交面板/SyncBar）与 session-manager（侧栏分支 chip 面板）的共用 git 写层。

- **REST**：`POST /api/extensions/aiti-git-ops/git/*`（refs / log / checkout / branch-create / branch-delete / tags / tag-create / commit-show / commit-diff / cherry-pick / stage / unstage / discard / commit / plan/execute / plan/rollback / stash/{list,files,push,apply,drop,branch} / push / pull / fetch）；cwd 走 JSON body。
- **services**：`ctx.services.get("aiti-git-ops.api")` 与 REST 同面（进程内直调）。
- **事件**：`aiti-git-ops:changed:<hash(repoRoot)>`（经 aiti-event-bus publish-local；订阅方 `POST /alive {types}` 保活，45s 停推）。
- **安全**：子命令白名单 + 每入口手写参数拼装 + ref 字符集白名单/check-ref-format；checkout 永不 `-f`、reset 仅 `--mixed`（unstage/discard 走 `reset -q`）、untracked 丢弃入 `cache/` 隔离区；checkout 家族 dirty∩affected 预检 409 三选一（worktree / stash / 取消）；同仓写经 queueRepo 串行；审计 `state/aiti-git-ops/git-ops.jsonl`（5MB 滚动）。
- **图谱 commit 详情卡（2026-09-19）**：点图谱行开卡——元信息 + 文件清单（name-status×numstat 合并）+ 单文件内嵌 diff（400KB 截断）；建分支 / tag / 检出 / cherry-pick（冲突 409 可终止回原状）、Git Review 直开、`@` 到新会话。

已接入消费方：session-manager（折叠头 `⎇` 分支 chip 面板，含 worktree 模式/部分 stash/块级 -p；新建会话「分支/Worktree」选择器同款复用）与 aiti-folder（目录 GitBar：分支面板/SyncBar/手动提交/✨ 分组提交计划——启发式分组+偏好学习+逐组提交断点+`reset --mixed` 回滚）。引擎缺席时各消费方软降级。

三平台实测（Linux/Apple Git 2.24/Windows Git 2.55）；数据：审计 `state/aiti-git-ops/`、隔离区 `cache/aiti-git-ops/discarded/`。

已实施：含 git-review aiReview 服务 AI 精修闭环 + commit 详情卡。
