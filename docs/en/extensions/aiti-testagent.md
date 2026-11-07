---
title: TestAgent (aiti-testagent)
icon: 🧪
description: AI debugging MCP + IDE for Java backends — scan Java processes / attach one-click bridge connect / tunnel-bridge multi-endpoint management; arbitrary in-JVM modification / Mock & SQL interception simulation / hot updates / diagnostic sampling; 57 tools in 10 groups exposed on demand, fully reversible
---

# aiti-testagent

> ❝ **All operations are reversible (delete/stop restores), so AI can experiment freely in a running JVM.** ❞

TestAgent 2.0 — **Arthas++ built for AI**: it teaches AI how to debug a running Java backend (first-class Spring Boot / Solon support, attachable to any JVM). A stdio MCP server (`mcp-testagent.cjs`) exposes TestAgent's HTTP JSON API as standard MCP tools: in-process expression evaluation, diagnostics (threads / sc / sysprop / classloader / logger…, continuously aligned with the Arthas capability surface), performance sampling. **The tier beyond Arthas is "modify": hot updates + arbitrary in-JVM modification + interception simulation** — source-code hot update, method hot update, new controllers, Mock / SQL interception simulation, Bean·XML / declarative Conf, property hot refresh, component hot operations; and all operations are reversible (delete/stop restores), so AI can experiment freely in a running JVM.

Beyond MCP, TestAgent ships its own **Web console** (React, same port and origin as the API): method/code hot update, declarative Conf, Eval, Mock, SQL interception, Bean·XML, Arthas diagnostics, Profiling, live monitoring, ClassWatch, Terminal, config history — humans look at the same port, with full input completion for class names / method names / URLs / beans.

## 57 tools, 10 groups

| Group | Tools | What they do |
| --- | --- | --- |
| `lifecycle` | ta_run / ta_ping / ta_attach / ta_discover / **ta_bridge** | start/stop the app, liveness probing, dynamic agent attach (waits for readiness automatically), discover instances, **one-click bridge connect (scan → attach → wire up)**; ta_tunnel is always exposed and belongs to no group (tunnel management status/connect/disconnect) |
| `observe` | ta_watch / ta_monitor / ta_tt / ta_trace / ta_job | observe args / return values / exceptions, call statistics, time-travel tunnel argument capture, per-layer sub-call cost tree, background resident observation jobs (watch/tt, auto-removed at TTL expiry, since cursor for incremental pull) |
| `jvm` | ta_metrics / ta_memory / ta_threads / ta_profile / ta_heapdump / ta_download / ta_vmtool / ta_classloader / ta_mbean / ta_vmoption / ta_perfcounter / ta_dump / ta_sysprop / ta_sysenv | thread stacks (deadlock detection / CPU ordering), flame graphs (cpu/alloc/wall), heap dump, per-pool memory detail, large-file retrieval, JVM flags, classloader tree, system properties / environment variables |
| `inspect` | ta_sc / ta_sm / ta_jad / ta_fs / ta_urls | class search, method list, CFR decompilation, in-container file viewing, REST endpoint list |
| `write` | ta_code / ta_restore / ta_method / ta_eval / ta_conf / ta_xml / ta_classwatch / ta_bean / ta_logger / ta_props / ta_spring / ta_solon / ta_addr | **source-code hot update, new controller creation**, method-level behavior change, expression evaluation, declarative Conf, Bean·XML, auto hot-swap on code change, Spring bean injection mock, log level hot tuning, Spring/Solon component hot operations (paired with the springboot/solon aggregate switches), transparent address replacement |
| `mock` | ta_mock_url / ta_mock_method / ta_mock_results / ta_capture / ta_sql | URL/method-level mock, return value tampering, traffic capture, **SQL interception simulation** |
| `startup` | ta_startup / ta_lazy_module | startup timing report (points straight at slow beans), module-level lazy loading |
| `auth` | ta_login | auto login: in-process login to obtain token/cookie → automatic replay of the 401 original request (humans and machines bypass the login wall) |
| `native` | ta_native_modules / ta_native_watch / ta_native_stack / ta_native_detach | thin proxy over testagent-native — the native layer of Windows processes (module enumeration / Detours hooks / thread stacks / unload restore) |
| `history` | ta_history / ta_status | config history audit, instance status |

