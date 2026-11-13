import { defineClientConfig } from 'vuepress/client';

// Import custom styles
import './styles/index.css';
import ExtensionList from './components/ExtensionList.ts';
import LatestVersion from './components/LatestVersion.ts';

export default defineClientConfig({
  enhance({ app, router, siteData }) {
    // 全局组件注册（按需扩展）
    app.component('ExtensionList', ExtensionList);
    app.component('LatestVersion', LatestVersion);
  },
  layouts: {},
  setup() {
    // ...
  },
  rootComponents: [
    // ...
  ],
});
