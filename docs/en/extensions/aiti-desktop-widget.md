---
title: aiti-desktop-widget (desktop overlay shell)
icon: 🪟
description: A business-agnostic native desktop shell — frameless, transparent, always-on-top, click-through/draggable, URL or local HTML content, multi-monitor placement and a stdin JSONL control channel; powers aiti-video-studio live captions.
---

# aiti-desktop-widget (desktop overlay shell)

> ❝ **The shell owns the window; the caller owns the content.** ❞

A cross-platform (Tauri 2) desktop window shell that knows nothing about captions, floating
icons, status cards or desktop pets. It renders an `http(s)` page (or local HTML) as a frameless,
transparent, always-on-top window, optionally click-through or draggable, and exposes a CLI plus
a stdin JSONL control channel.

## Install

```bash
npm install -g @aiti-ai/aiti-desktop-widget
aiti-desktop-widget --help
```

The npm package is a launcher. The native binary is a GitHub/Gitee Release asset downloaded on
first run by [justget](https://www.npmjs.com/package/justget) — multi-source racing (GitHub →
Gitee → gh-proxy mirrors), sha256 verified, cached per version/platform. Linux, Windows and
macOS are supported on x64 and arm64.

Standalone build: `cargo build --release` in
[`integrations/aiti-desktop-widget`](https://github.com/aiti-ai/aiti-ai/tree/main/integrations/aiti-desktop-widget).

### Local / offline install

Pack the launcher from a checkout and pre-seed the native cache (no published Release needed):

```bash
cd integrations/aiti-desktop-widget/npm && npm pack
npm install -g ./aiti-ai-aiti-desktop-widget-0.2.0.tgz --ignore-scripts
# Windows: recreate shims if npm skipped them for a local tarball
npm rebuild -g @aiti-ai/aiti-desktop-widget
```

Put the built binary at `<cache>/<version>/<platform>/` and write a `checksums.txt` line
`<sha256>  <release asset name>` next to it; the launcher then runs fully offline. Caches:
`~/.cache/aiti-desktop-widget/...` (Linux), `~/Library/Caches/aiti-desktop-widget/...` (macOS),
`%LOCALAPPDATA%\aiti-desktop-widget\cache\...` (Windows). See the npm README's "Local / offline
install" section for details.

## Usage

```bash
# frameless transparent caption window, click-through
aiti-desktop-widget http://127.0.0.1:8765/caption-bar.html --width 900 --height 140 \
  --click-through true

# local HTML served from a loopback origin
aiti-desktop-widget --html ./pet/index.html --root ./pet --width 220 --height 220 --draggable true

# pick a monitor and center on it
aiti-desktop-widget http://127.0.0.1:8765/ --display 1 --center true
```

The full CLI/config/control-channel reference lives in the
[README](https://github.com/aiti-ai/aiti-ai/tree/main/integrations/aiti-desktop-widget#readme).

## Demo: transparent lyric player

`demo/play/play.html` is a dependency-free example: audio playback + LRC/SRT/VTT lyrics +
current-line highlight + seekable progress + keyboard controls. The card is translucent by
default; `?bare=1` removes it for a text-only overlay.

```bash
aiti-desktop-widget \
  --html '/abs/path/demo/play/play.html?file=assets/aiti-intro.mp3&lyrics=assets/aiti-intro.lrc' \
  --width 900 --height 320 --transparent true
```

Params: `file`, `lyrics` (`lrc|srt|vtt|subtitle`), `title`, `artist`, `cover`,
`theme=dark|light`, `bg=transparent|none|color`, `bare=1`, `autoplay` (default 1, attempts to start on open),
`layout=auto|card|line`, `loop=1`, `volume`. At height ≤220px (or `layout=line`) the page
switches to a one-line marquee with the text-width progress fill covering the current lyric (karaoke-style).
The sample audio/lyrics are generated with edge-tts + ffmpeg (no third-party audio); run
`node demo/play/serve.mjs` for a local preview.

## Page control and one-line autosize (default on)

Loopback pages get **window control** by default (`capabilities/widget-page-control.json` +
`withGlobalTauri`): geometry/monitor reads, `setSize`/`setPosition`/`center`, size constraints,
`startDragging`/`startResizeDragging`, always-on-top/click-through/all-workspaces/skip-taskbar/
shadow/decorations/focusable/title, hide/show/close and WebView zoom. The capability matches only
`127.0.0.1` / `localhost`; external pages loaded with `--allow-remote true` cannot invoke it.
Destructive/multi-window permissions (create/destroy, fullscreen/maximize, icon/badge/progress,
clear-data/devtools) stay off.

`demo/play/play.html` in one-line mode (`layout=line` or height ≤220px) defaults to `autosize=1`:
the window width follows the current lyric while the **window center stays fixed**; use
`autosize=0` to keep the caller size. The page updates the min=max constraints before resizing
(`--resizable false`). Dragging is still a DOM `data-tauri-drag-region`, not a window property.

## Used by aiti-video-studio

Video Studio's desktop `overlay` caption mode opens a loopback caption page
(`caption-bar.html?bubble=1`) in aiti-desktop-widget and pushes subtitles over SSE. The shell owns
transparency/always-on-top/click-through; Video Studio owns the content and its SSE/audio sync.
`system.caption.style` (font size/weight/color/background/radius; `background:"transparent"` for
text-only captions) also flows through the shell.

Lookup order: `AITI_WIDGET_BIN` → `~/.pi/bin/aiti-desktop-widget` → PATH; without a binary, Video Studio
falls back to GTK/Chrome captions.

## Platform notes

- **Linux**: WebKitGTK 4.1 + GTK3; on X11 without a compositor transparent areas may render black.
- **Windows**: WebView2 runtime required (preinstalled on Windows 10/11, including ARM64); the
  binary is unsigned.
- **macOS**: minimum **10.15 (Intel) / 11.0 (Apple Silicon)**; `Info.plist` is embedded in
  `__TEXT,__info_plist` (ATS localhost exception + `LSUIElement`), so the bare binary loads
  `http://127.0.0.1` without an `.app` bundle; tested on 11.7.

## Release

Tag `aiti-desktop-widget-vX.Y.Z` builds six platform assets + `checksums.txt`, publishes a GitHub
Release, mirrors it to Gitee, and publishes the npm package.
