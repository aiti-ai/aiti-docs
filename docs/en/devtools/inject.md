---
title: Injection Mechanics
icon: 💉
description: Local inject details, the three forms, host/iframe routing
tags: [devtools, inject, architecture]
---

# Injection Mechanics (local inject)

## 1. The Three Injection Forms

| Form | Carrier | Applies to |
|---|---|---|
| ① Opt-in adaptation | `<script src="aiti-devtools/inject.js">` | Any project where the developer is willing to add one line |
| ② Chrome extension / platform built-in | The extension injects a content script | Any site, no code changes |
| ③ IDE plugin | vscode/idea proxies the dev server for injection | During development, zero dependencies |

All three forms inject **the same script** (the launcher bundled in `inject.js`), share the same bridge protocol, and can replace or stack with each other.

## 2. Injection Sequence

```
HTML response (prepended, executes earliest)
  → createAitiLauncher(aiUrl, {bridgeBase, bridgeToken})
  → initialize the aiti-devtools mini client (8 domains: DOM/CSS/Input/Page/Runtime/Storage/Performance/Browser)
  → mount the Inspector UI (bottom-right 💬/<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-2px"><path d="M22 12h-4"/><path d="M6 12H2"/><path d="M12 6V2"/><path d="M12 22v-4"/><path d="M12 12"/></svg>)
  → the host's own client injection (__AITI_POST__ callback, source='self')
  → batch-inject same-origin iframes (injectAllIframes + MutationObserver as fallback for dynamic iframes)
  → (optional) connect to the MCP bridge SSE (registered via mcpConnect, long-lived EventSource)
  → the page persists instanceId to localStorage (reused across refreshes, no disconnection)
```

> The prepend semantics match service-tunnels' `transformResponse` — the same injection script can be reused by web workbench tunnels.

## 3. Host ⇄ iframe / Host ⇄ self Routing

### Message Envelope

```js
{
  __aiti: 1,            // protocol marker
  type: 'aiti_exec',    // aiti_* namespace
  payload: {...},      // typed payload
  requestId: 'req_1',  // async command correlation
  _f: 'f0' | undefined // downstream targeting: destination iframe frameId; omitted = host
}
```

| Direction | Description |
|---|---|
| host → iframe | `postMessage({__aiti:1, _f:frameId, type, payload}, '*')` |
| host → self | The `__AITI_POST__` callback dispatches locally (no postMessage) |
| iframe → host | `parent.postMessage`; the host identifies the source via `e.source` (the return path does not rely on `_f`) |

### Async Command Round Trip

```
execInPage(cmd, args, frameId)
  → requestId enters pendingCommands
  → postToFrame(frameId, {type:'aiti_exec'})
  → the target client executes the CDP command
  → post({type:'aiti_exec_result', payload:{requestId, ok, result}})
  → the host resolves by requestId (correlated via requestId, not relying on _f)
```

## 4. frameId and pageId

- Target entity = **the document containing the current active selection**; `frameId` omitted/empty = the host itself (`'host'`)
- Same-origin iframes are targeted by reference `frameId` (`'f0','f1'...` = `listFrames()` index)
- `inject` does not create its own preview iframe — the targets are the host page itself plus real iframes inside it (the production form)
- Full target ID: `pageId = instanceId/frameId` (e.g. `01234/f0`); AI only needs to be told this one value

## 5. Security Boundaries

- Cross-origin iframes automatically skip injection (try/catch): they can be enumerated but not targeted for execution
- eval is allowed by default within a session (visible in the panel audit)
- Dangerous commands get a confirmation card + confirmation queue; browser-restricted operations go through the gesture bridge (a real user click)
- Bridge token authentication; right-click / middle-click are allowed through

> Related: [CDP Command Set](/en/devtools/cdp-commands.md) · [MCP bridge · Sessions](/en/guide/mcp/session.md)
