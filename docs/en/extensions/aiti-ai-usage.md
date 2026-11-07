---
title: aiti-ai-usage
icon: 📊
description: AI token usage statistics — multi-dimensional reports by workspace/provider/model/key/time-slot, pivot over any dimension combination + sankey diagram + CSV export, event-driven with zero polling, standalone SQLite storage
---

# aiti-ai-usage

> ❝ **Every token should have a traceable destination.** ❞

AI token usage statistics extension: multi-dimensional statistics across workspace / provider / model / key / time-slot (0–23) / date. The dimension pivot page supports arbitrary dimension combinations × multiple metrics (three views — cross heatmap table / flat detail table / sankey flow diagram + CSV export), web reports + month-view roll-up queries, standalone SQLite (node:sqlite) storage (idempotent PK for details + partition-recomputed daily summaries).

**Three data inflows (all event-driven, zero polling)**:

1. Startup/manual sync: incremental scan of active session JSONLs + session-manager `.pwarc` archives
2. `server.agent.onAgentSession → subscribeEvent("message_end")` real-time ingestion
3. pi-models-combo v0.2.1+ key logs: fs.watch tail (including client→sessionId attribution)

Includes AI self-management help points: the AI can help users interpret usage reports and troubleshoot cost anomalies.

## Dimension Pivot (matrix endpoint + "Dimensions" tab)

`GET matrix?dims=a,b,c,...&days=N|day=|month=|from=&to=` (backward compatible with legacy `dim`/`dim2`):

- **Dimension pool (unlimited count after dedup)**: `workspace` (session cwd) / `provider` / `model` / `hour` (local timezone 0–23) / `day` / `key` / `agent` (external-agent attribution); when dims contain `key` → automatically switches to the proxy-scope metrics (key_req joined to sessions via client→session attribution); otherwise session scope (the `usage_caliber` unified view joined to sessions: pi ∪ external-agent attribution)
- **Every row returns all metric columns**: session scope `msgs/tokens/cost/input/output/cacheRead/cacheWrite/reasoning`; proxy scope `reqs/ok/err429/errOther/tokens/input/output/cacheRead/cacheWrite`
- Fallback `LIMIT 200000` guards against combinatorial explosion; normal multi-dimensional groupings are far smaller than this

The front-end "Dimensions" tab: dimension chain dynamically added/removed (sankey view connector `→`); metric multi-select chips + select-all; three views — **cross heatmap table** (rows = combinations of the first N-1 dimensions, columns = Top12+other of the last dimension, hour columns completed to 0–23, single-value metrics) / **flat detail table** (all dimensions × all metrics, click column headers to sort, truncated beyond 500 rows) / **sankey flow diagram** (hand-written SVG, Top10+other per layer, hour full 24, day ≤31 in full natural order); when truncation happens, a `※` footnote explains at the bottom; ⬇ export CSV (all rows, BOM + escaping).

Sorting rules: hour numerically 0→23, day ascending by date (natural order); categorical dimensions such as workspace/provider/model/key sorted by metric value descending.

Time range: presets (today / last 7 days / last 30 days / this month / all) + custom start/end (`from`/`to`, YYYY-MM-DD inclusive, either end may be omitted alone; spans >60 days auto-switch trends to month granularity).

## Report tabs

- **Trends**: dimension-value line charts (≤12 lines, default Top8 when nothing is selected; spans >60 days auto-switch to month granularity); the `facets` endpoint feeds the filter dropdowns
- **Inputs**: user-input analysis — total count / quote rate / quote-format distribution (Markdown `>` / nested `>>` / Discord `>>>` / BBCode / email reply headers / @file mentions) / top workspaces; machine-injection detection (kind=human|agent|external)
- **Sessions**: `GET sessions` pagination + `session-keys/:id` per-session key attribution + `POST sync` manual rescan
