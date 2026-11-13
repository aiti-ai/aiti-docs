/**
 * LatestVersion — update guide page "latest version" line.
 *
 * Pure client-side query: fetches the latest @aiti-ai/pi-web version from the
 * npm registry (registry.npmjs.org sends CORS headers; npm `latest` is the
 * single authoritative version source — it is dist-tagged in lockstep with
 * GitHub releases). On failure, renders a static GitHub Releases link.
 * Deliberately no Gitee fallback: its releases API has been observed stale
 * (v0.15.7 while npm was at 0.15.15-aiti.4), which would mislead users.
 * SSR renders the placeholder; hydration swaps in the fetched version.
 *
 * .ts rather than .vue: same reason as ExtensionList (SFC compiled output
 * breaks on the tunnel link).
 */
import { defineComponent, ref, onMounted, h } from "vue";
import { useRoute } from "vuepress/client";

// Same endpoint and encoding as pi-web's app/api/app-update/route.ts.
const NPM_LATEST_URL = "https://registry.npmjs.org/@aiti-ai%2Fpi-web/latest";
const RELEASE_TAG_BASE = "https://github.com/aiti-ai/aiti-ai/releases/tag";
const RELEASES_URL = "https://github.com/aiti-ai/aiti-ai/releases";
const FETCH_TIMEOUT_MS = 5_000;

async function fetchLatestVersion(): Promise<string | null> {
  try {
    const response = await fetch(NPM_LATEST_URL, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const body = await response.json();
    return typeof body?.version === "string" && body.version ? body.version : null;
  } catch {
    return null;
  }
}

export default defineComponent({
  name: "LatestVersion",
  setup() {
    const route = useRoute();
    const version = ref<string | null>(null);
    const state = ref<"loading" | "ok" | "error">("loading");

    onMounted(async () => {
      const latest = await fetchLatestVersion();
      version.value = latest;
      state.value = latest ? "ok" : "error";
    });

    return () => {
      const en = route.path.startsWith("/en/");
      const label = en ? "Latest version: " : "最新版本：";
      let content: ReturnType<typeof h>;
      if (state.value === "ok" && version.value) {
        // Link straight to the release tag changelog.
        content = h(
          "a",
          { href: `${RELEASE_TAG_BASE}/v${version.value}`, target: "_blank", rel: "noopener noreferrer" },
          `v${version.value}`,
        );
      } else if (state.value === "error") {
        content = h(
          "a",
          { href: RELEASES_URL, target: "_blank", rel: "noopener noreferrer" },
          en ? "see GitHub Releases" : "见 GitHub Releases",
        );
      } else {
        content = h("span", {}, en ? "checking…" : "查询中…");
      }
      return h("p", { class: "latest-version-line" }, [label, content]);
    };
  },
});
