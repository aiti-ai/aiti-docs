---
title: aiti-ai-speek
icon: 🔊
description: Voice reading of AI output — switchable voice/pause/skip/stop; browser Web Speech by default, optional edge-tts
---

# aiti-ai-speek

The pi-web "follow-read mode" extension: reads AI output text aloud with speech.

- **Dual engines**: browser Web Speech by default (zero dependencies); optional edge-tts server-side synthesis (more natural voices).
- **Playback controls**: pause/resume/skip/stop; reading progress anchored to messages.
- **ASR hotword integration**: hotword extraction goes through the `session-manager.hotwords` service (consuming the [session-manager](session-manager.md) outlet).

## Recent Changes (2026-09)

- **Dual-SSE dual-push merge (Plan A)**: the text-stream and playback-progress SSE channels merged into a single channel with dual pushes, eliminating out-of-order/duplicate frames; extman pre-materializes lazy extensions (opening the panel spins up the client).
- The extension is lazy-loaded (`clientImmediately:false`).


