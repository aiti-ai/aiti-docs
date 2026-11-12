---
title: aiti-extman
icon: 🧩
description: Extension manager — search / enable-disable / install / online registry
---

# aiti-extman

pi-web's extension manager extension: extension management moves out of the host's built-in UI, with all the logic implemented in the extension itself.

- **Search**: the search box above the left list — merged results of locally installed extensions + the online registry (aiti.pw); local ones carry an installed badge, online ones come with an install button directly
- **Install from source**: paste a `git:` / `npm:` / github link / local path into the search box and an "Install from source" quick entry appears
- **Details**: enable/disable toggle, version, directory, insertion point details (**clickable to open**), dependencies, server capabilities, source address, **publisher**, uninstall (user-root only)
- **Online registry**: proxied fetch of aiti.pw/extensions.json — browse / one-click install / update check / doc links
- **Publisher trust (VSCode-style)**: the publisher is resolved before install with a trust confirmation prompt; untrusted publishers are not installed; later installs from already-trusted publishers pass automatically
- **Shared dependencies**: runtime dependencies declared by all extensions are installed into the shared root `<webRoot>/node_modules` (one copy per instance) — usable right after npm/git/zip install, no manual dependency install; the details "npm dependencies" row marks each item ✓shared / ●local / ✗missing
- **Feature launch**: the details "insertion points" section lists every UI injection point an extension declares as clickable entries — global slots (top toolbar/sidebar/dialogs etc.) trigger the corresponding on-page button directly via "Open"; context-required slots (session row actions/chat input) hint where to use them via "Where"

After install, a 🧩 Extensions button appears in the toolbar.

## Publishers and trust (publisher / trust)

Each extension's details shows the **publisher**: name + clickable website (opens in a new window) + trust status + trust/revoke buttons.

**Publisher source resolution** (resolved at install time, in priority order):

| Source | Publisher taken from | Example |
|---|---|---|
| npm package | npm registry: `_npmUser` / `maintainers` / latest version `author` (falls back to the registry entry's author / the `npm:<pkg>` fingerprint when the private registry has no publisher info) | `npm:@aiti-ai/aiti-devtools` → jonschlinkert |
| github/gitlab/git | repo owner (parsed from the URL, available offline) | `git:https://github.com/foo/bar` → foo |
| local path / zip / other urls | package.json `author` (string or object) → website from author.url / homepage / repository | `/path/to/ext` → author.name |

After a successful install the resolved publisher is written back to the extension directory's package.json `publisher` field for panel display.

**Trust gating**: the publisher is resolved before install (zip upload included) — if not on the trust list the install is **not performed** and needsTrust is returned; the frontend pops a trust confirmation dialog (publisher name + clickable website), and only clicking "Trust and install" actually installs and records the trust; trusted publishers install directly. The trust list persists at `<dataRoot>/aiti-extman/trusted-publishers.json`, viewable/revocable in the panel's "🤝 Trusted publishers" section.

## Shared dependencies (shared node_modules)

Runtime dependencies on the extension server side are no longer "each extension carrying its own node_modules"; they are installed into one unified **shared root**
`<webRoot>/node_modules` (one copy per instance: `~/.pi/web` and `~/.pi/web-dev` each have one). How it works: the host's
jiti resolves bare specifiers level by level upward from the extension directory, so the shared root takes effect for all extensions as soon as it exists; an extension's local
`node_modules` wins by proximity (unmigrated extensions keep working as before).

- **Auto reconcile**: after install / uninstall / zip install, the union of all extensions' package.json
  `dependencies`+`optionalDependencies` is written into the shared root's package.json and
  `npm install --legacy-peer-deps` runs (same-name conflicts take the **intersection within a same-family range** — the highest lower bound, e.g. `^0.1.3`+`^0.1.5` → `^0.1.5`, so one physical copy satisfies every declarer; only disjoint ranges / complex specs fall back to `||` and let npm choose; after uninstall, unreferenced
  packages are pruned automatically; `peerDependencies`/`devDependencies` are not installed). Can also be triggered manually:
  `POST /ops {"action":"reconcile-deps"}` (deploy scripts notify via `_shared/reconcile-deps.mjs`;
  deploy scripts no longer run npm i themselves).
- **Annotated view**: the details "npm dependencies" row marks each item ✓shared (green, resolved from the shared root) / ●local (gray, bundled
  by the extension) / ✗missing (red, in neither — the server imports a dependency it never declared); hover to see the shared root path.
- **Key point**: third-party packages used on the server side must be declared in the extension package.json `dependencies`; the shared
  root's package.json dependencies field is fully managed by extman (rewritten from the union on every reconcile —
  do not hand-edit).
  (implemented 2026-09-10; aiti-cmd is the migrated sample).

## Feature launch (one-click insertion point trigger)

The details page "insertion points" section lists every UI injection point an extension declares (toolbar/sidebar/sidebarFooter/sessionTopbar/dialogs/sessionRowActions/chatInputTop…) as clickable entries:

