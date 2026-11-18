/**
 * releases-changelog — 变更历史（release notes）编译插件。
 *
 * 参考 extensions-catalog 的模式：扫描本仓 releases/*.md（从 aiti-ai 仓
 * releases/v<version>.md 同步来的 file-based release notes，tools/sync-releases.mjs 负责
 * 拉取落盘），解析 Highlights / Changes 分组，产出两样东西：
 *
 * 1. `/releases.json`（public 目录）——变更历史数据（版本时间线），客户端/自动化可消费。
 * 2. **__RELEASES_CATALOG__ 全局常量**（vuepress `define` 钩子注入客户端 bundle）——
 *    ReleaseList 组件 SSR 预渲染可用（内容进静态搜索/SEO）。
 *
 * md 结构契约（aiti-ai scripts/draft-release-notes.mjs 产出）：
 *   ## Highlights        → highlights[]
 *   ### <分组名>         → sections[{ title, items[] }]（Changes / Internal 下的分组）
 *
 * 生命周期：onPrepared（启动/构建）生成；watch() 声明 releases/*.md（dev 热更新重建）。
 */
import { readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { PluginObject } from "vuepress";

export interface ReleaseSection {
  title: string;
  items: string[];
}

export interface ReleaseEntry {
  /** 标签名，如 v0.15.15-aiti.10 */
  tag: string;
  /** 版本号（去 v 前缀） */
  version: string;
  /** GitHub Release 页链接 */
  url: string;
  /** Highlights 要点（用户可见价值摘要） */
  highlights: string[];
  /** 变更分组（New extensions / Extension upgrades / ... / Internal） */
  sections: ReleaseSection[];
  /** 是否有实质内容（旧版 body 只有 compare 链接 → false） */
  substantive: boolean;
}

/** 解析单个 release notes md（draft-release-notes.mjs 的产物结构）。 */
export function parseReleaseMd(tag: string, md: string): ReleaseEntry {
  const version = tag.replace(/^v/, "");
  const url = `https://github.com/aiti-ai/aiti-ai/releases/tag/${tag}`;
  const lines = md.split("\n");

  const highlights: string[] = [];
  const sections: ReleaseSection[] = [];
  let current: { kind: "highlights" | "section"; section?: ReleaseSection } | null = null;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^##\s+Highlights/.test(line)) { current = { kind: "highlights" }; continue; }
    const h3 = line.match(/^###\s+(.+)/);
    if (h3 && current) {
      const section: ReleaseSection = { title: h3[1].trim(), items: [] };
      sections.push(section);
      current = { kind: "section", section };
      continue;
    }
    if (/^##\s+/.test(line)) { current = null; continue; }
    const item = line.match(/^[-*]\s+(.+)/);
    if (item && current) {
      if (current.kind === "highlights") highlights.push(item[1].trim());
      else if (current.kind === "section" && current.section) current.section.items.push(item[1].trim());
    }
  }

  const substantive = highlights.length > 0 || sections.some((s) => s.items.length > 0);
  return { tag, version, url, compareUrl: null, highlights, sections, substantive } as ReleaseEntry;
}

/** 扫描 releases/*.md → ReleaseEntry[]（版本倒序）。 */
export function scanReleasesDir(dir: string): ReleaseEntry[] {
  if (!existsSync(dir)) return [];
  const out: ReleaseEntry[] = [];
  for (const name of readdirSync(dir)) {
    const m = name.match(/^(v.+)\.md$/);
    if (!m) continue;
    try {
      out.push(parseReleaseMd(m[1], readFileSync(join(dir, name), "utf8")));
    } catch { /* 单文件损坏不拖垮整体 */ }
  }
  out.sort((a, b) => compareReleaseTags(b.tag, a.tag)); // 新→旧；fork 构建号数值感知（aiti.10 > aiti.9，字符串序会错位）
  return out;
}

/** release tag 比较：主版本段字符串比，-aiti.N 构建号数值比（新在前返回 >0） */
export function compareReleaseTags(a: string, b: string): number {
  const parse = (t: string) => {
    const m = t.match(/^(v?[\d.]+(?:-[\w.]+)?)-aiti\.(\d+)$/);
    return m ? { base: m[1], fork: Number(m[2]) } : { base: t, fork: -1 };
  };
  const pa = parse(a), pb = parse(b);
  if (pa.base !== pb.base) return pa.base < pb.base ? -1 : pa.base > pb.base ? 1 : 0;
  return pa.fork - pb.fork;
}

interface AppLike {
  dir: { source: () => string; public: () => string };
}

/** 写 public/releases.json（schemaVersion 1：版本时间线倒序） */
const generate = (app: AppLike, releasesDir: string) => {
  const releases = scanReleasesDir(releasesDir);
  const outFile = resolve(app.dir.public(), "releases.json");
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(
    outFile,
    JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), count: releases.length, releases }, null, 2) + "\n",
    "utf8",
  );
};

const releasesChangelog = (): PluginObject => {
  const releasesDir = (app: AppLike) => resolve(app.dir.source(), "..", "releases");
  return {
    name: "aiti-releases-changelog",

    /** 注入客户端全局常量：变更历史构建期进 bundle → ReleaseList SSR 预渲染可见（搜索/SEO） */
    define(app) {
      return {
        __RELEASES_CATALOG__: JSON.stringify({
          generatedAt: new Date().toISOString(),
          releases: scanReleasesDir(releasesDir(app as AppLike)),
        }),
      };
    },

    /** 监听 releases/*.md（dev 下变更实时重建 releases.json） */
    watch(app) {
      return [join(releasesDir(app as AppLike), "*.md")];
    },

    /** 启动/构建时生成 */
    onPrepared(app) {
      generate(app as AppLike, releasesDir(app as AppLike));
    },
  };
};

export default releasesChangelog;
