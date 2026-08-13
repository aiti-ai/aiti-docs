/**
 * extensions-catalog — 扩展注册表编译插件。
 *
 * 扫描 docs/extensions/*.md 的 `ext:` frontmatter（直接读磁盘 + js-yaml 解析，
 * 不依赖 vuepress 页面状态——dev 热更新时页面 frontmatter 更新有异步时序，
 * 直接读文件最可靠），产出两样东西：
 *
 * 1. `/extensions.json`（public 目录，build/dev 均可访问）——aiti-agent 等自动发现扩展列表。
 * 2. **__EXTENSIONS_CATALOG__ 全局常量**（vuepress `define` 钩子注入客户端 bundle）——
 *    扩展数据在构建期进入 JS，ExtensionList 组件 SSR 预渲染时即可用
 *    （列表内容进 contentRendered → slimsearch 静态搜索 / SEO 可索引），
 *    客户端仍 fetch /extensions.json 刷新（dev 实时）。
 *
 * 生命周期：onPrepared（启动/构建）生成；onWatched（dev 下扩展 md 变化）实时重新生成。
 */
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { load as yamlLoad } from "js-yaml";
import type { PluginObject } from "vuepress";

/** ext 元数据契约（与 docs/extensions/spec.md 中的规范保持一致）。 */
export interface ExtCatalogEntry {
  id: string;
  name: string;
  description: string;
  /** 一句话灵魂描述（设计源动力，列表卡片展示） */
  soul?: string;
  type: string;
  category?: string;
  version?: string;
  status?: string;
  author?: string;
  repo?: string;
  npm?: string;
  install?: string;
  license?: string;
  tags?: string[];
}

/**
 * 读取 md frontmatter（--- 块）并用 js-yaml 解析（常规做法；js-yaml 已加为直接依赖，
 * 避免 pnpm 传递依赖在 ESM 编译下解析不到）。返回 { ext?, title?, icon? } 等字段。
 */
function readExtMeta(filePath: string): Record<string, unknown> | null {
  let raw: string;
  try {
    raw = readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  try {
    return (yamlLoad(m[1]) as Record<string, unknown> | null) ?? null;
  } catch {
    return null;
  }
}

interface AppLike {
  dir: { source: () => string; public: () => string };
}

const extensionsCatalog = (): PluginObject => {
  /** 扫描 docs/extensions/*.md 的 ext frontmatter → 条目列表（已按 id 排序） */
  const readEntries = (app: AppLike) => {
    const extDir = resolve(app.dir.source(), "extensions");
    const entries: (ExtCatalogEntry & { docs: string })[] = [];
    for (const name of readdirSync(extDir).filter((f) => f.endsWith(".md"))) {
      if (name === "README.md" || name === "spec.md") continue;
      const meta = readExtMeta(join(extDir, name));
      const raw = meta?.ext as Partial<ExtCatalogEntry> | undefined;
      if (!raw || typeof raw !== "object" || typeof raw.id !== "string" || !raw.id) continue;
      const pageName = name.replace(/\.md$/, ".html");
      entries.push({
        id: raw.id,
        name: raw.name ?? raw.id,
        description: raw.description ?? "",
        soul: raw.soul ?? "",
        type: raw.type ?? "other",
        category: raw.category ?? "",
        version: raw.version ?? "",
        status: raw.status ?? "active",
        author: raw.author ?? "",
        repo: raw.repo ?? "",
        npm: raw.npm ?? "",
        install: raw.install ?? "",
        license: raw.license ?? "",
        tags: Array.isArray(raw.tags) ? raw.tags : [],
        docs: `/extensions/${pageName}`,
      });
    }
    return entries.sort((a, b) => a.id.localeCompare(b.id));
  };

  /** 写 public/extensions.json */
  const generate = (app: AppLike) => {
    const json = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      count: 0,
      extensions: readEntries(app),
    };
    json.count = json.extensions.length;
    const outFile = resolve(app.dir.public(), "extensions.json");
    mkdirSync(dirname(outFile), { recursive: true });
    writeFileSync(outFile, JSON.stringify(json, null, 2), "utf8");
  };

  return {
    name: "aiti-extensions-catalog",

    /** 注入客户端全局常量：扩展数据在构建期进入 bundle → SSR 预渲染可见（搜索/SEO 可索引） */
    define(app) {
      return {
        __EXTENSIONS_CATALOG__: JSON.stringify({
          generatedAt: new Date().toISOString(),
          extensions: readEntries(app as AppLike),
        }),
      };
    },

    /** 声明监听扩展目录（md 变化 → onWatched 触发 → 重新生成 JSON） */
    watch(app) {
      return [resolve(app.dir.source(), "extensions", "**", "*.md")];
    },

    /** 启动/构建时生成 */
    onPrepared(app) {
      generate(app as AppLike);
    },

    /** dev 模式：给 vuepress 的页面 watcher 挂监听，扩展 md 变化 → 实时重新生成 */
    onWatched(app, watchers) {
      for (const w of watchers) {
        if (!w || typeof w.on !== "function") continue;
        w.on("add", () => generate(app as AppLike));
        w.on("change", () => generate(app as AppLike));
        w.on("unlink", () => generate(app as AppLike));
      }
    },
  };
};

export default extensionsCatalog;
