---
title: "UI Environment · Desktop/Headless Virtual Display (aiti-ui-env)"
icon: 🖥️
description: Environment allocator for UI debugging on headless background servers — a 4-state mode arbiter decides whether newly launched MCP/apps land on a real desktop or an Xvfb headless virtual display (Xvfb+openbox+AT-SPI virtual display + VNC-on-web + RDP-on-web), service-ized on Linux/Windows/macOS; the VNC password is authenticated by the VNC server itself (the bridge is pure passthrough)
---

# aiti-ui-env

> ❝ **No monitor needed — there can still be a stage.** ❞

A UI debugging environment manager for background headless servers (VPS/workstations): a set of **4-state mode switches**
decides whether "newly launched MCP / GUI apps" land on the **real desktop** or the **Xvfb headless virtual display**
(openbox WM + AT-SPI bus + VNC-on-web), so a person can see and operate the virtual desktop from a browser.

- Full plan: internal design document (mode state machine, activation chain, Linux/Windows service-ization, install matrix)
- Prerequisite reference: headless AT-SPI field tests and container VNC blueprint (internal research document)

## Four Modes (Switchable Anytime, Effective for New Launches)

| # | Mode | Semantics |
|---|---|---|
| 1 | `prefer-desktop` Prefer desktop | desktop if available → desktop, otherwise virtual display |
| 2 | `prefer-headless` Prefer headless virtual environment | virtual display if available → virtual display, otherwise desktop |
| 3 | `always-desktop` Always desktop | force desktop, error out if unavailable |
| 4 | `always-headless` Always headless virtual environment | force virtual display, gives launch guidance if not started (can be auto-started) |

Switching takes effect immediately: already-running processes are untouched; the next `resolve`/`run` uses the new mode.

## Capabilities

