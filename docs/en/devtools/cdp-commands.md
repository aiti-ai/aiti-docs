---
title: CDP Command Set
icon: 🎛️
description: The full set of CDP-style commands executable via page_exec — 47 commands across 8 domains
tags: [devtools, cdp, commands]
---

# CDP Command Set (47 commands across 8 domains)

`page_exec` executes CDP-style commands inside the target page: `{ cmd: "DOM.querySelector", args: {...} }`. The commands are implemented locally in the page context by the injected client (not native Chrome DevTools Protocol forwarding), with naming aligned to CDP style.

## DOM

| Command | Description |
|---|---|
| `DOM.querySelector` | Query an element by selector; returns a serialized node (tag/attrs/xpath/text/computed/framework) |
| `DOM.querySelectorAll` | Batch query; returns a simplified node tree (excluding aiti's own UI, capped at 20 entries) |
| `DOM.getDocument` | Document tree overview (configurable depth, default 3 levels) |
| `DOM.getBoxModel` | Element box model (content quad + padding/margin/border/scroll) |
| `DOM.getOuterHTML` | Outer HTML (truncated to 8000 characters) |
| `DOM.getInnerText` | Visible text (sanitized, then truncated) |
| `DOM.setAttribute` / `DOM.removeAttribute` | Attribute operations |
| `DOM.removeNode` ⚠️ | Remove a node (irrecoverable, requires confirmation) |
| `DOM.clearSelection` | Clear the current selection state and outline |

## CSS

| Command | Description |
|---|---|
| `CSS.getComputedStyle` | computed style |
| `CSS.getMatchedRules` | Matched rules |
| `CSS.setStyle` | Override styles |
| `CSS.listStyleSheets` | Stylesheet list |
| `CSS.getStyleSheetText` | Stylesheet text |

## Input

| Command | Description |
|---|---|
| `Input.click` / `Input.hover` / `Input.focus` / `Input.blur` | Basic interactions |
| `Input.setValue` | Set value (React-compatible: native setter + input/change events) |
| `Input.type` / `Input.insertText` / `Input.keyPress` | Keyboard input |

## Page

| Command | Description |
|---|---|
| `Page.getMeta` | Page metadata (title/url/viewport/framework detection, etc.) |
| `Page.scrollTo` / `Page.scrollIntoView` | Scroll positioning |
| `Page.reload` ⚠️ | Reload (requires confirmation) |
| `Page.navigate` ⚠️ | Navigate (requires confirmation) |
| `Page.captureScreenshot` 🖐 | Screenshot (getDisplayMedia; the browser pops a picker to choose screen/window/tab; large images are automatically written to disk and a path is returned) |
| `Page.getFrameTree` | Frame tree (iframe src/name/title; same-origin includes url/readyState) |

## Runtime

| Command | Description |
|---|---|
| `Runtime.evaluate` | Execute JS in the page context — **disabled by default**; enable it in the panel or call `Runtime.setEvalEnabled {enabled:true}` first; `contextId` enters an iframe context (same-origin, index starts at 1) |
| `Runtime.setEvalEnabled` | Toggle evaluate |
| `Runtime.fetch` | Send requests in the target page's context (same-origin, no CORS; affected by network emulation) |
| `Runtime.getProperties` | Enumerate object properties |

## Storage

| Command | Description |
|---|---|
| `Storage.localStorageGet` / `localStorageSet` ⚠️ / `localStorageClear` ⚠️ | localStorage (writes/clears touch persistent data, require confirmation) |
| `Storage.sessionStorageGet` | sessionStorage |
| `Storage.cookies` | Cookies (document.cookie, truncated to 2000 characters) |

## Performance

| Command | Description |
|---|---|
| `Performance.getEntries` | Resource timing entries (most recent N, default 10) |

## Browser (restricted operations, executed by the host + gesture bridge)

Operations that browser security policy requires transient activation for are executed on the page's behalf by the host page via the gesture bridge:

| Command | Description |
|---|---|
| `Browser.copy` / `Browser.paste` | Clipboard write/read (reading may pop an authorization prompt) |
| `Browser.download` | Download a file |
| `Browser.openWindow` | Open a new window |
| `Browser.pickFile` | File picker (small files return content directly / small images convert to dataUrl) |
| `Browser.share` | System share panel (title/text/link) |
| `Browser.fullscreen` | Fullscreen |
| `Browser.play` | Play audio/video (bypasses autoplay policy) |

## Compatibility Aliases

Legacy short names are auto-mapped via `CMD_ALIASES`: `getInfo` → `DOM.querySelector`, `highlight` → `DOM.querySelector`, `scrollIntoView` → `Page.scrollIntoView`. Use the standard names in new code.

## Common Semantics

| Concept | Description |
|---|---|
| Target | `pageId` (`instanceId/frameId`); default = host frame |
| Dangerous commands ⚠️ | `DANGER_COMMANDS` list (5 items) → confirmation card + confirmation queue; repeat confirmations can be waived within a debug session (dangerAutoOkMs) |
| Gesture bridge 🖐 | `GESTURE_COMMANDS` list (9 items) → executed by the host (transient activation-safe); unattended mode can be configured to auto-allow |
| Result | `{ok: true, result}` or `{ok: false, error}`, correlated by requestId |

> For invoking via MCP, see [MCP bridge · server](/en/guide/mcp/server.md).
