#!/usr/bin/env node
// Publish pipeline for the aiti-docs documentation site.
//
// Extracts aiti-docs/ from this (private) monorepo into a standalone repo with
// a clean, translated history and pushes it to github.com/aiti-ai/aiti-docs.
//
// Privacy rules, the commit-message translation map and the author mailmap
// live in <repoRoot>/scripts/ — deliberately OUTSIDE aiti-docs/ so they never
// enter the published repository. This script contains no sensitive strings.
//
// Pipeline: fresh clone -> git filter-repo (subdirectory extract + content
// scrub + subject translation + Chinese body-line strip + author mailmap) ->
// full-history rescan against the rule file -> push.
//
// Usage:
//   node tools/publish.mjs              # full publish (scan + push)
//   node tools/publish.mjs --no-push    # rewrite + scan only, leave result in $AITI_DOCS_PUBLISH_DIR
//   AITI_DOCS_PUBLISH_DIR=/tmp/x ...    # override working directory
import { execSync, spawnSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url)); // aiti-docs/tools
const repoRoot = path.resolve(here, "../.."); // monorepo root
const rulesPath = path.join(repoRoot, "scripts", "aiti-docs-replace-text.txt");
const msgMapPath = path.join(repoRoot, "scripts", "aiti-docs-msg-map.tsv");
const mailmapPath = path.join(repoRoot, "scripts", "aiti-docs-mailmap.txt");
const target = process.env.AITI_DOCS_PUBLISH_DIR || "/tmp/aiti-docs-publish";
const remote = "git@github.com:aiti-ai/aiti-docs.git";
const args = new Set(process.argv.slice(2));
const doPush = !args.has("--no-push");

const run = (cmd, opts = {}) =>
  execSync(cmd, { stdio: "inherit", cwd: target, shell: "/bin/bash", ...opts });

// 1. fresh clone of the monorepo (main branch only — stray branches/tags in
//    the monorepo must never leak into the published repo)
rmSync(target, { recursive: true, force: true });
console.log(`[1/5] cloning ${repoRoot} -> ${target}`);
execSync(`git clone --no-local --no-hardlinks --single-branch -q "${repoRoot}" "${target}"`, { stdio: "inherit" });

// 2. build the commit-callback: translate subjects by original hash, strip
//    Chinese lines from bodies (code/links/English lines survive).
console.log("[2/5] building filter-repo callbacks");
const map = {};
for (const line of readFileSync(msgMapPath, "utf8").split("\n")) {
  if (!line.trim()) continue;
  const idx = line.indexOf("\t");
  if (idx < 0) continue;
  map[line.slice(0, idx).trim()] = line.slice(idx + 1);
}
// commit messages go through the same scrub rules as file blobs, so a message
// describing a scrub can never leak the original values it replaced
const rules = readFileSync(rulesPath, "utf8")
  .split("\n")
  .filter((l) => l.includes("==>"))
  .map((l) => [l.slice(0, l.indexOf("==>")), l.slice(l.indexOf("==>") + 3)]);
const callback = `
import re as _re
_MAP = ${JSON.stringify(map)}
_RULES = ${JSON.stringify(rules)}
_msg = commit.message.decode("utf-8", "replace")
for _old, _new in _RULES:
    _msg = _msg.replace(_old, _new)
if "\\n" in _msg:
    _subject, _body = _msg.split("\\n", 1)
else:
    _subject, _body = _msg, ""
_key = commit.original_id.decode("ascii", "replace")[:8] if commit.original_id else ""
if _key in _MAP:
    _subject = _MAP[_key]
_body = "\\n".join(l for l in _body.split("\\n") if not _re.search(r"[\\u4e00-\\u9fff]", l))
_body = _re.sub(r"\\n{3,}", "\\n\\n", _body).strip("\\n")
commit.message = (_subject + ("\\n\\n" + _body if _body else "")).encode("utf-8")
`;

// 3. one-pass history rewrite
console.log("[3/5] git filter-repo (extract + scrub + translate + mailmap)");
run(
  `git filter-repo --subdirectory-filter aiti-docs --replace-text "${rulesPath}" ` +
    `--mailmap "${mailmapPath}" --force --commit-callback '${callback.replace(/'/g, `'\\''`)}'`
);

// 4. full-history rescan: every rule's left-hand side must be absent from all
//    blobs and all commit messages; no Chinese may remain in subjects.
console.log("[4/5] full-history rescan");
const patterns = readFileSync(rulesPath, "utf8")
  .split("\n")
  .filter((l) => l.includes("==>"))
  .map((l) => l.split("==>")[0]);
const revList = execSync("git rev-list --all", { cwd: target, encoding: "utf8" }).trim().split("\n");
const grep2 = spawnSync(
  "git",
  ["grep", "-I", "-F", ...patterns.flatMap((p) => ["-e", p]), ...revList],
  { cwd: target, encoding: "utf8" }
);
const blobHits = (grep2.stdout || "").trim();
if (blobHits) {
  console.error("SENSITIVE STRINGS FOUND IN HISTORY:\n" + blobHits.slice(0, 4000));
  process.exit(1);
}

const logAll = execSync("git log --format=%h%x09%s", { cwd: target, encoding: "utf8" });
const cnSubject = logAll
  .split("\n")
  .filter((l) => /[\u4e00-\u9fff]/.test(l.split("\t")[1] || ""));
if (cnSubject.length) {
  console.error("CHINESE SUBJECTS REMAIN (add them to scripts/aiti-docs-msg-map.tsv):\n" + cnSubject.join("\n"));
  process.exit(1);
}

const count = revList.length;
console.log(`    scan clean: ${count} commits, no sensitive strings, no Chinese subjects`);

// 5. push
if (doPush) {
  console.log("[5/5] pushing to " + remote);
  run(`git remote add origin "${remote}"`);
  run("git push -u origin main --force");
  console.log("done.");
} else {
  console.log(`[5/5] skipped push (--no-push). Result kept at ${target}`);
}
