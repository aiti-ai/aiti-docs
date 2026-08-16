#!/usr/bin/env node
/**
 * aiti-docs 静态服务器 —— systemd 常驻（内部 nginx 反代上游）。
 *
 * 服务 docs/.vuepress/dist（构建产物）；SPA 式回退：扩展页 /extensions/xxx 等
 * 目录 URL 回退到对应 .html。用法：node tools/serve.mjs [port]（默认 30201）。
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const ROOT = join(import.meta.dirname, "..", "docs", ".vuepress", "dist");
const PORT = Number(process.argv[2] || process.env.AITI_DOCS_PORT || 30201);
const HOST = process.env.AITI_DOCS_HOST || "127.0.0.1";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".map": "application/json; charset=utf-8",
};

async function resolveFile(urlPath) {
  // 防穿越：规范化后必须仍在 ROOT 内。
  let rel = decodeURIComponent(urlPath.split("?")[0]);
  if (rel.includes("\0")) return null;
  rel = normalize(rel).replace(/^([/\\.])+/, "");
  const abs = join(ROOT, rel);
  if (!abs.startsWith(ROOT)) return null;

  try {
    const st = await stat(abs);
    if (st.isFile()) return abs;
    if (st.isDirectory()) {
      const idx = join(abs, "index.html");
      if ((await stat(idx)).isFile()) return idx;
      return null;
    }
  } catch {
    /* fall through */
  }
  // 目录 URL 回退：/extensions/aiti-extman → /extensions/aiti-extman.html
  if (rel && !rel.endsWith("/")) {
    const tryHtml = abs + ".html";
    try {
      if ((await stat(tryHtml)).isFile()) return tryHtml;
    } catch { /* not found */ }
  }
  return null;
}

const server = createServer(async (req, res) => {
  const file = await resolveFile(req.url || "/");
  if (!file) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("404");
    return;
  }
  try {
    const body = await readFile(file);
    const type = TYPES[extname(file)] ?? "application/octet-stream";
    // 带内容哈希的静态资源长缓存；html/json 短缓存（注册表/页面要新鲜）。
    const hashed = /-[A-Za-z0-9_-]{8,}\.(js|css|mjs|woff2?|png|jpg|svg|webp)$/.test(file);
    res.writeHead(200, {
      "content-type": type,
      "cache-control": hashed ? "public, max-age=604800" : "no-cache",
    });
    res.end(body);
  } catch {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end("500");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[aiti-docs] serving ${ROOT} on http://${HOST}:${PORT}`);
});
