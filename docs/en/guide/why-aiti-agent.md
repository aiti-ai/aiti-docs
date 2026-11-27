---
title: Why a Web Workbench
icon: ⚖️
description: Five AI coding form factors compared — aiti-agent (self-hosted web workbench) vs IDE-embedded AI, CLI agents, desktop clients and CLI-agent web shells, across input, messages, persistence, multi-agent, statistics, tooling and deployment
keywords: why aiti, pi-web, web workbench, AI coding form factor comparison, IDE, CLI, desktop client, web shell, detached, background, mobile, multi-agent, token statistics
tags: [guide, comparison, positioning]
---

# Why a Web Workbench (aiti-agent)

> **In one line**: move the actions you repeat dozens of times a day — start a task, watch progress, review output, switch models, read statistics, take over from another device — out of an IDE window or a terminal, onto an always-on operating surface that is remote-capable and mobile-capable, while **the code, the sessions and the tools stay on your own machine**.

## First, a warning: this may not be for you

If you only use AI occasionally, **do not bother with this** — use what you already know: IDE-embedded AI, a CLI agent, a desktop app, all get work done. **Tools are not good or bad; the one you can drive is the good one.**

This project is **deeply customized around one person's habits and working scenarios**: fragmented time, mobile devices, token budgets, many agents in parallel, remote machines, page debugging... It fits that way of working, not necessarily you; its complexity (running a service, a reverse proxy, maintaining extensions) is the price of those scenarios. See [Origin](/en/guide/origin.md).

## A 30-second check

How many of these five happened to you last week?

| Question | Typical pain point of other form factors |
|---|---|
| Two or more agents open at once (pi / Claude Code / Codex / Cursor…), hopping windows to find context | IDE and CLI each keep their own history; context breaks when you switch tools |
| You wanted to check progress from a phone, but had to SSH in or wait to get back to the laptop | Terminal / IDE mobile is mostly view-and-approve; full operation waits for the laptop |
| You closed the local IDE or terminal and worried the agent would be interrupted | Local agents follow the window (cloud agents are the exception) |
| You wanted "how many tokens this month, which model is most expensive" and could only read a bill | No cross-agent cost data plane |
| You wanted the AI to look at the page, click elements and change styles, so you took a screenshot and pasted it | Terminals and editors cannot see what is rendered |

**Two or more "yes"** means your workflow has outgrown a single-window tool — which is exactly what a web workbench is designed around. Below: a form-factor comparison, then the mechanics and the boundaries. Every claim is verifiable in the ten-minute self-test at the end.

**Zero or one "yes"**: close this page and keep using what you have — there is no reason to change your workflow for a workbench.

> **Scope**: this page compares **form factors**, not specific products. Within one form factor the spread is wide (Cursor and JetBrains AI are both IDEs but differ a lot). Cells describe typical capability: ✅ native / ⚠️ partial or via plugins / ❌ essentially absent. Every "N" below is **today's built-in coverage, not a capability ceiling**.

---

## 1. Five form factors and what each wins

| Form factor | Runs on | Who owns the sessions | Examples | What it is best at | Structural limit |
|---|---|---|---|---|---|
| **Web workbench** (aiti-agent) | Your machine or server, self-hosted | Unified index + shared session files | this project, `@aiti-ai/pi-web` | Always-on, remote, mobile; many agents in one pane; complete toolchain | Not an IDE: no LSP, breakpoint debugging or refactoring |
| **IDE-embedded AI** | Editor process + vendor cloud | Each IDE privately | VS Code Copilot / Cursor / JetBrains AI (incl. ACP) | Code and AI on one screen; LSP, refactor and debugger one click away; plugins + MCP + cloud agents | Sessions tied to the IDE / vendor; cloud agents run in vendor sandboxes; local dies with the window; mobile is supervision-first |
| **CLI agent** | Terminal process + optional vendor cloud | Vendor-private JSONL / SQLite | Claude Code / Codex / Gemini CLI / pi TUI | Fastest, most scriptable, SSH-friendly; plugins / skills / hooks / MCP | Terminal UI; sessions not unified across vendors; tool surface is commands; cloud / mobile per vendor |
| **Desktop client** | A local app | Vendor cloud or local | Claude Desktop / ChatGPT desktop / ZCode | OS integration (tray, hotkeys, clipboard), single-machine convenience; MCP extensions / connectors | Cross-machine needs another app; extension surface mostly MCP; capability set decided by the vendor |
| **CLI-agent web shell** | Local or vendor cloud | One tool (a few multi-agent consoles) | community shells / OpenCode built-in web / vendor cloud agents / OpenHands-style consoles | Browser access, streaming, some support multi-session and file editing | Wide spread: thin shells are chat-only, mature consoles approach a workbench; toolchain, statistics and extension ecosystem are usually missing |

