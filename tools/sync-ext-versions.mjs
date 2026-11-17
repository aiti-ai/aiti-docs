#!/usr/bin/env node
/**
 * sync-ext-versions — sync docs/extensions/*.md `ext.version` fields from the
 * aiti-ai release repo checkout.
 *
 * The docs-site extension catalog (extensions.json / ExtensionList) renders
 * the hand-maintained `ext.version` frontmatter field, which drifts as
 * extensions bump versions. After a successful @aiti-ai/pi-web publish, the
 * sync-ext-versions workflow checks out aiti-ai (whose extensions/ + pi-plugins/
 * mirrors carry the versions that actually shipped) and runs this script to
 * converge the doc versions, then commits and pushes main — the deploy
 * workflow picks it up and republishes the site.
 *
 * Version source resolution order (first existing package.json wins):
 *   1. $AITI_AI_DIR/extensions/<id>/package.json      — pi-web extensions (62+)
 *   2. $AITI_AI_DIR/pi-plugins/<id>/package.json      — pi plugins (pi-git-trace, pi-models-combo, pi-secret-mask)
 *   3. $AITI_AI_DIR/packages/<id>/package.json        — bridge & shared packages (aiti-bridge, secret-mask-core)
 *   4. $AITI_AI_DIR/integrations/<id>/package.json    — integrations, flat (dsh-secret-mask)
 *   5. $AITI_AI_DIR/integrations/<repo>/<id>/package.json — integrations, per-repo layout (DSH/OpenClaw/OpenCode host adapters)
 * AITI_AI_DIR defaults to ../aiti-ai (workflow layout; override for local runs).
 * Entries with no source there (git-pullkeep: SKILL.md carries no version
 * metadata) are reported as skipped and left untouched.
 *
 * Usage:
 *   node tools/sync-ext-versions.mjs                  # rewrite drifted versions
 *   node tools/sync-ext-versions.mjs --check          # report only; exit 1 on drift
 *   node tools/sync-ext-versions.mjs --json           # machine-readable output
 *   node tools/sync-ext-versions.mjs --only <id>      # restrict to given id(s), repeatable
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const REPO = resolve(join(fileURLToPath(import.meta.url), "..", ".."));
const DOCS_EXT_DIR = join(REPO, "docs", "extensions");
const AITI_AI_DIR = resolve(REPO, process.env.AITI_AI_DIR || "../aiti-ai");
const SOURCE_ROOTS = [
  join(AITI_AI_DIR, "extensions"),
  join(AITI_AI_DIR, "pi-plugins"),
  join(AITI_AI_DIR, "packages"), // aiti-bridge, secret-mask-core, ...
  join(AITI_AI_DIR, "integrations"), // flat (dsh-secret-mask) + per-repo layout via perRepoRoots
];
const SKIP_FILES = new Set(["README.md", "spec.md"]); // same skip list as extensions-catalog.ts

const argv = process.argv.slice(2);
const CHECK = argv.includes("--check");
const JSON_OUT = argv.includes("--json");
const onlyIdx = argv.indexOf("--only");
const ONLY = new Set();
for (let i = onlyIdx; i !== -1 && argv[i + 1] && !argv[i + 1].startsWith("--"); i = argv.indexOf("--only", i + 1)) {
  ONLY.add(argv[i + 1]);
}

/** Locate the authoritative package.json version for an extension id (or null). */
const INTEGRATIONS_DIR = join(AITI_AI_DIR, "integrations");
// integrations/<repo>/<pkg> per-repo layout (DSH/OpenClaw/OpenCode host adapters)
const perRepoRoots = existsSync(INTEGRATIONS_DIR)
  ? readdirSync(INTEGRATIONS_DIR, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => join(INTEGRATIONS_DIR, e.name))
  : [];
/**
 * Base-library packages that live in their own repositories under ~/workspace
 * (published to npmjs independently, not mirrored into aiti-ai).
 * Explicit list on purpose — a wildcard would match unrelated checkouts.
 */
