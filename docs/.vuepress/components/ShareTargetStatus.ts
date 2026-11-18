/**
 * ShareTargetStatus — content-share 分享目标可用性实测表（客户端组件）。
 *
 * 数据源：fetch /share-targets.json（docs/.vuepress/public/ 静态文件）。
 * 展示 136 个免 setup 目标的直连/翻墙实测判定 + 15 个需注册目标的注册入口，
 * 支持按判定/类型筛选与搜索。双语展示层（中文注册表唯一数据源，/en/ 下翻译）。
 *
 * 判定语义见 /extensions/content-share 页面说明；数据由 2026-11 实测生成
 * （真实上传探针：直连 → VPN 策略路由复测，多轮证据并集）。
 */
import { defineComponent, ref, onMounted, computed, h } from "vue";
import { useRoute } from "vuepress/client";

interface Bi { zh?: string; en?: string }
interface TargetRow {
  id: string;
  name: string;
  kinds: string[];
  category: string;
  domain: string;
  setup?: string;
  verdict: string;
  availability: { direct?: string; vpn?: string };
  url?: string;
  register?: { required: boolean; url?: string; token?: string; note?: Bi };
  note?: Bi | string;
  verified?: boolean;
}
interface Payload {
  generatedAt?: string;
  counts?: { total?: number; byVerdict?: Record<string, number> };
  providers?: TargetRow[];
  setupProviders?: TargetRow[];
}

const VERDICTS = [
  { key: "cn-ok", zh: "国内可用", en: "CN direct OK", cls: "ok" },
  { key: "vpn-ok", zh: "翻墙可用", en: "Via VPN OK", cls: "vpn" },
  { key: "vpn-reachable", zh: "翻墙可达·上传异常", en: "VPN reachable, upload fails", cls: "part" },
  { key: "cn-reachable-broken", zh: "直连可达·服务异常", en: "CN reachable, service broken", cls: "part" },
  { key: "needs-config", zh: "需注册/配置", en: "Needs config", cls: "cfg" },
  { key: "vpn-unreachable", zh: "翻墙后仍不通", en: "Unreachable via VPN", cls: "bad" },
  { key: "dead", zh: "服务已死", en: "Dead", cls: "dead" },
  { key: "template", zh: "模板/坏配置", en: "Template/broken", cls: "dead" },
];
const VERDICT_META = Object.fromEntries(VERDICTS.map((v) => [v.key, v]));

const ERROR_LABEL: Record<string, { zh: string; en: string }> = {
  ok: { zh: "通过", en: "pass" },
  reachable: { zh: "网络可达", en: "reachable" },
  timeout: { zh: "超时", en: "timeout" },
  dns: { zh: "DNS 解析失败", en: "DNS failed" },
  "conn-reset": { zh: "连接被重置", en: "connection reset" },
  tls: { zh: "TLS 握手失败", en: "TLS failed" },
  http: { zh: "HTTP 错误", en: "HTTP error" },
  other: { zh: "其他失败", en: "other failure" },
  "not-probed": { zh: "未测", en: "not probed" },
};

