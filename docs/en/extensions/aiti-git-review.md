---
title: Git code review (aiti-git-review)
icon: 👁️
description: Dedicated to reviewing uncommitted changes — Monaco diff workspace (side-by-side/merged/new-only/outline) + line-level annotations (must/suggest/question) + anchor flag-line re-mapping (stays valid while editing mid-review) + summary final-review checklist + AI pre-review (aiti_review_* tools injected only into review sessions, zero tools day-to-day)
---

# aiti-git-review

> ❝ **As a human, this is my last stubborn stand against AI.** ❞

Git code review extension: by default reviews "all uncommitted changes" (`git diff HEAD` + untracked, with git concepts hidden from the user), and also supports **arbitrary version baselines** — comparing base (branch/tag/commitid, default HEAD) against ref2, the two versions against each other. **Read-only git whitelist** (status/diff/log/show/rev-parse/merge-base/ls-files/hash-object/for-each-ref), no write subcommands at all.

- **Three context-aware entry points**: top toolbar 👁️ (whole repo) / file toolbar 👁️ (that file) / folder toolbar 👁️ (that directory)
- **Tasks are first-class citizens**: a picker (create · check files in the file tree + AI pre-review option / open the existing list / delete / GC of empty tasks after 30 days), tasks persisted at `<extRoot>/state/aiti-git-review/tasks/`
- **Version baselines**: base (branch/tag/commitid, default HEAD) versus ref2, the two versions compared against each other; /refs lists branches/tags/remotes/last 100 commits grouped by day; the picker switches between "workspace / two versions"
- **Monaco diff workspace**: one-click switching across the four views side-by-side/merged/new-only/outline, F7/Shift+F7 hunk-level navigation across files, width-bucket layout memory, small-screen three-zone adaptation
- **Line-level annotations (human + AI in one store)**: three entry points — right-click / ✍ mode / the pipeline form on the right; severity must/suggest/question; **anchor flag-line snapshot + automatic re-mapping on content-hash drift** (line numbers stay valid while editing mid-review; unfindable ones are marked stale with the original text kept); revision optimistic lock
- **AI pre-review**: `aiti_review_*` tools (status/diff/comment/comments/comment_update/summarize) are **injected only into review task sessions** (agentTools gated per session + boundSessionId persistence + ai-prebind lazy binding); day-to-day sessions get zero tools
- **Summary final-review checklist**: long-form findings as `file#line [severity] comment` + +N/-M stats; one click to send to the current session / open a new session / copy
- **Rename/binary/untracked/no-HEAD all compatible**: R-status dual-path diff keeps rename pairing, binary markers stay out of the diff, empty-tree baseline fallback before the first commit
- **trace source + partial rollback**: the review source is wired into the aiti-git-trace ledger; one-click partial rollback within a review (file/line level, write path consolidated into git-trace)
- **Two-stage lazy-loading conversion** (M3 batch ②, [lazy-loading contract](/en/guide/ext-lazy-loading.html)); the first case of cross-extension editor/folder bring-up (ensureMaterialized + fixed cross-extension registration ordering)
- **services outlets**: `aiti-git-review.aiReview` — groupReview (AI-refined commit grouping, consumed by aiti-git-ops M4) + commitMessage (AI-generated commit messages, consumed by the folder CommitDialog); spawns a prompt session + `agent.onAgentSettled` event-driven answer retrieval (single 180s deadline, no polling); when absent, consumer buttons are hidden

## Agent tools (review task sessions only)

```
aiti_review_status           # survey the changeset (files + statuses)
aiti_review_diff             # structured diff (hunks/segments with line numbers)
aiti_review_comment          # AI annotates directly (severity + line + comment)
aiti_review_comments         # read existing annotations (avoid duplicates)
aiti_review_comment_update   # revise / mark resolved
aiti_review_summarize        # summary final-review checklist
```

## ai-helper help point

`skills/pre-review/SKILL.md` — the AI pre-reviewer handbook (verify against the real code, annotate item by item, produce final-review recommendations; iron rule: never modify code).

> Full design: internal plan document
