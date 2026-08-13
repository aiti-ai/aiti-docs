import { defineUserConfig } from 'vuepress';
import { viteBundler } from '@vuepress/bundler-vite';
import theme from './theme.ts';
import extensionsCatalog from './plugins/extensions-catalog.ts';

export default defineUserConfig({
  base: '/',
  title: 'aiti',
  description: '以 pi 为引擎的个人 AI 开发工作台与本地调试注入生态 — aiti-agent / aiti-devtools / aiti-mcp-bridge',
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#7c3aed' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
  ],
  port: 8082,

  bundler: viteBundler({
    viteOptions: {
      define: {
        // 修复 dev 模式 HMR 崩溃：vuepress bundler 仅在 isDebug 时定义 NODE_ENV=development，
        // 导致正常 dev 模式下 @vue/runtime-core 的 __VUE_HMR_RUNTIME__ 被 tree-shake 掉
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV === 'production' ? 'production' : 'development'),
      },
      server: {
        // 放开 Host 限制（dev server 无妨）：支持任意隧道/代理域名访问
        // （your-pi-web.example.com、trycloudflare.com 随机域名等），否则 vite 对非白名单
        // Host 的模块请求返回 403（Blocked request）→ 页面 JS 加载失败。
        allowedHosts: true,
      },
    },
  }),
  theme,

  plugins: [
    // 扩展注册表：扫描 docs/extensions/*.md 的 ext frontmatter → 生成 /extensions.json
    extensionsCatalog(),
  ],

  locales: {
    // 默认中文 locale
    '/': {
      lang: 'zh-CN',
      title: 'aiti',
      description: '以 pi 为引擎的个人 AI 开发工作台与本地调试注入生态',
    },
  },
});
