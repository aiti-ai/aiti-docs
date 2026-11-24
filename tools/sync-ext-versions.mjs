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
 *   6. $AITI_AI_DIR/integrations/<id>/npm/package.json  — npm launcher of a native integration (aiti-desktop-widget)
 * AITI_AI_DIR defaults to ../aiti-ai (workflow layout; override for local runs).
 * Entries with no source there (git-pullkeep: SKILL.md carries no version
 * metadata) are reported as skipped and left untouched.
 *
 * Usage:
 *   node tools/sync-ext-versions.mjs                  # rewrite drifted versions
 *   node tools/sync-ext-versions.mjs --check          # report only; exit 1 on drift
 *   node tools/sync-ext-versions.mjs --json           # machine-readable output
 *   node tools/sync-ext-versions.mjs --only <id>      # restrict to given id(s), repeatable
 *   node tools/sync-ext-versions.mjs --no-probe-npm   # skip the public registry probe
 *
 * Besides ext.version, the script keeps the online install source (`ext.npm`) in sync: for
 * packages under the public @aiti-ai scope it derives the name from the source package.json and
 * writes it only after the public registry confirms the package exists (an unverified or
 * unpublished name would render a failing install button in the extension manager).
 * Manually pinned `npm:` values that differ from the derived name are treated as overrides.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const REPO = resolve(join(fileURLToPath(import.meta.url), "..", ".."));
const DOCS_EXT_DIR = join(REPO, "docs", "extensions");
// Cloud-hosted extension icons: the online registry (extensions.json) points clients at these
// URLs, so an extension can customise its icon without the client having the package on disk.
const PUBLIC_ICON_DIR = join(REPO, "docs", ".vuepress", "public", "ext-icons");
const ICON_URL_PREFIX = "/ext-icons";
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
function readPkg(pkg) {
  try {
    const j = JSON.parse(readFileSync(pkg, "utf8"));
    if (typeof j.version !== "string" || !j.version) return null;
    return {
      version: j.version,
      source: pkg,
      // Package name — the online registry install source (`npm:` frontmatter field) is
      // derived from it when the package belongs to the public @aiti-ai scope.
      npmName: typeof j.name === "string" ? j.name.trim() : "",
      private: j.private === true,
      // English metadata for the extension catalog (ext.nameEn / ext.descriptionEn).
      // `description` is the English baseline; displayNameI18n.en carries the English name.
      nameEn: typeof j.displayNameI18n?.en === "string" ? j.displayNameI18n.en.trim() : "",
      descriptionEn: typeof j.description === "string" ? j.description.trim() : "",
      soulEn: typeof j.soulI18n?.en === "string" ? j.soulI18n.en.trim() : "",
      // Declared icon, resolved against the package directory (icon.svg or icons/<name>.svg,
      // the latter falling back to the shared line-icon library in the aiti-ai checkout).
      iconFile: (() => {
        const pkgDir = join(pkg, "..");
        let entry = "";
        try { entry = readFileSync(join(pkgDir, "index.ts"), "utf8"); } catch { /* no entry */ }
        const decl = entry.match(/^\s*icon:\s*["']([^"']+\.svg)["']/m);
        const rel = decl ? decl[1] : (existsSync(join(pkgDir, "icon.svg")) ? "icon.svg" : "");
        if (!rel) return "";
        const own = join(pkgDir, rel);
        if (existsSync(own)) return own;
        if (rel.startsWith("icons/")) {
          const lib = join(AITI_AI_DIR, "extensions", "_shared", "icons", rel.slice("icons/".length));
          if (existsSync(lib)) return lib;
        }
        return "";
      })(),
    };
  } catch {
    return null;
  }
}

