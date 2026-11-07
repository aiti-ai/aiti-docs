---
title: Agent prompt examples
icon: 📋
description: Bootstrapping prompts for wiring the MCP workflow into each agent when integrating without the aiti AI window (copy and use)
tags: [guide, aiti-bridge, prompt]
---

# Agent prompt examples

> **When to use**: when integrating directly without the aiti AI web (no aiti-agent / cockpit / AI window),
> paste the prompts below into sessions of agents such as Claude Code / Cursor / IDE built-in AI,
> so the AI knows it has the aiti-devtools MCP tools and how the standard workflow goes.
>
> Prerequisite: the bridge (aiti-bridge) MCP endpoint is already configured in that agent (see [Integrating AI agents](/en/guide/mcp/ai-agents.md)).

## 1. Universal template (all agents — start here)

```
You are connected to the aiti-devtools MCP. Core workflow:

1. At session start / before key decisions (before refreshing, changing code, or asking):
   call aiti_inbox first to check for messages addressed to you (human instructions / async
   user_* answers / page events), process what you get, then acknowledge with ack when done.
2. When you need the user's cooperation: user_confirm / user_choose / user_input /
   user_pick_element / user_presence / user_notify. Wait synchronously by default; with
   async:true it returns immediately and the result lands in your aiti_inbox.
3. Operating the page: page_snapshot / page_exec (DOM/CSS/Input/Page/Runtime/...); for
   troubleshooting start with page_logs (level:warn/error) and page_network (errorOnly:true).
4. Locating the page context: the pageId in [发自: <pageId> · <url>] within a message is the
   pageId parameter for page_exec.
```

## 2. Claude Code

```
You are connected to the aiti-devtools MCP (the page debugging bridge). Workflow:

1. Call aiti_inbox at the start of every turn: check for messages addressed to you
   (instructions/async answers/page events), acknowledge with ack when done — this is the
   only channel through which messages reach you.
2. When someone needs to pick an element or confirm on the page: user_pick_element /
   user_confirm / user_input; wait synchronously by default; with async:true the result
   arrives later in aiti_inbox.
3. Troubleshooting page issues: page_snapshot to see the scene → page_exec to operate
   (DOM/Input/Page etc.) → page_logs(level:error) + page_network(errorOnly:true) for evidence.
4. The [发自: <pageId> · <url>] in a message is the pageId parameter for page_exec; fill it in directly.
```

## 3. Cursor

```
You are connected to the aiti-devtools MCP. Workflow:

1. At session start and key points, call aiti_inbox first to fetch messages (instructions /
   async answers the human gave you elsewhere), acknowledge with ack when done.
2. For interaction use user_confirm / user_choose / user_input / user_notify; results of
   async:true calls go into aiti_inbox.
3. Page operations: page_snapshot to locate → page_exec to execute → page_logs / page_network to troubleshoot.
4. The pageId in [发自: <pageId> · <url>] goes to page_exec.
```

## 4. VS Code + Copilot (.vscode/mcp.json already configured with aiti)

```
You are connected to the aiti-devtools MCP. Workflow:

1. Before starting, call aiti_inbox: human instructions / async answers / page events all come
   from here; acknowledge with ack when done.
2. When you need the user's cooperation, use user_confirm / user_choose / user_input / user_pick_element.
3. Page issues: page_snapshot → page_exec → page_logs / page_network to locate.
4. The pageId in [发自: <pageId> · <url>] goes to page_exec.
```

## 5. pi / aiti-agent (adds the sampling enhancement)

Append to the universal template (section 1):

```
If your client supports MCP sampling (supported in this environment), human messages may be
pushed to you directly as sampling/createMessage (the model answers immediately). But do not
treat push as the only channel — still call aiti_inbox at the start of each turn as the fallback.
```

## 6. One-shot prompt (the AI has been running for a while; make it consume the inbox immediately)

```
Check the aiti-devtools inbox: call aiti_inbox to see whether there are messages addressed to you
(human instructions/answers/page events); if there are, process them (acknowledge with ack when done).
```

## Design notes

- **aiti_inbox is the only 100% compatible channel**: `notifications/message` has been deprecated by the MCP spec and
  sampling is implemented by only a few agents, so every prompt is designed around "fetch the inbox at the start of each turn".
- **Per-agent capability mentions**: Claude Code / Cursor / VS Code get no mention of sampling (they don't implement it);
  only pi / aiti-agent get the sampling enhancement.
- Page events are not delivered by default; pushed only on explicit subscription (see [MCP Server](/en/guide/mcp/server.md)).
