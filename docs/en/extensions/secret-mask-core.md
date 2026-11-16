---
title: secret-mask-core (shared redaction engine)
icon: 🧬
description: Host-agnostic secret redaction engine — deterministic credential detection rules, the [REDACTED:*] placeholder registry, deep traversal, payload auditing and the /secret command logic in one zero-dependency package. Shared by the pi and DSH editions; any TS/JS agent can adapt it in four steps
---

# secret-mask-core (shared redaction engine)

> ❝ **One detection engine, one "paste-safe by default" for every agent.** ❞

A host-agnostic secret redaction engine (zero runtime dependencies) — it splits "paste-safe" into an **engine** and **host wiring**: the engine lives here; hooks, message shapes, mutability semantics and storage locations stay with the host. Two production consumers share the same code and test corpus:

- [`@aiti-ai/pi-secret-mask`](/en/extensions/pi-secret-mask.md) — pi (runtime dependency)
- [`@aiti-ai/dsh-secret-mask`](/en/extensions/dsh-secret-mask.md) — DeepSeek Harness (esbuild-bundled)

## Modules

| module | exports | role |
|---|---|---|
| `detect` | `scan` / `RULES` / `entropy` / `plausibleSecret` | deterministic credential detection (AWS/GitHub/GitLab/Slack/Stripe/SendGrid/Twilio/Google/Anthropic/OpenAI/HF/npm/PyPI/Azure/JWT/PEM/DB URL/Authorization header/generic assignments + Chinese keywords + base64-wrapped tokens), entropy floors, false-positive guards; no network, no model calls |
| `mask` | `Registry` / `redactForms` / `restoreDeep` / `redactDeep` / `auditPayload` | value↔placeholder registry (`[REDACTED:alias]` / `[REDACTED:LABEL#hash]`, stable within a session), deep JSON traversal, final-payload leak proof |
| `spans` | `redactTextSpans` / `spanOf` | the send-boundary loop: map your message shapes to text spans; auto-detection runs **only** on spans you flag as user-authored |
| `commands` | `handleSecretCommand` / `savePersist` / `appendAuditLog` | the full `/secret` command logic (storage paths injected via state) |

## Adapt any TS/JS agent in four steps

```ts
import { Registry, redactTextSpans, spanOf, restoreDeep, auditPayload } from "@aiti-ai/secret-mask-core";

// ① one Registry per session (fresh salt → same value maps to the same placeholder within the session)
const registry = new Registry();
const salt = crypto.randomBytes(4).toString("hex");

// ② send boundary: messages → text spans; only user-authored spans get auto-detection
for (const m of outgoingMessages) {
  const spans = textBlocksOf(m).map(b => spanOf(() => b.text, t => { b.text = t; }));
  redactTextSpans(spans, registry, salt, { autoDetect: m.role === "user" });
}

// ③ before a tool executes: restore placeholders the model echoed back (clone if frozen)
const args2 = restoreDeep(structuredClone(args), registry).value;

// ④ before the request leaves the machine: audit the FINAL payload
const a = auditPayload(payload, registry);
if (a.leaks > 0) alarm(`raw secret on the wire: ${a.leakedLabels.join(", ")}`);
```

Optional: `handleSecretCommand` provides the whole `/secret` command surface against a `SecretState` (you provide storage paths and a command dispatcher).

## Guarantees & limits

Session-scoped (fresh salt per session; in-memory registry, opt-in persistence) · bare high-entropy strings without keywords are NOT auto-detected (deliberate: bare entropy detection false-positives on minified JS) · prevents accidental leaks, not malicious agents · images are not scanned.

## Testing

`npm test` (37 engine/command/span cases) · `npm run fp-corpus` (11 locked public repos, 60k+ files, 0-false-positive baseline). Both hosts run their adapter suites and the fp-corpus baseline against this shared dist.
