---
title: "Quick Start: Your First Extension"
icon: 🚀
description: Follow the tutorial to build your first pi-web extension — server API + toolbar button + feature toggle, verified with hot reload
tags: [ext-dev, tutorial, quick-start]
---

# Quick Start: Your First Extension

> Goal: build a `my-ext` extension with a server API, a toolbar button opening a panel, and a
> toggleable feature. Takes ~15 minutes, no build toolchain needed (hand-write the `.mjs` client;
> move to the [template](/extensions/ext-jsx-client.md) when you want JSX/npm).

Prerequisite: aiti (pi-web) installed with a reachable instance. For development use the **dev
instance** (`PI_WEB_DEV_DIST=1`; extension root `~/.pi/web-dev/extensions/`, fully isolated from
production — see [deployment & hot reload](/en/ext-dev/deploy.md)).

## 1. Create the directory

An extension = a directory + one entry file. Directory name = extension id (must match):

```bash
mkdir -p ~/.pi/web-dev/extensions/my-ext/client
```

Entry file names: `index.ts` / `index.mjs` / `index.js` / `index.cjs` (jiti transpiles TS with
`moduleCache: false`, so hot reload works); a single-script directory also works as a single-file layout.

## 2. Write the entry `index.ts` (server side)

```ts
// ~/.pi/web-dev/extensions/my-ext/index.ts
// No imports needed: jiti loads TS directly, the host validates by structural contract.

export default {
  id: "my-ext",                    // must match the directory name
  name: "My Extension",
  icon: "🧰",
  description: "My first extension",

  server: {
    async startup(ctx) {
      // configDir/stateDir/cacheDir are guaranteed to exist by the framework
      console.log("[my-ext] started, config at", ctx.configDir);
    },
    async shutdown(ctx) {
      // cleanup on hot reload / exit
    },
    // API: GET /api/extensions/my-ext/hello?name=xx
    async api(req, ctx) {
      if (ctx.method === "GET" && ctx.path[0] === "hello") {
        const name = ctx.searchParams.get("name") ?? "world";
        return Response.json({ hello: name, from: ctx.id });
      }
      return null; // unmatched path → 404 (must return null, don't throw)
    },
  },

  ui: {
    // Declarative static item (lazy-load v2): the host renders this toolbar button
    // before the client bundle is even materialized
    toolbar: [{ id: "open", label: "My Ext" }],
    clientImmediately: true, // default is true; written out for readability
    i18n: {
      en: { "my-ext.title": "My Extension" },
      "zh-CN": { "my-ext.title": "我的扩展" },
    },
  },

  client: "client/bundle.mjs", // created in step 4; pure-server extensions can omit it

  features: [
    { id: "greeting.enabled", label: "Greeting", type: "boolean", default: true },
  ],
};
```

> Full `ctx` members: [Server ctx API](/en/ext-dev/server-api.md).

## 3. Verify the server side with hot reload

```bash
# Re-scan/load extensions on the dev instance (adjust the port)
curl -X POST http://127.0.0.1:30142/api/extensions/reload

# Load status (load errors show here; one failing extension never blocks the others)
curl http://127.0.0.1:30142/api/extensions/status | jq '.extensions["my-ext"]'

# Try the API
curl "http://127.0.0.1:30142/api/extensions/my-ext/hello?name=aiti"
```

You now have a working extension with an API. Edit server code → POST reload again to apply.

## 4. Write the client bundle (toolbar button)

The client is **a single precompiled ESM** doing `default export function register(ctx)`;
components never import react (`h`/hooks come from the host). Minimal hand-written version:

```js
// ~/.pi/web-dev/extensions/my-ext/client/bundle.mjs
export default function register(ctx) {
  const { h, useState, registerItems } = ctx;

  function Panel() {
    const [open, setOpen] = useState(false);
    if (!open) return null;
    return h("div", { style: "position:fixed;top:60px;right:20px;z-index:9999;" +
      "background:#fff;border:1px solid #ddd;border-radius:8px;padding:12px;" },
      h("span", null, ctx.t("my-ext.title")),
      h("button", { onClick: () => setOpen(false) }, "×"));
  }

  registerItems("toolbar", [
    {
      id: "open",
      // Declarative item: the host renders the standard 36×36 button + ⋯ menu entry
      meta: { label: "My Ext", icon: "🧰", onClick: () => setOpen(true) },
    },
  ]);

  // The panel body mounts into the dialogs slot (separate registration, open state self-managed)
  registerItems("dialogs", [{ id: "panel", render: () => h(Panel) }]);
}
```

Refresh the **browser** (server reload doesn't clear the frontend ESM module map) — the 🧰
toolbar button appears.

> That's the demo style. For real projects use the [ext-jsx-client template](/extensions/ext-jsx-client.md):
> JSX + TypeScript + npm deps bundled by vite lib mode into a single file the host can `import()`;
> React is delegated to the host via the host-shim — the bundle ships zero React references.

## 5. Verify the feature toggle

Open the extension manager (🧩 in the toolbar), find `my-ext`, switch off "Greeting", then:

- server side: `ctx.features.get("greeting.enabled")`
- client side: `ctx.getFeatures()["greeting.enabled"]` + `ctx.onFeatureChange(cb)`

Feature ids with the `tool.*` prefix have special semantics: the host filters disabled agent
tools automatically (see [feature guide](/en/ext-dev/features.md)).

## 6. Next steps

| Want to… | Go to |
|---|---|
| Build complex UI with JSX/npm deps | [ext-jsx-client template](/extensions/ext-jsx-client.md) |
| Decide where data lives (config/state/cache) | [Extension data & storage](/en/guide/ext-data.md) |
| Call other extensions / expose capabilities | [Extension services guide](/en/guide/ext-services.md) |
| Load heavy UI on demand | [Lazy-loading contract](/en/guide/ext-lazy-loading.md) |
| Let agent sessions use your tools | [AI integration](/en/ext-dev/ai.md) |
| Install on production / release | [Deployment & hot reload](/en/ext-dev/deploy.md) |
| Register in the docs catalog | [ext metadata spec](/extensions/spec.md) |

## Common pitfalls (top 5 for newcomers)

1. **Changed the client but nothing happened** — reload updates server + manifest only; the
   browser caches client bundles as ESM. Refresh the page.
2. **`ctx.dataDir` throws** — removed on purpose; use `ctx.configDir` / `ctx.stateDir` / `ctx.cacheDir`.
3. **API returns nothing** — unmatched paths must explicitly `return null` (the host treats null as 404).
4. **Hook order errors** — hooks must run before conditional returns (Rules of Hooks apply to
   host-injected hooks too).
5. **Hard-coded version in the entry** — package.json overrides it; only touch package.json at release.
