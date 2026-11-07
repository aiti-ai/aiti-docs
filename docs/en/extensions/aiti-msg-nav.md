---
title: Message Scroll Navigation (aiti-msg-nav)
icon: 🧭
description: A scroll navigation bar on the right side of the message area — to earliest / to latest / previous / next user input, one-click direct access; long-press "to latest" keeps the screen awake
---

# aiti-msg-nav

> ❝ **For chat histories thousands of stories tall, the elevator beats the stairs.** ❞

A vertical **scroll navigation bar** on the right side of the message area, with four buttons:

- ⏫ **To earliest**: scroll to the top of the message container (triggers core lazy pagination → older messages load automatically while the viewport is held)
- ▲ **Previous user input**: from the viewport top boundary, find the previous `user` message and smooth-scroll to its upper edge (-24px margin)
- ▼ **Next user input**: same as above, searching downward for the next one
- ⏬ **To latest**: scroll to the bottom of the container; **long-press** keeps the screen awake (Screen Wake Lock API, active during `agentRunning`, auto-degrades when unsupported)

- **Pure frontend extension**: originally pi-web's built-in `ScrollToolbar`, extracted wholesale into an extension — core keeps only a `chatOverlay` slot mount point, with all interaction/positioning/scroll logic in the client bundle, working off two DOM contracts (`[data-chat-scroll]` scroll container / `[data-chat-msg-role]` message nodes), **zero server APIs**.
- **Depends on core lazy pagination**: scrolling to the top triggers the sentinel → core automatically loads older messages and holds the viewport; when "to earliest" has already hit the bottom of loaded history, it retries with a delay at the top of the container.
- **User message positioning**: linear scan to find the anchor (`getBoundingClientRect` relative to the container top + `scrollTop`; `scrollTop + 8` is the viewport-top decision boundary).
- **Drag to reposition**: the whole nav bar can be dragged anywhere in the message area (persisted in localStorage `pi-scroll-toolbar-pos`, same key as the old built-in version so user habits carry over).

## Feature management (extman)

| feature | Type | Default | Notes |
|---|---|---|---|
| `show.toolbar` | boolean | on | Master switch (off = the nav bar isn't rendered) |
| `behavior.keepAwake` | boolean | on | Long-press "to latest" keeps the screen awake (Screen Wake Lock API, auto-degrades when unsupported) |

## Related extensions

- **aiti-msg-anchor** (message anchor banner): same `chatOverlay` slot, same set of DOM contracts — anchor is a top banner, nav is a right-side button column, complementary layouts; when both are on, watch for potential overlap at the top-right edge (both are absolutely positioned to the message column's right edge).
