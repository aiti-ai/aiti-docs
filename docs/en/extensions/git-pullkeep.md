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

## Core capabilities

- **Full git pull relay**: strategy flags (`--rebase[=merges]`/`--no-rebase`), the fetch family
  (`--prune`/`--tags`/`--force`/`--depth`/`--unshallow`/`--recurse-submodules`/`--negotiation-tip`…),
  merge flags (`--no-ff`/`-X`/`-s`/`--log`/`--stat`/`--signoff`/`--verify-signatures`),
  `--set-upstream`, positional `<remote> <branch>`, and even unrecognised options (forward
  compatible — future git flags keep working). `--autostash`/`--no-autostash` are accepted and
  ignored. `--rebase` replaces `git pull --rebase --autostash`.
- **Moves the minimum**: zero files parked when nothing overlaps (native pull); staged entries
  outside the overlap park automatically in merge mode (git merge refuses index ≠ HEAD);
  `--rebase` parks every dirty file (rebase demands a clean tree) and restores them afterwards.
- **Untracked-collision protection**: when upstream adds a file that exists untracked locally,
  autostash aborts the pull — pullkeep moves the local copy to `.git/pullkeep-aside/<stamp>/`,
  the pull proceeds, upstream lands, and your version stays recoverable.
- **Auditable**: pre-run snapshot in `refs/pullkeep/<stamp>` (not a stash; the branch never
  moves), index tree recorded in `.git/pullkeep-meta/`; after the run, before/after
  `status --porcelain` is diffed and printed — "did it touch anything else?" is a checked fact.
- **`--undo` restores exactly**: untracked files, staged state, even staged≠worktree two-layer
  content.
- **Interrupt-safe**: temp commits carry a machine-readable marker (`pullkeep-temp:` trailer,
  survives gc / re-clones / moved branches); the next run refuses to stack (exit 31) and points
  at `--recover` / `--continue` / `--undo`; `--recover` acts only when the answer is unambiguous,
  and published temp commits are reported, never rewritten.
- **Concurrency lock**: write modes take an atomic `mkdir` lock in the common git dir
  (exit 35 = wait), serialising every worktree of the same repository; dead owners are reclaimed.
- **AI-adoptable**: ships an Agent Skills format skill (`skills/git-pullkeep/SKILL.md`) —
  `npx skills add aiti-ai/git-pullkeep` teaches Claude Code / Codex / Cursor / OpenCode / pi when
  to reach for it instead of `git pull --autostash`.

## vs `git pull --autostash`

| | git-pullkeep | `git pull --autostash` |
|---|---|---|
| Files moved | only the actually-blocking ones | the whole working tree |
| Conflict risk on restore | untouched files never move — impossible to conflict | one big three-way merge, can land mid stash-pop |
| Staged state | preserved across the round trip | lost (everything unstaged) |
| Untracked vs upstream new file | moved aside, pull proceeds | pull aborts until you move it manually |
| Interrupted runs | labelled temp commits + `--recover`/`--undo` | stray stash entries, manual archaeology |
| Concurrent runs | atomic lock, serialised (exit 35) | no coordination, index races |
| Rollback | `--undo` restores the exact pre-pull state | none |

## How it works (six steps)

1. `git fetch`, compute `incoming = base..upstream` and `dirty = HEAD..worktree`
2. `blocking = incoming ∩ dirty`; untracked collisions move aside; modify/delete conflicts are
   warned up front
3. Snapshot the dirty tree → `refs/pullkeep/<stamp>` (index tree recorded too, so `--undo` is exact)
4. `git commit --only -- <blocking paths>`: a labelled temp commit touching only those paths
5. `git pull <your options>` — those paths are clean now
6. `git reset --mixed <new upstream>` collapses the layers, re-plays staged state; before/after
   status diff verifies the result

## Quick reference

```sh
git pullkeep                 # merge; dirty-tree pull with automatic park/collapse
git pullkeep --rebase        # replaces pull --rebase --autostash
git pullkeep --dry-run       # analyse only: what's incoming, who blocks — change nothing
git pullkeep --undo -y       # exact rollback to the pre-pull working tree
git pullkeep --continue      # after resolving conflicts: collapse the commit layer
git pullkeep --recover       # collapse a temp commit left by an interrupted run
git pullkeep --check         # CI gate: exit 10 when parking would be required
```

On conflict (exit 20) nothing is lost: resolve, `git add`, then `--continue` — or `git merge
--abort` + `--undo -y` to walk away with the exact pre-pull state. `--ff-only` / `--squash` /
`--no-commit` / `--all` / `--rebase=interactive` are refused (exit 21, with a reason) only when
files must actually be parked; otherwise they relay and `git pull` decides natively.

## Further reading

- GitHub: <https://github.com/aiti-ai/git-pullkeep> (bilingual README: motivation / comparison /
  safety / concurrency / limitations)
- Gitee: <https://gitee.com/aiti-ai/git-pullkeep> (release assets: script + man page)
- npm: <https://www.npmjs.com/package/git-pullkeep> (provenance-signed releases)
- AI skill: `skills/git-pullkeep/SKILL.md` (Agent Skills open format, shipped in the npm tarball)
