/**
 * extensions-catalog — 扩展注册表编译插件。
 *
 * 扫描所有页面 frontmatter 里的 `ext:` 元数据（规范见 docs/extensions/README.md），
 * 汇总生成 docs/.vuepress/public/extensions.json —— 文档站 build/dev 均提供
 * /extensions.json，供 aiti-agent 等自动发现扩展列表。
 *
 * 流程：改/新增 docs/extensions/<id>.md（带 ext 元数据）→ vuepress 重新准备 →
 * 本插件 onPrepared 重写 extensions.json → dev 热更新 / build 静态产出。
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { PluginObject } from "vuepress";

/** ext 元数据契约（与 docs/extensions/README.md 中的规范保持一致）。 */
export interface ExtCatalogEntry {
  id: string;
  name: string;
  description: string;
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

interface ExtRaw extends Partial<ExtCatalogEntry> {
  id?: unknown;
}

const extensionsCatalog = (): PluginObject => ({
  name: "aiti-extensions-catalog",

  async onPrepared(app) {
    const entries = app.pages
      .map((page) => {
        const raw = (page.frontmatter as { ext?: ExtRaw }).ext;
        if (!raw || typeof raw !== "object" || typeof raw.id !== "string" || !raw.id) return null;
        return {
          id: raw.id,
          name: raw.name ?? raw.id,
          description: raw.description ?? "",
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
          docs: page.path,
        };
      })
      .filter((e): e is ExtCatalogEntry & { docs: string } => e !== null)
      .sort((a, b) => a.id.localeCompare(b.id));

    const json = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      count: entries.length,
      extensions: entries,
    };

    const outFile = resolve(app.dir.public(), "extensions.json");
    mkdirSync(dirname(outFile), { recursive: true });
    writeFileSync(outFile, JSON.stringify(json, null, 2), "utf8");
  },
});

export default extensionsCatalog;
