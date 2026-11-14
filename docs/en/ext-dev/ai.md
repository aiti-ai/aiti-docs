---
title: AI Integration
icon: 🤖
description: Three routes for extensions to reach AI — invokeAI generic calls, the server.agent per-session extension point, and ai-helper skill self-management
tags: [ext-dev, ai, agent, invokeAI, skills]
---

# AI Integration

Three sanctioned routes for extensions to reach AI (combinable):

| Route | One-liner | Typical use |
|---|---|---|
| `ctx.invokeAI` | One-shot AI call (stateless) | Summaries / translation / classification / review suggestions |
| `server.agent.*` | Inject tools + subscribe to session lifecycle | Custom tools for agent sessions, monitoring, feedback loops |
| ai-helper skills | Teach the AI how to operate your extension | The AI can drive extension features autonomously |

## 1. `ctx.invokeAI` (generic AI invocation)

The core's lowest-level model capability: **zero business logic, zero accounting** — prompt
assembly / context / project state / token billing are entirely the caller's responsibility:

```ts
const { text, provider, model, usage } = await ctx.invokeAI({
  provider?, modelId?,  // default = the cheapest non-reasoning model globally (⚠️ not the session's current model)
  system?: "You are a summarizer",
  messages: [{ role: "user", content: longText }],
  maxTokens?, temperature?, reasoning?,   // reasoning e.g. "off", only effective when the provider supports it
  caller: "myext-review/summary",   // billing dimension: break down per scenario (defaults to ext.id)
});
// usage: { input, output, cacheRead, cacheWrite }
```

Real example: aiti-ai-schedule's `invokeAI` lightweight-QA mode (one of three modes alongside
session injection and one-shot full sessions).

## 2. `server.agent` (per-agent-session extension point)

In-process, zero-config injection into **every** agent session:

```ts
server: {
  agent: {
    // Inject custom tools (SDK ToolDefinition: name + label(required) + description +
    // parameters(TypeBox/JSON Schema) + execute; execute closures call in-process resources directly)
    agentTools(info) {   // info: { sessionId, cwd }
      return [{
        name: "my_tool",
        label: "My Tool",
        description: "...",
        parameters: { type: "object", properties: { /* JSON Schema */ } },
        async execute(_id, params) { /* ... */ },
      }];
    },

    // Session created (after wrapper creation): register agent identity / bind push sinks
    onAgentSession(info) {
      // info: { sessionId, cwd, steer(text), subscribeEvent?(listener), abortBash?(), getModel?() }
      const off = info.subscribeEvent?.((event) => { /* full event stream, incl. bash scrolling output */ });
    },

    // Wrapper destroyed (≠ the session file was deleted!)
    onAgentSessionEnd(info) {
      // info.reason: "shutdown" (truly ended) | "fork" (fork swapped the wrapper, file still exists) | "idle" (10-min GC, file still exists, rebuilt on next access)
    },

    // An agent turn finished (agent_settled) — feed the final answer back to a bridge/IM etc.
    onAgentSettled(info) { /* info: { sessionId, text } */ },
  },
}
```

### ⚠️ Idempotency iron law (from real accidents)

`onAgentSession` **may fire repeatedly**:

1. **idle GC → wrapper rebuild**: after 10 minutes idle, the same id fires again;
2. **extension hot reload**: the host re-attaches surviving sessions after reload.

So implementations must be idempotent: overwrite-style table writes; unsubscribe the old
subscription before re-subscribing `subscribeEvent`. The host reclaims the previous round of
subscriptions **established via `info.subscribeEvent`** before re-attaching (the subscription-epoch
ledger) — subscriptions that bypass it and attach to the wrapper's `onEvent` directly are not in
the ledger and must be unsubscribed by the extension. `reload` does not fire
`onAgentSessionEnd`.

### subscribeEvent and event filtering

`subscribeEvent` is an in-process direct feed (bypassing the SSE egress filter — the agent events
route drops `tool_execution_update`, i.e. bash's live scrolling output; extensions get it verbatim
through this).

### Tools and feature interplay

When a tool-level feature (`tool.<tool name>`) is disabled, the host filters it on injection and
rejects it immediately on execute (existing sessions included) — no toggle checks needed in your
code (see the [feature guide](/en/ext-dev/features.md)). For tool groups also declare an
`agentTools.enabled` master switch (default off; the helper 🤖 can enable temporarily, or extman).

Real examples: aiti-git-review (`aiti_review_*` tools injected only into review-task sessions via
per-session gating), aiti-ai-usage (`subscribeEvent("message_end")` real-time ingestion).

## 3. ai-helper skill self-management (an extension-to-extension convention)

> This one is **not a host contract** — it is a convention consumed by the aiti-helper extension
> (helper aggregates all extensions' help points).

Declare in the entry:

```ts
export default {
  id: "my-ext",
  ai: {
    manage: true,        // adds a "manage this extension" help point
    intro: "one-liner",  // help-point copy
    skills: "skills",    // skills directory name (defaults to "skills")
  },
};
```

Directory organization (pi skills standard):

```
my-ext/
  skills/
    index.json          # lists skill names only (avoids a full directory scan)
    do-thing/SKILL.md   # frontmatter = metadata and actions; body = how-to
```

When aggregating, the helper walks each extension's skills directory → index → each SKILL.md
frontmatter; the AI reads SKILL.md on demand to learn how to operate your extension (the AI gets
a one-line skill path and reads it with its read tool). See [aiti-helper](/extensions/aiti-helper.md).
