---
title: pi-subagents (delegation for pi)
icon: 🕸️
description: Sub-agent delegation plugin for the pi coding agent (aiti fork) — single-agent delegation + scripted multi-agent workflows (parallel / background / council panels / saved workflows / worktree isolation); the second and third pair of eyes for code review, parallel audits and implementation splits
---

# pi-subagents (delegation for pi)

> ❝ **When one pair of hands isn't enough, dispatch a few focused pairs of eyes.** ❞

A sub-agent delegation plugin for the pi coding agent ([aiti fork](https://github.com/nicobailon/pi-subagents) of nicobailon/pi-subagents, merge-style sync based on v0.86.0). pi is the parent
session; a subagent is a focused child pi session with its own job — foreground children stream
inside the parent process, background children run in a detached runner process and keep working
until checked.

## Capabilities

- **Single-agent delegation**: `{agent, task}` spawns a focused child — code review, scouting,
  implementation, each to its own specialist
- **Parallel audits**: `{workflow:"parallel", tasks:[...]}` — e.g. correctness / tests /
  unnecessary-complexity reviewers at once
- **Background jobs**: detached runner, native wake-up on completion; `bg_wait` for
  no-notification waits
- **Scripted workflows**: `async:true` ```js workflow``` blocks, saved workflows, worktree
  isolation (one child per worktree — concurrent writers isolated), failure recovery
- **Council mode**: a bounded supervisor-mediated advisor debate (`/council`)
- **Management surface**: resume / steer / stop, run status, guide system
  (workflows / recommended-orchestration-pattern / …)

## Built-in safety discipline

- **Delegation needs authorisation**: size or complexity alone never authorises delegation — the
  operator must ask, directly or through applicable instructions
- **Tool activation gate**: fresh sessions expose the small `subagents_enable` loader first;
  when the request authorises delegation, pi calls the loader itself and the full `subagent`
  schema appears on the next model turn (protects provider prompt caches; `toolActivation`
  setting overrides)
- **One writer per tree**: one cwd/worktree, one writer; concurrent writers must be isolated
- **Fail loudly**: after a launch or runtime failure, stop and report — never silently switch
  channels

## aiti fork changes

- **Host capability layer** (`src/host/`): the opt-in `PI_SUBAGENTS_HOST=pi-web` switch turns off
  the terminal carrier surfaces (fleet view, async widget, slash commands) — the fork runs as an
  embedded engine inside pi-web with subagent activity surfaced through web panels; the `pi`
  default keeps upstream behaviour identical, and upstream unit tests stay green under both caps
- **Engine-layer purity**: `src/runs/**` must not import from `src/tui/` (co-enforced with
  upstream's engine-import-boundary guard); the last engine→TUI touch point routes through
  `src/host/shims/noop-widget.ts`
- **Upstream feedback**: generic improvements are proposed upstream one by one (#3182
  transcript-parsing move and #3186 async mutation evidence already landed)
- **Packaging**: ships TypeScript sources and exposes a stable `./host` subpath for embedding hosts

## Usage (zero-config start)

Natural language is enough after install — no agents to create, no config to write, no slash
commands to learn:

```text
Use reviewer to review this diff.
Run parallel reviewers: one for correctness, one for tests, one for unnecessary complexity.
```

pi decides whether to call the `subagent` tool, which agent to use, and how to compose the work.
Requires pi ≥ 1.2.0.