> The real difference is not "does it have a web page" but **whose runtime sits behind the browser**. A thin shell is just a display layer; a mature self-hosted web UI has a runtime too, but usually serves one agent family. The web-workbench bar is: runtime, sessions, queues, tools and statistics in your own service — and across agents.

---

## 2. The big comparison

Three things to keep in mind so the tables are not read as "everyone else has nothing":

1. **✅ / ⚠️ / ❌ describe the form's out-of-the-box default.** ⚠️ = usually needs a plugin, MCP, a cloud service or your own extension to reach parity; ❌ = no general extension point reaches the same level — not "impossible forever".
2. **Other ecosystems are not weak**: IDEs have marketplaces + MCP + ACP, CLIs have plugins / skills / hooks / MCP, desktops have MCP extensions and connectors, and self-hosted web shells are growing. The gap is **ownership and tool surface**, not "whether plugins exist".
3. **Our "N" numbers are not closed lists either** — they are today's built-in coverage, and they keep growing; see 2.0.

> Scope note: modern IDE agents often run partly in the vendor cloud (Cursor Cloud Agents, Copilot coding agent), and Claude Code / Codex have cloud sessions and mobile apps. The tables count those under the respective form rather than as "web-only".

### 2.0 Where our "N" comes from and how it grows

| Number | Built in today | Extension point | How to add more |
|---|---|---|---|
| **23** agent families parsed | adapters inside `session-manager` | `ui.provides: ["session-agent-source"]` third-party source slot: implement manifest / list / session read-only endpoints | Install an extension; parsing runs in your own process, `sm-demo-source` is the minimal template; the search index grows with the source |
| **25** ACP agents | auto-detection in `aiti-acp-agent` | The ACP protocol itself + a custom backend panel | Any ACP agent works by entering its launch command; no code change |
| **7** dedicated CLI drivers | Claude Code / Codex / Cursor / CodeBuddy / Qoder / ZCode / omp | `aiti-custom-agent` form + the backend provider contract | Register any CLI via the form; deep adaptation (login, streaming, tool cards) is a provider extension |
| **16** balance adapters | adapter registry in `aiti-provider-usage` | A code-level adapter table: one new provider ≈ one declaration | Send a PR or add a local row; HTTP, auth and normalization are shared |
| **4** external usage sources | ingest source table in `aiti-ai-usage` | Code-level readers (JSONL / SQLite) | Add a reader; model attribution follows the same shape |
| **60+** bundled extensions | bundled extensions | Host extension API (slots / services / API routes / agent hooks) + MCP | Publish an extension, or attach any MCP server directly |
| TTS / ASR / sharing / page carriers | engine and target registries | OpenAI-compatible endpoints, share sinks, carrier plugins | Switch in settings, or write a plugin for a new engine / site |

> In one line: **both user-level additions (install an extension, fill a form, attach MCP) and code-level ones (adapters, ingest readers) have a defined door**; the latter need code, but the change is one declaration or one file, not a rewrite. The only test is whether **the target exposes readable session storage, a usage API or ACP support** — if it does, it can be connected without waiting for our release.

Other forms' extension surfaces are real too; the difference is how far they reach:

| Form | Main extension surface | Can add | Cannot reach |
|---|---|---|---|
| IDE-embedded AI | Marketplace, MCP, ACP, vendor cloud agents | Editor features, tool panels, external agents, cloud background tasks | Cross-vendor session assets; turning the IDE into an always-on shared service |
| CLI agent | Plugins / skills / hooks / MCP / subagents | Tools, commands, lifecycle hooks, subagents, TUI | Rich UI, unified sessions across clients, a visual toolchain |
| Desktop client | MCP extensions / connectors, some native extensions | Local tools, connectors, OS integration | Arbitrary workbench panels, remote multi-user, team orchestration |
| CLI web shell | Implementation-dependent; most have no plugin model | Sessions / streaming / file editing for one agent; a few multi-agent consoles accept tools | Full toolchain, statistics, plugin ecosystem, cross-agent orchestration |