function sourceVersion(id) {
  const ext = EXTERNAL_PKG_DIRS[id];
  if (ext && existsSync(join(ext, "package.json"))) {
    const hit = readPkg(join(ext, "package.json"));
    if (hit) return hit;
  }
  const pkgs = SOURCE_ROOTS.map((r) => join(r, id, "package.json"));
  for (const root of perRepoRoots) pkgs.push(join(root, id, "package.json"));
  // Native integration with an npm launcher beside its Rust project.
  pkgs.push(join(INTEGRATIONS_DIR, id, "npm", "package.json"));
  for (const pkg of pkgs) {
    if (!existsSync(pkg)) continue;
    const hit = readPkg(pkg);
    if (hit) return hit;
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
  let nameLine = -1;
  let descLine = -1;
  let nameEnLine = -1;
  let descEnLine = -1;
  let soulLine = -1;
  let soulEnLine = -1;
  let iconUrlLine = -1;
  let websiteLine = -1;
  let repoLine = -1;
  let npmLine = -1;
  let docNpm = "";
  let quoteNpm = "";
  let npmCommented = false;
  let fieldIndent = "";
  let blockEnd = lines.length;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!inExt && /^ext:\s*$/.test(line)) {
      inExt = true;
      continue;
    }
    if (!inExt) continue;
    if (line.trim() === "") continue;
    const ind = line.match(/^[ \t]*/)[0];
    if (ind.length < 2) { blockEnd = i; break; } // dedent → ext block ended
    const idm = line.match(/^[ \t]+id:\s*['"]?([\w@/.-]+)/);
    if (idm) id = idm[1];
    const vm = line.match(/^([ \t]+)version:\s*(['"]?)([^'"\s]+)\2\s*$/);
    if (vm) {
      verLine = i;
      indent = vm[1];
      quote = vm[2];
      docVersion = vm[3];
    }
    if (/^[ \t]+name:\s/.test(line)) nameLine = i;
    else if (/^[ \t]+nameEn:\s/.test(line)) nameEnLine = i;
    else if (/^[ \t]+description:\s/.test(line)) descLine = i;
    else if (/^[ \t]+descriptionEn:\s/.test(line)) descEnLine = i;
    else if (/^[ \t]+soul:\s/.test(line)) soulLine = i;
    else if (/^[ \t]+soulEn:\s/.test(line)) soulEnLine = i;
    else if (/^[ \t]+iconUrl:\s/.test(line)) iconUrlLine = i;
    else if (/^[ \t]+website:\s/.test(line)) websiteLine = i;
    else if (/^[ \t]+repo:\s/.test(line)) repoLine = i;
    // npm is a top-level ext field: only accept the key at the block's field indent so
    // block scalars (install: | notes) never contribute a package name.
    const nm = line.match(/^([ \t]+)npm:\s*(['"]?)([^'"\s]*)\2\s*(#.*)?$/);
    if (!fieldIndent) fieldIndent = ind;
    if (nm && nm[1] === fieldIndent) {
      npmLine = i;
      quoteNpm = nm[2];
      docNpm = nm[3];
      npmCommented = Boolean(nm[4]); // inline note = hand-maintained decision
    }
  }
  if (!id || verLine === -1) return null;
  return { file, id, verLine, indent, quote, docVersion, nameLine, descLine, nameEnLine, descEnLine, soulLine, soulEnLine, iconUrlLine, websiteLine, repoLine, npmLine, docNpm, quoteNpm, npmCommented, blockEnd };
}

/**
 * Publish one extension's icon for the online registry.
 *
 * The client renders registry icons with a plain <img>, where `currentColor` has no context, so the
 * published copy replaces it with a neutral tint that stays visible on both light and dark themes.
 * The source file is never modified.
 */
function publishIcon(id, iconFile) {
  try {
    let svg = readFileSync(iconFile, "utf8");
    svg = svg.replace(/stroke="currentColor"/g, 'stroke="#8b93a7"');
    svg = svg.replace(/fill="currentColor"/g, 'fill="#8b93a7"');
    if (!/^<svg[^>]*\swidth="/m.test(svg)) svg = svg.replace(/<svg/, '<svg width="16" height="16"');
    mkdirSync(PUBLIC_ICON_DIR, { recursive: true });
    writeFileSync(join(PUBLIC_ICON_DIR, `${id}.svg`), svg, "utf8");
  } catch {
    /* publishing an icon must never break the version sync */
  }
}

const rows = [];
for (const name of readdirSync(DOCS_EXT_DIR).sort()) {
  if (!name.endsWith(".md") || SKIP_FILES.has(name)) continue;
  const parsed = parseDoc(name);
  if (parsed) rows.push(parsed);
}

const result = { updated: [], ok: [], skipped: [], npmMissing: [], npmUnverified: [], npmManual: [] };

// ── Online install source (`npm:` frontmatter) ──
// The extman panel turns a registry entry into an install button only when the entry carries
// `npm` or `repo` (see extensions/aiti-extman client registryInstallSource). The catalog is built
// from these doc files, so the field has to live here. It is derived from the package name of the
// aiti-ai source package, limited to the public @aiti-ai scope, and verified against the public
// registry first — a wrong or unpublished name would surface a failing install button.
const MANAGED_NPM = /^@aiti-ai\/[a-z0-9][a-z0-9._-]*$/i;
const PROBE_NPM = !argv.includes("--no-probe-npm");
const npmProbe = new Map(); // package name -> true (published) | false (404) | null (unverified)
const probeCache = new Map(); // package name -> Promise<boolean|null>
function probeNpm(name) {
  if (!probeCache.has(name)) {
    probeCache.set(name, (async () => {
      try {
        const res = await fetch(`https://registry.npmjs.org/${name.replace("/", "%2f")}`, {
          headers: { accept: "application/vnd.npm.install-v1+json" },
          signal: AbortSignal.timeout(10_000),
        });
        return res.ok;
      } catch {
        return null; // network hiccup: never write an unverified install source
      }
    })());
  }
  return probeCache.get(name);
}

const sources = new Map(); // id -> source package info | null
for (const row of rows) sources.set(row.id, sourceVersion(row.id));

const probeTargets = new Set();
if (PROBE_NPM) {
  for (const src of sources.values()) {
    if (src && !src.private && MANAGED_NPM.test(src.npmName)) probeTargets.add(src.npmName);
  }
  const queue = [...probeTargets];
  let cursor = 0;
  const worker = async () => {
    while (cursor < queue.length) {
      const name = queue[cursor++];
      npmProbe.set(name, await probeNpm(name));
    }
  };
  await Promise.all(Array.from({ length: Math.min(8, queue.length) }, worker)); // eslint-disable-line no-undef
}

/** Desired npm field value for this doc row (null = leave the field alone). */
function wantNpm(row, src) {
  if (!src || src.private || !MANAGED_NPM.test(src.npmName)) return null;
  if (row.docNpm && row.docNpm !== src.npmName) return null; // explicit manual override wins
  if (row.npmCommented && row.docNpm !== src.npmName) {
    // An inline note records a deliberate decision (e.g. "this name belongs to a third party");
    // leave the field untouched instead of overwriting the reasoning.
    result.npmManual.push({ id: row.id, npm: row.docNpm, derived: src.npmName });
    return null;
  }
  if (!PROBE_NPM) return src.npmName;
  return npmProbe.get(src.npmName) === true ? src.npmName : null;
}

for (const row of rows) {
  if (ONLY.size && !ONLY.has(row.id)) continue;
  const src = sources.get(row.id);
  if (!src) {
    result.skipped.push({ id: row.id, docVersion: row.docVersion });
    continue;
  }
  // English catalog metadata (ext.nameEn / ext.descriptionEn) rides along with the version sync:
  // the docs build never checks out aiti-ai, so these fields are the only source the catalog plugin
  // can read for localized names/descriptions.
  // Publish the cloud icon on every run: artwork can change without a version bump, and the
  // frontmatter field alone cannot tell us that the file content moved.
  if (src.iconFile && !CHECK) publishIcon(row.id, src.iconFile);

  const wantNameEn = Boolean(src.nameEn);
  const wantDescEn = Boolean(src.descriptionEn);
  const wantSoulEn = Boolean(src.soulEn);
  const wantIconUrl = Boolean(src.iconFile);
  const nameEnDrift = wantNameEn && row.nameEnLine === -1;
  const descEnDrift = wantDescEn && row.descEnLine === -1;
  const soulEnDrift = wantSoulEn && row.soulEnLine === -1;

  const iconUrlValue = wantIconUrl ? `${ICON_URL_PREFIX}/${row.id}.svg` : "";
  const iconUrlDrift = wantIconUrl && !new RegExp(`iconUrl:\\s*["']?${iconUrlValue}`).test(readFileSync(row.file, "utf8"));

  const npmWanted = wantNpm(row, src);
  const npmDrift = npmWanted !== null && npmWanted !== row.docNpm;
  if (!npmWanted && src && !src.private && MANAGED_NPM.test(src.npmName) && row.docNpm !== src.npmName && PROBE_NPM) {
    const state = npmProbe.get(src.npmName);
    if (state === false) result.npmMissing.push({ id: row.id, npm: src.npmName });
    else if (state === null) result.npmUnverified.push({ id: row.id, npm: src.npmName });
  }

  if (src.version === row.docVersion && !nameEnDrift && !descEnDrift && !soulEnDrift && !iconUrlDrift && !npmDrift) {
    result.ok.push({ id: row.id, version: src.version });
    continue;
  }
  result.updated.push({
    id: row.id,
    from: row.docVersion,
    to: src.version,
    ...(nameEnDrift ? { nameEn: "added" } : {}),
    ...(descEnDrift ? { descriptionEn: "added" } : {}),
    ...(soulEnDrift ? { soulEn: "added" } : {}),
    ...(iconUrlDrift ? { iconUrl: "added" } : {}),
    ...(npmDrift ? { npm: row.npmLine === -1 ? "added" : "fixed" } : {}),
  });
  if (!CHECK) {
    const lines = readFileSync(row.file, "utf8").split("\n");
    const insertAfter = (anchorLine, key, value) => {
      if (anchorLine < 0) return;
      const ind = lines[anchorLine].match(/^[ \t]*/)[0];
      lines.splice(anchorLine + 1, 0, `${ind}${key}: ${JSON.stringify(value)}`);
    };
    // In-place rewrites first: an earlier insert shifts every later index, which would make a
    // stale npmLine clobber a neighbouring field (the version line sits above both anchors).
    lines[row.verLine] = `${row.indent}version: ${row.quote}${src.version}${row.quote}`;
    // npm sits next to repo in the natural field order (website → repo → npm → install/license).
    // Its anchor is the deepest one, so this insert runs before the English siblings below.
    if (npmDrift) {
      if (row.npmLine >= 0) {
        const ind = lines[row.npmLine].match(/^[ \t]*/)[0] || row.indent;
        lines[row.npmLine] = `${ind}npm: ${JSON.stringify(npmWanted)}`;
      } else {
        const anchor = row.repoLine >= 0 ? row.repoLine : row.websiteLine >= 0 ? row.websiteLine : row.verLine;
        insertAfter(anchor, "npm", npmWanted);
      }
    }
    // Insert the English siblings after name / description (or after version when absent).
    // Bottom-up insertion keeps earlier indices valid: descriptionEn sits below nameEn in the
    // natural order, so it must be spliced first.
    if (descEnDrift && wantDescEn) insertAfter(row.descLine >= 0 ? row.descLine : row.verLine, "descriptionEn", src.descriptionEn);
    if (soulEnDrift && wantSoulEn) insertAfter(row.soulLine >= 0 ? row.soulLine : row.verLine, "soulEn", src.soulEn);
    if (iconUrlDrift && wantIconUrl) insertAfter(row.soulLine >= 0 ? row.soulLine : row.verLine, "iconUrl", iconUrlValue);
    if (nameEnDrift && wantNameEn) insertAfter(row.nameLine >= 0 ? row.nameLine : row.verLine, "nameEn", src.nameEn);
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
  if (result.npmMissing.length) {
    console.log("\nnpm install source not published (field left unchanged):");
    list(result.npmMissing, (s) => `${s.id}: ${s.npm}`);
  }
  if (result.npmUnverified.length) {
    console.log("\nnpm install source unverified (registry unreachable, field left unchanged):");
    list(result.npmUnverified, (s) => `${s.id}: ${s.npm}`);
  }
}
if (CHECK && result.updated.length > 0) process.exit(1);
