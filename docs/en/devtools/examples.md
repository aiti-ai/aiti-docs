---
title: Example Matrix
icon: 🧪
description: Runnable examples per carrier under examples/ — run commands and verification points
tags: [examples, demo]
---

# Example Matrix (examples/)

Under the repo's `examples/`, each mainstream carrier gets a **minimal runnable example**, all following the same conventions: the dev server mounts `/aiti/` same-origin, the launcher is injected automatically, and MCP is registered automatically at startup (examples default to `mcp.register: false` or skip disk writes during testing, to avoid polluting local configuration).

## Matrix

| Example | Carrier | How to integrate | Port | Start command | Integration doc |
|---|---|---|---|---|---|
| aiti-vite-demo | Vite | `aitiDevtools()` plugin | 5199 | `pnpm dev` | [vite](integrations/vite.md) |
| aiti-webpack-demo | webpack-dev-server | `AitiDevtoolsWebpackPlugin` | 5299 | `pnpm dev` | [webpack-rspack](integrations/webpack-rspack.md) |
| aiti-rspack-demo | Rspack | Reuses the webpack plugin | 5399 | `pnpm dev` | [webpack-rspack](integrations/webpack-rspack.md) |
| aiti-astro-demo | Astro | `aitiAstro()` integration | 5499 | `pnpm dev` | [astro](integrations/astro.md) |
| aiti-nuxt-demo | Nuxt | `modules: ['@aiti-ai/aiti-devtools-nuxt']` | 5599 | `pnpm dev` | [nuxt](integrations/nuxt.md) |
| aiti-express-demo | Express | core `connectBridge` manual wiring | 5699 | `pnpm dev` | [manual](integrations/manual.md) |
| aiti-next-demo | Next.js | `instrumentation.ts` + `patchProcessHttp()` | 5799 | `pnpm dev` | [manual](integrations/manual.md) |
| aiti-sveltekit-demo | SvelteKit | Bare Vite plugin (SSR pages injected too) | 5899 | `pnpm dev` | [vite](integrations/vite.md) |

There are also shared test pages: `examples/aiti-test-page.html` (complex DOM scenarios) and `aiti-test-page-iframe.html` (iframe host-routing scenarios); the express demo reuses them directly.

## Unified Verification

Every example uses the same set of verification points (using the vite demo / 5199 as an example):

```bash
cd examples/aiti-vite-demo && pnpm install && pnpm dev

# ① Injection takes effect: the launcher script appears in the HTML
curl -s http://localhost:5199/ | grep -o aiti-launcher

# ② Bridge/MCP reachable same-origin
curl -s http://localhost:5199/aiti/aiti-launcher.js -o /dev/null -w '%{http_code}\n'   # 200

# ③ In the page: the toolbar appears → 🧰 opens the console; /aiti/cockpit.html can open the AI window standalone
```

## Per-Example Notes

### aiti-vite-demo

The simplest integration template. Demonstrates multi-project coexistence via `name`, external bridge negotiation, MCP auto registration (`register/targets/dryRun`), and the `assetsDir` debugging hatch (point it at the repo's inject/dist to see launcher changes instantly). Includes an iframe test page (host/iframe routing).

### aiti-webpack-demo / aiti-rspack-demo

webpack injects via html-webpack-plugin + mounts the bridge via setupMiddlewares; rspack reuses the same package with zero config differences — validating the "thin carrier layer" design: core provides the capability, the carrier only adapts.

### aiti-astro-demo

One line `integrations: [aitiAstro()]`. Verifies that SSR-rendered pages are injected too (the official head-inline mechanism).

### aiti-nuxt-demo

One line in `modules`. Verifies that under Nuxt (Vite underneath) the module does everything automatically and the user changes no application files.

### aiti-express-demo

The manual wiring template: the standard connect middleware `connectBridge` goes straight into `app.use`, the page script is added manually; at startup `registerMcp` aligns with the other carriers.

### aiti-next-demo

The solution for carriers without a middleware hook: `patchProcessHttp()` patches the single port inside `instrumentation.ts`; `next.config.mjs` keeps core external (runtime resolution + import.meta.url asset paths stay valid).

### aiti-sveltekit-demo

The representative case of attaching a bare Vite plugin to an SSR framework: `plugins: [sveltekit(), aitiDevtools()]` is all it takes.