### 2.1 Input and messages

| Capability | aiti-agent (web) | IDE-embedded AI | CLI agent | Desktop client | CLI web shell |
|---|---|---|---|---|---|
| Input completion (local + AI tiers) | ✅ Inline ghost text; favorites / history first at zero model cost | ⚠️ Slash / @ candidates, no continuation | ⚠️ Slash / @ / skills, no continuation | ⚠️ Basic history | ⚠️ Implementation-dependent |
| Voice input | ✅ Streaming ASR + VAD + 2-pass refinement + hotwords | ⚠️ OS dictation | ⚠️ OS dictation | ⚠️ OS dictation | ⚠️ Browser dictation |
| Type-to-command | ✅ Type "model" to execute; cursor returns to the composer | ⚠️ Slash commands / custom prompts | ✅ Slash commands + skills | ⚠️ Limited | ⚠️ Implementation-dependent |
| Draft safety | ✅ One shared slot per session; survives tabs, reload, crash | ⚠️ Kept in session, resumable | ✅ resume / checkpoint keeps context | ⚠️ Kept in session | ⚠️ Implementation-dependent |
| Actionable queue | ✅ Reorder / steer / take back / trash / decide item by item after restart | ⚠️ Some support queueing | ⚠️ Can queue, limited visibility | ❌ | ⚠️ Simple queue |
| Actionable messages | ✅ Click paragraphs / code lines; quote, A/B options, copy | ⚠️ Copy / apply / partial quote | ⚠️ Terminal text, mostly copy | ⚠️ Copy | ⚠️ Copy / quote by implementation |
| Long-conversation navigation | ✅ Anchor banner + previous / next / earliest / latest | ⚠️ Scroll + in-tool search | ⚠️ resume / logs, no anchors | ⚠️ Scroll | ⚠️ Implementation-dependent |
| Read-aloud / follow mode | ✅ Audiobook follow mode, three TTS engines, voice cloning | ⚠️ OS screen reader | ❌ (OS screen reader) | ⚠️ OS screen reader | ⚠️ Browser TTS |
| Full-power small screen | ✅ Touch composer matrix, full-screen dialogs, back gesture, touch reorder | ⚠️ Mobile companion, supervision-first | ⚠️ Vendor app can view / approve | ❌ (phone is another form) | ✅ A web page opens on a phone |
| Multiple tabs / devices | ✅ Shared draft and queue, consistent state | ⚠️ Cloud sessions visible across devices | ⚠️ Cloud sessions visible across devices | ❌ | ⚠️ Implementation-dependent |

**Takeaway**: input and messages remain the web's strongest ground, but mobile is not exclusive — IDE / CLI mobile experiences are "watch and approve" today, while a full operating surface is still most natural on the web. Desktop and web-shell input enhancements depend on the host or a plugin.

### 2.2 Runtime and persistence

| Capability | aiti-agent (web) | IDE-embedded AI | CLI agent | Desktop client | CLI web shell |
|---|---|---|---|---|---|
| Keep running after closing the UI | ✅ Sessions live in the server; the browser is a view | ⚠️ Local stops; vendor cloud agents continue | ⚠️ tmux keeps local; cloud sessions continue | ❌ | ✅ Server-side / cloud (implementation-dependent) |
| Resume after a server restart | ✅ Detached wrapper + journal replay (supported backends) | ⚠️ Cloud agents are vendor-managed; local is not | ⚠️ Cloud sessions resume; local relies on resume | ❌ | ⚠️ Self-hosted service can resume; process-bound does not |
| Queue / interrupt recovery | ✅ Server-side sidecar; decide item by item after restart, never auto-delivered | ⚠️ Cloud sessions keep state, no local queue recovery | ⚠️ checkpoint / resume, queue not preserved | ❌ | ⚠️ Implementation-dependent |
| Parallel workspaces | ✅ Several projects open, each running independently | ✅ Agents window / sessions across projects | ⚠️ tmux / multiple processes | ⚠️ Multiple windows | ⚠️ Multiple sessions |
| Headless server / Docker | ✅ Single core / full container | ⚠️ Remote / code-server | ✅ | ❌ | ✅ Self-hosted |
| Access from browser / phone | ✅ Reverse proxy + tunnels + TOTP | ⚠️ vscode.dev / mobile companion | ⚠️ SSH / vendor app | ❌ | ✅ |
| Survive network loss / device switch | ✅ SSE reconnect + server queue + drafts | ⚠️ Cloud sessions resume | ⚠️ Cloud sessions resume | ❌ | ⚠️ Implementation-dependent |

