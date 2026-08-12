import { defineClientConfig } from 'vuepress/client';

// Import custom styles
import './styles/index.css';

export default defineClientConfig({
  enhance({ app, router, siteData }) {
    // 全局组件注册（按需扩展）
  },
  layouts: {},
  setup() {
    // ...
  },
  rootComponents: [
    // ...
  ],
});
