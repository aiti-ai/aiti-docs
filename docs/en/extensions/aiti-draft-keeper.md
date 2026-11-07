---
title: Draft Keeper (aiti-draft-keeper)
icon: 📝
description: Draft persistence + restore take-over — sole owner of the composer contract v2 (applyIntent as the only write entry), shared slots across tabs, no-contribution-no-writeback oscillation guard, pruneStale 7-day cleanup, restore after hydration
---

# aiti-draft-keeper

> ❝ **A crash can take the page away, but not the words you were halfway through typing.** ❞

Draft persistence + restore take-over extension — a pi-web defork P2 product. The core's draft logic has fully moved out; **core has zero draft-store dependencies**; the core accesses this extension's storage API through the `lib/composer/draft-api.ts` registry.

**Model (shared slots + no-contribution-no-writeback)**:

- One shared slot per session; multiple tabs on the same session naturally share the same draft
- **onChange writes only on real input**: no write when the snapshot equals known (the anti-oscillation core), clear/send-then-clear (300ms delayed confirmation guards against accidental clears)
- **scan is read-only, never writes**: empty box with a stored draft → silent restore; storage ⊇ known → sync into the box; divergence untouched; **when a restore happens, that round's onChange returns directly** (that round's empty snapshot is stale — wait for the new snapshot triggered by typing to arbitrate — guards against "restore means delete")
- **Restore waits for host hydration to complete** (`pi-web:hydrated` signal + stage replay as a second line of defense), so it isn't wiped by re-renders from hydration mismatches

**Composer contract v2 (sole owner of the state machine)**: the core (pi-web) only sends intents — `applyIntent` is the only write entry:

- `sessionCreated {provisionalKey, sessionId}`: on promote the provisional draft is invalidated; new input during the promote window (before the draftKey prop switches) is **redirected into the sid slot** (the whole `new:<cwd>` family of in-memory copies is cleared together, guarding against sent-message residue)
- `rejected {key,text,images}`: failed sends are **merged back into the draft** (submission first, original after) and written back to the current box
- v1 methods (saveDraft/clearDraft/rekeyDraft/restoreSubmission) are deprecated, only for fallback with un-upgraded old cores

**Maintenance & migration**: `pruneStale()` cleans slots unwritten for >7 days once at registration (including old per-tab residue and ts-less legacy formats; not polling); slot normalization to `crashrestore-new:<cwd>` shares by cwd; old `crashrestore-<key>-<tabId>` slots migrate in automatically on first read. `core.test.mjs` pins the semantics with 26 cases; core.mjs is a thin shell (hydration gating + DraftApi registration).