**Takeaway**: cloud agents have made "keep running after closing the client" non-exclusive. The real difference is **whose machine it runs on** — a vendor cloud sandbox versus your server and real workspace — and whether a service restart also survives, which is what detached mode buys, without shipping code to someone else's cloud.

### 2.3 Sessions and multi-agent

| Capability | aiti-agent (web) | IDE-embedded AI | CLI agent | Desktop client | CLI web shell |
|---|---|---|---|---|---|
| Cross-tool history ingestion | ✅ 23 agent families parsed into one model | ⚠️ Multiple agents visible in one IDE; not across IDE / CLI / vendors | ❌ Vendor-private | ❌ | ❌ One or a few |
| Full-text search (incl. CJK) | ✅ FTS5 trigram, ≈20 families; the AI can search too | ⚠️ In-tool search | ⚠️ resume / grep logs | ⚠️ Title / local search | ⚠️ Implementation-dependent |
| Tags / favorites / archive / kanban | ✅ | ⚠️ Pins / folders | ❌ | ⚠️ Pins | ⚠️ Implementation-dependent |
| Continue an old session | ✅ All 23 families reopen and continue | ⚠️ Within the IDE; not across tools | ✅ Per-tool resume / checkpoint | ⚠️ Own tool only | ⚠️ Own tool only |
| Run other agents | ✅ 7 dedicated drivers + generic ACP (25) + custom / attach | ✅ ACP / multi-agent windows (Zed, JetBrains, VS Code extensions) | ❌ One at a time | ⚠️ MCP tools, not sessions | ⚠️ A few multi-agent consoles |
| Same session across clients | ✅ Terminal `/web` bridge with bidirectional IO | ⚠️ Within vendor: IDE / cloud / mobile | ⚠️ Within vendor: web / mobile / teleport | ❌ | ⚠️ Same service, multiple clients |
| Session fork / branches | ✅ Dual branching + branch navigator + jump from a quote | ⚠️ Edit and resend / partial | ⚠️ checkpoint / rewind | ⚠️ Limited | ⚠️ Implementation-dependent |
| Project / worktree grouping | ✅ Integrated with git worktrees | ✅ Native | ⚠️ Manual | ⚠️ Manual | ⚠️ Implementation-dependent |

**Takeaway**: on "run other agents", **modern IDEs have caught up** — VS Code's Agent Sessions puts Copilot, the cloud coding agent, the CLI and Codex in one panel, and ACP lets Zed and JetBrains drive Claude Code and other external agents. Our lead is not "it can run them" but **one session model + cross-vendor history + cross-client continuation**; an IDE can show several agents in one view, but their histories still live in each extension's or vendor's store.

### 2.4 Toolchain and ecosystem

| Capability | aiti-agent (web) | IDE-embedded AI | CLI agent | Desktop client | CLI web shell |
|---|---|---|---|---|---|
| Code editing / LSP / refactor | ⚠️ Monaco editing; no LSP or refactoring | ✅ Its job | ⚠️ No editor | ⚠️ Limited | ⚠️ Implementation-dependent |
| Breakpoint debugging | ⚠️ Dedicated page / JVM channels, no general debugger | ✅ | ⚠️ Command-line debuggers | ❌ | ❌ |
| Terminal (real PTY) | ✅ Survives reload and restart | ✅ | ✅ | ⚠️ Sometimes | ⚠️ Sometimes |
| Files / documents / Office | ✅ Word / Excel / PPT preview and editing, full-text doc center | ⚠️ Mostly text, Office via plugins | ❌ | ⚠️ Attachment preview | ⚠️ File browsing by implementation |
| Containers / images / compose | ✅ docker / podman / nerdctl panel | ⚠️ Docker / K8s plugins | ⚠️ Commands | ❌ | ⚠️ Sandboxed env, not a management panel |
| Virtual desktop VNC / RDP | ✅ Virtual display on headless servers, straight from the browser | ⚠️ Viewer plugins, no display orchestration | ❌ | ❌ | ❌ |
| Service tunnels / public exposure | ✅ Five modes + TOTP / face / voice gate | ⚠️ Remote Tunnel serves only itself | ⚠️ `ssh -R` / cloudflared | ❌ | ⚠️ Your own reverse proxy |
| Git review / change lineage | ✅ Diff review + write gate + change-trace repo | ✅ Diff and staging; AI review via plugins | ⚠️ git commands | ❌ | ⚠️ Diff by implementation |
| Page injection debugging | ✅ aiti-devtools: pick an element, AI operates the page back | ⚠️ Install this project's VS Code extension | ⚠️ Via the MCP bridge | ⚠️ Via the MCP bridge | ⚠️ Via the MCP bridge |
| Subagents / scheduled tasks | ✅ Fleet panel + resident scheduler | ⚠️ Partial (custom agents / multi-agent windows) | ✅ Subagents / hooks | ⚠️ Via MCP | ⚠️ Implementation-dependent |
| Extension mechanism | ✅ 60+ bundled extensions + `ctx.services` contracts | ✅ Marketplace + MCP + ACP | ✅ Plugins / skills / hooks / MCP | ⚠️ MCP extensions / connectors | ⚠️ Implementation-dependent |