- **Global slots** (no session context needed): marked "Global"; clicking "Open" locates the feature entry in the page DOM and triggers it directly (topbar buttons located precisely via `data-topbar-id`; sidebar/dialogs matched by label), e.g. clicking the "🧰 AITI" entry opens the devtools panel directly.
- **Context-required slots** (session row actions/chat input etc.): marked "⚠ Context required"; clicking "Where" shows which context the feature lives in (e.g. "Left session list · session row action buttons", "Above the chat input"), with no context-free forced triggering.

Slot contexts are defined in `SLOT_CONTEXT` in `index.ts` (global: toolbar/sidebar/sidebarFooter/sessionTopbar/dialogs/banners/pages; context: sessionRowActions/chatInputTop).

For lazy extensions (`clientImmediately:false`), the "Open" button calls `ensureMaterialized` to materialize first, then opens (older hosts gracefully degrade to opening directly).

## Reverse dependency view ("dependents" + hard block)

Beyond the details "dependencies" section, each extension can also show **who depends on me** (reverse view). On disable/uninstall: **hard edges** (`dependsOn` / hard capability edges, including the effective-provider resolution chain) → **hard block** — the user is told to disable dependents first, with no "disable anyway" button; client-prefetch soft edges only → a custom confirm dialog lists affected parties and allows forcing through; optional edges never pop (designed and implemented 2026-09-05).

## Dependency and capability model (three views + pin)

Built on the core's declarative dependency and capability model (`dependsOn`/`optionalDependsOn`/`provides`/`takeover`; spec in [ext-services](/en/guide/ext-services.html) §6; implemented and shipped 2026-09-08, including the production core sync):

- **Three views**: `exts` (extension list) / `caps` (capability table: grouped by capability name — provider list (effective one highlighted), consumers, pin dropdown; missing capabilities marked red) / `conflicts` (same-id multi-source groups + takeover conflict groups; pinnable, one click back to "auto").
- **Edge types**: five kinds — client (`clientDependsOn` prefetch) / hard-ext / optional-ext / hard-cap / optional-cap (older hosts degrade to client edges only). Dependency edges display the resolution chain (e.g. `cap.git-trace → aiti-git-trace ✓`, missing ✗).
- **Warning policy**: on disable/uninstall, the **hard block only consumes hard edges** (see the section above); capability edges carry resolution-chain text. The manager does not allow disabling/uninstalling itself.
- **pin**: `extPins` supports the dual keys `source:<extId>` (pick a source among multiple) and `capability:<name>` (pick the effective provider of a capability); the `devPriority` toggle controls whether dev workspace versions win. Resolution order: pin > takeover declarer > semver latest > id lexicographic.

## Extension protocol (aitiExtProtocol badge + AI upgrade)

An extension's package.json declares the `aitiExtProtocol` protocol version (e.g. `"1.0"`, meaning the protocol generation its code follows); the list row and the details "protocol" row show a status badge — current / compatible / needs upgrade / incompatible / too new (host upgrade required) / undeclared / invalid. Entries needing upgrade get an **🤖 AI upgrade** button: it invokes the aiti-helper `ext-protocol-upgrade` skill, which reads the built-in per-version migration manual to migrate automatically; the install response carries protocolCheck back (spec §7 screening placeholder). Spec and bump process: see the extension authoring spec.

## Full set of ops actions

`POST /ops {"action":…}`: install / remove / enable / disable / reload / set-feature / **set-pin / set-dev-priority / trust / untrust / reconcile-deps** — aiti-app-center's "one-click disable extension" and the toggle view consume exactly enable/disable; `set-feature` toggles each feature an extension declares, one by one.

## Services outlet section

The extension card details gains a "Services outlet" section: reads `statusPayload.services` and shows all service keys the extension registered via `ctx.services.provide` (core-provided ones included) — who exposes what, at a glance (P3 implemented). Combined with the dependency view above it forms the complete loop of "who I depend on / who depends on me / what I provide / what I consume".

## AI self-management

> AI can, for you: **enable/disable/install/uninstall extensions, toggle features one by one, and even create or modify an extension directly.**

```yaml
ai:
  manage: true
  skills:
    - View full status/online registry (GET /status, /registry)
    - Install (git:/npm:/local path)/remove/enable-disable/reload/set-feature (all POST /ops actions: set-pin / set-dev-priority / trust / untrust / reconcile-deps)
    - Create/modify extensions: start from the `create-from-template` template library (**optional; AI free-form creation is fine too**); with the **spec prompts** (entry contract/store conventions/deploy chain/red lines + per-extension-point demo references) — **not registered as skills by default; fed to the AI separately when creating/modifying** → write the business source → deploy → reload (button appears in the user's toolbar immediately)
  install: git:/npm:/local path/zip
  storage_dir: <dataDir>
  page: Toolbar 🧩 Extensions → Manager
```

After hooking into ai-helper: just say "build me an XXX extension" → AI reads templates, generates/modifies → deploys and ships (see [aiti-helper](/en/extensions/aiti-helper.html)).

### AI help points (ai.helpers)

| Help point | What it does | Delivery |
|---|---|---|
| `extman-recommend` AI extension recommendation | Describe the capability you want → AI recommends installed/online extensions | Suggestions only (natural language) |

Declared in `ai.helpers` in `index.ts`; aggregated proactively by ai-helper (no registration needed).
