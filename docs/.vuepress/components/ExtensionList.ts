/**
 * ExtensionList — 扩展列表组件（TS 版）。
 *
 * 用 .ts 而非 .vue：.vue 的 SFC 编译产物在隧道链路（nginx/pi-web pipe）
 * 下存在模块响应损坏问题（浏览器缓存坏条目导致 304 后语法错误）。
 * .ts 由 vite esbuild 转换（同 .js 路径），链路已验证正常。
 *
 * 数据源：
 * - SSR/首屏：__EXTENSIONS_CATALOG__（编译插件 define 注入的构建期数据）→
 *   列表内容进 contentRendered → slimsearch 静态搜索 / SEO 可索引。
 * - 客户端：fetch /extensions.json 刷新（dev 下扩展 md 变化实时生效）。
 */
import { defineComponent, ref, onMounted, computed, h } from "vue";

/** 构建期注入的扩展数据（插件 define 钩子），SSR 与首屏即用。 */
declare const __EXTENSIONS_CATALOG__: string | undefined;

function ssrCatalog() {
  try {
    const raw = typeof __EXTENSIONS_CATALOG__ !== "undefined" ? __EXTENSIONS_CATALOG__ : "";
    const d = raw ? JSON.parse(raw) : null;
    return d && Array.isArray(d.extensions) ? d : null;
  } catch {
    return null;
  }
}

const TYPE_LABEL = {
  "devtools-plugin": "开发工具插件",
  "dev-repo": "aiti-agent 扩展",
  bridge: "MCP 桥",
  "ide-plugin": "IDE 插件",
  theme: "主题",
  skill: "技能",
  other: "其他",
};

const STATUS_LABEL = {
  active: "可用",
  beta: "测试",
  experimental: "实验",
  archived: "归档",
};

export default defineComponent({
  name: "ExtensionList",
  setup() {
    const ssr = ssrCatalog();
    const catalog = ref(ssr);
    const error = ref("");
    const loading = ref(!ssr);

    onMounted(async () => {
      // 生产/构建：SSR 数据（__EXTENSIONS_CATALOG__）已就地渲染，不再请求 JSON。
      // dev：扩展 md 改动 → /extensions.json 实时变化 → fetch 刷新（就地重渲染，不整页刷新）。
      if (!import.meta.env.DEV) return;
      try {
        const res = await fetch("/extensions.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        catalog.value = await res.json();
        loading.value = false;
      } catch (e) {
        error.value = String(e);
        loading.value = false;
      }
    });

    const groups = computed(() => {
      const ext = catalog.value?.extensions ?? [];
      const map = new Map();
      for (const e of ext) {
        const key = e.category || "其他";
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(e);
      }
      return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "zh"));
    });

    return { catalog, error, loading, groups };
  },

  render() {
    const { catalog, error, loading, groups } = this;
    const typeLabel = (t) => TYPE_LABEL[t] || t;
    const statusLabel = (s) => STATUS_LABEL[s] || s;

    const card = (e) =>
      h("article", { class: "ext-card", key: e.id }, [
        h("header", { class: "ext-card-head" }, [
          h("a", { class: "ext-name", href: e.docs }, e.name),
          e.name !== e.id ? h("code", { class: "ext-id" }, e.id) : null,
          h("span", { class: "ext-type" }, typeLabel(e.type)),
          h("span", { class: "ext-status " + e.status }, statusLabel(e.status)),
        ]),
        e.description
          ? h("p", { class: "ext-desc" }, e.description)
          : null,
        e.soul ? h("p", { class: "ext-soul" }, [h("span", { class: "ext-soul-mark" }, "❝"), e.soul]) : null,
        h("dl", { class: "ext-detail" }, [
          e.version ? [h("dt", "版本"), h("dd", e.version)] : null,
          e.npm ? [h("dt", "npm"), h("dd", h("code", e.npm))] : null,
          e.repo
            ? [
                h("dt", "仓库"),
                h("dd", h("a", { href: "https://github.com/" + e.repo, target: "_blank", rel: "noopener" }, e.repo)),
              ]
            : null,
          e.license ? [h("dt", "许可"), h("dd", e.license)] : null,
          e.tags && e.tags.length
            ? [h("dt", "标签"), h("dd", e.tags.map((t) => h("span", { class: "ext-tag", key: t }, t)))]
            : null,
        ]),
        e.install ? h("pre", { class: "ext-install" }, h("code", e.install)) : null,
      ]);

    const group = ([cat, list]) =>
      h("section", { class: "ext-group", key: cat }, [
        h("h3", { class: "ext-cat" }, [cat, h("span", { class: "ext-cat-count" }, String(list.length))]),
        h("div", { class: "ext-grid" }, list.map(card)),
      ]);

    let content;
    if (loading) {
      content = h("div", { class: "ext-note" }, "加载扩展列表…");
    } else if (error) {
      content = h("div", { class: "ext-note ext-error" }, "扩展列表加载失败：" + error);
    } else if (catalog) {
      content = h("div", { class: "ext-catalog" }, [
        h(
          "div",
          { class: "ext-meta" },
          [
            "共 " + (catalog.count ?? catalog.extensions?.length ?? 0) + " 个扩展 · 数据源 ",
            h("a", { href: "/extensions.json", target: "_blank", rel: "noopener" }, "/extensions.json"),
            " · 更新于 " + (catalog.generatedAt || "").slice(0, 16).replace("T", " "),
          ]
        ),
        groups.map(group),
      ]);
    } else {
      content = null;
    }
    return h("div", { class: "ext-list" }, [content]);
  },
});
