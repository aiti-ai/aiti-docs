---
title: ZCode Session Backend (aiti-zcode-agent)
icon: 🟢
description: Driven by Zhipu ZCode (CLI runtime embedded in the desktop AppImage) — dual-channel resident app-server (default, streaming/tool cards/steer/attachments) + oneshot fallback, plugged into All Sessions, consuming the GLM coding plan compliantly
---

# aiti-zcode-agent

> ❝ **Where the GLM plan runs, that's where the panel watches it.** ❞

Zhipu ZCode session backend: drives the official ZCode CLI (`resources/glm/zcode.cjs` embedded in the desktop AppImage, run directly with node) and plugs into the All Sessions multi-agent frontend. Coding plan quota is restricted to the official tool whitelist (Claude Code/Codex/ZCode/…) — **going through the official CLI itself = consuming the plan compliantly**; all HTTP calls (UA/fingerprint/tool definitions) are constructed by the official CLI, and this extension only does protocol-level driving.


## Mechanism (dual transport channels, feature `zcode.transport`)

- **app-server (default)**: resident ZCode Protocol (the same NDJSON stdio as the desktop app) — streaming typewriter / native tool cards / steer injection / hot model switching / permission mode taking effect immediately / v4 file attachment upload, saving the ~5-6s cold start per turn
- **oneshot (fallback tier)**: `node zcode.cjs --json --mode M [--resume sess_xxx] --prompt <text>` one-shot per turn + `--resume` to continue a conversation
- `--json` outputs a **single pretty-printed JSON object** (printed in full on exit 0): `{sessionId, traceId, turnId, response, usage{...}, projection{contextWindow}}`
- **3.17+ CLI startup gate**: the CLI added `prepareCliProviderRuntimeEnv` (tui/app-server/login crash without a builtin provider config) — the extension's `providerRuntimeEnv()` injects `ZCODE_BUILTIN_PROVIDER_CONFIG_FILE` (preferring `resources/config/provider/zcode-builtin.json` shipped in the same runtime package, falling back to the desktop-refreshed copy) + `ZCODE_PERSONAL_PROVIDER_CONFIG_FILE` (`~/.zcode/v2/provider_config.json`); buildTurnEnv and the controlled-login driver apply the same gate; AppImage glm-only extraction additionally pulls `resources/config/*`
- Lazy persistence: `sess_xxx` only becomes known after the first turn → `session_backend_ready` rebinds to `zcode:sess_xxx` (core's dual-registered handle + placeholder file migrate along)
- Placeholder naming: the real title is written on takeover (session-manager open-live passes meta.name); for new sessions, after the first-turn rebind it takes the truncated first user message (generic core behavior); survives refresh
- History replay: on resume, liveHistory is backfilled via the All Sessions service outlet (session-manager `services.sessions`) — the only reader for zcode storage lives in session-manager `lib/agents/zcode.ts`, and this extension does not build its own reader; structured tool rows (IndexedMessage.tool) are replayed into **pi-native shape** (assistant.toolCall blocks + toolResult messages paired by toolCallId) → the frontend renders them with pi's own tool cards instead of degrading to `🛠 {json}` text (2026-09-07)
- Model injection goes through the official env channel (`ZCODE_MODEL`/`ZCODE_BASE_URL`/`ZCODE_API_KEY`), **never writes `~/.zcode/cli/config.json`**
- Two-phase abort: before spawn (cancel runtime resolution/download via AbortController) + after spawn (SIGTERM kills the child process → settled "aborted")

## Runtime lifecycle (tried in order)

1. feature `zcode.runtimePath`: a zcode.cjs file / an extracted directory / a ZCode-*.AppImage itself
2. Auto-detection: `/tmp/.mount_ZCode.*/` (a running mounted instance) → extraction cache (dataDir/runtime, deduped by version) → `~/.zcode/ZCode-*.AppImage` (highest version)
3. Auto-download: direct link from the official site `zcode.z.ai/cn#all-downloads` (`cdn-zcode.z.ai/.../linux/x64/`) → `--appimage-extract` extraction cache (no root needed)

## Login and key lifecycle

1. feature `zcode.apiKeyOverride` set → use it directly
2. Cached key in dataDir (0600) with an unchanged credentials.json fingerprint → use the cache
3. Decrypt `~/.zcode/v2/credentials.json` (fallback secret derivation + aes-256-gcm) → silently exchange for a `zcode-api-key` via the same path as official login (idempotent check-then-create) → cache
4. Not logged in → fail-loud + three guidance options (authorize from the desktop app / `login --no-browser` / manually fill in an override key)

## Capability surface (fail-loud, keyed by `ZCODE_CAPABILITIES_BASE` + split by channel)

| Capability | Value | Notes |
|---|---|---|
| prompt / followUp | ✅ | app-server streaming typewriter + sequential queue; oneshot one-shot per turn + `--resume` |
| steer | ✅ | app-server (v4 `sendText{requestedDelivery:"guide"}` injected mid-run, drained between model turns); oneshot auto-degrades to the local followUp queue when injection fails |
| contextUsage | ✅ | usage.totalTokens / projection.contextWindow (1M-window plan) |
| setModel | ✅ | immediate on app-server; effective next turn on oneshot (ZCODE_MODEL swaps the ref, bigmodel/zai channel endpoints follow) |
| setPermissionMode | ✅ | takes effect immediately on app-server |
| queueManage / respondInteraction | ✅ | ExitPlanMode and AskUserQuestion reverse request cards |
| respondProviderHeaders | ✅ | provider_headers captcha card (see the Captcha Bridge section below) |
| getUsage / listModels | ✅ | dynamic model catalog (desktop registry preferred) |
| fileAttachments | ✅ | app-server v4 attachment upload |
| fork | ✅ | app-server only (see the Fork Capability section) |
| getTools / getCommands | ❌ | builtin tool set is fixed; commands list is P2 |

## Model catalog

`bigmodel/GLM-5.3-Flash` (default), `bigmodel/GLM-5.3`, `bigmodel/GLM-5-Turbo` (three seed fallback tiers); the catalog defers to the **desktop registry dynamically** (`buildZcodeCatalogRefs`), with the zai channel sharing the same structure. The model channel determines the credential chain (bigmodel/zai use two separate OAuth tokens) and the endpoint (`open.bigmodel.cn/api/anthropic` / `api.z.ai/api/anthropic`).

## Feature management (extman features)

| feature | Type | Default | Notes |
|---|---|---|---|
| `zcode.transport` | string | app-server | Transport channel: resident app-server / oneshot one-shot fallback |
| `zcode.runtimePath` | string | empty | Specify the runtime (zcode.cjs / extracted directory / AppImage) |
| `zcode.autoDownload` | boolean | on | Auto-download the AppImage (~300MB) when detection fails |
| `zcode.mode` | string | **yolo** | Per-turn `--mode`: yolo/build/edit/plan (changed from build to yolo per user request on 2026-09-06) |
| `zcode.model` | string | empty | Default model ref for new sessions; **leave empty to auto-follow the authenticated plan channel** (reads coding-plan-cache, so zai users don't get stuck on the bigmodel default) |
| `zcode.apiKeyOverride` | string | empty | Manually provide a coding plan API Key, skipping the OAuth chain |
| `spawn.env` / `spawn.command` / `spawn.argsPrefix` | inherited from the extman shared declarator | empty | Spawn env vars / launch command override (dockerized wrapper) / args prefix |

There is also a hidden feature `zcode.ultraGateway` (on by default; false falls back to direct provider connection without the ultra gateway mapping).

## All Sessions integration (desktop historical sessions)

- Parser: session-manager `lib/agents/zcode.ts` (**the only reader implementation**, id "zcode") — reads `~/.zcode/cli/db/db.sqlite` (opencode-identical schema: session/message/part, safely copied to /tmp under WAL then queried read-only); part types text/reasoning/step-*/tool, reasoning skipped, tool degraded to a `🛠 name(args) → output` text line + **structured tool field** (shared with the opencode-family summarizer; output over 20k characters is truncated with a note on replay)
- Source card: the All Sessions panel discovers the ZCode source (count = number of sessions in the db); once activated, history rows enter the index; the detail preview is adapter.parse
- Takeover (open-live): `zcode:sess_xxx` → backend createSession resume + **history replayed via the `services.sessions` service outlet** (IndexedMessage → liveHistory) → the main window opens with full context; continuing chats `--resume` the same session (field test: after takeover, asking "what command ran last" → "pwd")
- Service outlet: `ctx.services.get("session-manager.sessions").parseSession(compositeId)` (DI plan P1 key contract; v1, in-process read-only; fail-silent when the consumer is absent, and each agent's storage reader must not be re-implemented locally. The legacy `__piWebExt.byId("session-manager")` penetration remains as a transitional fallback for older production cores)

## Security and boundaries

- Key exchange only interacts with the local user's own credentials + official Zhipu domains; the key cache is 0600 and never committed to git
- Never writes `~/.zcode/cli/config.json` or any file under the desktop's `v2/`
- Env governance: spawn only passes through the `governanceEnv("zcode")` whitelist (`ZCODE_MODEL/ZCODE_BASE_URL/...`)

## 🧬 Captcha bridge (provider_headers reverse request card)

When a ZCode channel (start-plan etc.) triggers a risk-control captcha: the client ships `CaptchaRequestCard` (migrated out of pi-web core; "whoever owns the capability renders it" — aiti-session-cards only keeps the interaction primitives/authorization card). Three states: **seamless pass-through** (captchaVerifyParam cached 5min) / **official AliyunCaptcha slider** (SDK triplet cached 1h) / cancel on failure; the appserver has a 180s timeout fallback and clears the card at turn end. The answer is returned through the `respondProviderHeaders` capability flag.

## 🔑 Controlled login (ext-controlled-login standard, 2026-09-08)

One click from the toolbar **🔑 Login** (or this panel): the backend spawns the official CLI's browserless login (`z.ai` channel) and pushes the authorization link into this dialog — **just open it in a browser on any device to complete authorization**; credentials are persisted automatically by the official CLI, and the extension's existing credential chain picks it up automatically.

- API: `POST /api/extensions/aiti-zcode-agent/login/start` (idempotent) · `GET /login/status` · `POST /login/cancel`
- State machine: waiting (spinner) → success ✅ / failed / timeout / cancelled, all retryable; status is polled every 2s while the dialog is open and stops when it closes

## 🔀 Fork capability: Edit from Here / Branch (2026-09-18)

Wired to the `session/fork` protocol surface (capability `fork`, resident app-server channel only; oneshot=false). `ZcodeHandle.fork(entryId, {reset})`:
- **Edit from here** (reset=true; ChatWindow send path branches on capability): fork a child session → handle rebind (rebindSessionId → session_backend_ready; host registry/placeholder/queue sidecar all rebind end to end) → history rebuilt from source → the edited message continues in place. Equivalent to pi's navigate_tree rollback; zcode has no truncate, so fork-at-turn is the only protocol surface. First message (empty branch point) = root rebuild: drop the channel, clear the sid, and the next turn's prompt creates fresh.
- **Branch** (reset=false; the message "Branch" button): pure fork, current session untouched, returns the child session's composite id for the frontend to jump to (cold resume).
- Position id mapping: UI `ext-N` maps strictly 1:1 to liveHistory (normalizeHandleMessages passes through directly + absolute pagination index) → turnIndex = prefixed user count - 1. Passing the branch point (the previous assistant message) = excludes the edited message; passing the message itself = includes that turn (branch semantics). Known limitation: if a steer-injected user bubble was not persisted server-side, the count shifts (e8i parse failure errors out explicitly rather than silently misaligning).
- The server-side restriction "no fork while running" is surfaced verbatim as a human-readable message (capability retained, timing restricted); file rollback follows zcode's own checkpoint semantics and does not pass through the git-trace gate. Capability gating: external backends without fork and navigateTree hide the "Edit from here" button (marked unsupported).

## Testing

```bash
node --test dev-repo/aiti-zcode-agent/zcode-core.test.mjs
```

52 cases (zcode-core.test.mjs) + four suites zcode-appserver(33) / handle-fork(6) / handle-queue(7) / cards(1): `--json` parsing / error extraction / model ref and env assembly / full credential decrypt + key exchange chain (fetch injected, zero network) / download atomicity (.part + abort cancel) / channel probing / fake AppImage extraction cache / handle wire contract (rebind, resume, abort, error frames, model switching, seed follow) / app-server channel / fork / queue / captcha card.

> Supplementary field test with a real AppImage: `--appimage-extract "resources/glm/*"` pattern extracts 3.11.2 → 47MB output (zcode.cjs 0.16.5) that is executable, without a full extraction.