- **Agent tools** (Plan M injection; the whole group's feature `agentTools.enabled` is **off by default** — enable temporarily via helper 🤖 or via extman, or toggle items individually):
  `ui_env_status` / `ui_env_set_mode` / `ui_env_resolve` / `ui_env_run` / `ui_env_headless` (virtual display start/stop) / `ui_env_deps` (dependency self-check/install) / `ui_env_vnc` / `ui_env_rdp`
- **CLI**: `scripts/ui-env` (in a shell, `eval "$(ui-env env)"` injects the environment directly into MCP/app launchers)
- **API**: `/api/extensions/aiti-ui-env/{status|set-mode|resolve|run|headless|vnc|vnc-session|vnc-password|vnc-clipboard|rdp|rdp-session|install-status}`
- **Panel**: toolbar 🖥️ → 4-mode radio + dual environment cards (probe results) + VNC links + 🔑 password + install status

## Virtual Display Stack (Linux)

```
Xvfb :99 ─ dbus/AT-SPI bus ─ openbox ─ x11vnc 127.0.0.1:5900 ─ vnc-bridge 127.0.0.1:6080
                                      └── External access: extension middleware proxy
                                          /aiti-ui-env/vnc/* (incl. WS upgrade) → same port as the current site
```

Launch env output: `DISPLAY=:99` + `DBUS_SESSION_BUS_ADDRESS` (the AT-SPI semantic tree becomes visible, for use by
standalone driver extensions such as cua.ai) + `XDG_RUNTIME_DIR` + GTK/Qt a11y switches.
cua.ai is **not part of this extension** — it attaches to this extension's AT-SPI bus as an independent extension (one-way dependency).

> **VNC-on-web: multi-instance + random ports + zero-credential URLs**: each start randomly allocates an RFB/Web port (avoiding conflicts with the
> desktop's gdm or other services); repeated starts automatically open new instances (registry persisted in `dataDir/vnc-instances.json`);
> browsers go through the current site's middleware (under the sub basePath at `/aiti-ui-env/vnc/*`, WS routed via `/ws/<instance-id>`).
> **The URL carries no target address**: the path segment = the instance's true random token (rotated every 30min with a grace window for old tokens; middleware routes by the first segment to the instance's webPort);
> authentication = a 30min HttpOnly cookie (issued by `POST /vnc-session`, established when the panel opens): copying the URL elsewhere without the cookie gets a straight 403
> (anti-leak / anti-pivot); refresh/reopen works within 30min.

## VNC Password Contract (Finalized 2026-09-18)

The password is "the one the user themselves knows" — on set, it is persisted to `configDir/vnc-passwd` (1–8 chars; env `UI_ENV_VNC_PASSWORD` takes priority; 0600), **authenticated by the VNC server itself, the bridge never answers on its behalf** (`lib/vnc-bridge.mjs` is a pure RFB passthrough; noVNC only pops the password prompt).

- **UltraVNC's proprietary key**: its ini `passwd` uses the proprietary DES-ECB key `E84AD660C4721AE0` — **not** the standard VNC key `17526B06234E5807` (using the wrong key makes the server decode garbage and fail); format = 8 bytes ciphertext + 1 checksum byte in hex, written lowercase only into `[UltraVNC] passwd`; the system-installed TightVNC uses the standard key
- **Kill winvnc before writing**: on exit, winvnc writes its in-memory old config back to ultravnc.ini, overwriting the new value; the ini is rebuilt wholesale to prevent leftover keys
- **PS scripts must be UTF-8 BOM**: PowerShell 5.1 decodes BOM-less files as ANSI; Chinese comment bytes concatenate and swallow code after a line-ending backtick
- **`resetVncPassword(pw,{id})` unified entry** (panel 🔑 / `POST /vnc-password` / `ui_env_vnc reset-password`): Windows = self-managed portable winvnc (ini + restart) + system-installed UltraVNC/TightVNC registry (requires admin); Linux = x11vnc `-rfbauth` / `~/.vnc/passwd` (storepasswd→vncpasswd→openssl legacy three-level fallback); **macOS Screen Sharing uses the system account password and cannot be changed** — `SysVncEntry.passwordResettable=false` + `passwordNote` points elsewhere, and the UI shows/hides by the flags

## RDP-on-web

webRDP forwards the RDP protocol into the browser as WS via rdp-bridge (agent tool `ui_env_rdp` + feature `behavior.rdp`): `POST rdp {start{host,port supports host:port/rdp://}|stop|status|list|sys-scan|sys-open{port}|sys-stop}` (sys-open/sys-stop bridge to the system xrdp); middleware `/aiti-ui-env/rdp/<token>/*` (30min cookie `ui_env_rdp`); `vnc-clipboard` reads/writes the clipboard directly.

## macOS

Desktop = the Aqua console session (WindowServer + /dev/console owner + launchd context evidence chain); "headless" = honest degradation — Screen Sharing VNC (:5900) ready + vnc-bridge/noVNC browser viewing (passwordless sudo auto `load -w`), authentication = the mac account password; there is no Xvfb equivalent. `scripts/macos/setup-macos.sh`.

## Installation

```bash
# Linux: component install (apt + justget fallback) + service-ization (systemd user + linger keepalive)
cd scripts/linux && ./setup-linux.sh && ./install-service.sh
# View the virtual desktop in a browser (via the site middleware, no new ports)
open https://<site-address>/<basePath>/aiti-ui-env/vnc/vnc.html  # After clicking "Open viewer" in the panel, direct access in a new tab (zero-credential URL, 30min cookie session)

# Windows (admin): virtual display driver + auto-login + TightVNC + noVNC
.\scripts\win\setup-windows.ps1
.\scripts\win\install-service.ps1 -NSSM   # or -ScheduledTask
```

> Public exposure: no new ports — 5900/6080 only answer on loopback; browsers access directly via the current site's middleware (`/aiti-ui-env/vnc/*`)
> (HTTP+WS proxy; authentication = 30min HttpOnly cookie, zero-credential URL, no cookie means 403 across the board).

## AI Help Points (ai.helpers)

| Help point | Purpose | Implementation |
|---|---|---|
| `ui-env-setup` AI picks a display mode for me | Describe the running scenario → AI recommends a display mode (prefer-headless, etc.) | `POST set-mode` (mapping mode) |

Declared in the `ai` section of `index.ts` (pi skills standard: `skills/index.json` + `skills/ui-env-setup/SKILL.md` frontmatter `action.type=api` → `POST set-mode` mapping), aggregated proactively by ai-helper.

## Documentation

- Plan document: internal design document
