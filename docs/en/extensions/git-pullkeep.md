---
title: git-pullkeep (dirty-worktree-safe pull)
icon: 🩹
description: When a pull is blocked by the working tree, parks only the actually-blocking files in a labelled temp commit, runs the pull, then collapses the layer back into uncommitted changes — staged state preserved, untracked files kept aside, every other dirty file untouched. A drop-in git pull replacement relaying all its options (--rebase replaces pull --rebase --autostash)
---

# git-pullkeep (dirty-worktree-safe pull)

> ❝ **Move the minimum, prove that you moved nothing else, and make every step reversible — stash is no longer a toll you pay for pulling.** ❞

When `git pull` refuses with `Your local changes would be overwritten`, the usual escapes (stash /
autostash) move the whole tree, lose staged state, scatter conflict markers over unrelated files,
and abort outright on untracked-vs-upstream collisions. **git-pullkeep** takes a different route:
it parks only the genuinely blocking paths in a labelled temporary commit (`wip: pullkeep temp
commit` + `pullkeep-temp:` trailer), runs the pull, then collapses the layer back into uncommitted
changes — local edits, staged state, and untracked files all preserved.

- **Full git pull relay**: `--rebase[=merges]` / `--no-ff` / `-X` / `-s` / `--set-upstream` / the
  fetch family all pass through; `--autostash` is accepted and ignored (keeping your changes is
  the whole job); unknown options relay too (forward compatible). `--rebase` replaces
  `git pull --rebase --autostash`.
- **Moves the minimum**: zero files parked when nothing overlaps (native pull); staged entries
  park automatically in merge mode (git merge refuses index ≠ HEAD); untracked collision files
  move to `.git/pullkeep-aside/<stamp>/` with the local copy kept.
- **Auditable & reversible**: pre-run snapshot in `refs/pullkeep/<stamp>`, `--undo -y` restores
  exactly (staged / untracked / even staged≠worktree two-layer content); before/after
  `status --porcelain` is diffed and printed.
- **Interrupt-safe**: labelled temp commits survive gc and re-clones, `--recover` / `--continue`
  collapse leftovers; concurrent runs serialise on an atomic `mkdir` lock (exit 35).
- **AI-adoptable**: ships an Agent Skills format skill (`skills/git-pullkeep/SKILL.md`) —
  `npx skills add aiti-ai/git-pullkeep` teaches Claude Code / Codex / Cursor / OpenCode / pi when
  to reach for it instead of `git pull --autostash`.

## Install

```sh
npm install -g git-pullkeep
# China mirror without npm:
curl -fsSL https://gitee.com/aiti-ai/git-pullkeep/raw/main/install.sh | GIT_PULLKEEP_REPO=https://gitee.com/aiti-ai/git-pullkeep/raw sh
# Windows (PowerShell 5.1+): irm https://gitee.com/aiti-ai/git-pullkeep/raw/main/install.ps1 | iex
```

Requires Git ≥ 2.23, bash ≥ 3.2. On Windows always type `git pullkeep` (the subcommand form —
Git for Windows runs it with its bundled bash, immune to WSL bash hijacking). Single file, zero
dependencies; git discovers it automatically (`git help -a | grep pullkeep`).

## Quick reference

```sh
git pullkeep                 # merge; dirty-tree pull with automatic park/collapse
git pullkeep --rebase        # replaces pull --rebase --autostash (parks all dirty, restores after)
git pullkeep --dry-run       # analyse only: what's incoming, who blocks — change nothing
git pullkeep --undo -y       # exact rollback to the pre-pull working tree
git pullkeep --continue      # after resolving conflicts: collapse the commit layer
git pullkeep --recover       # collapse a temp commit left by an interrupted run
git pullkeep --check         # CI gate: exit 10 when parking would be required
```

On conflict (exit 20) nothing is lost: resolve, `git add`, then `git pullkeep --continue` — or
`git merge --abort` + `--undo -y` to walk away with the exact pre-pull state. Motivation,
comparison table and limitations live in the bilingual README.