const EXTERNAL_PKG_DIRS = { "content-share": resolve(homedir(), "workspace", "content-share") };
function sourceVersion(id) {
  const ext = EXTERNAL_PKG_DIRS[id];
  if (ext && existsSync(join(ext, "package.json"))) {
    try {
      const v = JSON.parse(readFileSync(join(ext, "package.json"), "utf8")).version;
      if (typeof v === "string" && v) return { version: v, source: ext };
    } catch { /* fall through to the in-repo roots */ }
  }
  const pkgs = SOURCE_ROOTS.map((r) => join(r, id, "package.json"));
  for (const root of perRepoRoots) pkgs.push(join(root, id, "package.json"));
  for (const pkg of pkgs) {
    if (!existsSync(pkg)) continue;
    try {
      const v = JSON.parse(readFileSync(pkg, "utf8")).version;
      if (typeof v === "string" && v) return { version: v, source: pkg };
    } catch {
      /* unreadable package.json — keep looking */
    }
  }
  return null;
}

/**
 * Parse one doc file: returns { file, id, indent, quote, docVersion, lineNo }
 * or null when there is no ext block / id / version line to manage.
 * Line-oriented scan (no yaml dep): enter the ext block at `ext:`, leave at
 * the first line with less indentation; quote style is preserved on rewrite.
 */
function parseDoc(name) {
  const file = join(DOCS_EXT_DIR, name);
  const lines = readFileSync(file, "utf8").split("\n");
  let id = null;
  let inExt = false;
  let verLine = -1;
  let indent = "";
  let quote = "";
  let docVersion = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!inExt && /^ext:\s*$/.test(line)) {
      inExt = true;
      continue;
    }
    if (!inExt) continue;
    if (line.trim() === "") continue;
    const ind = line.match(/^[ \t]*/)[0];
    if (ind.length < 2) break; // dedent → ext block ended
    const idm = line.match(/^[ \t]+id:\s*['"]?([\w@/.-]+)/);
    if (idm) id = idm[1];
    const vm = line.match(/^([ \t]+)version:\s*(['"]?)([^'"\s]+)\2\s*$/);
    if (vm) {
      verLine = i;
      indent = vm[1];
      quote = vm[2];
      docVersion = vm[3];
    }
  }
  if (!id || verLine === -1) return null;
  return { file, id, verLine, indent, quote, docVersion };
}

const rows = [];
for (const name of readdirSync(DOCS_EXT_DIR).sort()) {
  if (!name.endsWith(".md") || SKIP_FILES.has(name)) continue;
  const parsed = parseDoc(name);
  if (parsed) rows.push(parsed);
}

const result = { updated: [], ok: [], skipped: [] };
for (const row of rows) {
  if (ONLY.size && !ONLY.has(row.id)) continue;
  const src = sourceVersion(row.id);
  if (!src) {
    result.skipped.push({ id: row.id, docVersion: row.docVersion });
    continue;
  }
  if (src.version === row.docVersion) {
    result.ok.push({ id: row.id, version: src.version });
    continue;
  }
  result.updated.push({ id: row.id, from: row.docVersion, to: src.version });
  if (!CHECK) {
    const lines = readFileSync(row.file, "utf8").split("\n");
    lines[row.verLine] = `${row.indent}version: ${row.quote}${src.version}${row.quote}`;
    writeFileSync(row.file, lines.join("\n"), "utf8");
  }
}

if (JSON_OUT) {
  console.log(JSON.stringify({ check: CHECK, ...result }, null, 2));
} else {
  const list = (arr, fmt) => arr.forEach((x) => console.log("  " + fmt(x)));
  console.log(
    `sync-ext-versions (${CHECK ? "check" : "write"}): ` +
      `${result.updated.length} drifted, ${result.ok.length} in sync, ${result.skipped.length} skipped`
  );
  if (result.updated.length) {
    console.log(`\n${CHECK ? "drifted" : "updated"}:`);
    list(result.updated, (u) => `${u.id}: ${u.from} -> ${u.to}`);
  }
  if (result.skipped.length) {
    console.log("\nskipped (no version source under AITI_AI_DIR):");
    list(result.skipped, (s) => `${s.id} (doc=${s.docVersion})`);
  }
}
if (CHECK && result.updated.length > 0) process.exit(1);
