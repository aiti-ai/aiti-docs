#!/usr/bin/env node
// sync-latest-version.mjs — 把 guide 文档里的示例版本号刷成最新已发布版
//
// 背景：guide/update.md 与 guide/install.md（中英对照）里的示例版本号
// （格式示例、--ref 固定版本、Docker/GHCR tag）容易随发布漂移成"不存在的
// 版本"。本脚本把它们统一改写为 @aiti-ai/pi-web 当前最新发布版，由
// pre-commit 钩子（githooks/pre-commit）在每次提交前自动执行。
//
// 版本来源（按序兜底）：npmjs 官方 registry（显式 --registry，本机默认私源
// 不可依赖）→ GitHub Releases latest → 本地缓存 tools/.latest-version.json。
// 缓存 24h 内直接复用，避免每次提交都查网络。
//
// 豁免机制：需要保留旧版本号的行，在行尾加 `<!-- version-pin -->` 注释，
// 本脚本跳过该行（VuePress 渲染时不显示）。
//
// 用法：
//   node tools/sync-latest-version.mjs                 # 原地改写
//   node tools/sync-latest-version.mjs --check         # 只报告漂移，有则 exit 1
//   node tools/sync-latest-version.mjs --stage         # 改写并 git add 触及的文件（pre-commit 用）
//   node tools/sync-latest-version.mjs --refresh       # 忽略缓存 TTL，强制重查
//   node tools/sync-latest-version.mjs --install-hook  # 启用 githooks/pre-commit
//
// 注意：--stage 会把脚本改写的文件整体加入本次提交；若你只 stage 了文件的
// 一部分（git add -p），请先提交或 stash，避免裹挟未打算提交的改动。
import { readFileSync, writeFileSync, existsSync, mkdirSync, chmodSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PKG = "@aiti-ai/pi-web";
const NPMJS = "https://registry.npmjs.org";
const CACHE = join(ROOT, "tools", ".latest-version.json");
const TTL_MS = 24 * 60 * 60 * 1000;
const HOOK = join(ROOT, "githooks", "pre-commit");

// 示例版本号出现的文档清单（中英对照都要列）；新文档引用版本后加进来
const TARGETS = [
  "docs/guide/update.md",
  "docs/en/guide/update.md",
  "docs/guide/install.md",
  "docs/en/guide/install.md",
];

const args = process.argv.slice(2);
const CHECK = args.includes("--check");
const STAGE = args.includes("--stage");
const REFRESH = args.includes("--refresh");

// ---------- 版本解析 ----------

const readCache = () => {
  try {
    return JSON.parse(readFileSync(CACHE, "utf8"));
  } catch {
    return null;
  }
};
const writeCache = (v) =>
  writeFileSync(CACHE, JSON.stringify({ version: v, fetchedAt: new Date().toISOString() }, null, 2) + "\n");

const latestFromNpm = () => {
  const out = execFileSync(
    "npm",
    ["view", PKG, "version", "--registry", NPMJS, "--json"],
    { encoding: "utf8", timeout: 30000, stdio: ["ignore", "pipe", "ignore"] },
  );
  const v = JSON.parse(out.trim());
  if (!/^\d+\.\d+\.\d+/.test(v)) throw new Error(`unexpected npm output: ${out.trim()}`);
  return v;
};

const latestFromGithub = async () => {
  const res = await fetch("https://api.github.com/repos/aiti-ai/aiti-ai/releases/latest", {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GitHub API → ${res.status}`);
  const tag = String((await res.json()).tag_name || "");
  const v = tag.replace(/^v/, "");
  if (!/^\d+\.\d+\.\d+/.test(v)) throw new Error(`unexpected release tag: ${tag}`);
  return v;
};

async function resolveLatest() {
  const cache = readCache();
  if (!REFRESH && cache && Date.now() - Date.parse(cache.fetchedAt) < TTL_MS) {
    return { version: cache.version, source: "cache", cacheWritten: false };
  }
  for (const [name, fn] of [
    ["npm", latestFromNpm],
    ["github", latestFromGithub],
  ]) {
    try {
      const v = await fn();
      writeCache(v);
      return { version: v, source: name, cacheWritten: true };
    } catch (e) {
      console.warn(`[sync-latest-version] ${name} query failed: ${e.message}`);
    }
  }
  if (cache) {
    console.warn(
      `[sync-latest-version] falling back to stale cache: ${cache.version} (${cache.fetchedAt})`,
    );
    return { version: cache.version, source: "stale-cache", cacheWritten: false };
  }
  return null;
}

// ---------- 改写 ----------

// 匹配分三档，避免误伤 Node 版本要求（≥ 22.19.0）、回环 IP（127.0.0.1）等：
// 1. 带 -aiti.N 后缀（含可选 v 前缀与 -core/-full）→ aiti 发行版特征，无条件替换；
// 2. 带 v 前缀（vX.Y.Z...）→ release/installer 语境特征，无条件替换；
// 3. 裸基线 X.Y.Z（无 v 无后缀）→ 仅在 update.md 的格式示例/排序示例锚句行内替换
//    （裸三段数字在别处可能是 Node 版本、IP 段等，一律不碰）。
const VER_RE = /(v?)(\d+\.\d+\.\d+)(-aiti\.\d+)?(-core|-full)?/g;
const BARE_LINE_RE = /版本号形如|Versions look like|排序遵循|Ordering follows/;
const rewriteLine = (line, L, B) => {
  if (line.includes("version-pin")) return line; // 特意保留的旧版行，跳过
  const bareAllowed = BARE_LINE_RE.test(line);
  return line.replace(VER_RE, (m, v, _ver, fork, variant) => {
    if (variant || fork || v) {
      const tail = variant || "";
      return `${v}${L}${tail}`;
    }
    return bareAllowed ? B : m; // 裸基线：仅锚句行内替换，否则原样保留
  });
};

// ---------- 主流程 ----------

if (args.includes("--install-hook")) {
  mkdirSync(dirname(HOOK), { recursive: true });
  writeFileSync(HOOK, `#!/bin/sh
# Rewrite example versions in guide docs to the latest published release.
# See tools/sync-latest-version.mjs. Enable on a fresh clone with:
#   git config core.hooksPath githooks
node "$(git rev-parse --show-toplevel)/tools/sync-latest-version.mjs" --stage
`);
  chmodSync(HOOK, 0o755);
  execFileSync("git", ["config", "core.hooksPath", "githooks"], { cwd: ROOT });
  console.log(`[sync-latest-version] hook installed → ${HOOK} (core.hooksPath=githooks)`);
  process.exit(0);
}

const latest = await resolveLatest();
if (!latest) {
  console.warn("[sync-latest-version] no version source available (offline & no cache); skipping");
  process.exit(0);
}
const L = latest.version;
const B = L.replace(/-aiti\.\d+$/, "");

const changed = [];
for (const rel of TARGETS) {
  const file = join(ROOT, rel);
  if (!existsSync(file)) continue;
  const before = readFileSync(file, "utf8");
  const after = before
    .split("\n")
    .map((line) => rewriteLine(line, L, B))
    .join("\n");
  if (after === before) continue;
  changed.push(rel);
  if (!CHECK) writeFileSync(file, after);
}

if (changed.length === 0) {
  console.log(`[sync-latest-version] ok (latest=${L} via ${latest.source})`);
} else if (CHECK) {
  for (const f of changed) console.log(`[sync-latest-version] drift: ${f}`);
  process.exitCode = 1;
} else {
  for (const f of changed) console.log(`[sync-latest-version] updated: ${f} → ${L}`);
  if (STAGE) {
    const toAdd = [...changed];
    if (latest.cacheWritten) toAdd.push(join(ROOT, "tools", ".latest-version.json"));
    execFileSync("git", ["add", ...toAdd], { cwd: ROOT });
    console.log(`[sync-latest-version] staged: ${toAdd.map((f) => String(f).replace(ROOT + "/", "")).join(", ")}`);
  }
}
