---
title: Feature Declaration & Consumption
icon: 🎚️
description: The three ExtFeature types, the tool.* convention, and the server/client consumption chains with manifest pass-through
tags: [ext-dev, features, extman]
---

# Feature Declaration & Consumption

A feature = a capability point the extension exposes for users to **toggle/configure per item**.
Users switch them one by one in the extension manager (aiti-extman); state persists in
`<dataRoot>/features.json`, **written/read solely by the core registry** (extensions never touch
the file).

Source of truth: `lib/ext/types.ts` (`ExtFeature`).

## 1. Declaration (entry-level `features`)

```ts
export default {
  id: "my-ext",
  // ...
  features: [
    // boolean (default type): on/off. default defaults to true; false = off by default, users can enable
    { id: "greeting.enabled", label: "Greeting", description: "Say hi at startup",
      group: "behavior", default: true },

    // string: text setting, rendered as an input box in extman
    { id: "asr.hotwords.count", label: "Hotword limit", type: "string", value: "50",
      placeholder: "50" },

    // textlist: multi-line text, one entry per line (e.g. an env-var list), value semantics same as string
    { id: "proxy.extra-args", label: "Extra arguments", type: "textlist" },

    // Tool-level convention: id = "tool.<injected tool name>" → the host filters disabled agent tools automatically
    { id: "tool.aiti_page_exec", label: "Page execution tool", group: "page actions",
      description: "The aiti_page_exec tool injected into agent sessions" },

    // category: app-center category tag (optional; internal ids: session/code/ai/auto/debug/ui/system/other,
    // other values display verbatim as custom categories; falls back to the extension-level category, then "other")
    { id: "tool.export", label: "Export", category: "export" },
  ],
};
```

| Field | Semantics |
|---|---|
| `id` | Unique within the extension; **tool-level = `"tool.<tool name>"`** (e.g. the page-injection extension's `aiti_page_exec` → `tool.aiti_page_exec`); other prefixes (e.g. `behavior.xxx`) are queried by the extension itself |
| `label` / `description` | extman display |
| `group` | Group (extman groups by it, e.g. "page actions" / "user interaction") |
| `type` | `"boolean"` (default) / `"string"` / `"textlist"` |
| `default` | boolean default state (defaults to true) |
| `value` | string default value (defaults to "") |
| `placeholder` | Input hint (string, optional) |
| `category` | App-center category tag (optional) |

## 2. The host's special handling of `tool.*`

- Injection side: the core **filters disabled tool-level features automatically** during
  `collectAgentTools` injection (existing sessions included).
- Execution side: disabled tools are **rejected immediately** on execute (existing sessions included).
- Non-`tool.*` features: the host interprets nothing — the extension queries on both ends itself.

## 3. Server-side consumption (`ctx.features`)

```ts
// inside server.startup(ctx) / api(req, ctx)
const on = ctx.features.get("greeting.enabled");            // boolean | string | undefined
const limit = ctx.features.get("asr.hotwords.count");       // string value
const other = ctx.features.get("other-ext", "some.flag");   // read another extension (cross-extension read)

const off = ctx.features.on(() => resubscribeIfNeeded());   // change subscription; returns an unsubscribe fn
```

Red line: **do not reach through the registry** calling `featureValue` / `setFeatureFlag` (the old
global path, replaced by `ctx.features` — see the [services red lines](/en/guide/ext-services.md) §4).

## 4. Client-side consumption

```js
export default function register(ctx) {
  const flags = ctx.getFeatures?.() ?? {};        // sync read of all effective values (fetched in one go by the host, zero extra requests)
  const off = ctx.onFeatureChange?.(() => render());  // fired after extman edits
}
```

## 5. Manifest pass-through & cross-extension reads

- Feature states travel with `/api/extensions/manifest` (`features?: { id, type?, label?…, enabled,
  value? }[]`) — the host client fetches them in one go; extensions read a shared store, no
  separate requests.
- Cross-extension reads use `ctx.features.get(extId, fid)` (server) / the manifest (client);
  features are **not** a cross-extension calling channel — capability collaboration goes through
  [ctx.services](/en/guide/ext-services.md).

## 6. Relation to static-item gating

In lazy-load v2, entry `ui[slot]` static items can carry a `feature` gate (off → the host doesn't
render that entry); after the client materializes, the registered item's own `feature` takes over.
See the [lazy-loading contract](/en/guide/ext-lazy-loading.md).
