---
title: ext-jsx-client (Extension JSX Template)
icon: ⚛️
description: Shared template for extension clients using JSX + TypeScript + npm dependencies (vite lib mode + host-shim delegation)
---

# ext-jsx-client (Extension JSX Template)

> ❝ **Writing extensions shouldn't force you to hand-write `h()` — JSX + npm dependencies, copy and go.** ❞

A shared template that lets pi-web extension clients use **JSX + TypeScript + npm dependencies**: vite lib mode
bundles into a single `.mjs` the host can `import()`, `react` is delegated to the host's `h/useState/…` via host-shim,
the output has zero React references and npm packages are fully inlined.

## Why it is needed

Extension clients "couldn't use JSX/npm" before — not a framework limitation, but **no build step**:

| Side | Loading | npm packages | JSX |
|---|---|---|---|
| server (`index.ts`) | jiti (server-side) | ✅ | ✅ |
| client (`client/*.mjs`) | browser `import()` | raw serve doesn't support | raw serve doesn't support |

The template adds one vite build step for the client, unblocking both paths. For a runnable example see the [demo extension](/en/extensions/demo.html) (the ⚛️ button in the top bar).

## Three steps to use

```bash
# 1. Copy the template
cd dev-repo && cp -r templates/ext-jsx-client <your-ext> && cd <your-ext>

# 2. Change three places
#    - vite.config.ts: build.lib.fileName → "<your-ext>.mjs" (= index.ts's client field)
#    - package.json: add your npm packages to dependencies (e.g. qrcode/date-fns)
#    - client/src/entry.tsx: replace with your UI (registerItems registers toolbar/dialogs/...)

# 3. Build + point index.ts at the output
npm install && npm run build:client
# index.ts: export default { id: "your-ext", client: "client/<your-ext>.mjs", ... }
# run build-client.mjs first in the deploy script
```

## Template structure

```
templates/ext-jsx-client/
├── package.json            # scripts(build/deploy) + vite devDep
├── vite.config.ts          # lib mode + jsx automatic + alias regex + external:[]
├── skills/                 # AI help points (aiti-helper skills mechanism)
│   ├── index.json          # lists skill names (e.g. ["ext-create"])
│   └── ext-create/SKILL.md # full guide for "create a new extension with this template" (AI reads it to create/maintain extensions)
├── client/src/
│   ├── entry.tsx           # register(ctx) entry + example panel (useState / list map key demo)
│   ├── host-shim.ts        # react → host h/useState… delegation bridge (incl. jsxs validated flag)
│   └── jsx-runtime.ts      # one line
└── tools/build-client.mjs  # wraps vite build
```

## How it works (three key designs)

1. **vite lib mode**: `client/src/entry.tsx` → a single ESM `.mjs` (`formats: ['es']`),
   the host's loading method stays unchanged.
2. **host-shim delegation**: `resolve.alias` points `react` / `react/jsx-runtime` to
   `host-shim.ts`; hooks are delegated to the `h/useState/useEffect/apiUrl/t` passed in by the host's `register(ctx)`.
   The output has zero React references; the host keeps a single render instance.
3. **Dependency inlining**: `rollupOptions.external: []` forces all npm dependencies into the single `.mjs`.

## AI help points (aiti-helper skills)

The template ships a `skills/` skeleton. Once the extension declares it in `index.ts`, aiti-helper automatically aggregates that extension's
AI help points (dialog 🤖 AI button → highlighted grouped by extension):

```ts
export default {
  id: "your-ext",
  // ...
  ai: { manage: true, intro: "One sentence: what can AI do for me", skills: "skills" },
}
```

- `skills/index.json` only lists skill names; each skill gets one `skills/<name>/SKILL.md` (frontmatter: `name/title/summary/placeholder/outputs/action`; the body is a manual for the AI, and can use `{basePath}` to build API paths)
- The template ships `ext-create`: a **full guide for "create a new extension with this template"** (copy → change config → write components → build → deploy → take effect, with a pitfall quick reference and a landing checklist); the AI can consult it directly to create new extensions; after copying, replace it with your own help points
- Runnable examples: the [demo extension](/en/extensions/demo.html)'s `skills/demo-selfcheck` (AI runs a self-check) and `demo-humor` (AI plays a humor easter egg)

## Common pitfalls (already flattened in the template, do not regress)

- **vite defaults to classic JSX** → you must set `esbuild.jsx: "automatic"`, otherwise the output has `React.createElement` with React undefined.
- **alias prefix matching** → use separate regexes `/^react$/` and `/^react\/jsx-runtime$/` (string aliases swallow `jsx-runtime`).
- **lib mode externalizes dependencies by default** → you must set `external: []` to inline them.
- **`__setCtx(ctx)` must be called first** (before any JSX render), otherwise hooks in components won't delegate to the host.
- **False-positive key warnings for static sibling elements** → the host-shim's `jsxs` must add `_store.validated = 1` (the value must be 1; 2 still warns). Don't omit this part when copying host-shim.
- **`map()` / svg path arrays in JSX must have keys** (the host is React; the rules are the same).
- **Dialog close button with `aria-label="Close"`**: aiti-helper's global AI button identifies the close button to inject itself to its left; bare text "Close" won't be recognized → the AI button won't be injected.
- **Don't pass a no-op function to DialogsSlot's `onClose`**: it breaks all in-panel close buttons/masks; bind real state (`onClose={() => setPanelOpen(false)}`).

## Commands

```bash
npm run build:client   # build (must run after changing source, otherwise the page shows nothing new)
npm run watch          # vite build --watch: rebuilds automatically on source changes (rev changes → together with the frontend rev poller this is HMR without full reload)
```

> Detailed plan documents (internal docs): full host-shim code,
> full vite.config, HMR layering plan.
