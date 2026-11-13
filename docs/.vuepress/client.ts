import { defineClientConfig } from 'vuepress/client';

// Import custom styles
import './styles/index.css';
import ExtensionList from './components/ExtensionList.ts';
import LatestVersion from './components/LatestVersion.ts';

declare global {
  interface Window {
    _hmt: unknown[][] | undefined;
  }
}

export default defineClientConfig({
  enhance({ app, router, siteData }) {
    // 全局组件注册（按需扩展）
    app.component('ExtensionList', ExtensionList);
    app.component('LatestVersion', LatestVersion);

    // Baidu Analytics: this site is an SPA — hm.js would only track the initial
    // page load. Disable auto pageview and report one PV per route change instead.
    if (typeof window !== 'undefined') {
      window._hmt = window._hmt || [];
      window._hmt.push(['_setAutoPageview', false]);
      router?.afterEach((to) => {
        window._hmt?.push(['_trackPageview', to.fullPath]);
      });
    }
  },
  layouts: {},
  setup() {
    // ...
  },
  rootComponents: [
    // ...
  ],
});