export default defineComponent({
  name: "ShareTargetStatus",
  setup() {
    const route = useRoute();
    const isEn = computed(() => (route.path || "").startsWith("/en/"));
    const data = ref<Payload | null>(null);
    const error = ref("");
    const loading = ref(true);
    const verdict = ref("all");
    const kind = ref("all");
    const query = ref("");

    onMounted(async () => {
      try {
        const res = await fetch("/share-targets.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data.value = await res.json();
      } catch (e) {
        error.value = String(e);
      }
      loading.value = false;
    });

    const t = (zhText: string, enText: string) => (isEn.value ? enText : zhText);
    /** Prefer bilingual labels delivered by the payload; fall back to built-ins. */
    const pickBi = (v: { zh?: string; en?: string } | string | undefined) => {
      if (!v) return "";
      if (typeof v === "string") return v;
      return (isEn.value ? v.en : v.zh) || v.zh || v.en || "";
    };
    const verdictLabel = (key: string) => {
      const fromData = data.value?.labels?.verdicts?.[key];
      if (fromData) return pickBi(fromData);
      const m = VERDICT_META[key];
      return m ? (isEn.value ? m.en : m.zh) : key;
    };
    const avLabel = (x?: string) => {
      if (!x) return "";
      const fromData = data.value?.labels?.availability?.[x];
      if (fromData) return pickBi(fromData);
      const m = ERROR_LABEL[x];
      return m ? (isEn.value ? m.en : m.zh) : x;
    };
    const noteText = (p: TargetRow) => pickBi(p.note);

    const rows = computed<TargetRow[]>(() => {
      const list = [...(data.value?.providers ?? []), ...(data.value?.setupProviders ?? [])];
      const q = query.value.trim().toLowerCase();
      return list.filter((p) => {
        if (verdict.value !== "all" && p.verdict !== verdict.value) return false;
        if (kind.value !== "all" && !(p.kinds ?? []).includes(kind.value)) return false;
        if (q && !(`${p.id} ${p.name} ${p.domain} ${p.note ?? ""}`.toLowerCase().includes(q))) return false;
        return true;
      });
    });

    return { data, error, loading, verdict, kind, query, rows, isEn, t, verdictLabel, avLabel, noteText };
  },

  render() {
    const { data, error, loading, rows } = this;
    const t = (zh: string, en: string) => this.t(zh, en);

    const badge = (v: string) => {
      const m = VERDICT_META[v];
      return h("span", { class: "st-badge st-" + (m?.cls ?? "dead"), title: this.verdictLabel(v) }, this.verdictLabel(v));
    };

    const chip = (key: string, label: string, count: number | undefined) =>
      h("button", {
        class: "st-chip" + (this.verdict === key ? " active" : ""),
        onClick: () => { this.verdict = key; },
      }, [label, count !== undefined ? h("span", { class: "st-chip-n" }, String(count)) : null]);

    const filters = h("div", { class: "st-filters" }, [
      h("div", { class: "st-chips" }, [
        chip("all", t("全部", "All"), data?.counts?.total),
        ...VERDICTS.map((v) => chip(v.key, this.verdictLabel(v.key), data?.counts?.byVerdict?.[v.key])),
      ]),
      h("div", { class: "st-row2" }, [
        h("input", {
          class: "st-search",
          type: "search",
          placeholder: t("搜索目标 / 域名…", "Search target / domain…"),
          value: this.query,
          onInput: (e: Event) => { this.query = (e.target as HTMLInputElement).value; },
        }),
        ...["all", "text", "image", "file"].map((k) =>
          h("button", {
            class: "st-chip st-kind" + (this.kind === k ? " active" : ""),
            onClick: () => { this.kind = k; },
          }, k === "all" ? t("全部类型", "All kinds") : k)
        ),
      ]),
    ]);

    const item = (p: TargetRow) => {
      const av = p.availability ?? {};
      const reg = p.register ?? {};
      const children = [
        h("div", { class: "st-head" }, [
          h("code", { class: "st-id" }, p.id),
          badge(p.verdict),
          p.verified ? h("span", { class: "st-verified" }, t("✔ 上传验证", "✔ upload verified")) : null,
          ...(p.kinds ?? []).map((k) => h("span", { class: "st-kind-tag" }, k)),
        ]),
        h("div", { class: "st-meta" }, [
          p.domain ? [t("域名 ", "Domain "), h("code", p.domain), " · "] : null,
          t("直连 ", "Direct "), h("span", { class: "st-av" }, this.avLabel(av.direct)),
          " · ",
          t("翻墙 ", "Via VPN "), h("span", { class: "st-av" }, this.avLabel(av.vpn)),
          p.url ? [" · ", h("a", { href: p.url, target: "_blank", rel: "noopener" }, p.url)] : null,
        ]),
        reg.required || p.setup === "actually-needs-config"
          ? h("div", { class: "st-reg" }, [
              t("注册 ", "Register "),
              reg.url ? h("a", { href: reg.url, target: "_blank", rel: "noopener" }, reg.url) : h("span", t("见说明", "see note")),
              reg.token ? [" · ", h("a", { href: reg.token, target: "_blank", rel: "noopener" }, t("取密钥", "get key"))] : null,
              reg.note ? h("span", { class: "st-reg-note" }, " — " + (typeof reg.note === "string" ? reg.note : (this.isEn ? reg.note.en : reg.note.zh) || "")) : null,
            ])
          : null,
        (() => { const n = this.noteText(p); return n ? h("div", { class: "st-note", title: n }, n) : null; })(),
      ];
      return h("li", { class: "st-item", key: p.id }, children);
    };

    const recos = t(
      "推荐：国内直连首选 paste.rs / dpaste.com / p.ip.fi / f.blicky.net（图 f.blicky.net）；翻墙后 rentry / gofile.io / write.as 已验证可用。判定为 2026-11 实测快照，服务随时可能变化。",
      "Recommended: for direct CN access use paste.rs / dpaste.com / p.ip.fi / f.blicky.net (images: f.blicky.net); behind a VPN, rentry / gofile.io / write.as are verified. Verdicts are a 2026-11 measured snapshot — services drift over time."
    );

    let content;
    if (loading) content = h("div", { class: "st-note" }, t("加载目标可用性数据…", "Loading target status data…"));
    else if (error) content = h("div", { class: "st-note st-error" }, t("数据加载失败：", "Failed to load data: ") + error);
    else if (data) {
      content = h("div", { class: "st-root" }, [
        h("div", { class: "st-meta" }, [
          t("实测目标 ", "Targets probed ") + (data.counts?.total ?? data.providers?.length ?? 0),
          t(" · 另有 " + (data.setupProviders?.length ?? 0) + " 个需注册目标 · 数据源 ", " · plus " + (data.setupProviders?.length ?? 0) + " registration-required targets · data: "),
          h("a", { href: "/share-targets.json", target: "_blank", rel: "noopener" }, "/share-targets.json"),
          " · " + t("更新于 ", "updated ") + (data.generatedAt ?? "").slice(0, 16).replace("T", " "),
        ]),
        h("p", { class: "st-hint" }, "💡 " + recos),
        filters,
        h("ul", { class: "st-list" }, rows.map(item)),
        rows.length === 0 ? h("div", { class: "st-note" }, t("没有匹配的目标", "No matching targets")) : null,
      ]);
    } else content = null;

    return h("div", { class: "st-status" }, [content]);
  },
});
