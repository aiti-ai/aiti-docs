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
import { useRoute } from "vuepress/client";

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

/** 英文 locale（/en/ 前缀）下的标签与文案——中文注册表仍是唯一数据源，这里只做展示层翻译。 */
const TYPE_LABEL_EN = {
  "devtools-plugin": "Devtools plugin",
  "dev-repo": "aiti-agent extension",
  bridge: "MCP bridge",
  "ide-plugin": "IDE plugin",
  theme: "Theme",
  skill: "Skill",
  other: "Other",
};

const STATUS_LABEL_EN = {
  active: "Active",
  beta: "Beta",
  experimental: "Experimental",
  archived: "Archived",
};

/** 分类展示翻译（注册表 category 为中文；未命中原样展示）。 */
const CATEGORY_EN = {
  "系统工具": "System tools",
  "多 agent 后端": "Multi-agent backends",
  "聊天增强": "Chat enhancements",
  "开发工具": "Dev tools",
  "AI 能力": "AI capabilities",
  "页面调试注入": "Page debug injection",
  "宿主适配": "Host adapters",
  "示例": "Examples",
  "命令工具": "Command tools",
  "会话管理": "Session management",
  "调试": "Debugging",
  "MCP 桥": "MCP bridge",
  "IM 渠道": "IM channels",
  "知识管理": "Knowledge",
  "效率工具": "Productivity",
  "系统与管理": "System & admin",
  "其它": "Other",
  "其他": "Other",
  "开发模板": "Templates",
  "会话与项目": "Sessions & projects",
  "服务隧道": "Service tunnels",
  "服务端引擎": "Server engines",
};

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
    const route = useRoute();
    const isEn = computed(() => (route.path || "").startsWith("/en/"));
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

    /** 展示层双语助手：闭包读 isEn.value（render 内经 this 调用，保证与路由同步）。 */
    const t = (zhText, enText) => (isEn.value ? enText : zhText);
    const typeLabel = (x) => (isEn.value ? TYPE_LABEL_EN[x] : TYPE_LABEL[x]) || x;
    const statusLabel = (x) => (isEn.value ? STATUS_LABEL_EN[x] : STATUS_LABEL[x]) || x;
    const linkOf = (e) => (isEn.value ? "/en" : "") + e.docs;

    const groups = computed(() => {
      const ext = catalog.value?.extensions ?? [];
      const map = new Map();
      for (const e of ext) {
        const raw = e.category || "其他";
        const key = isEn.value ? (CATEGORY_EN[raw] || raw) : raw;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(e);
      }
      return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    });

    return { catalog, error, loading, groups, t, typeLabel, statusLabel, linkOf };
  },

  render() {
    const { catalog, error, loading, groups } = this;
    const typeLabel = (x) => this.typeLabel(x);
    const statusLabel = (x) => this.statusLabel(x);
    const t = (zhText, enText) => this.t(zhText, enText);

    const card = (e) =>
      h("article", { class: "ext-card", key: e.id }, [
        h("header", { class: "ext-card-head" }, [
          h("a", { class: "ext-name", href: this.linkOf(e) }, e.name),
          e.name !== e.id ? h("code", { class: "ext-id" }, e.id) : null,
          h("span", { class: "ext-type" }, typeLabel(e.type)),
          h("span", { class: "ext-status " + e.status }, statusLabel(e.status)),
        ]),
        e.description
          ? h("p", { class: "ext-desc" }, e.description)
          : null,
        e.soul ? h("p", { class: "ext-soul" }, [h("span", { class: "ext-soul-mark" }, "❝"), e.soul]) : null,
        h("dl", { class: "ext-detail" }, [
          e.version ? [h("dt", t("版本", "Version")), h("dd", e.version)] : null,
          e.npm ? [h("dt", "npm"), h("dd", h("code", e.npm))] : null,
          e.repo
            ? [
                h("dt", t("仓库", "Repo")),
                h("dd", h("a", { href: "https://github.com/" + e.repo, target: "_blank", rel: "noopener" }, e.repo)),
              ]
            : null,
          e.license ? [h("dt", t("许可", "License")), h("dd", e.license)] : null,
          e.tags && e.tags.length
            ? [h("dt", t("标签", "Tags")), h("dd", e.tags.map((tg) => h("span", { class: "ext-tag", key: tg }, tg)))]
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
            t("共 " + (catalog.count ?? catalog.extensions?.length ?? 0) + " 个扩展 · 数据源 ",
              (catalog.count ?? catalog.extensions?.length ?? 0) + " extensions · data source "),
            h("a", { href: "/extensions.json", target: "_blank", rel: "noopener" }, "/extensions.json"),
            " · " + t("更新于 ", "updated ") + (catalog.generatedAt || "").slice(0, 16).replace("T", " "),
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