The exposed surface can be trimmed by group with `--tools` / `--exclude` (group names / single names / wildcards, via argument or `TESTAGENT_TOOLS/EXCLUDE`) — for read-only debugging just exclude the two groups `write,mock`; hidden tools disappear from tools/list entirely and the server refuses calls to them.

## Scenario quick reference: what you hit, what to use

No need to memorize 40 tool names — when you hit one of the situations below, look up its line:

| Scenario | Use |
| --- | --- |
| Want to return fake data / simulate failures during joint debugging | `ta_mock_method` (four content types: json/bean/code, filter-matched) |
| Backend not ready yet, frontend waiting to integrate | `ta_mock_url` / `ta_mock_method` serve fake responses directly |
| Want to simulate slow SQL / a specific SQL result | `ta_sql` (SQL interception simulation) + filters |
| **Debugging blocked by a login wall** | **`ta_login`: configure the debug password once and both humans and AI skip login** |
| Fixed a bug and don't want to restart | `ta_code` source-code hot update / `ta_classwatch` auto hot-swap after local edits |
| Observe only, hands off (read-only in production) | observe + jvm groups, `--exclude write,mock` as a clean cut |
| API is slow, want to find where it hangs | `ta_trace` (sub-call tree with per-layer cost) |
| Slow startup, want to see who is slow first | `ta_startup` (per-bean report, byPkg aggregation) → `ta_lazy_module` |
| Which environment is it connected to? Want to swap it under the hood | `ta_addr` (addr-redirect transparently replaces Redis/JDBC addresses) |
| Want a scheduled job to run once right now | `ta_spring` / `ta_solon` (jobs / job_trigger, Quartz, @Scheduled) |
| Connection pool full / thread pool blown up | `ta_spring` / `ta_solon` (pool_set / executor_set hot tuning) |
| How is this method actually written? | `ta_jad` (CFR source-level decompilation) |
| Threads stuck / hunting for deadlocks | `ta_threads` (deadlock detection, CPU ordering) |
| Logs too quiet, amplify first | `ta_logger` hot-tunes log levels, no restart needed |
| Don't know how many are attached or how to connect | `ta_discover` / `ta_attach` (dynamic attach) / **`ta_bridge` (scan + attach + wire up in one step; with pid omitted it auto-selects the only candidate)** |
| **Unified managed debugging across processes / machines** | **TaBridge bridge**: target services started with `-Dtestagent.bridge=ws://bridge:8667` all come online automatically; MCP `TESTAGENT_URL` points at the bridge + the `endpoint` argument routes to any endpoint |
| Endpoint didn't connect to the bridge at startup, want to join afterwards | `ta_tunnel connect` (runtime catch-up connect; with the endpoint argument via the bridge it becomes a remote catch-up connect) |
| What was changed, want to roll back | `ta_history` / `ta_restore` |

## IDE support (pi-web panel)

aiti-testagent is also a pi-web extension: the toolbar ☕ Java button → panel. **Bridge-centered management model**:

