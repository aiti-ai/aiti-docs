#!/usr/bin/env node
// sync-releases.mjs — 从 aiti-ai 仓 GitHub Releases 拉取 release notes → releases/*.md
//
// 数据契约：aiti-ai 仓的 file-based release notes（scripts/draft-release-notes.mjs 起草、
// assemble-release-notes.mjs 装配为 Release body）。每个 release 落为 releases/<tag>.md。
// 旧版本（file-based 管线之前）body 只有 compare 链接 → 也落盘（substantive:false，
// 文档站展示为"见 GitHub"），保证时间线完整。
//
// 用法：
//   node tools/sync-releases.mjs                # 拉取全部 release，跳过本地已有的 tag
//   node tools/sync-releases.mjs --force        # 覆盖本地已有文件
//   node tools/sync-releases.mjs --tag v0.x.y   # 只拉一个
//
// 幂等：文件内容与远端一致时跳过；GITHUB_TOKEN 可选（提额）。
import { writeFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "releases");
const REPO = "aiti-ai/aiti-ai";
const TOKEN = process.env.GITHUB_TOKEN || "";
const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const onlyTag = args.includes("--tag") ? args[args.indexOf("--tag") + 1] : null;

const api = async (path) => {
  const headers = { Accept: "application/vnd.github+json" };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub API ${path} → ${res.status}`);
  return res.json();
};

mkdirSync(OUT, { recursive: true });
const releases = await api(`/repos/${REPO}/releases?per_page=100`);
let added = 0, skipped = 0, updated = 0;
for (const r of releases) {
  if (r.draft) continue;
  const tag = r.tag_name;
  if (onlyTag && tag !== onlyTag) continue;
  const file = join(OUT, `${tag}.md`);
  // 在 body 顶部补一行 frontmatter 式元信息（日期），便于时间线展示；其余原样
  const date = (r.published_at || r.created_at || "").slice(0, 10);
  const body = `<!-- release-date: ${date} -->\n${r.body || ""}\n`;
  if (existsSync(file) && !FORCE) { skipped++; continue; }
  if (existsSync(file) && readFileSync(file, "utf8") === body) { skipped++; continue; }
  writeFileSync(file, body);
  if (existsSync(file) && FORCE) updated++; else added++;
  console.log(`+ ${tag} (${date})`);
}
console.log(`[sync-releases] added=${added} updated=${updated} skipped=${skipped} → ${OUT}`);