**Takeaway**: the toolchain difference is **breadth versus depth**. IDEs go deeper on editing, debugging and refactoring — we say so; our breadth is the range of things the agent can act on: containers, virtual desktops, tunnels, Office, IM, device pairing — none of which is an IDE's job. Page injection is not exclusive either: any MCP host can use aiti-bridge; we simply make it a built-in panel.

### 2.5 Statistics, security and governance

| Capability | aiti-agent (web) | IDE-embedded AI | CLI agent | Desktop client | CLI web shell |
|---|---|---|---|---|---|
| Token / cost pivot reports | ✅ Any dimension combination + sankey + CSV | ⚠️ Vendor quota / usage pages | ⚠️ Vendor usage; third-party ccusage can aggregate | ⚠️ Vendor page | ⚠️ Vendor page |
| Ingest external agent usage | ✅ 4 detailed sources + 3 model attributions | ❌ | ⚠️ Third-party tools can aggregate several | ❌ | ❌ |
| Balance / quota | ✅ 16 adapters, multi-key pool aware | ⚠️ Vendor subscription page | ⚠️ Some CLIs / plugins | ⚠️ Occasionally shown | ⚠️ Occasionally shown |
| Model health / rate-limit probing | ✅ Probes + recovery time + availability windows | ⚠️ Availability hints only | ⚠️ Partial | ⚠️ Availability hints only | ⚠️ Availability hints only |
| Context / smoothness indicators | ✅ Context ratio bar + 0–100 smoothness score | ⚠️ Context shown in some | ⚠️ TUI shows context | ❌ | ⚠️ Partial |
| Per-session statistics export | ✅ Tokens / cost / tool calls per session, HTML export | ❌ | ⚠️ Third-party scripts | ❌ | ⚠️ Implementation-dependent |
| Paste-time secret masking | ✅ Secrets become placeholders before sending, restored on execution | ⚠️ Secret scanning / SecretStorage | ⚠️ Possible via plugins / hooks | ⚠️ Enterprise controls / connector permissions | ⚠️ Implementation-dependent |
| Secret vault | ✅ The model only sees opaque tokens; plaintext never enters the chat | ⚠️ External secret manager | ⚠️ External secret manager / plugins | ⚠️ External | ⚠️ External |
| Config rollback / backup | ✅ Diff rollback + hardlink incremental snapshots | ⚠️ Settings sync / history | ⚠️ dotfiles / git | ⚠️ Limited | ⚠️ Implementation-dependent |
| Local session data retention | ✅ Everything local; no vendor cloud | ⚠️ Tool-private formats | ✅ Local JSONL / SQLite | ⚠️ Mostly vendor cloud | ⚠️ Self-hosted or vendor cloud |

**Takeaway**: statistics are not "nobody else does it" — vendors usually show you a quota page for their own product. A local cost view across provider / model / key / workspace / agent needs a centralized session layer. Third-party CLI tools close part of the gap, but they aggregate by tool and file, not from the same runtime sessions.

**What we do not claim**: that others cannot do background execution, multi-agent, mobile or plugins — Cursor / VS Code cloud agents, Claude Code / Codex cloud sessions and mobile apps, Zed / JetBrains ACP, Claude Desktop / ChatGPT MCP all prove otherwise. What we claim is that **these capabilities should be out of the box, cross-vendor, running in an environment you control, with sessions and tools that belong to you**.

