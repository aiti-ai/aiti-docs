---
title: AI Helper (aiti-helper)
icon: 🤖
description: The one-sentence AI capability entry for all extensions — declarative AI help points (pi skills standard) + input/result preview/review-and-fill-back + streaming progress bus delivery + multi-turn follow-ups + history and background tasks + user-defined skills (config versioning has been split out as aiti-configs)
---

# aiti-helper

> ❝ **AI's tools should be wired up and evolved by AI itself — humanity's role is to steer, not to haul bricks.** ❞
> Tools were meant to fly (AI), yet they fall like a teardrop from the Madonna — clear, precious, but only falling downward. ai-helper is the "airplane" channel: **an extension calls AI in one sentence, and AI's output lands as something the extension can use.**

The "one-sentence AI capability" entry for **all extensions**. An extension only declares help points + calls `invoke` once; everything else (AI input box, context assembly, output validation, preview review, fill-back/execution) is done by ai-helper.

- **Declarative help points (pi skills standard)**: the extension declares `ai: { manage, intro, skills: "skills" }` in `index.ts`; help points are organized as a **skills directory** — `skills/index.json` (only lists skill names, avoiding full-directory scans) + `skills/<name>/SKILL.md` (frontmatter carries the metadata title/placeholder/outputs/action; the body is a manual for the AI). ai-helper reads the index → assembles each SKILL.md frontmatter; invoke only injects one line with the skill path, and the AI reads it on demand with the read tool (no long inline system prompt). Output formats support `json-obj` (just list the fields) and `text`; actions support direct API writes or CDP fill-back into the extension's dialog forms
- **Global dialog AI button**: every extension dialog gets a 🤖 button automatically in the top-right corner, to the left of the close button (injected uniformly by the framework; extensions don't write it) — invoke AI in one sentence while a dialog is open
- **AI input box + result preview**: input in the dialog → generated within an AI session → schema validation → editable preview → after user review "fill in and execute / copy only / redo"
- **Originator source annotation**: at invoke time the originator is reported to the AI — `From: <pageId> (AI main window/host page)` + `Source session ID: <current pi-web session id>` (pages slot passes selectedSession); in multi-window scenarios the AI knows which window the user invoked from and can read that session's history
- **AI proactive interaction**: the default invoke prompt includes "interact with the user" — when information is insufficient or a choice/confirmation is needed, the AI can proactively collect from you using tools like `aiti_user_choose` (candidates for the user to pick)/`aiti_user_input`/`aiti_user_confirm`/`aiti_user_pick_element` instead of guessing (e.g. "list all sessions for me to choose" triggers choose to pop candidate cards)
- **Streaming progress + result bus delivery**: progress and results go through the aiti-event-bus topic `helper-<sid>` (result lands directly with full text; HTTP `/result` degrades to a pure snapshot and never holds a connection; after a 3s grace period with zero output a no_result frame is broadcast — the old long-poll path cut off by nginx at 60s has been retired)
- **Multi-turn follow-ups**: follow-up input box inside the dialog → `POST /followup` steers the same agent session to continue (context fully preserved; the session is automatically rebuilt and resumed after recycling)
- **History and background tasks**: invoke history lands as JSONL in `state/history.jsonl` (with a land marker); background execution sends a system notification; reopening the dialog lists unsettled tasks (`/active`), `/origin` reconnects to live progress
- **User-defined skills**: 🤖 "AI, add/modify a skill for me" → `/user-skills` CRUD (stored in the data directory, owner attributed to the extension, without touching the extension's deployed artifacts) + the `skill-manage` help point
- **invoke safety net**: before invoke, automatically `POST`s to aiti-configs `/snapshot` to freeze the scene (fire-and-forget, modeled on etckeeper Pre-Invoke; config versioning was split out at M4 into [aiti-configs](aiti-configs.md), and this extension keeps only this one wiring)
- **Session-level tool enablement**: the owner extension's aiti_* tools are only injected into this helper session (enableExtTools — no feature writes, no race); `ai-prebind` pre-binds resources before creating the session; ownerTools statistics
- **Lazy loading v2**: thin entry stays resident (global 🤖 button + stable invoke entry installed immediately); the heavy UI dialog is imported on demand at first invoke; originating page bound via boundPageId
- **Free form**: without picking a preset help point, ask directly; the result can be text/code/JSON, filled back into the current input box/clipboard
- **AI self-management checklist**: reads each extension's `ai` section (self-management checklist) → maintains commands/prompts/extensions, even **creates a new extension** (together with aiti-extman)

> Workflow and full design text: internal plan documents (including aiti-devtools "AI managing itself" self-bridging, per-extension self-management checklists, the evolving AI agent philosophy, and the versioning design).
>
> **Integration guide for other extensions** (three steps: declare skills + integrate + verification checklist, see the internal integration guide) — declare the `ai` section → write `skills/<name>/SKILL.md` → deploy recursively copies; includes a SKILL.md spec quick reference / api+fill output contract / source annotation / common pitfalls.
