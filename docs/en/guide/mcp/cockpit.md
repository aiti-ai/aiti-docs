---
title: Universal AI window cockpit
icon: 🛰️
description: Onboarding page + address configuration hub + human-AI collaboration console; three integration paths; message window
tags: [guide, aiti-bridge, cockpit, ai-window]
---

# Universal AI Window (cockpit.html)

**cockpit** is aiti's universal AI window: three roles in one — **onboarding page** (opens by default when no AI UI is available), **address configuration hub** (displays/sets the bridge address and AI server address, bringing any agent into the system), **human-AI collaboration console** (works with agents once connected to the bridge).

## 1. Three address concepts (don't mix them up)

| Address | Meaning | Who uses it | Where it comes from |
|---|---|---|---|
| **AI server address** (aiUrl) | The page loaded in the AI window iframe = a web-based agent adapted to the aiti protocol (aiti-agent / pi-web / any page implementing the `aiti-devtools` protocol + the aiti extension client) | launcher opens the AI window | Auto-inferred (script src at injection → service root); `data-ai-url`; set by the user in cockpit |
| **MCP bridge address** (bridge URL) | MCP server endpoint (`…/mcp/mcp`); the agent's mcp.json points at it; the window's bridge-client connects to it | agent + window | Auto-inferred (script src at injection → mcp in the same directory); `data-bridge-url`; manual edit |
| **The agent's MCP config snippet** | Integration config derived from the bridge address (mcp.json / claude mcp add command) | User copies it to the agent | Generated and shown by the window |

> Adaptation rule (open protocol): **any agent with a web UI** can be configured as the AI server address as long as its page injects the aiti-devtools extension client (or implements the `aiti-devtools` postMessage protocol) — i.e. "opting itself into the aiti system".

## 2. Three integration paths

### Path 1: AI server address (web-agent adapted, the fullest experience)

1. The user sets the AI server address in cockpit → postMessage `aiti_ai_set_url` is pushed to the host inject.
2. launcher rebuilds the AI iframe to load the new address.
3. **Protocol probing**: receiving `aiti_ai_ready` from that iframe within 10s (the extension client's heartbeat) = protocol OK → **inject records it in localStorage only after confirming** → next time that UI opens automatically, no onboarding page needed.
4. **No response within 10s** (plain website / not adapted) → prompt "go back to the onboarding page?"; the address is not recorded.

### Path 2: MCP bridge address (fallback method, any agent)

1. Set the bridge address in cockpit → the window itself loads bridge-client.js to connect to the bridge (role=ai).
2. Bridge connection succeeds → shows "the MCP address the agent needs to be configured with" (copy the mcp.json snippet / claude mcp add command) → the user pastes it into any agent.
3. On success cockpit enters the **message window** (see §4).
4. Full per-agent guidance → [Integrating AI agents](/en/guide/mcp/ai-agents.md).

### Path 3: zero configuration (extension injection)

The page has aiti-devtools inject js injected → the bridge address is **auto-inferred** (mcp in the script src's directory) → connects to the bridge automatically to verify → on success it shows the MCP address the agent needs to be configured with, plus the connection status. **The user never configures the bridge address manually.**

## 3. Distribution channels and same-origin

- Distribution: ① aiti-devtools extension assets ② bundled with the mcp bridge service (`--port 8777` static directory) ③ official hosting at aiti.pw ④ CDN / ecosystem plugins (aiti-devtools-vite etc.)
- **Hard requirement: same origin as the host inject** (or CORS-communicable) — the postMessage protocol, localStorage memory (aiUrl/bridge), and protocol probing all depend on same-origin; on cross-origin, users are prompted to switch to the extension/aiti.pw channels instead.

## 4. Message window (after Path 2 succeeds)

- **Message list**: incoming and outgoing messages (human pushes, agent answers, page events), shown as a **sliding window** (last 50 by default, paginated loading for more)
- **Message consumption status**: each message shows delivered / pending consumption / consumed (`pending → delivered → consumed`; consumed history is kept permanently, see [MCP Server · Message storage](/en/guide/mcp/server.md#message-session-storage-pi-session-style-jsonl))
- **Input box + pending-picks area**: send messages to the agent (`POST /bridge/push`), with [元素N]/[回答N]/[错误N] placeholder substitution
- **One-shot prompt**: copy and send into the AI session to make the AI consume its inbox immediately:
  ```
  Check the aiti-devtools inbox: call aiti_inbox to see whether there are messages addressed to you (human instructions/answers/page events); if there are, process them (acknowledge with ack when done).
  ```

## 5. Settings entry points

- The AI window settings page (⚙ dialog) carries address settings and display: AI server address / bridge address / generated MCP config; editable, with re-probing after changes
- "Reset" resets position/size + all addresses (aiUrl/bridge)
- Extension-injected but want to use another agent: the settings page offers a "switch to cockpit" entry (clears aiUrl so it points to cockpit)

> Related: [Integrating AI agents](/en/guide/mcp/ai-agents.md) · [MCP Server](/en/guide/mcp/server.md) · [Session system](/en/guide/mcp/session.md)
