---
title: Page event bus (aiti-event-bus)
icon: 📡
description: The single outlet for page events — chained take-over of __piPageEvents, v0.2 topic subscription (forwarding filtered by a type whitelist) + publish-local high-frequency direct line + subscribe-topics client outlet, zero core changes; topics are the only path and any fallback is forbidden
---

# aiti-event-bus

> ❝ **One bus, every frame.** ❞

The page event bus consolidation extension — the landed deliverable of dependency-injection refactor batch **P0.5** (signed off 2026-09-06).

The bus implementation is owned by this extension; core `lib/agent-page-events.ts` is neither deleted nor changed, demoted to a fallback host + a core-internal channel (SessionSidebar running frames).

## Mechanism: accessor-property take-over

Every **publication** of page events (core `running`, plan-first `pf:remind`, model-check `mc:avail`, editor `ed-watch`…) goes through the global outlet `globalThis.__piPageEvents.publish`. At startup this extension **takes the `__piPageEvents` property over as an accessor**: reads always get a stable wrapper (dual-fed to the core predecessor + this bus, **zero core changes**); writes (module re-evaluation / re-assignment by someone else's re-install) are absorbed by the setter as a "predecessor update" — under turbopack dev, instrumentation and routing each lazily evaluate `agent-page-events` and unconditionally re-assign the global, so a function-style take-over would be flushed away; the accessor approach is immune and independent of evaluation order.

Hot-reload safety:

- shutdown **guarded restore**: only uninstall and restore the predecessor slot when the accessor is still the one it installed itself (prevents multi-instance stacking)
- on reload it proactively disconnects all SSE connections; client EventSources automatically reconnect to the new bus instance and frames never stop flowing

## Integration surface

| Surface | Contract |
|---|---|
| SSE | `GET /api/extensions/aiti-event-bus/events` — message JSON frames `{type,...}` follow the same frame contract as the core route; the named `hello` (pushed first on connect, `{conn, busId}`) and the named `heartbeat` (30s) do not enter frame dispatch, serving liveness checks / keep-alive through proxies |
| Topic subscription (v0.2) | `POST /subscribe {conn, types:[...]|null}` — declares the type whitelist for that connection (whole-list override; null = back to all frames, v0.1 compatible); forwarding is filtered by the whitelist, **non-matching frames never leave over SSE** (trailing `*` prefix wildcard such as `sched:*`); high-frequency stream extensions (aiti-cmd terminal `cmd-<id>`) rely on it to keep irrelevant frames away from subscribers |
| Connection keep-alive | `POST /heartbeat {conn}` — client broker every 90s; server scan: heartbeat-sent and not refreshed for 6min is judged half-open → cleanup (v0.1 old clients are not governed) |
| Server service outlets | `ctx.services.provide("aiti-event-bus.publish", …)` — the standard channel for producers to publish page frames (dual-fed to the core route); **`aiti-event-bus.publish-local`** — connects straight to the bus without feeding the core route, dedicated to high-frequency large frames |
| Client service outlets | `ctx.registerExtService("aiti-event-bus.subscribe", subscribePageFrames)` all-frame subscription; **`aiti-event-bus.subscribe-topics`** — `topics(handler, ["cmd-x", "sched:*"], onStatus)` topic subscription (after `h.ready` the whitelist takes effect on the server, then the initial snapshot is pulled for a seamless join); host standard slot `window.__piEventBus` + `piwe-event-bus-ready` event |
| client broker | page-level singleton SSE (protected by a connection pool) + reference counting; closes only when the last subscriber unsubscribes |

## Load priority + queue instead of fallback (v2, 2026-09-11)

- **Server single-start first**: the host `instrumentation` runs `startupById("aiti-event-bus")` alone after loadAll and before startAll so the bus is ready first (`startupPriority: 100` governs ordering within the extension batch; startAll starts in descending order and shutdown reverses symmetrically)
- **Frontend materialize highest priority**: the bus is materialized first, alone; the remaining immediate items go through `Promise.allSettled` in parallel
- **Queue instead of fallback**: bus availability is settled by the manifest deployment fact; `getEventBus` deployed but not ready → subscriptions **queue up and hang** (CONNECTING→ready then frames flow), never returning null, never timing out; **the only fallback condition = the manifest settles that it is not deployed** (returns null synchronously)
- **STALE_CONN silent rebuild**: `/subscribe`//`/heartbeat` 404s carry `code:"STALE_CONN"` (distinguished from a missing route), clients silently rebuild the connection without throwing uncaught; additionally hello/heartbeat frames carry `busId` — a change = server reload → proactively switch connections

## Consumer integration (decided 2026-09-09: topics are the only path, any fallback is forbidden)

```js
const topics = ctx.getExtService?.("aiti-event-bus.subscribe-topics");
if (!topics) return; // bus not enabled → feature degrades, no fallback
const h = topics(handler, ["cmd-s_ab12", "sched:*"], onStatus);
await h.ready; // whitelist takes effect on the server first, then the initial snapshot is pulled — seamless join
```

> No more all-frame subscriptions / core `__piPageEventsClient` / self-built EventSource fallbacks — **all historical fallbacks have been deleted** (under STALE_CONN semantics the old fallbacks amplify reconnect storms). High-frequency stream publishers go through `aiti-event-bus.publish-local`, with large messages via REST snapshot + seq dedup (pattern in the extension README).

## Producer integration

```ts
ctx.services?.get("aiti-event-bus.publish")?.publish("my:evt", { ... });   // low-frequency status frames (dual-fed to core route)
ctx.services?.get("aiti-event-bus.publish-local")?.publish("cmd-x", { ... }); // high-frequency large frames (direct to the bus)
```

Steady-state topology: **2 SSE connections** — the core route (SessionSidebar's own running) + this extension's `/events` (all other page consumption).

## Structure

```
index.ts                       # server: assembly + accessor take-over + SSE api + /subscribe /heartbeat + service outlets
bus-core.ts                    # pure kernel (createEventBus broadcaster + installPageEventSlot accessor take-over), zero host dependencies
bus-core.test.mjs              # node --test: fan-out / bad sink eviction / dual feeding / clobber immunity / guarded restore / hot-reload stacking
client-url.test.mjs            # node --test: fallback basePath (//dev host mis-concatenation regression anchor, 5 cases)
stale-rebuild.test.mjs / topic-match.test.mjs / bus-id.test.mjs   # STALE_CONN rebuild / whitelist matching / busId connection switch
client/src/aiti-event-bus-client.mjs  # page singleton broker + subscribe/subscribe-topics service registration
tools/deploy.mjs               # deploy
```
