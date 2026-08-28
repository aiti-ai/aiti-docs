/**
 * seo-enhance — 搜索可见性增强插件。
 *
 * 在 extensions-catalog 基础设施之上补齐 SEO 短板：
 *
 * 1. **keywords meta**：每页注入 <meta name="keywords">——优先级 frontmatter.keywords >
 *    扩展页 ext.tags（+ id/name/category）> 站点默认词。扩展页 40+ 组 tag 天然形成长尾词覆盖。
 * 2. **社交卡片**：全站补 og:image / twitter:card / twitter:image（public/og-image.png，
 *    1200×630 品牌图；plugin-seo 自身不产 image，缺它则分享/搜索快照无图）。
 * 3. **JSON-LD 结构化数据**：
 *    - 扩展页 → schema.org/SoftwareApplication（name/description/version/author/license/
 *      keywords/url/image）——搜索引擎富摘要素材；
 *    - 首页 → WebSite + Organization。
 * 4. **llms.txt**（onPrepared 写入 public/）：面向 AI 爬虫的站点摘要（区块导航 + 全部扩展/
 *    集成一行一条）——AI 时代的「被搜到」。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Page, PluginObject } from "vuepress";

const SITE = "https://aiti.pw";
const OG_IMAGE = `${SITE}/og-image.png`;

/** 站点默认关键词（每页兜底，保证品牌词全站覆盖） */
const DEFAULT_KEYWORDS = [
  "aiti",
  "aiti.pw",
  "AI 开发工作台",
  "AI 调试",
  "AI agent",
  "页面调试注入",
  "MCP 桥",
  "aiti-agent",
  "aiti-devtools",
  "aiti-mcp-bridge",
  "pi",
];

interface ExtLike {
  id?: string;
  name?: string;
  description?: string;
  version?: string;
  category?: string;
  license?: string;
  tags?: unknown;
}

function collectKeywords(fm: Record<string, unknown>, ext?: ExtLike): string[] {
  const out: string[] = [];
  const fmKw = fm.keywords;
  if (Array.isArray(fmKw)) out.push(...fmKw.map(String));
  else if (typeof fmKw === "string") out.push(...fmKw.split(",").map((s) => s.trim()).filter(Boolean));
  if (ext) {
    if (Array.isArray(ext.tags)) out.push(...ext.tags.map(String));
    if (ext.id) out.push(ext.id);
    if (ext.name) out.push(ext.name);
    if (ext.category) out.push(ext.category);
  }
  return [...new Set([...out, ...DEFAULT_KEYWORDS])].filter(Boolean);
}

export const seoEnhance = (): PluginObject => ({
  name: "aiti-seo-enhance",

  extendsPage: (page: Page) => {
    const fm = page.frontmatter as Record<string, unknown>;
    const ext = fm.ext as ExtLike | undefined;
    const keywords = collectKeywords(fm, ext);

    // 本版本 Page 不暴露 .head（plugin-seo 同款做法）——统一写 frontmatter.head，
    // VuePress core 渲染时合并进页面 <head>。
    const head = (Array.isArray(fm.head) ? fm.head : (fm.head = [])) as unknown[];

    // 1) keywords meta（去重后全页注入；首页/普通页/扩展页统一走这里）
    head.push(["meta", { name: "keywords", content: keywords.join(",") }]);

    // 2) 社交卡片（og:image + twitter）
    head.push(["meta", { property: "og:image", content: OG_IMAGE }]);
    head.push(["meta", { name: "twitter:card", content: "summary_large_image" }]);
    head.push(["meta", { name: "twitter:image", content: OG_IMAGE }]);

    // 3) JSON-LD 结构化数据
    if (ext?.id) {
      // 扩展页 → SoftwareApplication 富摘要
      const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: ext.name ?? ext.id,
        description: ext.description ?? fm.description ?? "",
        ...(ext.version ? { softwareVersion: ext.version } : {}),
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web, Linux, macOS, Windows",
        author: { "@type": "Organization", name: "aiti-ai", url: `${SITE}/` },
        license: ext.license ?? "MIT",
        keywords: keywords.join(", "),
        url: `${SITE}${page.path}`,
        image: OG_IMAGE,
      };
      head.push(["script", { type: "application/ld+json" }, JSON.stringify(schema)]);
    } else if (page.path === "/") {
      // 首页 → WebSite + Organization
      const schema = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            name: "aiti",
            url: `${SITE}/`,
            description: "以 pi 为引擎的个人 AI 开发工作台与本地调试注入生态",
            inLanguage: "zh-CN",
            publisher: { "@id": `${SITE}/#org` },
          },
          {
            "@type": "Organization",
            "@id": `${SITE}/#org`,
            name: "aiti-ai",
            url: `${SITE}/`,
            logo: `${SITE}/logo.svg`,
          },
        ],
      };
      head.push(["script", { type: "application/ld+json" }, JSON.stringify(schema)]);
    }
  },

  /** llms.txt：面向 AI 爬虫的站点地图（数据复用 extensions-catalog 产出的 public/extensions.json） */
  onPrepared: async (app) => {
    let catalog: { extensions?: Array<Record<string, unknown>>; integrations?: Array<Record<string, unknown>> };
    try {
      catalog = JSON.parse(readFileSync(join(app.dir.public(), "extensions.json"), "utf8"));
    } catch {
      return; // catalog 未生成（插件顺序异常）→ 跳过，不影响构建
    }
    const lines: string[] = [
      "# aiti",
      "",
      `> 以 pi 为引擎的个人 AI 开发工作台与本地调试注入生态：aiti-agent（自托管 Web 工作台）· aiti-devtools（页面内 AI 调试助手，AI 进驻网页面对面调试）· aiti-mcp-bridge（任意 AI agent 经 MCP 操作页面）。`,
      "",
      `AI 助手读我：本站是 aiti 生态官方文档。扩展注册表含 ${catalog.extensions?.length ?? 0}+ 个可组合扩展（调试注入 / 多 agent / 终端·VNC·RDP / 隧道 / 模型管理 / 配置安全网 / IM 接入等），aiti-devtools 已适配 DSH / OpenClaw / OpenCode 宿主。`,
      "",
      "## 文档",
      "- [首页 · 系统特色](https://aiti.pw/): 生态全景与特色速览",
      "- [产品矩阵](https://aiti.pw/products/): aiti-agent / aiti-devtools / aiti-mcp-bridge 全家福",
      "- [指南](https://aiti.pw/guide/): 架构、快速开始、MCP 桥",
      "- [aiti-devtools](https://aiti.pw/devtools/): 注入器、CDP 命令集、框架集成（Vite/webpack/Nuxt/Astro…）",
      "- [扩展注册表](https://aiti.pw/extensions/): 全部扩展分类浏览，机器可读 /extensions.json",
      "",
      "## 扩展",
      ...(catalog.extensions ?? []).map(
        (e) => `- [${e.id}](${SITE}${e.docs}): ${e.description ?? ""}`,
      ),
      "",
      "## aiti-devtools 框架集成",
      ...(catalog.integrations ?? []).map(
        (e) => `- [${e.id}](${SITE}${e.docs}): ${e.description ?? ""}`,
      ),
      "",
    ];
    writeFileSync(join(app.dir.public(), "llms.txt"), lines.join("\n"));
  },
});

export default seoEnhance;
