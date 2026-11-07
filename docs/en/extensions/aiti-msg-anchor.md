---
title: Message Anchor Banner (aiti-msg-anchor)
icon: 📍
description: A persistent banner at the top of the message area — shows "the user input that generated the content currently at the top of your screen", following turn segments as you scroll; switchable to first input / latest input / session title
---

# aiti-msg-anchor

> ❝ **Replying to the wrong person's words is more awkward than calling someone the wrong name.** ❞

A persistent **anchor banner** at the top of the message window: each user input and the AI replies after it form a "turn segment"; as you scroll, the banner follows the turn segment where the **top boundary** of the current viewport sits — **whichever input generated the content at the top of your screen, the banner shows that input** (with index/total; clicking the banner smooth-scrolls to that input).

- **Reference use**: when a large chunk of output sits at the top and you can't tell which input it belongs to, the banner shows the corresponding input for reference (right-aligned to the end of the message column, temporarily standing in for the off-screen user input); **the banner auto-hides when the anchor input is already visible on screen** (if you can see the input, what's the point).
- **Shows while scrolling, fades out 6s after scrolling stops** (visible for 6s initially; afterwards scrolling wakes it).
- **Pure frontend extension**: works with the two DOM contracts shared with aiti-msg-nav (`[data-chat-scroll]` / `[data-chat-msg-role]`), zero server API; zero layout reads in scroll frames (cached positions + binary search); lazy loading/streaming changes rebuild via a throttled MutationObserver.
- **Session title mode**: with `display.mode = title` it shows the session title (the name; if absent, the session's first input — same source as the left session list title), passed through via the chatOverlay slot's `currentSession`.
- **Known limitation**: index/total are based on user messages rendered in the current DOM (the virtual list renders only the viewport window) — in large sessions total is "rendered" rather than full; click-to-jump also only works within the rendered range. A trade-off under the pure-frontend contract.

## Feature management (extman)

| feature | type | default | description |
|---|---|---|---|
| `show.banner` | boolean | on | master switch |
| `display.mode` | string | `current` | `current`=the user input the current viewport belongs to (scroll following); `first`=the session's first input; `latest`=the most recent input; `title`=session title |
| `text.maxLen` | string | `140` | banner text truncation length (characters) |
| `display.title` | boolean | on | show the session title line as the banner's first line |
| `display.input` | boolean | on | show the anchor input line as the second line |
| `display.opacity` | string | `85` | banner opacity (0-100) |