- **Bridge management card**: defaults to the **self-hosted bridge** (same jar, dual roles; auto-spawned on save with idempotent liveness probing; port + registration/access token configurable), switchable to an **external bridge** (address + ws + token); [🖥 Open Console] mounts the bridge port onto the pi-web domain via the service-tunnels proxy (no-auth open binding) (`https://<bridge-port>.your-pi-web.example.com/dev` prefix/root) and opens the full console directly, with an endpoint dropdown at the top right to switch targets; 🎟 invitation ticket issuance is kept
- **JAVA_OPTS auto-attach switch**: one click writes a marked block into `~/.bashrc` + `~/.profile` (`JAVA_TOOL_OPTIONS=-javaagent:…-Dtestagent.bridge=ws://…-Dtestagent.httpPort=0`) — **every newly started Java process automatically gets the agent attached and connects to the bridge**; after enabling, just wait for ta clients to auto-register; turning it off removes the block. Note it affects all new Java processes (maven/gradle included) — you bear the overhead
- **⇄ Bridge endpoint section**: endpointId/pid/port/remoteIp/online dot; each row has [🖥] open bridge console (endpoint selected) / tunnel status / offline removal
- **Attached session table**: each row has **[🖥 Open Console]** (service-tunnels proxy no-auth mounting that endpoint's own httpPort, URL preserving the TA basePath with 1:1 passthrough; dual instances auto-sync registration) + ⛓✕ detach; unattached Java processes get one-click Attach (after bridge config they come onto the bridge automatically)
- **MCP wiring**: the bridge config lives at `~/.cache/testagent/bridge.json` (extension writes / MCP reads) and the BASE of mcp-testagent.cjs follows automatically — on the AI side `ta_discover` lists all endpoints directly in bridge mode, `ta_*` tools route to any endpoint via the `endpoint` argument, and AI can operate every process on the bridge

The server side and MCP share `lib/testagent-core.cjs` (the single implementation of discovery / attach / liveness probing / bridge config / the JTO switch).

## Tunnel/Bridge: multi-endpoint management (TaBridge)

Unified management for multi-process / subprocess / cross-machine debugging — **the same jar, dual roles**:

```bash
# ① Bridge (HTTP 8666 console + forwarding / WS 8667 endpoint tunnel; tokens all optional)
java -cp testagent.jar com.teesoft.testagent.bridge.TaBridge --reg-token reg-1 --use-token use-1
# ② Target service (JAVA_TOOL_OPTIONS fully inherited — main process + subprocesses all caught in one net)
JAVA_TOOL_OPTIONS="-javaagent:testagent.jar=conf -Dtestagent.bridge=ws://bridge:8667" ./run.sh
# ③ Calls (identical to direct connection + X-TA-Endpoint; tokens see below)
curl -H 'X-TA-Endpoint: <id>' http://bridge:8666/api/status
```

- **Endpoints come online automatically**: `-Dtestagent.bridge=ws://bridge:8667` (or the ta_attach bridge argument, env TESTAGENT_BRIDGE, or runtime `POST /api/tunnel connect` catch-up); endpointId is derived from the cmdline hash (stable across restarts/bridges; conflicting cmdlines get a random suffix)
- **Zero drift in calls**: identical to direct connection except for the extra `X-TA-Endpoint` header; in MCP bridge mode (`TESTAGENT_URL` pointing at the bridge) all tools automatically carry endpoint routing, and `ta_discover` lists all endpoints (pid/cmd/remote ip for identification)
- **Three-way token separation** (all optional, zero tokens by default):

| token | Validated by | Carried via | Iron rule |
| --- | --- | --- | --- |
| Registration token | Bridge (once at hello) | TA `testagent.bridge.token` ↔ bridge `--reg-token` | Mismatch refuses the connection; it never appears again inside the channel |
| Bridge usage token | Bridge (every /api request) | `X-TA-Bridge-Token` header | **Stripped after validation, never forwarded to the TA** |
| Endpoint token (X-TA-Token) | TA | Direct: header/`?token=`; via bridge: `X-TA-Endpoint-Token` conversion (only when the TA declares `needToken=true`) | Bridge has zero awareness; trusts bridge WS requests by default |

- **In-process direct dispatch over the WS channel**: requests forwarded by the bridge are dispatched directly inside the TA (not through the HTTP token validation layer — registration implies trust); when needToken=true the tunnel entry point validates by itself
- IDE panel: after bridge address/token config it shows all bridge endpoints (⇄ section) + one-click attach of local processes to the bridge

## Diagnostics surface: aligned with Arthas

Mainstream Arthas commands all have corresponding endpoints: `sc`/`sm`/`jad` (CFR source-level decompilation) / `watch` (with call stack) / `trace` (sub-call tree cost+maxDepth) / `monitor` / `tt` (recording) / `heapdump` / `profiler` (cpu+alloc+wall) / `mbean` / `vmoption` (whitelisted writable flags + audit) / `logger` / `classloader` / `ognl` (ta_eval) / `getstatic` / `thread` (deadlock detection, CPU ordering, state filter, utilization) — for the difference comparison see `docs/testagent-vs-arthas.md` and `docs/arthas-parity-plan.md` in the TestAgent repo.

## The "modify" surface: what Arthas doesn't have

- **Source-code hot update**: `ta_code` submits Java source directly; compile → retransform takes effect instantly; once `ta_classwatch` is attached, editing local source hot-swaps automatically — no restart for either code or config
- **Arbitrary method-level behavior change**: `ta_method` / declarative conf to change return values, inject sleep/exceptions, insertBefore/insertAfter/body (Javassist syntax), add fields
- **Interception simulation**: URL/method-level mock (four content types: json/bean/code/file), filter-based matching, `ta_sql` SQL interception simulation, `ta_capture` traffic capture — frontend/backend joint debugging no longer waits for the backend, fault injection without changing code
- **Transparent address replacement** (addr-redirect): intercepts `Socket.connect` + `DriverManager.getConnection`, hot-rewrites unreachable dev Redis/JDBC addresses to point at any reachable address; rules hot add/remove, auto-restored across restarts, zero instrumentation overhead when no rules exist
- **Auto login** (ta_login): **configure the debug password once and neither humans nor AI worry about login during local debugging** — `-Dtestagent.login.*` startup presets, or ta_login supplying username/password on the spot (or your own login code with `{{username}}/{{password}}` placeholder injection); the server intercepts on 401 → in-process login obtains token/cookie → the original request is replayed automatically. Bare curl, MCP tools, and the Web console all work — AI calling twenty APIs in a row won't get bounced back by a login wall

## Framework dev mode: one switch

**Spring Boot** (`-Dtestagent.springboot=true`) and **Solon** (`-Dtestagent.solon=true`) each fuse the whole dev experience into a single switch, with sub-items individually opt-out:

- **Faster startup**: `lazy-module` (module-level lazy loading, first request triggers activation) + `lazy-mybatis` (mapper SQL generation deferred to background, works for both Spring/Solon) — measured on an app with 263 mappers, startup 33.3s → 29.0s; Solon measured (neutrino-proxy, 19 mappers) cold start **-42%**
- **Config changes without restart**: propwatch watches `application*.yml` / `app.yml`, and after debounce writes the property source + rebinds `@Value`/`@ConfigurationProperties`/`@Inject`
- **Component hot operations** (`ta_spring` / `ta_solon`, all without restart):
  - HikariCP connection pool / thread pool hot tuning (maxPoolSize, core/max)
  - `@Scheduled` and **Quartz** job lists with hot cron changes, trigger now, pause/resume
  - **Dubbo** service list + in-process generic invocation; **XXL-Job** direct trigger (bypassing the admin console)
  - Spring `@Cacheable` / Hibernate second-level cache list and cache eviction (after editing the DB directly, evict stale reads)
  - Solon-specific: bean/route lists, URL → handler resolution, config hot change + bean re-injection, hot controller registration
- **Startup report**: per-bean cost aggregation (byPkg), pointing straight at slow beans — check the shares before expanding the lazy-loading set

## Reversibility and safety

- Every modification enters the config history (`ta_history`); `ta_restore` / deleting a conf / `stop` restores in one click
- `ta_attach` dynamically attaches to a running process without restart; httpPort supports TOKEN auth and basePath
- Lazy instrumentation: addr-redirect installs no hooks without rules; the solon adapter loads only when `org.noear.solon` is detected
- Read-only scenarios: `--exclude write,mock` cuts off the entire write surface

## Quality and docs

Automated regression: 29 assertions for core features + 26 assertions for Arthas gap closure (both JDK8+spring2 and JDK21+mybatis baselines fully green) + 16 assertions for auto login + lazy-module/solon dedicated e2e + **48 assertions for tunnel/bridge** (endpoint management / three-way token separation / wss / Origin / download / concurrency / MCP bridge mode) + 6 MCP protocol assertions; one-click run-all **120 + restmock 9 = 129 assertions**. For the full tutorial and API parameter schemas see `docs/testagent-user-guide.md` in the TestAgent repo (MCP tool mapping in its Appendix B).

## Prerequisites

- The target JVM has TestAgent attached (via `-javaagent` at startup or dynamic `ta_attach`); the HTTP API defaults to `http://127.0.0.1:8564` (env `TESTAGENT_URL`)
- Compiled on a Java 11 baseline, runs on Java 8+ (Spring Boot 2/3, javax/jakarta both covered; Solon 2.x/3.x dual compatible)