---

## 3. Eight structural reasons

### 1. Runtime location: sessions live in the service, not in a window

The browser is only a view. Close the tab, lose the network, switch devices — the agent keeps running (vendor cloud agents can also run in the background; the difference is that they run in a vendor sandbox, not on your machine). **Stopping or restarting pi-web itself does not have to interrupt the turn in flight either** — `detach` hosts the agent in a standalone wrapper (Linux `systemd-run`, macOS plain detached process, Windows `Win32_Process.Create`) that talks to the service over a local socket and keeps a 4 MB ring journal: after a service restart you reconnect and the output replays exactly. Wrappers with no attached client and no output for the idle window are reaped. Already supported: pi, all ACP backends, Claude Code, CodeBuddy, Cursor, Qoder, omp and more; the rest are landing progressively. See [Architecture · sessions and detachment](/en/guide/architecture.md).

### 2. Sessions as an asset: one index over 20+ agents

`session-manager` parses 23 agent families' private stores into one model (built-in coverage; third parties can add more through the `session-agent-source` slot), with FTS5 trigram search that works for Chinese, tags, favorites, archive snapshots, kanban and branch / worktree grouping in one sidebar. The AI can search too: `pi-session-search` gives the agent `session_search` / `session_read`, so after compaction it can read back the original messages and continue. History is not a fossil — open it and keep talking.

### 3. Input is a workflow

Local favorites / history hits render instantly as ghost text at zero model cost; only a miss goes to the AI continuation (others can add OS dictation or completion plugins, but rarely put completion, commands, drafts and queues into one chain). Typing "model" or "compact" executes a command and returns the cursor to the composer. Press-and-hold gives streaming ASR with hotwords. Drafts are shared per session and survive crashes. The queue is persisted server-side: reorder, steer, take back to edit, and decide item by item after a restart. See [aiti-ai-input](/en/extensions/aiti-ai-input.md), [aiti-draft-keeper](/en/extensions/aiti-draft-keeper.md), [aiti-queue-keeper](/en/extensions/aiti-queue-keeper.md).

### 4. Messages are interface objects

Paragraphs, headings, table rows and code lines are clickable: copy, quote, A/B options, highlight the line. The anchor banner tells you which prompt produced what is on screen; the navigation bar jumps to previous / next / earliest / latest. Long answers can switch into read-aloud mode with sentence-level highlighting. See [aiti-msg-smart](/en/extensions/aiti-msg-smart.md), [aiti-ai-speek](/en/extensions/aiti-ai-speek.md).

### 5. The toolchain lives on the same page

A real PTY terminal (survives restarts), container panel, virtual desktop VNC / RDP, service tunnels, files / Office / document center, git review and change lineage, JVM and Windows process debugging, subagent fleet, scheduled tasks, IM remote control — all panels in the same workbench, sharing the workspace and runtime context with the session. That is what "richer than an IDE" means concretely: not more editor features (IDEs go deeper on editing and debugging — we say so), but a **wider range of things the agent can act on**.

### 6. Statistics and governance need to be centralized

Usage reports pivot over any dimension combination (workspace / provider / model / key / hour / date / agent) × multiple metrics, with three views and CSV export; external agent tokens are ingested too (third-party tools such as `ccusage` aggregate part of CLI usage, but not as a multi-dimensional view from the same runtime sessions). Add 16 provider balance and quota adapters, model health probes, context and smoothness indicators, per-session export, plus secret masking / vault / config rollback / data snapshots. See [aiti-ai-usage](/en/extensions/aiti-ai-usage.md).

### 7. A full-power small screen, not a reduced one

A phone is not a remote peephole: a touch composer matrix (model / thinking level / tool preset / compact / queue / extension state in one sheet), collapsible composer and queue, dialogs that go full screen and close with the system back gesture, right-panel state restore, touch drag reordering, voice plus a "⏎ newline" pill, read-aloud follow mode. PWA install and offline support are still on the roadmap — that is a known gap. See [full mobile adaptation](/en/extensions/aiti-float.md).

### 8. The page is the AI's scene (aiti-devtools)

