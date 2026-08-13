/**
 * ExtensionList — 扩展列表组件（纯 JS 版）。
 *
 * 用 .js 而非 .vue：.vue 的 SFC 编译产物在隧道链路（nginx/pi-web pipe）
 * 下存在模块响应损坏问题（浏览器缓存坏条目导致 304 后语法错误）。
 * .js 由 vite esbuild 转换，与其它 .js 模块同路径，已验证链路正常。
 *
 * 数据源：/extensions.json（编译插件 extensions-catalog.ts 自动生成）。
 */
import { defineComponent, ref, onMounted, computed, h } from "vue";

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
    const catalog = ref(null);
    const error = ref("");
    const loading = ref(true);

    onMounted(async () => {
      try {
        const res = await fetch("/extensions.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        catalog.value = await res.json();
      } catch (e) {
        error.value = String(e);
      } finally {
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
          h("span", { class: "ext-type" }, typeLabel(e.type)),
          h("span", { class: "ext-status " + e.status }, statusLabel(e.status)),
        ]),
        e.description
          ? h("p", { class: "ext-desc" }, e.description)
          : null,
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
            "共 " + catalog.count + " 个扩展 · 数据源 ",
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
