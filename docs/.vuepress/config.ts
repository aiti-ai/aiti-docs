import { defineUserConfig } from 'vuepress';
import { viteBundler } from '@vuepress/bundler-vite';
import theme from './theme.ts';

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
    },
  }),
  theme,

  locales: {
    // 默认中文 locale
    '/': {
      lang: 'zh-CN',
      title: 'aiti',
      description: '以 pi 为引擎的个人 AI 开发工作台与本地调试注入生态',
    },
  },
});
