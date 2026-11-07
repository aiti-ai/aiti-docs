---
title: AI Input Enhancement (aiti-ai-input)
icon: ⌨️
description: Chat input box enhancement — L0/L1 two-layer autocomplete + favorite suggestions + 🎤 real-time ASR voice input (pluggable engines/hotwords/2-pass refinement) + dictation detection and repair
---

# aiti-ai-input

> ❝ **Before you finish typing, it has already guessed half of it.** ❞

Input enhancement extension for the AI chat input box (long-term keeper, not a temporary experiment).

### Autocomplete (L0 local instant → L1 AI)

Typing pauses 700ms with the cursor at the end → gray ghost text shows the next sentence (Tab/→ to accept, Esc/keep typing to cancel).

- **L0 local layer (zero-model, instant)**: first checks locally favorited prompts + session history inputs; the server `POST /complete mode=local` prefix-matches, and on a hit the gray text appears immediately with a ↦favorite/↦history badge, without calling the AI
- **L1 AI layer**: only when L0 misses does it make a small same-model request (gray text appears after 0.4–2s)
- **Governance**: extman feature management — `autocomplete.enabled` master switch · `autocomplete.localOnly` (L0 only, zero network egress) · `autocomplete.minChars` (minimum trigger length, default 3, CJK weighted ×1.5) · ctx three-tier context budget

### Favorite suggestions (suggest)

Typing a prefix in the input box pops a candidate panel:

- **Static sources first**: commands ⚡ rank0 + prompts 📌 rank1; when nothing matches, `aiFallback` serves as the fallback
- **Backend extension point**: `POST /providers {id,path,label,rank}` registers a suggestion source
- **`POST /suggest`**: aggregates provider results + strict filtering for short input (`suggest.looseLen` default 10)
- **⚡ one-click run**: feature `ai-input.suggestRun` default off (enable in extman)

### Voice input (three layers)

**① Dictation detection + repair** (default off: `voice.fix` / `voice.indicator`)

1. Pure browser event-feature detection of voice/high-speed input (`beforeinput` inputType + rhythm), zero server dependency
2. On detection → a "🎤 checking and fixing transcription errors for you" marker bar above the input box, dismissible with ✕
3. On send, AI spelling repair for typos/transliterated words/repeated words, giving replacement suggestions only at ambiguous spots

**② 🎤 Real-time ASR (push to talk)** (two master switches `voice.enabled` / `toolbar.enabled`, default off; enable in extman)

Real-time streaming WS recognition + VAD auto segmentation (~0.7s) + pseudo-real-time sentence segmentation via SenseVoice + on release a 2-pass offline refinement (Qwen3-ASR).

**③ Pluggable ASR engines (asr-config.json)**

- **Self-hosted 8767** (FunASR / Qwen3 / GLM): true streaming + model-level hotwords
- **iFlytek**: local bridge 8768, true streaming
- **Baidu / SiliconFlow / Azure / OpenAI-compatible endpoints**
- Switch engines in the panel; keys are masked and only the last 4 characters are returned

### Hotwords / usage stats / self-healing

- **Hotwords**: the session-manager `hotwords` service auto-extracts per workspace and merges with the user lexicon (`user-hotwords.json` ≤500), pushing per-workspace biasing to 8767 recognition (hash key + 10min TTL debounce)
- **Usage stats**: the "Voice traffic statistics" tab in the right panel (`GET /asr/usage`)
- **8767 self-healing**: `/asr/ensure` launches it via the aiti-cmd runner PTY (circuit breaker 60s / dedup window 120s); `/asr/control start|stop|restart`
