---
title: Attach Session Backend (aiti-attach-agent)
icon: 🔌
description: Socket-attaches to already running agent processes — connects the pi TUI bridge; supports full automation via environment variables (PI_WEB_BRIDGE_AUTO=1 auto-bridges any CLI session); followUp queue echo + image attachment passthrough + idle timeout exit
---

# aiti-attach-agent

> ❝ **Don't grab the steering wheel — the agent is already running; attach to it and watch.** ❞

Socket-attach session backend: connects to an already running agent process (pi TUI bridge) instead of spawning a new one. For hooking a pi running in the terminal directly into the All Sessions panel for spectating/interaction.

## Mechanism

- The first real backend under the "every backend is an extension" principle: the core keeps only the abstraction layer, and this extension registers the `attach` backend via `ctx.sessionProviders.register()`
- Integration: when the pi TUI-side bridge extension's `/web` command spawns pi-web (detached), it passes `--socket <path>`, completing the attach
- Scenario: user runs pi TUI in a terminal → types `/web` → the browser workbench takes over the same session directly

## Auto bridge: any CLI session goes to the web in real time without typing commands (PI_WEB_BRIDGE_AUTO=1)

Don't want to type `/web` manually every time? Export this in your shell config (`~/.bashrc` / `~/.zshrc`) (enabled on this machine since 2026-08-30):

```bash
export PI_WEB_BRIDGE_AUTO=1                              # any pi CLI session auto-starts the bridge on launch
# Optional: route aiti_* tools through the managed bridge of a specific pi-web instance
# (unset = use the resident standalone bridge 127.0.0.1:8777; attach is unaffected, it follows the registry)
# export PI_WEB_BRIDGE_BASE=https://your-pi-web.example.com/dev    # dev instance
# export PI_WEB_BRIDGE_BASE=https://your-pi-web.example.com        # prod instance
```

Afterwards every terminal `pi` session (including `-c` / `--resume` restores) automatically executes the equivalent of
`/web --attach --no-spawn --no-open` at `session_start`: starts the socket rpc bridge + writes `~/.pi/agent/bridge-registry.json`,
without spawning or opening a browser. When pi-web (dev/prod, either instance) opens that session it attaches automatically — the All Sessions
list carries the `tui-bridge` tag, live streaming spectating + bidirectional IO (send messages / steer / follow_up queue / attach images / switch model from the web).

**Queue echo and attachments (2026-10)**: pi's `queue_update` does not go through the extension event channel — the bridge maintains a text mirror itself and **synthesizes broadcasts**: enqueue = bridge command while busy (prompt/steer/follow_up) + TUI terminal local enqueue (`input` event awareness: Enter=steer, Alt+Enter=followUp); dequeue = `message_start(user)` pops the matching text in the same order; if `get_state` sees an empty queue while the mirror is non-empty, it self-heals by clearing. `get_state` carries `steering/followUp` text → the attach handle adds a read-only `queueManage(list)` (queue panel refresh/reconnect recovery; mutation actions fail-loud). prompt/steer/follow_up **pass through image attachments** (previously queueing/jumping the queue with images silently dropped them).

**Idle timeout exit (2026-09-15)**: the CLI fully-automatic bridge's pi TUI session automatically `ctx.shutdown()` exits after the idle timeout (clearing pending processes + bridge socket + connector retries) — aligned with pi-web inprocess sessions via the same env; if a page attaches or a model is running at expiry, the timeout renews; manual `/web` and headless subagents do not auto-exit.

| env | who sets it | effect |
|---|---|---|
| `PI_WEB_BRIDGE_AUTO=1` | user shell (CLI full-auto) or pi-web host (subagent injection) | auto-starts the bridge on session launch |
| `PI_WEB_BRIDGE_BASE=<url>` | user shell (optional) | points to a running pi-web: `aiti_*` tools merge with that instance's managed bridge; unset keeps attach as-is (via registry) while aiti_* goes to the standalone bridge |
| `PI_WEB_BRIDGE_PORT` / `PI_WEB_BRIDGE_LANG` | optional | bridge port derivation / prompt text language |
| `PI_WEB_IDLE_TIMEOUT_MS` | user shell (optional) | CLI auto-bridge idle timeout exit (default 10 minutes, 0 disables; renews if a page attaches / a model is running at expiry; manual /web and subagents do not auto-exit; invalid values fall back to the default) |
| `PI_WEB_CHILD_MARKER` | pi-web automatic | host mark: with it + not a subagent = pi-web embedded session, does **not** auto-bridge (it is already in the web) |

Edge cases and behavior details:

- pi-web embedded sessions and their child processes never auto-bridge (`PI_WEB_CHILD_MARKER` guard) — they are already in the web; multiple embedded sessions on the same pid would collide on the same-named socket, so this guard also prevents that conflict;
- **In-process session switching (`/new`, `/resume`) re-registers in the registry** (socket reused), so sessions switched to and opened from the web still go through attach;
- Manual control takes priority: `/web off` only disables the current one, another `/web` restarts it (repeated `/web` still enters the management menu); starting a new session re-auto-starts the bridge;
- socket permission `600` (only the owner can connect); Windows named pipes are isolated by ACL;
- pi exit disconnects the socket and the registry self-cleans; the bridge is only valid while the process lives;
- SIGTERM/kill hard kill skips cleanup and leaves dead entries — self-healing: the next registry read/write sweeps dead pids, no manual intervention needed;
- pi launched by IM (cc-connect etc.) also counts as a "CLI session"; to bridge those too, add the same env in their service environment.

