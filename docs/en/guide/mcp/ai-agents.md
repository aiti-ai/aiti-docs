---
title: Integrating AI agents
icon: 🧠
description: Capability matrix, per-agent integration and bootstrapping prompts, aiti_inbox main channel
tags: [guide, aiti-bridge, ai-agent]
---

# Integrating AI agents

The core value of aiti-bridge: **give any AI agent the ability to operate pages, ask the user, and receive messages**. Integration = configuring one standard MCP server; **the message channel that works 100% with any agent is `aiti_inbox` (the agent polls it proactively)**, not push.

## 1. Capability matrix (validated by 2026-08 research)

**Conclusion first**: "the server pushes one message and the agent's model sees it instantly" does not hold on almost any mainstream agent (`notifications/message` has been deprecated by the MCP spec; `notifications/progress` only shows a UI progress bar; sampling is rarely implemented). **The only 100% universal option is the agent calling `aiti_inbox` to poll.**

| Agent | Streamable HTTP | sampling | elicitation | Generic notifications visible to the model |
|---|---|---|---|---|
| **pi** (pi-mcp-adapter) | ✅ probed first | ✅ enabled by default (UI approval, can be turned off via `samplingAutoApprove`) | ✅ enabled by default (form-based collection) | ❌ |
| Claude Code | ✅ | ❌ (issue #1785) | ❌ | ❌ |
| Claude Desktop | stdio only | ❌ | ❌ | ❌ |
| Cursor | ✅ | ❌ (issue #3023) | ❌ | ❌ |
| VS Code + Copilot | ✅ | ⚠️ supported by the platform but unstable in practice | ❌ | ❌ |
| Gemini CLI | ✅ | ❌ (issue #10704) | ❌ | ❌ |
| OpenAI Codex | ✅ | ❌ | ❌ | ❌ |

**Design implications**:
- `aiti_inbox` is the **main channel** (every agent can call the tool)
- sampling push is an **enhancement** (only pi and a few other agents support it; pi enables it by default)
- Page events are not delivered by default; pushed only on explicit subscription

## 2. Integration examples

### Claude Code

```bash
npx @aiti-ai/aiti-bridge --register-shim claude   # registers the `aiti` entry; start claude with AITI_BRIDGE_URL to connect
claude mcp list   # verify aiti is connected
```

### VS Code (.vscode/mcp.json)

```json
{
  "servers": {
    "aiti": {
      "type": "stdio",
      "command": "node",
      "args": ["<bridge-install-dir>/bin/aiti-mcp-shim.cjs"],
      "env": { "AITI_BRIDGE_URL": "http://127.0.0.1:8777" }
    }
  }
}
```

### Any MCP client (mcp.json)

```json
{
  "mcpServers": {
    "aiti": {
      "type": "http",
      "url": "http://localhost:8777/mcp/mcp"
    }
  }
}
```

### aiti-agent (web workbench)

Configure the bridge address within the session (or have it inferred automatically via injection); the aiti-agent page ships with the aiti-devtools extension client, making it a natural AI window host.

## 3. Bootstrapping the AI (full per-agent versions in [agent prompt examples](/en/guide/mcp/prompts.md))

### Universal template (all agents — recommended)

> **Important: this is the only 100% compatible integration method; use it with every agent.**
>
> ```
> You are connected to the aiti-devtools MCP. Core workflow:
> 1. At session start / before key decisions (before refreshing, changing code, or asking):
>    call aiti_inbox first to check for messages addressed to you (human instructions / async
>    user_* answers / page events), process what you get, then acknowledge with ack when done.
> 2. When you need the user's cooperation: user_confirm / user_choose / user_input /
>    user_pick_element / user_presence / user_notify. Wait synchronously by default; with
>    async:true it returns immediately and the result lands in your aiti_inbox.
> 3. Operating the page: page_snapshot / page_exec (DOM/CSS/Input/Page/Runtime/...); for
>    troubleshooting start with page_logs (level:warn/error) and page_network (errorOnly:true).
> 4. Locating the page context: the pageId in [发自: <pageId> · <url>] within a message is the
>    pageId parameter for page_exec.
> ```

### pi / aiti-agent template (adds the sampling enhancement)

> Append to the universal template:
> ```
> If your client supports MCP sampling (supported in this environment), human messages may be
> pushed to you directly as sampling/createMessage (the model answers immediately). But do not
> treat push as the only channel — still call aiti_inbox at the start of each turn as the fallback.
> ```

### One-shot prompt (after the user has sent a message via cockpit, make the AI consume it immediately)

```
Check the aiti-devtools inbox: call aiti_inbox to see whether there are messages addressed to you (human instructions/answers/page events); if there are, process them (acknowledge with ack when done).
```

## 4. How messages reach the agent (capability fallback chain)

| Source | Channel | Description |
|---|---|---|
| Human sends a message in cockpit | **sampling push** (supporters such as pi) → **inbox queue** (all agents) | the former: the model answers immediately; the latter: the agent polls via `aiti_inbox` |
| Async `user_*` answer | **inbox queue** (routed back to the initiating agent) | with `async:true` the result does not block the return; it goes into the inbox |
| Page events (explicit subscription) | **inbox queue / push** | delivered only after subscribing via `aiti_hello` subEvents; not delivered by default |

## 5. Typical Q&A

```
User: Help me find out why the login page returns 500
AI: page_snapshot to confirm the page → page_exec to submit the form → collect the console →
    finds that /api/login is missing Content-Type
User: user_confirm pops up "Add the Content-Type header uniformly in the api layer?" → approved
AI: modifies the code + verifies (the page auto-refreshes, the error is gone)
```

> Protocol details in [MCP Server](/en/guide/mcp/server.md), sessions in [Session system](/en/guide/mcp/session.md), human-side UI in [cockpit](/en/guide/mcp/cockpit.md).
