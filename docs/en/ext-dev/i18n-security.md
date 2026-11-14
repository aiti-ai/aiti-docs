---
title: i18n & Security
icon: 🌐
description: Extension i18n (the ui.i18n table + type contract) and the security model (trusted directories, fail-closed gate, fileAccess, publicApi whitelist)
tags: [ext-dev, i18n, security]
---

# i18n & Security

## 1. i18n

### Declaration (entry `ui.i18n`)

```ts
ui: {
  i18n: {
    en:      { "my-ext.greet": "Hello, {name}!" },
    "zh-CN": { "my-ext.greet": "你好，{name}！" },
  },
}
```

- Table shape: `Record<locale, Record<key, message>>`; keys should carry an extension-prefixed
  namespace (avoiding key collisions).
- The client looks up via `ctx.t("my-ext.greet", { name })`; the host picks by current locale
  (falling back when missing).

### Type contract (optional, host-repo development)

Declaring `LocaleNamespaceMap` gives `t(key)` compile-time key checking:

```ts
declare module "dev-repo/ext" {
  interface LocaleNamespaceMap {
    "my-extension": { "my-ext.greet": string };
  }
}
```

Without a declaration it degrades to string (backwards compatible). **Type-level documentation,
no runtime effect.**

### Locale awareness

`ctx.getLocale()` reads the current UI locale (follows the host language setting); use it for Intl
formatting (relative time / numbers).

## 2. Security model

### Loading boundary

- Extensions are **fully server-privileged code**, loaded only from trusted directories (the
  `~/.pi/web/extensions/` roots and their layers, see [deployment](/en/ext-dev/deploy.md) §1).
- A load failure never blocks other extensions (errors go to `/api/extensions/status`).

### Request gate (fail-closed)

- Every request first passes the extension's `middleware(req)` hook, then the core's
  DNS-rebinding gate;
- **A throwing middleware = fail-closed 403** (the aiti-agent core enforces it) — when writing
  middleware, fail conservatively; never swallow exceptions to let requests through.

### Cross-extension API boundary

- Extension APIs mount at `/api/extensions/<id>/<path...>`, protected by the default same-site gate.
- Read-only assets that must be fetched by **any page via cross-origin `<script src>`**
  (server-side injection scenarios) use the `publicApi` whitelist: GET only + exact paths +
  declared paths; writes and undeclared paths still go through the default gate (see
  [contract](/en/ext-dev/contract.md) §1, the `publicApi` row).

### File access

- To read/write user files, extensions **must** go through `ctx.core.fileAccess`
  (`allowRoot(root)` / `isAllowed(p)`), reusing the host's allowed-roots security rules (session
  cwds etc. are pre-authorized); do not hand-assemble paths to bypass it.
- Extension data goes only into its own three-tier directories (configDir/stateDir/cacheDir);
  cross-extension data access goes through [ctx.services](/en/guide/ext-services.md) — **never
  read another extension's configDir directly**.

### Client boundary

- Client bundles execute in the browser with page-script privileges; sensitive operations always
  sink into the server `api` hook.
- Slot extras carry data only (the [host slot red line](/en/guide/ext-services.md) §5.1) — writes
  go through services, never through injected callbacks.