### Troubleshooting

| Symptom | Check |
|---|---|
| New terminal pi doesn't auto-bridge | whether `echo $PI_WEB_BRIDGE_AUTO` is =1 (after editing bashrc you need `source` or a new terminal); whether the startup log has `[pi-web-bridge]` lines |
| Log shows "skipping /web registration (pi-web embedded process…)" | the process inherited pi-web host env (e.g. a shell spawned from within a pi-web session) — switch to a clean terminal |
| Session not visible in web All Sessions | sessions are not in the list before their file is written (before the first message); or the registry is empty (`cat ~/.pi/agent/bridge-registry.json`; emptying on process exit is normal) |
| `aiti_*` tools not connecting to the bridge you want | without `PI_WEB_BRIDGE_BASE` the standalone bridge 8777 is used; set the base of the pi-web instance you want to merge with (see above) |
| Dead entries in the registry (socket points to an exited pid) | normal: hard kill (SIGTERM/kill) skips cleanup; the next registry read/write sweeps automatically |

### Fixed: first open fails to connect (race-window twins, 2026-08-30)

**Symptom**: clicking open the session right as the TUI just started (or a browser SSE reconnection lands in the TUI restart gap),
"the first connection fails" — messages sent from the web show no streaming echo; switching to another session and back fixes it.

**Root cause** (reproduced in practice): bridge registration lands a few milliseconds after `session_start`, but the session row is already in the
pi-web list (the `pi -c` restore scenario) — clicking open within this **race window**, SSE routing
`attachIfBridged` misses (registry not yet written) → the fallback `startRpcSession` preemptively starts a
**local runtime** (the "twin", double-writing the same jsonl as the TUI). The bridge then finishes registering,
split-brain: POST prompt goes to the bridge (attach first), GET status/SSE still prefers the local twin
(`getRpcSession` first) — the prompt reaches the TUI but streaming is bound to the twin, manifesting as "can't connect";
switching away and back = on SSE reconnect attach priority hits the bridge, so "it just works". A zombie twin remains.

**Fix** (three places in pi-web):

1. `lib/session/index.ts` `attachIfBridged`: on attach success also `shutdownStrayLocalRuntime` —
   shutting down the race-window local wrapper of the same session (single-writer restored; log `bridge claimed … shutting down
   stray local runtime`);
2. `app/api/agent/[id]/route.ts` GET: **socket first** (`resolveAttachBySessionId` overrides
   `getRpcSession`) — the status reconciliation tick (foreground 15s; immediate on foreground switch/network recovery) self-heals back to the bridge, no page refresh needed;
3. `app/api/sessions/[id]/context/route.ts`: when the bridge claims, context also goes through the bridge's `get_messages`
   (the disk file may lag the TUI in-memory state; an in-progress turn is not flushed);
4. `app/api/sessions/[id]/auto-name/route.ts`: when the bridge claims, auto-naming degrades to skip (within the window it would
   otherwise run a naming LLM turn against the twin, double-writing the file);
5. `bridge-registry.ts`: registry changed to tmp+rename atomic write —
   the previous direct write was non-atomic; concurrent readers (dev/prod, two pi-web + multiple TUIs sharing the same file) reading half a
   JSON would treat it as an empty table, and any subsequent read-modify-write would wipe all entries (attach fails entirely).
   Also synced to the installed copy `~/.pi/agent/extensions/pi-web-bridge/bridge-registry.ts` (effective for newly
   started TUI processes).

Residual edge: the SSE connection established within the race window remains bound to the already-dead twin (heartbeat keep-alive does not reconnect);
the next natural remount (session switch/refresh) binds back to the bridge — all other routes have self-healed.

### Deep review record (2026-08-30, second round)

| Item | Conclusion |
|---|---|
| queue-recovery / PATCH rename / DELETE / export | read-only or already gated by provider / attach-first ✓ no change needed |
| set_tools (`setRpcSessionTools`)| within the window would `appendSessionToolSelection` directly writing one line to the file before the gate (pre-existing, narrow; logged as TODO, not fixed this round) |
| DELETE window | deleting the file the TUI is about to claim during the window is theoretically possible (requires manual confirmation + a second-level window) — accepted |
| registry cross-process read-modify-write | atomic write eliminates the half-JSON corruption surface; multi-process concurrent rewrite losing updates is still possible (no lock) — write frequency is extremely low, accepted; a complete fix needs file locking |
| TUI not re-registering after a registry entry is lost | known limitation: entries are written only at session_start/session switch; after loss that session's attach fails until the TUI switches session/restarts (the self-heal sweep only deletes, never restores) |
| probe falsely killing live entries | the probe goes through the kernel backlog; a TUI that is merely "busy" won't fail (requires a true stall/backlog of 511) — unreachable in practice |
| regression tests | no unit tests added (twin cleanup needs mocking the rpc-manager dynamic import, low benefit); verified the full chain E2E with a mock bridge + existing providers/handle-adapter tests pass |
