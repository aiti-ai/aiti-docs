---
title: Features at a Glance
icon: 🌟
description: Every aiti-agent capability — multi-agent sessions, multi-dimensional usage, composer and messages, secrets and data, debug infrastructure, office documents, UI framework — with upstream vs in-house attribution
tags: [guide, features, overview, capabilities]
---

# Features at a Glance

aiti-agent is built on top of the open-source [pi-web](https://github.com/agegr/pi-web). This page separates two layers: first the capabilities upstream pi-web already provides (the base), then the enhancements and in-house features this project adds on top; planned unique capabilities have their own section.

Start with the **five signature capabilities**: one sidebar for many agents, full-stack usage and statistics, multi-workspace parallelism, sessions detached from the service process, and the composer/message workflow. The composer and message area (§4) are the most frequently used chain day to day, so that section goes down to "which extension owns which contract".

**Source legend** (every item is tagged):

| Tag | Meaning |
|---|---|
| ⚪ **Upstream** | Provided natively by upstream pi-web; this project only tracks and maintains it |
| 🔵 **Upstream + enhanced** | Upstream has a base implementation; this project extends it substantially |
| 🟢 **In-house** | Not in upstream; added entirely by this project (all extensions and pi plugins) |

Basis: a path-by-path comparison with the upstream pi-web mainline. The upstream mainline has no `extensions/`, `pi-plugins/` or `packages/` directories, so **every extension and pi plugin below is 🟢 in-house**; host-layer items are judged by whether upstream already had the module and how far we extended it.

> Scope: published extensions (`extensions/`), pi plugins (`pi-plugins/`), shared packages and integrations (`packages/`, `integrations/`), plus experimental extensions that are not published yet (video studio, plan-first, plan-review, etc., kept in the experimental area).

---

## 1. Five signature capabilities (start here)

### 🟢 Signature one: every agent's history, in one sidebar

This is not a simple "import": it parses each agent's **private session storage format** into one session model and puts it into the same **All Sessions** sidebar, where a session can be opened, continued, searched and archived:

- **pi native sessions** are read by the host directly; `aiti-pi-agent` starts multiple sessions through `pi --mode rpc` and is the main path for running pi in the browser.
- **A generic ACP backend**: `aiti-acp-agent` covers **25 built-in auto-detected Agent Client Protocol agents** plus a custom-backend panel; auth cards, queues and model catalogs are presented uniformly.
- **Dedicated CLI drivers** handle each vendor's details: `aiti-codex-agent` (`exec --json` + `resume`, OAuth/env dual auth, live and cold replay share the same tool cards), `aiti-claude-code-agent` (three-level keyring credential resolution), `aiti-cursor-agent` (stream-json + `--resume`, plus read-only browsing of Cursor IDE history), `aiti-codebuddy-agent` (long connection + exec fallback, three control_request channels), `aiti-qoder-agent` (international/domestic CLIs, quotas, model catalog, scheduled tasks), `aiti-zcode-agent` (desktop-embedded runtime, long-lived + oneshot dual channel), `aiti-omp-agent` (RPC branch of the largest pi fork).
- **Attach mode**: `aiti-attach-agent` connects over a socket to an agent process already running in a terminal, wires all environment variables automatically, echoes queued messages and passes image attachments through; `aiti-testagent` / `aiti-testagent-native` also bring Java processes and Windows native-process debug sessions in.
- **One management surface**: `session-manager` has **23 agent history parsers** built in; the All Sessions sidebar provides a tag tree with colors, favorites, FTS5 full-text search, advanced agent/tag filters, archive (`.pwarc` snapshots) and a board view — and new sessions can pick a branch or worktree directly.

> Result: Claude Code in the terminal, pi in the browser, Cursor in the IDE, Qoder on a server — the history all lands in one sidebar, so you no longer have to remember "which tool was this, and where did it store it". See [session-manager](/en/extensions/session-manager.md) and [AI agent integrations](/en/guide/mcp/ai-agents.md).

### 🟢 Signature two: full-stack usage and statistics

Not a "tokens this month" counter, but a complete observation system from **token detail → multi-dimensional pivots → cost/quota → context/smoothness → per-session rollups**:

- **Multi-dimensional usage reports** `aiti-ai-usage`: statistics by workspace / provider / model / key / hour (0–23) / date, with any dimension combination × multiple metrics in three views — a cross-tab heat table, a flat detail table and a hand-drawn SVG Sankey; all exportable as CSV (with BOM). Data lives in its own SQLite (idempotent detail keys + daily rollup partitions), event-driven with zero polling. It also ingests **external agents' token usage** (Claude / Qoder / CodeBuddy / ZCode four sources + model attribution for codex / opencode / cursor), not just pi's own.
- **Balance and quotas** `aiti-provider-usage`: 16 adapter ids (DeepSeek / OpenRouter / Z.AI / Kimi / Codex / Copilot and more); the "remaining quota" block in the session info panel expands the current session at the top; 5-minute TTL overview + manual refresh; multi-key pool aware.
- **Model health** `aiti-model-check`: sends a minimal probe to each model, classifies available / 429 rate-limited / error, parses Retry-After and similar recovery times, records historical availability windows, and reminds you when a long rate limit expires.
- **Context and smoothness**: `aiti-ctx-meter` shows the context usage ratio live above the composer (four urgency tiers + critical breathing), and clicks through to the host session statistics panel; `aiti-cpu-meter` scores the main thread 0–100 with color tiers and can stay minimized, includes AI stall debugging, and ships a single-file external build that can be injected into any website.
- **Per-session statistics** (🔵 upstream base + enhancement): token / cost / tool calls / active duration per session, exportable as HTML; `aiti-git-trace` then brings "which files the AI changed, which message and which operation did it" into the same statistics and audit trail.

### 🟢 Signature three: multi-workspace parallel + several folders per workspace + pinned directories

Upstream supports only one context: "the current workspace". This project makes workspaces and folders parallel and pinnable:

- **Several workspaces at once**: the project dropdown in `session-manager` lists every workspace derived from sessions; sessions from different projects can be open and running at the same time without interrupting each other. The sidebar groups by project, can hide unused workspaces, and can batch-move sessions to a new directory or archive a whole group.
- **Pinned projects and sessions**: projects can be 📌 pinned with a custom order (drag to reorder), and sessions too; pinned items are shown first in the All Sessions tree, so frequently used projects are never buried.
- **Several folders in one workspace**: `aiti-folder` v2 turns the folder block into dynamic dock instances — one panel per directory, dockable in the left sidebar block, the right panel or a floating window; switching projects automatically opens a folder instance for the new working directory, and you can add more from the ＋ picker.
- **📌 Pinned directories**: the folder ⋮ menu can pin an instance so it is not auto-closed; unpinned instances keep at most 3 by default and evict the oldest by FIFO (the quota is adjustable 1–9 via `behavior.folder-quota`). Each deployment sub-path remembers its own directory list and pin state, so instances do not leak into each other.

> Result: an agent is running in project A while you read a session from project B, with several directories from both projects spread across the sidebar and floating windows and the common ones pinned — a genuinely parallel workbench instead of one directory at a time. See [session-manager](/en/extensions/session-manager.md) and [aiti-folder](/en/extensions/aiti-folder.md).

### 🟢 Signature four: sessions detached from the service process (start detached)

Native agent sessions run inside the pi-web **service process**: closing the browser tab or losing the network is fine — the agent keeps running; what actually interrupts it is **stopping or restarting the pi-web service** (the session file survives, but the running agent dies with the process). This project solves that with a complete `agent-starter` system: Linux/macOS use systemd-run or a plain detached process, Windows uses Win32_Process.Create plus a pipe endpoint, and the agent is hosted by an independent wrapper process that talks to the service over a local socket. After a service restart the UI can reattach to the original session and the agent never stops; sessions with no attached client and no output for a long time are idle-collected by the wrapper, so resources are not held forever. The CLI driver family (including the whole ACP line and CodeBuddy) is progressively adopting this detached host. See [sessions and detachment](/en/guide/architecture.md).

### 🟢 Signature five: the composer and message area as a "never lost, fast to read, listenable" workflow

Upstream treats the composer as a send control and messages as read-only text. This project turns the two most-clicked surfaces into a stateful, recoverable, operable chain — each link is owned by a dedicated extension, and the host keeps only thin contracts:

- **Drafts are never lost** (`aiti-draft-keeper`): the sole owner of the composer draft state machine (v2 intent contract). One shared slot per session, so tabs share the same draft; switching sessions, closing the page or crashing restores it verbatim; a rejected send merges the text back; stale slots are pruned after 7 days.
- **Input is faster** (`aiti-ai-input`): two-tier autocomplete (instant local rules → AI continuation fallback), commands typed straight into the composer ("model", "compact" execute and leave the caret in the box), push-to-talk real-time speech input (streaming recognition + 2-pass refinement + multiple engines + hotwords), and a mobile newline pill.
- **Queues are controllable** (`aiti-queue-keeper` + host queue persistence): while the AI is busy, queued messages get a full panel — drag to reorder, steer-send, convert to follow-up, recall for editing, soft-delete into a recycle bin with 8-second undo, import/export. The queue is mirrored to a server-side sidecar, so after a restart you decide per entry — resend / drop / later — and nothing is ever auto-delivered.
- **Comfortable key semantics**: while running, `Enter` queues first and a second `Enter` on an empty composer promotes the queue head to a steer; `Alt/Option+Enter` steers immediately. With an empty composer, `↑` recalls a queue entry or pages session history, and `Shift+↑` opens the history menu. Full semantics live in the §4 quick-reference table.
- **Messages are operable** (`aiti-msg-smart` + `aiti-msg-anchor` / `aiti-msg-nav`): click paragraphs, headings, table rows and code lines to copy / quote / highlight / pick an option; the top anchor banner tells you "which input produced what is on screen", and the navigation rail jumps to the previous / next / earliest / latest user turn; a whole session can also be shared out.
- **It can read to you** (`aiti-ai-speek` follow mode): one click on 🔊 enters follow mode; each finished reply is queued in order and the current sentence is highlighted in the message flow and auto-scrolled (audiobook style); three engines — browser Web Speech / edge-tts / local ONNX — with voice cloning. With follow mode off there are zero subscriptions and zero requests.

> Result: leaving mid-sentence to look something up, queueing three ideas while the AI is busy, not wanting to read a long answer, needing to quote a paragraph back — none of these require "copy by hand / remember by hand / scroll by hand" anymore. Mechanisms are detailed in §4.

---

## 2. ⚪ What upstream pi-web already provides

These capabilities come from upstream pi-web; this project only tracks and maintains compatibility, and does not count them as its own:

| Upstream capability | Description |
|---|---|
| Session workspace | Browse, resume, rename, export and delete sessions grouped by project; show run state, context usage, cost and compaction details |
| Dual branching | "New session" derives an independent session file from a message; "Edit from here" branches inside the current session |
| Project file tools | Browse/upload files, view Git diffs, preview source/Markdown/images/audio/PDF/DOCX, auto-refresh |
| Git worktree switching | Switch checkouts in the sidebar; sessions from the same repository regroup automatically |
| Web configuration | Provider login, API keys, models, model tests, plugin packages and skills all managed in the browser |
| Three UI languages | English / Simplified Chinese / Traditional Chinese, following the browser language on first visit |
| PWA / single-file CLI distribution | Started via `npx`, listens on localhost by default |

Every enhancement below builds on these bases. For example, worktree switching: upstream provides the switch, and this project adds session grouping/sorting by worktree, a branch picker and batch deletion; three UI languages: upstream provides the framework, and this project extends translation coverage across more of the surface.

---

## 3. Host-level enhancements (built in, no extension required)

### 🔵 Queue persistence and crash recovery
Upstream has a send queue; this project mirrors the steer / follow-up queue to a sidecar file (`lib/queue-store.ts`, `lib/composer/recovery.ts`). After a service restart a recovery dialog resolves entries one by one and never auto-delivers — together with `aiti-recovery`, you choose "resend / drop / later".

### 🟢 Complete mobile adaptation
Upstream has no systematic touch interaction. This project adds a mobile toolbar, back gesture, right-panel state restore, top-bar collapse, WeChat-style input matrix, thinking menu, long-press keep-awake and more (`AppShell.mobile*`, `ChatInput.mobile*`); small screens are a redesign of input and navigation, not a shrunken desktop.

### 🔵 Conversation branch navigation
Upstream has dual branching; this project adds `BranchNavigator`: browse the branch tree, preview and switch to any leaf, and jump from a quote to the corresponding branch. No more getting lost when trying alternatives in a long session.

### 🔵 MCP secret masking (host side)
When the settings panel shows MCP configuration, credentials in URLs and arguments are masked automatically, and sensitive env/header values never reach the browser (`lib/mcp-secrets.ts`). This is a different line of defense from `pi-secret-mask` (masking in the conversation).

### 🟢 Session deletion to trash + branch batch deletion
Upstream deletes directly. This project moves session files to the XDG desktop trash with restore information, so they can be recovered from a file manager; it also offers "delete all sessions in a project", cascading cleanup of sub-agents, detached wrappers, pins and archive records so no orphan processes are left behind.

### 🔵 Completion notification system
A single browser chime at the end of a run (never duplicated), an unread badge on the favicon, and Web Push desktop notifications — you will not miss a result even while working in another tab.

### 🔵 Auto-naming and run-outcome detection
A session title is generated after the first turn; a unified run-outcome classifier stops failures from being reported as "task completed", so sidebar state and notifications agree.

### 🟢 Refresh prompt when another client writes
A session file can be written by another client (for example the zcode desktop app continuing the conversation). The message area then shows a "Refresh session content" hint; one click reloads it without reopening the session.

### 🟢 Task list progress
Multi-step tasks show a `done/total` progress bar in the composer; click it to open the task list, so you can see how many steps remain while the run is in flight.

### 🔵 Git worktree workspace enhancements
Upstream can switch worktrees; this project further groups and sorts sessions by project and worktree, supports renaming and drag-and-drop, offers a branch / worktree picker when creating a session in `session-manager`, and coordinates with the `aiti-git-ops` write gate.

### 🔵 Chat appearance and composer continuity
Content width (820–2000px), fonts, terminal theme and other appearance preferences persist; drafts survive session switches, are compacted while idle, use a collapse-chain animation, and interrupted prompts can be restored (together with [aiti-draft-keeper](/en/extensions/aiti-draft-keeper.md) this forms the complete composer state machine, see §4).

### 🔵 Other detail enhancements
Open the workspace in the system file manager with one click; Debian-style version comparison for self-update prompts; Esc in stacked dialogs closes only the topmost one (`stacked-dialog`); per-session statistics and HTML export; direct file-manager jumps and viewer window focus forwarding.

---

## 4. 🟢 Composer and messages (all in-house extensions)

The composer and message area are the two most-clicked surfaces every day. Upstream treats them as a "send control + read-only text"; this project turns the chain into a stateful, recoverable, operable workflow: **input → complete → queue → send → read → quote → listen**. Each link is taken over by a dedicated extension, and the host keeps only thin contracts (data and RPC in core, UI and policy in extensions), so disabling any extension falls back to a usable state without losing data.

#### Composer key semantics (quick reference)

Running-state Enter semantics are a deliberate change from upstream: upstream Enter steers immediately and `Alt+Enter` queues; this project flips it so the non-destructive queue is the default and steering needs an explicit key.

| Context | Key | Behavior |
|---|---|---|
| Idle | `Enter` | Send (switchable to `Ctrl/Cmd+Enter` in settings); `Shift+Enter` inserts a newline |
| Running, text present | `Enter` | Queue as a follow-up, sent in order after the current turn |
| Running, text present | `Alt/Option+Enter` | Steer immediately, ahead of the current turn; falls back to queueing when the backend cannot steer |
| Running, empty input | `Enter` / `Alt+Enter` | Promote the first queued follow-up to a steer — **Enter to queue, Enter again to steer** |
| Running | `Esc` | Abort the current run (not while a menu is open or IME composition is active) |
| Empty input | `↑` | With queued messages: recall the last one for editing (sending puts it back at its queue slot); without: page back through session input history shell-style |
| Empty input | `Shift+↑` | Open the input-history menu; `↑/↓` browse, `Enter`/`Tab` pick |
| While editing a recalled item | `↑ / ↓` | Switch editing between queue entries; each still returns to its original slot |
| Composer | `/` | Slash-command candidates (extensions / prompts / skills in one search); `↑↓←→` navigate, `Tab`/`Enter` complete |
| Composer | `@` | File candidates; `↑/↓` navigate, `Tab`/`Enter` complete |
| IME composition | `Enter` | Confirms the candidate only, never sends by accident (short grace period after composition ends) |

#### Input intelligence ([aiti-ai-input](/en/extensions/aiti-ai-input.md))

**Two-tier autocomplete**: after 700 ms of typing inactivity with the caret at the end, the composer shows the next phrase as gray text — `Tab` / `→` accepts, `Esc` or typing dismisses.

- **L0 local tier (zero model, instant)**: first checks saved prompts and session history inputs, with a server-side prefix match; a hit is shown immediately with a "↦saved / ↦history" badge and makes no model request.
- **L1 AI tier**: only when L0 misses, a small request to the same model returns a longer continuation in 0.4–2 seconds.
- **Three governance controls**: master switch, `localOnly` (L0 only, zero egress), minimum trigger length (default 3, weighted 1.5 for CJK); the context budget has low/medium/high tiers so a continuation cannot silently stuff in the whole long context.

**Saved-prompt suggestions (suggest)**: typing a prefix opens a candidate panel, with static candidates first — commands ⚡ (rank 0), prompts 📌 (rank 1), app commands (click executes directly instead of inserting text) — and AI fallback only when none match. Desktop uses a fixed popup (`↑↓` / `Tab` / `Enter` / `Esc` full keyboard), mobile uses an inline suggestion strip (tap to apply). Suggestion sources are extensible: any extension can register its own provider, and `suggest.looseLen` controls strict filtering for short input.

**Speech input (three layers, each optional)**:

1. **Dictation detection + repair** (off by default): pure browser event features (`beforeinput` inputType + rhythm) decide whether text came from speech or very fast typing, with zero server dependency; on a hit, a "🎤 checking and repairing transcription" bar appears above the composer, and on send only ambiguous spots get AI spelling repair with replacement suggestions instead of a full rewrite.
2. **🎤 Real-time ASR (push to talk)**: streaming WebSocket recognition + VAD auto-splitting (~0.7 s) + pseudo-real-time segmentation (SenseVoice), then a 2-pass offline refinement (Qwen3-ASR) on release.
3. **Pluggable engines**: self-hosted 8767 (FunASR / Qwen3 / GLM, true streaming + model-level hotwords), the iFlytek local bridge 8768, Baidu / SiliconFlow / Azure / any OpenAI-compatible endpoint; switch engines in the panel, and keys are echoed only as the last 4 characters. The self-hosted service can be started automatically by the extension through the `aiti-cmd` PTY runner (60 s breaker, 120 s anti-repeat), so no manual service start.

**Hotwords, statistics and mobile**: the `session-manager` hotwords service extracts terms per workspace, merges them with the user dictionary (≤500 entries), and pushes them to the recognition engine per ws as bias (hashed key + 10-minute TTL debounce); the right-panel "speech traffic" tab shows usage per engine. On touch devices, when the composer is focused and the caret is not at the start, an "⏎ newline" pill stays above it, filling the gap left by mobile keyboards without `Shift+Enter`; the desktop is unaffected.

#### Composer as an operation hub (command direct, `aiti-ai-input` + `aiti-app-center`)
Type a word in the composer and get work done: type "model" → the suggestion area offers **select model**; clicking opens the model selector in place, closes back into the composer and **leaves the caret there** — no toolbar, no leaving the input flow; type "compact" → triggers context compaction for the current session (the same path as the compact button in the session info panel, with no re-entry while compacting or queued).

Mechanically this is a fixed pattern: **any extension that registers an entry in the `commands` directory slot gets both an App Center card and a composer command candidate** (pinnable, searchable, click-to-execute, never inserting text into the composer), with zero host changes. Capabilities already shipped this way include opening a terminal (`aiti-folder`), the container panel (`aiti-containers`), models and compaction (this item); session switching, thinking level, export and branching can follow the same pattern — the vision is "one word or one sentence invokes any operation, and execution returns you to the composer" as the default interaction.

Keywords are no longer hard-coded by the app center either: extensions declare their own search terms via entry-level `meta.keywords` / top-level `keywords` (Chinese and English aliases work), and App Center only consumes them with a fallback — a new extension brings its own vocabulary and cannot be missed because someone "forgot to register it".

#### Draft Keeper ([aiti-draft-keeper](/en/extensions/aiti-draft-keeper.md))

In one line: **a crash can take the page away, but not the words you were halfway through typing.** It is the sole owner of the composer draft state machine (v2 intent contract), and it is more than "save every few seconds":

- **One shared slot per session**: tabs opened on the same session share the same draft; switching sessions, closing the page, refreshing or crashing restores it verbatim. Restore waits for host hydration (`pi-web:hydrated` signal + stage replay) so a first-render mismatch cannot wipe it.
- **Only real input is written**: `onChange` writes only when the content actually changed (a snapshot equal to the known text is skipped), and clearing after send waits 300 ms for confirmation. Scans are read-only: an empty box with stored text restores silently, stored text that is a superset of the known text syncs into the box, and the `onChange` in the recovery round returns immediately — preventing "restore deletes it".
- **`applyIntent` is the only write entry of the v2 contract**: when a provisional session is promoted to a real id (`sessionCreated`), the provisional draft is invalidated, new input during the promotion window is redirected to the real slot, and the whole `new:<cwd>` in-memory family is cleared so already-sent content cannot linger in the "new session" box; on a rejected send (`rejected`) the submitted original is merged back into the draft (submitted first, original after) and written back into the composer.
- **Cleanup and migration**: `pruneStale()` runs once at registration and removes slots untouched for 7 days (including old per-tab leftovers and the timestamp-less old format), with no polling; old `crashrestore-<key>-<tabId>` slots merge into the new per-cwd shared slot on first read.

> Value: switching sessions to look something up, opening a second tab to compare, editing a request while the AI replies, a browser crash, a failed send — none of these eat the text you had half-typed.

#### Queue Keeper ([aiti-queue-keeper](/en/extensions/aiti-queue-keeper.md))

While the AI is busy you can queue your thoughts, and the queue itself is operable:

- **Full panel**: banner collapse/expand, entry count and "recall all"; row operations include ↑↓ move, drag reorder (separate desktop HTML5 and mobile touch implementations), **steer jump-send**, convert to follow-up, recall one entry for editing, delete.
- **Undoable**: soft-delete into a recycle bin (restore / purge with confirmation), and an 8-second undo after deletion; JSON import/export (imports are staged and restored entry by entry), with notices even for an empty queue.
- **No storage of its own**: the queue mirror, sidecar persistence, 12 RPCs and the recycle bin all live in the host core; the extension only renders UI and routes every operation through the `actions` primitives. Disabling the extension falls back to the host's upstream-shaped banner with no data loss in any state; turning off `queuePanel.enabled` takes effect immediately without a page refresh.
- **Coordination with Draft Keeper**: the two never talk directly; they meet through core contracts — draft recovery items and queue recovery items merge in the same recovery dialog; the draft's "re-queue" enters through core `queueFollowUp` (rendered by this extension); recalling a row writes back through core edit-intent (Draft Keeper sees the same value via `onChange`).

Host queue persistence is the other half: steer / follow-up queues are mirrored to a sidecar file, and after a service restart a recovery dialog resolves entries one by one (resend / drop / later) and **never auto-delivers**; `aiti-recovery` presents interrupted sessions and pending queues together.

When a run ends, the "Continue" button next to the composer sends "continue" in one click; with a non-empty queue the same button becomes "Run queue now", delivering every queued message in order. A recalled queue item returns to its original slot after sending, and `↑/↓` switches editing between queue entries.

#### Message intelligence ([aiti-msg-smart](/en/extensions/aiti-msg-smart.md))

Turns AI messages from "read-only text" into "clickable rich text":

- **Click a paragraph / heading / list / table row**: an action card offers copy full text / quote (whole or one sentence) / option buttons (yes-no, A-B, which prefill a reply when clicked).
- **Click a code line**: copy the line / quote the line, and highlight that line in the original text (following the scroll); hovering the "quote sentence" button highlights the corresponding clause in the original.
- **Inline code**: one click copies it, with an extensible mini action layer (copy by default; other extensions can add actions).
- **Pluggable recognizers (each toggleable via features)**: closed questions → yes/no and A/B options; file/directory paths → 📂 open + 📁 reveal (existence check, silent on 404); http(s) links → open in a new window; any paragraph → copy / quote; selected text → popup copy / quote as a reply (current session) / quote into a new session. When the main cwd misses, the session's identified repositories from `aiti-git-trace` can resolve files across repositories.
- **Clear boundary**: core only provides the thin extension point ("paragraph click broadcast + host capability pass-through"), while recognition, decisions, UI and copy all live in the extension; adding a clickable scenario only requires the extension to declare clickable tags, with no core change. Other extensions can also register `msg-popover-action` / `inline-code-action` to add their own actions to the popup.

#### Message anchors and navigation ([aiti-msg-anchor](/en/extensions/aiti-msg-anchor.md) + [aiti-msg-nav](/en/extensions/aiti-msg-nav.md))

Two spatial-orientation tools for long conversations, pure front-end with zero server APIs:

- **Anchor banner**: each user input and the replies that follow form a turn segment; while scrolling, the banner follows the turn segment at the top edge of the viewport and shows "which input produced what is on screen" plus its index/total; clicking the banner smoothly jumps back to that input. When the anchor input is already visible on screen the banner hides itself, and it fades out 6 seconds after scrolling stops. It can switch to the first input / latest input / session title.
- **Navigation rail**: jump to the earliest (triggering lazy pagination that loads earlier messages and preserves the viewport), previous / next user input, latest; long-pressing "latest" uses the Screen Wake Lock to keep the screen awake (automatic fallback when unsupported); the whole rail can be dragged anywhere in the message area and remembers its position.

#### Message sharing ([aiti-msg-share](/en/extensions/aiti-msg-share.md))
A whole session, a single message, a selection, files and images can all be shared through pluggable targets (Gitee / image host / object storage / note archive); secrets are masked before upload, and the generated link comes with a QR code. Targets are not hard-coded: the audit directory can act as a remote overlay for hot updates; a share-sink extension point also lets other extensions collect shared content into their own favorites or command library.

#### Follow-along reading ([aiti-ai-speek](/en/extensions/aiti-ai-speek.md))

"Follow along" is not a play button on one message; it **turns reading mode into audiobook mode**:

- **Toggle in the toolbar**: 🔊 off means truly zero cost (no SSE subscription, no message-list fetch, no requests, and no message count on the speaker); clicking it puts this session into follow mode, and every completed reply is queued in order without interrupting the one being read.
- **Persistent playback bar**: ⏮ previous sentence / ⏯ play-pause / ⏭ skip this reply / ⏹ stop (clears the queue and returns to reading mode), rate 0.75–2x, live voice switching, and a queue counter ("2/5"); switching to another session and back resumes from the last position, and a page refresh restores deterministically (independent of component timing).
- **Follow highlight (audiobook style)**: the sentence being read is circled in the message flow and auto-scrolled according to `smart` (default, intelligent follow) / `always` (always pull back) / `off` (highlight only, no scroll); if the user deliberately scrolls away it does not yank them back, offering "jump back to the reading position / read from this page" buttons instead.
- **Three engines**: browser Web Speech (zero-dependency fallback), edge-tts (server-side synthesis, more natural voices), local ONNX (Hojo-TTS-Light 40M/80M, CPU-friendly; 40M ships 17 built-in voices, and 80M can clone a voice from 3–30 seconds of reference audio, bootstrapping venv and models automatically and exiting after 30 idle minutes). The local service exposes an OpenAI-compatible `/v1/audio/speech` on 8768 by default (auto-incrementing when busy), so other clients can reuse it too.
- **Bandwidth and details**: sentence-level prefetch (current + next 3), synthesis results cached in a pool keyed by "engine + voice + rate + text" so replays do not re-synthesize; a short-reply threshold (default 8 characters) keeps "ok" and "got it" from being read; reading content can switch between "full / essentials"; enabling follow mode can inject a one-time "reading mode" prompt into the session (asking the AI for conclusion-first, conversational output that is easier to listen to); whether to keep reading in a background tab is also a switch.
- **Beyond chat**: the 🔊 button in the editor and file preview reads file text in chunks with line-level follow; other extensions can call `aiti-ai-speek.speak` for one-off announcements or use the server-side `tts` service directly.

#### Prompts ([aiti-prompts](/en/extensions/aiti-prompts.md))
Frequently used prompts are saved as a grouped snippet library; it can extract from session history, save on input, and receive favorites from `aiti-msg-share` — reuse recurring wording with one click.

#### Appended system prompt ([aiti-append-system](/en/extensions/aiti-append-system.md))
Edit global and project-level "permanent memory" rule files directly in the browser, or let the AI draft them, without logging into the server to edit files by hand.

#### Scheduled tasks ([aiti-ai-schedule](/en/extensions/aiti-ai-schedule.md))
A resident scheduler: extensions can declaratively register periodic tasks, and both users and the AI can create plans (cron / interval / one-shot) with three execution modes, an AI plan-building tool and a management page; backup and model probing extensions run on it.

#### Session search ([pi-session-search](/en/extensions/pi-session-search.md) · pi plugin)
Gives the AI a tool to search past sessions: after context compaction the agent can go back to the original text of "where we left off" and continue, effectively adding a long-term memory index to sessions.

---

## 5. 🟢 Models and usage (all in-house)

#### Model wizard (`aiti-model-wizard`)
Catalog search (models.dev + Chinese AI directories, bilingual, and an API URL can be reverse-looked-up) → enter token → connectivity test (2xx / 429 both pass) → pick or type a model → write `models.json`; when nothing is found, it can extract a baseUrl from any document or code snippet for reverse matching, auto-detect missing v1/v2 prefixes, and infer the brand from OpenAPI or model prefixes. Tokens are masked and never returned to the front end when editing; export/import uses a whitelist of fields and never carries plaintext keys.

#### Multi-model config import (`aiti-models-import`)
Scans existing provider and model configuration in Codex / ZCode / OpenCode, drafts an import, and guides a one-time import on first launch; every write goes through the wizard's `saveBatch` and can be undone in one step — never a direct write to `models.json`.

#### Model list and multi-key rotation (`pi-models-combo` · pi plugin)
A leaner model list (filtered to what you need), sticky rotation across multiple API keys to avoid rate limits, and aggregation of several providers into one "combo model" — one model name routed to different backends by policy.

#### Provider balance (`aiti-provider-usage`)
Balance / quota queries for 16 adapter ids; a "remaining quota" block sits in the session info panel with the current session expanded first; the overview has a 5-minute TTL cache plus manual refresh, and it is aware of multi-key pool totals.

#### Token usage reports (`aiti-ai-usage`)
See "Signature two" — multi-dimensional pivots, Sankey charts, CSV, its own SQLite, external agent usage ingestion: the core of the whole statistics system.

#### Model health checks (`aiti-model-check`)
Minimal probe messages test each model's availability / rate limiting / errors, parse rate-limit recovery times, record historical availability windows, and remind locally when a long rate limit expires (zero extra probe cost).

#### Context meter (`aiti-ctx-meter`)
A vertical ratio bar in the desktop `compactLead` slot plus a lead position in the mobile `modelInfoLead` slot, four urgency color tiers and a critical breathing effect, clicking through to the host session statistics panel.

#### Recently used models (`aiti-model-recent`)
A pure service extension (no UI): the model picker's recent segment reads it synchronously, pick events enter an LRU; compatible with the old localStorage key, zero migration.

---

## 6. 🟢 Security and data (all in-house)

#### Secret masking (`pi-secret-mask` · pi plugin)
"Paste anything, leak nothing": tokens / API keys pasted into a prompt become placeholders before reaching the model and are restored only when a tool runs; deterministic masking plus a `/secret` command for management. Best for temporary values, not persisted across sessions.

#### Secret vault (`pi-secret-vault` · pi plugin)
For cross-session, encrypted-at-rest storage and alias lookup by the model, use the persistent version: the model only sees `rsec_<hash8>` tokens, while adding, editing, deleting and revealing plaintext are always human actions. It shares the same engine with mask and they are mutually exclusive in a session (when vault is preferred, mask disables itself).

#### Vault management (`aiti-secret-vault`)
The web management UI: list aliases / add / rotate / reveal / delete, lock and unlock with either a keyfile or the system keychain, and see which aliases each session has mounted — values never enter the AI conversation.

#### Configuration safety net (`aiti-configs`)
When AI or a human breaks a config or an extension, there is a diff to inspect, a change to blame and one-click restore; an independent command-line sentinel covers crashes without depending on the broken system itself.

#### Data snapshot backup (`aiti-backup`)
Hard-link incremental snapshots for large state-layer data (sessions and more): each round is a full point-in-time copy plus a manifest completion marker, and files with the same path, size and mtime are linked zero-copy; when the target disk does not support hard links (exFAT and friends) the round degrades to a full copy automatically. Sources are strictly read-only (symlinks are not followed), scanning and copying run in a subprocess with progress on the event bus; a kill mid-run only leaves `.tmp-*` cleaned up by the next round, and each source takes a run lock; keepCount rotation only deletes snapshot directories.

#### Device pairing (`aiti-pair`)
Devices connected to the same bridge (mobile browser / another computer / agent session / injected page) can message each other and transfer files — cross-device collaboration without building your own relay.

#### Recovery wizard (`aiti-recovery`)
After an interrupted session, queued messages and interrupted tasks each get a choice; the red line is **never auto-deliver**, and continuing only sends "continue" — recovery is always a human decision.

---

## 7. 🟢 Git, debugging and infrastructure (all in-house extensions/plugins)

#### In-page AI debug assistant (`aiti-devtools`)
The core capability: turn any web page into a debugging scene where AI can collaborate. Point at an element and its structured information reaches the AI directly; the AI can run DevTools-like DOM / CSS / input / performance operations, and can ask the user questions or request element picks — human and AI debug side by side on the same page. It ships vite / webpack / nuxt carrier plugins, a VS Code extension and a browser extension, with the bridge protocol provided by an independent core package.

#### Git change review (`aiti-git-review`)
Dedicated to reviewing uncommitted code: a Monaco diff workspace (side-by-side / inline / new-only / outline), line-level tags for "must fix / suggestion / question", anchor-marker line remapping so annotations survive edits during review, and a final review checklist; `aiti_review_*` tools are injected only into review sessions, so everyday sessions carry zero tool overhead.

#### Git write operations (`aiti-git-ops`)
A whitelisted git write engine: checkout preflight, stash, plan checkpoints, full audit, changed topics; consumed by the file browser and session manager so the AI can make safe git writes without losing work.

#### AI change tracing (`aiti-git-trace` / `pi-git-trace`)
An out-of-tree trace repository `.aiti-trace`, auto-initialized even in directories without git; each change gets a before/after commit pair keyed by op number, so file ⇄ message ⇄ operation is traceable end to end, with one-click revert and shadow-repo compaction. Both share one engine: `aiti-git-trace` is the workbench extension (every file in the file browser carries a "⎇ file timeline" that opens that file's change history directly), `pi-git-trace` serves pure CLI users.

#### Service tunnels (`service-tunnels`)
Expose local services to the public internet with one command: automatic port discovery (service detection / custom names), five exposure modes (tunnel / vhost / mixed / router mapping / direct IPv6), an auth gateway (portal / TOTP / face and voice), DDNS auto-resolution and a network doctor. This exposure layer is unique to the project.

#### Command center (`aiti-cmd`)
One extension, three apps: command favorites (groups / tags / lexicon + one-click run), running (terminal sessions / agent commands / execution history) and a real PTY terminal; plus message recognition, a composer runtime entry and a unified cross-extension execution outlet. Terminal sessions survive reloads and restarts.

#### Container management (`aiti-containers`)
One panel for containers, images, volumes, networks and compose projects (docker / podman / nerdctl), with start/stop, logs and cleanup coverage, linked to the service-tunnels port page. Dangerous actions share one confirmation protocol: the UI enters "click again within 5 seconds", the API returns 428 + a danger description without `confirm:true`, and the AI must show the exact action to the user and get explicit consent before retrying.

#### Terminal bridge to the browser (`pi-web-bridge` · pi plugin)
Run the pi TUI in a terminal as usual, then type `/web` to open the same session live in the browser with bidirectional IO (prompt / steer / follow-up / abort / model switch), queued-message echo and image attachment pass-through — hand off between terminal and browser at any time.

#### Headless-server graphics environment (`aiti-ui-env`)
Allocates a virtual desktop for servers without a display: a four-state mode decides the display environment for newly started MCPs/apps, Xvfb + openbox + AT-SPI virtual screens, VNC-on-web and RDP-on-web, serviced on Linux / Windows / macOS; the VNC password is authenticated by the VNC server itself, and the bridge only passes it through.

#### Remote debug injection (`aiti-debug-inject`)
Injects another workbench instance's debugger into this instance's page, making it easy for developers to troubleshoot a deployed instance remotely; the service address is a text feature in extension management, off by default and enabled on demand.

#### Smoothness meter (`aiti-cpu-meter`)
See "Signature two" — a 0–100 smoothness score, color tiers, minimized residency and AI stall debugging. Three injection channels: service-tunnels-proxied sites inject directly, any site works via the bookmarklet, and cross-instance injection (`service.url` + `inject.enabled`); `window.__aitiCpuMeter.report()` returns the score, long tasks, LoAF script attribution and session-level time-weighted averages — in-extension build plus a standalone single-file build.

---

## 8. 🟢 Multi-agent ecosystem (all in-house extensions)

### Unified entry and orchestration

#### pi multi-session (`aiti-pi-agent`)
`pi --mode rpc` subprocesses as sessions, multiple sessions without interference — the main path for running pi in the browser; the startup model aligns with `agentRunModelRef`, so the selected model is the model actually used.

#### Generic ACP backend (`aiti-acp-agent`)
One adapter for every Agent Client Protocol agent: 25 built-in auto-detected agents plus a custom-backend panel, unified auth cards, queues, model catalogs and permission policy; the whole line supports detached hosting.

#### Sub-agent fleet (`aiti-subagents`)
Observe and control parallel sub-agents in the UI: start delegations, watch progress events, manage concurrency settings; the fork engine and tool surface come from the pi sub-agent system, while the workbench provides visualization and run control.

#### Agent account management (`aiti-agent-manager`)
One panel aggregates external agents' login state, login-action proxying, multi-account profiles (backup / alias / one-click switch) and account quota display — it implements no login protocol itself, only aggregation and switching.

#### Custom backends (`aiti-custom-agent`)
Register any CLI as a session backend with a form: startup command, argument prefix, member env, bridge mode, hot-applied on save; the generic driver spawns one-shot and supports Dockerization, command wrapping and multiple configs for the same CLI.

#### AI helper entry (`aiti-helper`)
A unified "one-sentence AI capability entry" for every extension panel: declarative AI help points (pi skills standard) + input / result preview / review write-back + a streaming progress bus + multi-turn follow-ups and history; users can also write their own skills.

### CLI integration family (each vendor's private session format has been handled)

| Extension | Integration target and differences |
|---|---|
| `aiti-claude-code-agent` | Claude Code CLI: `agentKey: claude`, restores history from All Sessions, 2.1.318+ three-level keyring credential resolution for login state |
| `aiti-codex-agent` | OpenAI Codex CLI: `exec --json` + `resume`, auth.json OAuth / openrouter env dual track, live and cold replay share the same native tool cards |
| `aiti-cursor-agent` | Cursor Agent CLI: stream-json print + `--resume` multi-turn, plus read-only parsing of Cursor IDE history |
| `aiti-codebuddy-agent` | Tencent CodeBuddy Code CLI: stream long connection (default) + exec fallback, three control_request channels, API-key env login, detached hosting |
| `aiti-qoder-agent` | Qoder CLI international/domestic versions: quota queries, WASM-signed model catalog, scheduled-task mirroring, run queue management, plan/permission modes |
| `aiti-zcode-agent` | Zhipu ZCode desktop runtime: app-server long-lived (streaming / tool cards / steer / attachments) + oneshot fallback, compliant with GLM coding plans |
| `aiti-omp-agent` | Oh My Pi (the largest pi fork): `omp --mode rpc` subprocess + ready handshake / get_state capability surface / host tools / login / branch |
| `aiti-attach-agent` | Attach over socket to an already-running agent process (pi TUI bridge): `PI_WEB_BRIDGE_AUTO=1` fully automatic, followUp echo + image pass-through + idle timeout exit |
| `aiti-testagent` | Java backend AI debugging: process scan / attach to bridge / Tunnel multi-endpoint management, in-JVM modification, mocks, SQL interception, hot reload, diagnostic sampling, 57 tools exposed on demand and fully reversible |
| `aiti-testagent-native` | Live control of Windows native processes: a visual panel for broker processes / sessions / hooks / event streams |

> Same shape, different sources: all of these turn a vendor's session into "one row in the workbench + a continuable session", but each vendor's login state, streaming protocol, history storage and tool-card format differ — most of the adaptation work is in those details.

---

## 9. 🟢 Office and documents (all in-house extensions)

#### File browser (`aiti-folder`)
Takes over the `fileViewer` folder view and the `pathPicker` directory picker: browse and delete like a local file manager (deleted items go to trash and can be recovered), with a git toolbar and a commit plan grouped by branch (soft dependency on `aiti-git-ops`); it can also reuse the doc center's full-text search for document search. The v2 multi-instance dock supports several directories at once, each dockable in the left sidebar / right panel or a floating window; the ⋮ menu can 📌 pin common directories, and unpinned ones are kept FIFO (default 3, configurable 1–9).

#### Code/file editor (`aiti-editor`)
Monaco editing with save (mtime conflict 409, allowlist and size checks), diff view, archive parsing and a unified image viewer (message images and file images in one, zoom / pinch / info panel) — the shared base for all document editing experiences.

#### Online spreadsheets (`aiti-sheet-univer`)
`.xlsx/.xlsm` online preview + editing (exceljs data layer + Univer view layer); `.xls/.ods` read-only preview with one-click conversion to `.xlsx` — edit sheets without installing Office.

#### Word, three tiers
`aiti-word-docx-preview` provides high-fidelity read-only preview (pagination / headers and footers / tables / images / list restoration); `aiti-word-superdoc` uses SuperDoc (ProseMirror docx round-trip) for online editing that preserves formatting; `aiti-onlyoffice` connects to OnlyOffice DocumentServer for fully faithful Word / Excel / PPT preview and editing (AGPL community edition, off by default). Install tiers as needed: OnlyOffice for heavy office work, the preview build for lightweight viewing.

#### Document center (`aiti-doc-center`)
Automatically collects Markdown documents in the workspace, with FTS5 trigram Chinese full-text search, a two-level tag system from seven sources and four floating views; it supports smart sorting, tag rename/export and reverse lookup of "which sessions wrote this document" — no more digging through directories.

#### Mail sending (`aiti-mail`)
The workbench's unified mail outlet: a zero-dependency SMTP client + send history (SQLite) + configuration/test/history dialogs; tunnel lifecycle notifications and similar flows are built on it.

#### IM channel integration (`aiti-channels`)
Hosts the cc-connect process, providing overview / project / channel / session panels and a socket API for outbound messages, bringing DingTalk, Feishu and other chat channels into the workbench.

---

## 10. 🟢 UI and framework (all in-house extensions)

#### Session manager (`session-manager`)
Manages all sessions across projects: tag tree with colors, favorites, FTS5 search, advanced agent/tag filters, archive and a board overview; new sessions can pick a branch or worktree, it carries the All Sessions sidebar DockStack orchestration, and it parses history from 23 agents. With multiple workspaces running, projects can be 📌 pinned, drag-reordered, hidden or moved/archived as a group; switching projects also automatically asks `aiti-folder` to open a folder instance for the new working directory (see "five signatures").

#### App center (`aiti-app-center`)
The "start menu" after all left-sidebar blocks collapse: an app view (action / panel / management entry cards, hover shortcuts to pin + info pages) and a switch view (feature toggles grouped by extension), two views toggled in one row; tag categories, per-view search, and edit mode for ordering / hiding / restoring.

#### Agent badge (`aiti-agent-badge`)
The agent badge in the composer toolbar (bottom of the ＋ sheet on mobile): filled dot = a turn is running, filled muted = the process is alive but idle, hollow = a cold session with no live process. Clicking opens a compact switch panel where the hosting mode (in-process / subprocess / subprocess-detached) can be changed — it decides whether this session keeps running across a pi-web restart or extension reload.

#### Session request cards (`aiti-session-cards`)
Presents AI plan approvals, AskUser questions, OAuth authorization, tool authorization and similar requests as clear cards that can be understood and confirmed at a glance, covering zcode / omp / generic interaction primitives.

#### Floating panels (`aiti-float`)
The `data-ext-float` contract takeover: drag, edge resize, position persistence, click-to-front, double-click reset, an automatic maximize button, full screen on small screens with system-back to close; it also provides the DockStack left-sidebar block-stack service — the base that makes "every dialog equally usable".

#### Quick start (`aiti-quickstart`)
The new-session welcome page offers getting-started steps, shortcuts, task runtime and example prompts; the workspace Hub supports git clone / zip upload / local directory / new directory; there are also a fully collapsed left-sidebar guide card and static sidebar entries.

#### Extension manager (`aiti-extman`)
Search / install / enable / disable extensions in the UI, install-on-demand from the online registry; shared dependencies are reconciled by it, with no manual file editing.

#### Page event bus (`aiti-event-bus`)
Takes over the page event layer: topic subscriptions with server-side filtering, a publish-local channel for high-frequency frames, load-priority guarantees and silent STALE_CONN rebuilds — extensions can therefore refresh in real time (sidebar state, run progress) without dropping on connection jitter.

#### Server status monitor (`aiti-sysmon`)
A left-sidebar dock panel that watches the host's health: an OS header (hostname / distro / kernel / uptime), a large CPU load percentage + 60-point mini history + per-core bars + loadavg + temperature, memory and swap bars, per-mount disk bars (amber ≥80% / red ≥90%, noisy mounts filtered), per-NIC live up/down rates and totals (loopback and docker bridges filtered, VPNs kept, non-up interfaces dimmed). Temperature uses the full `/sys/class/hwmon` sensor set and colors by threshold; the toolbar can pause / refresh manually / switch 2s·5s·15s sampling. No background timers at all — sampling runs only while the panel is open, the tab is visible and not paused, and stops when collapsed; slow-moving data is cached server-side with a TTL, and history is memory-only.

#### One-click feedback (`aiti-feedback`)
Report a problem straight from the UI: fill the dialog → preview the **already-sanitized** final content live → open a **prefilled GitHub issue** in one click, then log in and submit. Zero tokens, zero server. The privacy model is concrete: preview is the final content (internal domains / private IPs / internal repo names / paths / common token shapes all become placeholders), environment info is checked by default but can be turned off (query stripped), session content is **never read automatically** and only an opt-in paste box is provided; over-long GitHub prefill is truncated, with the full text always copied to the clipboard as a fallback.

---

## 11. Platform and integration layer (beyond the web workbench)

Everything above runs inside the workbench process. There is a broader integration layer that connects to other dev tools and endpoints over the same protocol:

| Integration | Form | Purpose |
|---|---|---|
| `aiti-devtools` carrier plugins (vite / webpack / nuxt) | npm package | Embeds the bridge and MCP in the dev server (same-origin `/aiti/`) + auto-injects the launcher + registers MCP on startup, with zero changes to application code |
| `browser-ext` | Browser extension | Injects the in-page AI debug assistant into any page (no app changes): FAB + Inspector + AI window, Chrome / Edge / Firefox (including Firefox Android) |
| `vscode-ext` | VS Code extension | Inject + connect the bridge + MCP wiring + jump to the AI window inside the editor |
| OpenCode / OpenClaw / DSH adapter extensions | Host adapters | Port devtools capabilities to OpenCode / OpenClaw / DSH hosts |
| `dsh-secret-mask` / `dsh-market` | Plugin and market index | The DSH-side masking plugin and plugin market index (index v1 drafted) |
| `aiti-desktop-widget` | Desktop widget shell | A frameless, transparent, always-on-top, click-through/draggable desktop widget shell that loads any http(s) page or local HTML; supports choosing a display and runtime repositioning; used for desktop subtitles, floating icons, status cards and desktop pets (the video studio's live subtitle window relies on it) |
| `aiti-bridge` + stdio shim | Standalone service | Page connection / SSE / tool execution / MCP JSON-RPC share one port (default 127.0.0.1:8777), so any standard MCP client can connect |
| `aiti-widget-interaction` | Package | Host-managed asynchronous user interaction (confirm / choose / input): SSE + HTTP, a pending queue and a browser renderer, reused by all widgets |
| `relay-worker` | Edge service | A relay worker deployed on Vercel, forwarding cross-network bridge/device connections |

> These integrations share several core packages: `aiti-devtools-core` (bridge core: page ⇄ agent message/session bridge, Streamable HTTP MCP endpoint, browser protocol), `aiti-devtools-inject` (injection SDK and artifacts: launcher + client, host/iframe routing), `aiti-devtools-agent` (multi-agent host wiring framework), `aiti-devtools-pi` (pi CLI connector), `aiti-devtools-vite`, `aiti-devtools-webpack`, `aiti-devtools-nuxt` (the three carrier plugins), `secret-mask-core` / `secret-vault-core` (the shared masking and vault engines used by the Web, pi and DSH versions — any TS/JS agent can integrate).

### 🟢 Video studio (`aiti-video-studio`)

Turns "demo video" into a reproducible engineering artifact instead of manual screen recording and editing. The core idea: **AI writes the script during authoring; runtime has zero AI** — you type, it produces the video.

- **One pipeline end to end**: the AI reads the video-authoring skill → explores the target site (dry-run probe) → writes `scene.json` (steps + narration nodes + overlay layer) → validates with `/dryrun` → TTS first (content-hash cache, known durations) → deterministic replay in chromium with frame capture → ffmpeg composition → `final.mp4` + subtitles + chapters + report + waveform. A structured editor in the panel also lets you make videos without writing JSON.
- **Frame-accurate deterministic recording**: CDP grabs JPEG frames at paint time and stitches them (no white flashes, sharp text), with `recordVideo` as a fallback; each step stays on screen exactly as long as its narration, so picture and sound align naturally.
- **Real interactions that feel live**: a pseudo cursor ring + click ripples (rings only on click optionally) that survive navigation; four effect types (spotlight / focus ring / dim surroundings / confetti) timed automatically by narration.
- **Sixteen overlay blocks**: lower thirds, title cards, annotations, badges, arrows, image cards, plus 13 built-in blocks (tweets, macOS notifications, YT lower thirds, data charts, Spotify cards, logo end cards, IG/TikTok follows, Reddit posts, flowcharts, app showcases, UI 3D reveals, custom local HTML); four transitions and three filter packs (`flash-white` / `chromatic` / `glitch`), with transition time kept outside narration.
- **Post-production included**: `zoompan` camera moves after export (accurate framing, overlays unaffected) + optional motion blur, studio-style framing (padding / radius / shadow / gradient background), CAS sharpening, BT.709 encoding, automatic hardware-encoder probing (nvenc/qsv/vaapi/videotoolbox all actually test-encoded), background music mixing + EBU R128 loudness normalization.
- **Multi-language output**: one script can produce one video per language, with independent voice mapping and subtitles per language; switch language in the panel.
- **Human involvement under control**: `user-confirm` steps show confirm/choose/input cards on the page and wait for a click; the wait can be cut from the video or kept. Two explicit AI triggers: `ai-decide` (let the AI pick a value from live page evidence into a script variable, with ask-the-human fallback) and `onError: ai-fix` (a failed step gets a JSON patch from the AI written back to `scene.json`, with a circuit-breaker limit).
- **Extensible real-machine scripts**: steps can reference project `scripts/*.mjs`, with multiple entries per module; project trust is bound to the script-tree hash, so changes invalidate it. A CodeMirror editor is built into the panel.
- **Privacy masking**: scene-level or step-level CSS selectors + mosaic / blur / cover rules; both img and video (camera picture-in-picture) can be masked, and they really do not appear in the recording.
- **Complete deliverables**: `final.mp4` (H.264/AAC), `final.srt`, `final.vtt`, `chapters.txt`, `report.md`, `waveform.png`, `timeline.json`, `meta.json`, per-step screenshots, plus 9:16 / 1:1 / GIF extra formats and clip extraction (mp4/gif).
- **Project management**: project sidebar (search / filter / status / pin), templates, rename (display name and directory id migrate together), duplicate, import/export, delete to the system trash, run cleanup, concurrent batch recording queue.
- **Live demo mode**: a separate subtitle bar window (hosted by `aiti-desktop-widget`) + on-the-spot voice playback; during a demo you can pause / resume / skip the current step / jump to any scene / stop; recording mode stays deterministic and refuses these controls.
- **Player**: play/pause, ±3 seconds, previous/next scene or chapter, a scene picker generated from `timeline.json`, and click-to-seek on any scene.

> TTS engines include edge (local CLI), any OpenAI-compatible `/v1/audio/speech`, ElevenLabs, Gemini, Sarvam and optional local kokoro-js. The design borrows ideas from Argo (`@argo-video/cli`, MIT) — TTS-first pacing, content-addressed cache, an overlay vocabulary, jpeg-stitch capture — and explicitly rejects a few (remote third-party HTML registries, WebGL pre-rendered transitions, waveform editors), with the reasoning documented in the extension docs. See [aiti-video-studio](/en/extensions/aiti-video-studio.md).

### 🟢 Workflow experiments (not released)

These extensions are still being honed in the experimental area and are not distributed with releases, but they point in a very different direction — **turning "write a plan before changing code" into a process the tools can sense, remind about and hold accountable**:

| Extension | Purpose |
|---|---|
| `aiti-plan-first` (plan first) | Event-driven through `aiti-git-trace` (push-listen architecture, zero scanning): a binding wizard pops up when a Markdown file changes (naming prefers matching plans), warns on a large change without a followed plan, and reminds "write the plan first" when the plan is ahead of the code; front-matter is the source of truth for tags, and the session row carries a 📋 binding marker |
| `aiti-plan-review` (plan acceptance) | The acceptance UI for Plan-Sandbox: reads the `review.json` contract and lists "declared vs other" differences; accept the selection and close the sandbox / save only / discard all; includes sandbox history (re-extract / reuse / destroy) |
| `aiti-echo-agent` (echo backend) | A demo session-provider backend for the multi-agent front end, used to validate the new-backend integration path |
| `aiti-updater` (upgrade panel) | Service management + upgrade orchestration panel driven by the service-tunnels API; currently a skeleton |

There are also `aiti-bridge-probe` (bridge connection diagnostics) and `demo-lazy` (lazy-loading demo), two diagnostic/example extensions.

---

## 12. Small features (handy additions)

These are small individually but handy day to day. They are additions not expanded above, all 🟢 in-house (a few are further polish on top of upstream, marked 🔵).

### Chat and message niceties

- 🟢 **Ask AI about an error**: error/warning notification bars carry an "Ask AI" button that feeds the original error text to the agent for triage, with no manual copy-paste.
- 🟢 **Copy buttons at both ends**: the assistant message copy button sits at both the top and the bottom; hover actions move to the lower-left of the message so long messages do not need a scroll back to the top.
- 🟢 **Fork while bash is running**: the fork button does not hide while a command runs; a click is staged instead of lost — an experience detail fixed on purpose.
- 🟢 **Visual hint while editing a prompt**: "Edit from here" shows a masked preview in the draft area, so prefilled content is not confused with your own typing.
- 🟢 **Tidier operation cards in messages**: flat tool-call arguments are shown line by line, codemode calls show the script itself and its tool calls, and MCP calls show server/tool with indented JSON results.
- 🟢 **Pre-send scan (composer gate)**: before a message leaves the composer, `aiti-secret-vault` scans it with stricter rules than automatic masking and asks "send masked / send as-is / cancel" on a hit — masking encrypts the value into the vault and leaves a stable placeholder, so the model never sees plaintext.
- 🟢 **Compaction queued when busy**: if a compaction request arrives while the session is busy, the request waits **on the server** (queued by session id) rather than in the browser tab, and resumes when the session is free — closing the tab does not lose it.
- 🟢 **Dual-currency cost display**: when the UI language is Chinese, cost shows as `$xx (¥yy)` (exchange rates cached server-side for 24h); other languages keep `$xx`; the accounting unit remains USD, so the calculation is unchanged.
- 🟢 **New session with context**: the "New session" action next to the composer forks the current full context into a new session and sends the current input there, leaving the original session running untouched.
- 🟢 **Relay between sessions (/relay)**: `/relay <session-id> <message>` delivers a message to another live backend session and injects its reply back into the current conversation — two agents can hand off without copy-paste.

### Navigation and layout

- 🟢 **Three-stage right panel**: the expand button cycles "docked → wider → full screen", one button from a glance to focus.
- 🟢 **Panel zoom slider**: settings can adjust UI scale for the sidebar and right panel, so oversized or tiny fonts/controls can be fixed.
- 🟢 **Draggable main/file column widths**: layout widths persist instead of being a fixed ratio.
- 🟢 **Top-bar closure**: the system prompt and debug panels gained title-bar close buttons, and debug entries joined the top-bar ordering system.
- 🟢 **Welcome page recent-on-top**: the welcome page's top card area expands adaptively with recent sessions on top, so you resume immediately.
- 🟢 **One dock, four homes**: the same panels can dock in the left sidebar block, the right panel or a standalone floating window; the ⋮ menu is uniform everywhere (float / left / right / up / down / close), and position memory is isolated per deployment sub-path.
- 🟢 **Top bar you arrange**: the top-bar order is customizable — show/hide, move up/down, insert group dividers, the theme button; buttons contributed by extensions are in the same list.
- 🔵 **Batch archiving**: multi-select sessions to archive / restore; the sidebar offers "archive older than 7 days" and "clean up archives older than 30 days", and deleting all sessions in a project keeps running ones.
- 🟢 **Drafts and collapsing**: sessions not yet persisted are marked "draft"; sub-agent and branch sessions collapse separately so long trees do not take over.
- 🟢 **Shift+click deletes directly**: deleting a session asks for confirmation by default; hold Shift to skip it.

### Model and backend selection

- 🟢 **Prices on model rows**: the model picker shows the catalog's current price hint on the right (e.g. `$0.6/$2.2 per M` input/output), so comparing does not require the settings page.
- 🟢 **External-agent model hints**: model rows mark integrations from the ext-agent catalog, so it is clear which vendor a model comes from.
- 🟢 **Missing CLIs are dimmed**: backends that are not installed are dimmed with a reason; "rescan" discovers CLIs installed after startup without restarting the workbench.
- 🟢 **Model wizard readability**: a collapsible provider tree plus a status legend toolbar — dozens of providers no longer fill a whole screen.
- 🟢 **Model visibility rules**: configurable model filtering, probe limits and discovery caching keep long lists to what you need.
- 🟢 **Rate-limit and error badges**: model rows show 429 rate limiting / probe errors / untested, and provider-wide limiting merges into one hint; it only informs and never silently disables a model.
- 🟢 **Model switch "next turn"**: switching mid-run does not interrupt the current turn, and a badge says when it takes effect.

### Files, queues and small tools

- 🟢 **Multi-tab file viewer**: tabs can be detached into independent windows, re-docked and grouped by folder; preview state survives tab switches.
- 🟢 **Queue export/import**: queued messages and the recovery queue can be exported whole (Markdown / JSON) and parsed back on import — no more copying entries one by one when changing machines or debugging.
- 🟢 **Crash rescue page**: a bilingual rescue UI and an emergency AI endpoint when the page crashes, saving data before investigating.
- 🟢 **Restart recovery**: scans the interrupted-session list recorded in the running journal and orchestrates recovery, so after a restart you know which sessions were interrupted and how to resume.
- 🟢 **Masking plugin preinstalled**: the first launch installs the bundled first-party pi plugin (default `pi-secret-mask` — paste safely); skipped plugins state the reason instead of failing silently.
- 🟢 **Extension background self-healing**: bundled extensions reconcile in the background with a cooldown on failure, so they do not retry forever and slow startup.
- 🟢 **Composer command hints**: the placeholder hints at available commands and the trigger word is consumed after typing; the file panel also has an "open terminal" command card.
- 🟢 **Undoable composer clear**: clearing goes to the recycle bin, and one click brings it back — an accidental clear is no longer a rewrite.
- 🟢 **Attachments land in the workspace**: pasted or attached images and files go to `<cwd>/.pi-attachments/` (auto-added to `.gitignore`) and are referenced by path in the message; same-name files are never overwritten.
- 🟢 **Mobile composer matrix and collapsing**: the ＋ sheet gathers model / thinking level / tool preset / compaction / sound / queue / extension status and panels; the composer and queue collapse on a swipe down and pull back up.

### In-extension experience details

- 🟢 **Adaptive message-intelligence popover**: wider screens show more text, narrow screens collapse, and file-operation row order is unified.
- 🟢 **Share receivers**: share-dialog content can be "saved as a command / saved as a prompt" and delivered to each other through the share-sink extension point.
- 🟢 **Pluggable share targets**: upload targets (Gitee / image host / object storage / note archive) are not hard-coded; the audit directory can act as a remote overlay for hot updates.
- 🟢 **Collapsible sub-agent fleets**: the Fleet panel supports grouping by fleet and a concurrency entry, so many agents stay legible.
- 🟢 **Redesigned device panel**: device pairing docks in the right panel with a device-detail popover, showing connection state at a glance; messages are memory-only, files self-clean after 1h, and offline devices are reaped after 1h.
- 🟢 **Cross-bridge federation** (off by default): with `pairFed.enabled` on, devices in the authoritative bridge's `fed:` namespace are visible and can exchange messages/files, so multiple instances do not have to chat in isolation.
- 🟢 **Reading source label**: read-aloud labels which session is being read; long text is split into chunks synthesized in order, so very long input does not stall.
- 🟢 **Local TTS voice cloning**: beyond browser Web Speech and edge-tts, a local ONNX TTS engine (Hojo-TTS-Light 40M/80M, CPU is enough) runs as an OpenAI-compatible service with voice cloning.
- 🟢 **Editor selection card**: selection cards work across previews (same-origin and cross-origin), and the editor toolbar has a read-aloud entry.
- 🟢 **Search results with plan tags**: session search results carry the plan-related tag from the server for faster filtering.
- 🟢 **Tunnel mobile entry**: the service-tunnels panel adds a mobile QR-code entry; the container panel's port page links straight to tunnel configuration.
- 🟢 **Attributable debugging**: devtools interaction records say which agent session and which device they belong to, and support cross-bridge federation proxying.
- 🟢 **Agents carry their quotas**: `aiti-qoder-agent` can query credits and the WASM-signed model catalog, while `aiti-agent-manager` aggregates login state and quotas across vendors.
- 🟢 **Credentials are read-only to the model**: in `pi-secret-vault` the model can only `vault_list` / `vault_get` to obtain placeholder tokens; adding, editing, deleting and revealing plaintext are always human actions (weak passwords raise a warning and a ⚠ at add/rotate time).

> Note: development-only extensions are not distributed and are not counted in the feature list — `aiti-crash-fatal` (fatal crash testing; refuses to run when `NODE_ENV !== development` and is deployed only to the dev directory) and `demo` (an all-slots demo extension for framework validation).

---

## 13. Planned unique capabilities (roadmap excerpt)

Status follows the public roadmap (✅ shipped / 🚧 in progress / 📋 planned) and implementation records; only items **unique relative to upstream pi-web** are listed.

| Capability | Status | One-line description |
|---|---|---|
| Multi-agent CLI bridging (12+) | ✅ | Delivered beyond the target; see "Signature one" |
| CDP remote debugging channels (chrome-devtools / msedge-cdp / remote-cdp) | ✅ | Browser debugging over standard MCP, complementary to in-page `page_exec` |
| Editor suite (editor / onlyoffice / sheet-univer / word) | ✅ | See "Office and documents" |
| Container desktop VNC / RDP | ✅ | `aiti-ui-env` delivers a virtual desktop and web VNC/RDP |
| Browser extension listing on three stores | 🚧 | Source and release guide ready, listing pending (inject any site without code changes) |
| VS Code extension listing | 🚧 | 0.3.x source ready (inject + bridge + MCP wiring + AI window jump) |
| noVNC full image orchestration / TOTP orchestration | 🚧 | The last mile of desktop visualization and auth orchestration |
| PWA / deeper mobile support | 📋 | Touch interaction shipped; PWA installability and offline capability pending |
| SSH multi-machine federation | 📋 | One entry for multiple machines |
| `just get` tool marketplace | 📋 | Layered CLI tool installation |
| Extension marketplace going public (npm + MCP registry sources) | 📋 (v1 index drafted) | From an online registry to an open ecosystem; a v1 plugin-market index exists |
| Engine abstraction (pi / omp dual-kernel evaluation) | 📋 | Mainline stays on pi; first adapt omp sessions, evaluate dual engines long term |
| IntelliJ plugin (devtools-idea) | 📋 | Completes IDEA in the injection ecosystem |
| Usage P2: external agent cost estimation | 📋 | Add a cost perspective on top of existing token attribution |

> The roadmap is a living document; see the [Master Plan](/en/roadmaps/master-plan.md) and the [aiti-agent roadmap](/en/roadmaps/aiti-agent.md) for current status.

---

## Learn more

- Every extension in detail: [extension catalog](/en/extensions/README.md)
- Positioning and the five capability layers: [aiti-agent](/en/products/aiti-agent.md)
- Architecture overview: [architecture](/en/guide/architecture.md)
- Project origins: [upstream lineage](/en/guide/lineage.md)
