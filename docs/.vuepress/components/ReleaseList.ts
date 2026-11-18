/**
 * ReleaseList — release notes 时间线（/changelogs 页）。
 *
 * 数据源（与 ExtensionList 同模式）：
 * - SSR/首屏：__RELEASES_CATALOG__（releases-changelog 插件 define 注入的构建期数据，
 *   扫描本仓 releases/*.md）
 * - 客户端：fetch /releases.json 刷新（dev 实时）
 *
 * 渲染：版本倒序时间线；substantive 版本展开 Highlights + 分组（Internal 默认折叠）；
 * 非实质版本（file-based 管线之前，body 仅 compare 链接）只显示 tag + GitHub 链接。
 *
 * .ts rather than .vue: same reason as ExtensionList (SFC compiled output
 * breaks on the tunnel link).
 */
import { defineComponent, ref, computed, h } from "vue";
import { useRoute } from "vuepress/client";

interface ReleaseSection {
  title: string;
  items: string[];
}
interface ReleaseEntry {
  tag: string;
  version: string;
  url: string;
  highlights: string[];
  sections: ReleaseSection[];
  substantive: boolean;
}

declare const __RELEASES_CATALOG__: string | undefined;

function readCatalog(): ReleaseEntry[] {
  const raw = typeof __RELEASES_CATALOG__ !== "undefined" ? __RELEASES_CATALOG__ : "";
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as { releases?: ReleaseEntry[] };
    return Array.isArray(parsed.releases) ? parsed.releases : [];
  } catch {
    return [];
  }
}

/** release-date 注释从 md 顶部带过来时插件未解析 —— 版本日期展示用 tag 的日期部分兜底 */
function dateOf(entry: ReleaseEntry): string {
  return entry.tag; // 时间线以 tag 排序为准；日期展示在 GitHub 链接旁
}

export default defineComponent({
  name: "ReleaseList",
  setup() {
    const route = useRoute();
    const isEn = computed(() => (route.path || "").startsWith("/en/"));
    const entries = ref<ReleaseEntry[]>(readCatalog());
    const expandedInternal = ref<Record<string, boolean>>({});

    void fetch("/releases.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j && Array.isArray(j.releases) && j.releases.length) entries.value = j.releases;
      })
      .catch(() => {});

    const toggleInternal = (tag: string) => {
      expandedInternal.value = { ...expandedInternal.value, [tag]: !expandedInternal.value[tag] };
    };

    const t = (zh: string, en: string) => (isEn.value ? en : zh);

    const renderHighlights = (e: ReleaseEntry) =>
      e.highlights.length
        ? h("ul", { class: "release-highlights" }, e.highlights.map((it) => h("li", { innerHTML: it })))
        : null;

    const renderSections = (e: ReleaseEntry) => {
      const visible = e.sections.filter((s) => s.items.length);
      if (!visible.length) return null;
      const internal = visible.find((s) => /^Internal$/i.test(s.title));
      const normal = visible.filter((s) => s !== internal);
      const open = !!expandedInternal.value[e.tag];
      return h(
        "div",
        { class: "release-sections" },
        [
          ...normal.map((s) =>
            h("div", { class: "release-section", key: s.title }, [
              h("h4", s.title),
              h("ul", s.items.map((it) => h("li", { innerHTML: it }))),
            ]),
          ),
          ...(internal
            ? [
                h(
                  "div",
                  { class: "release-section release-internal" },
                  [
                    h(
                      "button",
                      {
                        class: "release-internal-toggle",
                        onClick: () => toggleInternal(e.tag),
                      },
                      `${open ? "▾" : "▸"} ${internal.title} (${internal.items.length})`,
                    ),
                    ...(open
                      ? [h("ul", internal.items.map((it) => h("li", { innerHTML: it })))]
                      : []),
                  ],
                ),
              ]
            : []),
        ],
      );
    };

    return () =>
      h(
        "div",
        { class: "release-list" },
        entries.value.map((e) =>
          h("section", { class: "release-entry", key: e.tag, id: e.tag }, [
            h("h2", { class: "release-tag" }, [
              h("a", { href: e.url, target: "_blank", rel: "noopener" }, e.tag),
            ]),
            e.substantive
              ? [renderHighlights(e), renderSections(e)]
              : h(
                  "p",
                  { class: "release-legacy" },
                  t(
                    "此版本早于 file-based release notes 管线，完整变更见 ",
                    "This release predates the file-based notes pipeline — see ",
                  ) + h("a", { href: e.url, target: "_blank", rel: "noopener" }, "GitHub Release"),
                ),
          ]),
        ),
      );
  },
});
