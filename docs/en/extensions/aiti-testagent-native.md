---
title: TestAgent Native (aiti-testagent-native)
icon: ⌖
description: Visual panel for testagent-native (live Windows-native process control) — broker processes/sessions/hooks/event stream; formerly aiti-wintrace (renamed 2026-11-07)
---

# aiti-testagent-native

> ❝ Any Windows process becomes an AI-programmable tool surface: API/COM call-level tracing, native evaluation, mock tampering, function-body hot-patching — all reversible and audited. ❞

**testagent-native panel** (formerly `aiti-wintrace`, renamed with the project on 2026-11-07) — the in-IDE visual surface: tan broker status / process scan + attach / sessions + eject / hook form / live event stream. The server proxies the broker HTTP API (`8766 /api/rpc`, all methods, 1:1 with the testagent-native-mcp tools).

Capability model = the native replica of TestAgent's six primitives:

- **A Access**: two-hop injection (NtCreateThreadEx→CRT fallback, bitness-matched), attach to any process
- **B Inspect**: libclang signature library for named argument decoding + COM four-layer auto-discovery + `proc.stack` frames with exported-symbol names
- **C Evaluate / tamper**: out-of-process compile + remote execution (clang→COFF relocation→arena→remote thread); API-level mocks (skip / change return / last_error)
- **D Hot-update**: function-body hotpatching (dll_bypass apply/revert) + quickjs-ng sandboxed scripts (works on ACG-protected processes)
- **E Reversible audit**: mandatory registration of every hook/patch + `tan_restore` one-click rollback + history audit

Tool surface: **57 tools = 50 `tan_*` + 7 `app_*`** (snapshot 2026-11-10; the "any app → MCP" service layer plus the cross-platform object-model OM families: `tan_dbus_*`×4 / `tan_gir_*`×2 / `tan_objc_*`×3 / `tan_vtable_*`×3, growing with the OM phases); the legacy `wintrace_*` names remain compatible through broker/MCP dual alias layers (retirement criteria in the testagent-native repo, rename-exec §P6).

## Data source & configuration

| Item | Value |
| --- | --- |
| broker HTTP | `http://127.0.0.1:8766` (env `TAN_BROKER_HTTP` to override) |
| broker token | env `TAN_TOKEN` (required when the broker starts with `--token`) |
| MCP registration | `node mcp/testagent-native-mcp/register.js` → pi `mcpServers.testagent-native` (HTTP 8767) |
| Java-side integration | TestAgent `/api/tan/*` proxy (`TanOps.java`, `-Dtestagent.tanBroker` for cross-machine) |
