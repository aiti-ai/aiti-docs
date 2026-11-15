---
title: pi-subagents (delegation for pi)
icon: 🕸️
description: Sub-agent delegation plugin for the pi coding agent (aiti fork) — single-agent delegation + scripted multi-agent workflows (parallel / background / council panels / saved workflows / worktree isolation); the second and third pair of eyes for code review, parallel audits and implementation splits
---

# pi-subagents (delegation for pi)

> ❝ **When one pair of hands isn't enough, dispatch a few focused pairs of eyes.** ❞

A sub-agent delegation plugin for the pi coding agent ([aiti fork](https://github.com/nicobailon/pi-subagents) of nicobailon/pi-subagents):

- **Single-agent delegation**: `{agent, task}` spawns a focused child (code review / scouting /
  implementation)
- **Parallel & background**: multi-child parallel audits, background long jobs, native wake-up on
  completion
- **Scripted workflows**: saved workflows + worktree isolation + failure recovery
- **Council mode**: a bounded supervisor-mediated advisor debate (`/council`)

Ships its own skills (council-mode / pi-subagents), loaded on demand in pi sessions.
