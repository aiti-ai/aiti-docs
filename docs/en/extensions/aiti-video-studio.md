---
title: aiti-video-studio (video studio)
icon: 🎬
description: Deterministic scene.json replay to demo video — browser/desktop capture, TTS narration, cursor/overlays, transitions, subtitles and multi-format export.
---

# aiti-video-studio (video studio)

> Write the scene once, replay it forever.

Scenes are deterministic `scene.json` scripts. Video Studio records them, adds TTS
narration and composes a final video; runtime recording and composing do not call AI.

## System audio

Default: `system.audio.system: false` (no loopback device needed).

To capture application/system sound:

### Windows — VoiceMeeter

**Tested 2026-11-22 (Windows 11 26200 x64)**: VoiceMeeter 1.1.3.0 installed successfully;

> **SSH-only host note**: Windows OpenSSH sessions run in session 0 without a logged-in desktop; VoiceMeeter and the default-output/B1 routing need an interactive desktop session. On an unattended box, log in once via RDP/local first. the driver registers as `VB-Audio Voicemeeter VAIO`; ffmpeg enumerates `Voicemeeter Out 1..8`; dshow capture of a 44.1kHz stereo WAV works. Default-output/B1 routing still needs the manual steps below, and the audio driver needs a reboot.

1. Install the official VoiceMeeter ZIP as administrator.
2. Reboot after installing the audio driver.
3. Start **VoiceMeeter x64**.
4. Windows Settings → Sound → Output: select **VoiceMeeter Input (VB-Audio VoiceMeeter VAIO)**.
5. In VoiceMeeter: route **A1** to real speakers/headphones and enable **B1** on the virtual input strip.
6. Verify:

```powershell
ffmpeg -hide_banner -list_devices true -f dshow -i dummy
```

Expected capture device:

```text
"Voicemeeter Out 1 (VB-Audio Voicemeeter VAIO)" (audio)
```

7. Scene:

```json
"system": {
  "audio": {
    "system": true,
    "device": "Voicemeeter Out 1 (VB-Audio Voicemeeter VAIO)"
  }
}
```

A single virtual cable (**VB-CABLE**) is a simpler alternative: set playback to
`CABLE Input` and capture `CABLE Output`.

### macOS — BlackHole 2ch

Install `blackhole-2ch`, create a Multi-Output Device (Built-in Output + BlackHole),
select it as system output, then use `system.audio.device: "BlackHole 2ch"`.

### Linux

`system.audio.device: "auto"` selects a PulseAudio/PipeWire `.monitor` source.

## AI tools in `ai-decide` / `ai-fix`

Both runtime AI points may call tools before answering:

```text
ai-decide → {"tool":"page.snapshot"} → tool-result → {"tool":"page.click",...} → {"value":"..."}
ai-fix    → {"tool":"page.snapshot"} → tool-result → {"patch":{"selector":"#real"}}
```

- Protocol: JSON-in-text (the host AI channel is text-only), identical across pi-web, the exported
  endpoint and CLI `--ai-url`.
- Tools execute inside the runner (which owns the live page); the server drives the loop with a 90s
  budget, 8 rounds, 10s per tool and a 2-consecutive-error circuit breaker.
- Browser tools: `page.info/snapshot/screenshot/assert/console/network/click/dblclick/hover/type/press/scroll/waitFor`,
  `cdp.snapshot`, `cdp.send`.
- Desktop tools: `desktop.windows/screenshot/assert/click/dblclick/type/key/scroll/focus/window`.
- CDP is allowlisted (`DOM.*`, `Page.getLayoutMetrics`, `Page.captureScreenshot`,
  `Runtime.getProperties`); Browser/Target/Network/Storage/Fetch/Debugger/Profiler/Security/Emulation
  and `Page.navigate` / `Runtime.evaluate` are always blocked.
- Scene privacy masks apply: redacted element text is masked before any DOM reaches the model.
- Diagnostics: a console/pageerror ring and failed requests (HTTP >=400) are captured and included in
  the initial evidence; `page.console` / `page.network` expose them on demand.
- Audit: `status.json` `toolCalls` plus `<runDir>/ai-tools.jsonl` (full payloads) and a collapsible
  list in the panel.
- Switches: `ai.tools.enabled`, `ai.tools.mutations` (default on), `ai.tools.vision` (default off),
  `ai.tools.maxCalls`, `ai.tools.allowAnyCdp` (default off).

### Vision

With `ai.tools.vision: true` the decision/repair screenshot is attached as an image part, and any
`page.screenshot` the model takes is attached on the next turn (<=2MB each). Requires a
vision-capable model (verified with `zai-coding-cn/glm-5.3-flash`, `opencode-go/hy4-flash-free`).
Scene `redact` masks are part of the rendered page, so they apply to screenshots too — enabling vision
does not bypass the privacy rules.

### Result loop (`until`)

```jsonc
{ "action": "ai-decide", "id": "fill", "output": "var:name",
  "prompt": "Fill the form and submit",
  "until": { "selector": "#created", "state": "visible", "timeoutMs": 2000, "retries": 3 } }
```

After the AI answers, the runner asserts the target state; on failure it feeds the reason plus a fresh
snapshot back into the loop (3 retries by default, `retries: 0` fails fast).

- browser: `{ selector, state: visible|hidden|attached|detached|text }` via `page.assert`
- desktop: `{ window: "<title>", state: exists|absent|focused|title }` via `desktop.assert` (no DOM)
- a **list** is allowed: `until: [{…}, {…}]` — all must hold, and a failure names which one (`#2/3`)

### Repair pre-flight (ai-fix)

A proposed patch is verified **before** it is applied (`page.assert` on the patch `selector` and every
`fx[].selector`). A selector that does not exist is fed back inside the same fix loop, so a bad guess
does not burn a `heal.maxFixes` slot.

## Desktop recording

```json
{
  "surface": "desktop",
  "system": {
    "capture": { "fps": 30 },
    "audio": { "system": true, "device": "auto" }
  }
}
```

Desktop capture needs a graphical login session. Windows requires an interactive
session; macOS requires Screen Recording permission.

## CLI

```bash
node cli/aiti-video-studio.mjs check  ./demo
node cli/aiti-video-studio.mjs record ./demo
node cli/aiti-video-studio.mjs compose ./demo
node cli/aiti-video-studio.mjs doctor
node cli/aiti-video-studio.mjs audio-devices
node cli/aiti-video-studio.mjs vault-list
```

`--ai-url` can point at the in-process pi-web endpoint:

```text
/api/extensions/aiti-video-studio/ai/chat/completions
```

No external OpenAI-compatible gateway is required.
