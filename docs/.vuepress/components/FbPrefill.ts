/**
 * FbPrefill — feedback prefill landing component (client-side, bilingual).
 *
 * Reads `?d=<enc>` (body) and `?t=<enc>` (title) from the query (URL-encoded by
 * the pi-web feedback dialog), shows an editable preview, one-click copy, and a
 * "open prefilled GitHub issue" button. Without a payload it degrades to plain
 * guidance (manual issue links). Language follows the route (/en/ → English).
 */
import { defineComponent, ref, computed, h, onMounted } from "vue";
import { useRoute } from "vuepress/client";

const ISSUE_URL = "https://github.com/aiti-ai/aiti-ai/issues/new";

export default defineComponent({
  name: "FbPrefill",
  setup() {
    const route = useRoute();
    const title = ref("");
    const body = ref("");
    const copied = ref(false);
    const hasPayload = ref(false);

    onMounted(() => {
      const q = route.query as Record<string, unknown>;
      const d = typeof q.d === "string" ? q.d : "";
      const t = typeof q.t === "string" ? q.t : "";
      if (!d) return;
      hasPayload.value = true;
      try { body.value = decodeURIComponent(d); } catch { body.value = d; }
      try { title.value = t ? decodeURIComponent(t) : ""; } catch { title.value = t; }
    });

    const issueUrl = computed(() => {
      const t = (title.value || "feedback").trim();
      return `${ISSUE_URL}?title=${encodeURIComponent(t)}&body=${encodeURIComponent(body.value)}`;
    });

    const copy = async () => {
      try { await navigator.clipboard.writeText(body.value); copied.value = true; setTimeout(() => { copied.value = false; }, 2000); } catch { /* clipboard unavailable */ }
    };

    return () => {
      const en = (route.path === "/en/" || route.path.startsWith("/en/"));
      const L = en
        ? {
            intro: "The content below was brought in by the pi-web \"Report an issue\" dialog — edit freely:",
            titlePh: "Title",
            copy: "Copy full text",
            copied: "Copied ✓",
            open: "Open GitHub to submit →",
            note: "After logging into GitHub the fields are already filled — review and hit Submit.",
            manual1: "Open an ",
            manual1a: "issue",
            manual2: " directly (log into GitHub, fill in title and body). Check the ",
            manual2a: "extension docs",
            manual3: " and ",
            manual3b: "changelogs",
            manual4: " first — many questions are already answered.",
            tip: "Feedback started from the pi-web toolbar (\"Report an issue\") carries a sanitized environment and content preview automatically — recommended.",
          }
        : {
            intro: "以下内容由 pi-web 的「报告问题」弹窗带入，可直接编辑：",
            titlePh: "标题",
            copy: "复制全文",
            copied: "已复制 ✓",
            open: "前往 GitHub 提交 →",
            note: "登录 GitHub 后内容已填好，确认无误点 Submit 即可",
            manual1: "直接 ",
            manual1a: "新建 issue",
            manual2: "（登录 GitHub 后填写标题与内容提交）；建议先看 ",
            manual2a: "扩展文档",
            manual3: " 与 ",
            manual3b: "更新日志",
            manual4: "，很多问题已有答案。",
            tip: "从 pi-web 界面（工具栏「报告问题」）发起的反馈会自动带上脱敏后的环境与内容预览，推荐使用。",
          };

      return h("div", { class: "fb-prefill" }, [
        hasPayload.value
          ? [
              h("p", { style: "font-size:13px;color:var(--vp-c-text-2)" }, L.intro),
              h("input", {
                value: title.value,
                onInput: (e: Event) => { title.value = (e.target as HTMLInputElement).value; },
                placeholder: L.titlePh,
                style: "width:100%;box-sizing:border-box;padding:8px 10px;margin-bottom:8px;border:1px solid var(--vp-c-divider);border-radius:8px;background:transparent;color:var(--vp-c-text-1);font-size:13px",
              }),
              h("textarea", {
                value: body.value,
                onInput: (e: Event) => { body.value = (e.target as HTMLTextAreaElement).value; },
                style: "width:100%;box-sizing:border-box;height:260px;padding:10px;margin-bottom:10px;border:1px solid var(--vp-c-divider);border-radius:8px;background:transparent;color:var(--vp-c-text-1);font-family:var(--vp-font-mono,monospace);font-size:12px;resize:vertical",
              }),
              h("div", { style: "display:flex;gap:10px;flex-wrap:wrap;align-items:center" }, [
                h("button", {
                  onClick: copy,
                  style: "padding:8px 14px;border-radius:8px;border:1px solid var(--vp-c-divider);background:transparent;color:var(--vp-c-text-1);cursor:pointer;font-size:13px",
                }, copied.value ? L.copied : L.copy),
                h("button", {
                  onClick: () => { window.open(issueUrl.value, "_blank", "noopener"); },
                  style: "padding:8px 14px;border-radius:8px;border:1px solid transparent;background:var(--vp-c-brand);color:#fff;cursor:pointer;font-size:13px",
                }, L.open),
                h("span", { style: "font-size:12px;color:var(--vp-c-text-3)" }, L.note),
              ]),
            ]
          : [
              h("p", null, [
                h("span", null, L.manual1),
                h("a", { href: ISSUE_URL, target: "_blank", rel: "noopener" }, L.manual1a),
                h("span", null, L.manual2),
                h("a", { href: en ? "/en/extensions/" : "/extensions/" }, L.manual2a),
                h("span", null, L.manual3),
                h("a", { href: en ? "/en/changelogs/" : "/changelogs/" }, L.manual3b),
                h("span", null, L.manual4),
              ]),
              h("p", { style: "font-size:13px;color:var(--vp-c-text-2)" }, L.tip),
            ],
      ]);
    };
  },
});