Inject the debug client into the page you are developing: pick an element and structured information goes straight to the AI; the AI can run DevTools-like DOM / CSS / input / performance operations, and can ask the user to pick elements or answer questions. Carriers cover Vite / webpack / Nuxt / Astro, plus a browser extension (any site) and a VS Code extension, all on one bridge protocol. Page injection is not exclusive — any MCP host can use `aiti-bridge`; our advantage is making it a built-in panel, sharing the same origin as the workbench. See [aiti-devtools](/en/extensions/aiti-devtools.md).

---

## 4. Boundaries: what it does not do

A credible "why choose" page states the costs. These are known boundaries, not bugs waiting to be fixed:

| Boundary | Explanation | Suggestion |
|---|---|---|
| Not an IDE | No LSP completion, breakpoint debugging, cross-file refactoring or test panel | Keep the IDE for deep coding; pi sessions are shared, and other agents' sessions continue in the web |
| You operate it | Node 22 / Docker / ports / reverse proxy / auth are yours to set up | Use `docker run` or the install script; expose via tunnels + TOTP |
| Browsers have a cost | Higher memory than a TUI; very long sessions rely on lazy paging | Use paged navigation; run the server on another machine |
| Single-user self-hosting | No multi-tenant, team collaboration or cloud sync | Isolate instances behind your own proxy for multi-user setups |
| Mobile still has headroom | Touch interaction is complete; PWA install / offline is pending | "Add to home screen" works, but needs connectivity |
| Backend adaptation is continuous | Each CLI changes its login state, streaming protocol and history format | Watch release notes; unsupported features still work as plain sessions |
| Detached varies by platform | Different runners on Linux / macOS / Windows, and not every backend is wired yet | Check the hosting-mode badge to see whether the current session can detach |
| Upstream maintenance | We track pi and pi-web, and occasionally have to absorb upstream changes | Use official releases; pin versions for your own builds |

---

## 5. How to combine them

These form factors are complements, not substitutes. Use the web as the **center** and the others as **specialized tools**:

| Scenario | Primary | Companion |
|---|---|---|
| Long-running tasks, multi-agent orchestration | The web workbench | Attach the same session from the CLI with `/web`; watch progress on a phone |
| Deep coding, refactoring, breakpoint debugging | IDE | Use the web for history, usage and change lineage |
| One-off scripts, CI, low-bandwidth links | CLI | Use the web for usage and result rollups |
| Page-level integration work | Web + aiti-devtools | Browser extension / VS Code extension |
| Headless servers, remote machines | Web (Docker) | Service tunnels + TOTP + VNC / RDP |
| Just a chat window over one CLI | A CLI web shell | Fine on its own; migrate when session assets matter |

> Compatibility is what makes this work: the pi CLI, the pi IDE extension and the web operate on **the same session files**, not three separate stores. You do not have to pick a side.

---

## 6. Ten-minute self-test

Skip the prose and just do this:

1. **Start it**: `npx --allow-scripts=@aiti-ai/pi-web @aiti-ai/pi-web@latest` (or `docker run -d -p 30142:30142 aitiai/pi-web:core`).
2. **Open two agents**: create a pi session, then attach an installed, logged-in Claude Code / Codex session from the sidebar; confirm both live in one project tree.
3. **Switch devices**: open the same URL on a phone (or through a tunnel), send a message, queue one, switch the model.
4. **Close the browser**: wait 30 seconds and reopen; the agent has not stopped and the output is still there.
5. **Restart the service**: `docker restart` or `systemctl restart`, then reopen the session; on backends that support detached mode the agent replays its history and continues.
6. **Read the numbers**: open the usage report, pivot by provider / model, export a CSV.
7. **Enter the page**: add `@aiti-ai/aiti-devtools-vite` to any Vite project and ask the AI to restyle an element you click.

If three or more of these feel like something you would use daily, the web workbench is the right center. If only step 7 resonates, you probably need [aiti-devtools](/en/devtools/) rather than the whole workbench. If none of them do, do not migrate — **the tool that fits your hand beats the one with more features**.

---

## Learn more

- Every capability, with upstream / in-house attribution: [Features at a Glance](/en/guide/features.md)
- Architecture and session hosting: [Architecture](/en/guide/architecture.md)
- Product overview: [aiti-agent](/en/products/aiti-agent.md)
- Relationship to upstream pi-web: [Origin](/en/guide/origin.md)
- Page debugging toolchain: [aiti-devtools](/en/devtools/)
