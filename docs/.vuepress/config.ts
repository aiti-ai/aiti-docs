import { defineUserConfig } from 'vuepress';
import { viteBundler } from '@vuepress/bundler-vite';
import theme from './theme.ts';
import extensionsCatalog from './plugins/extensions-catalog.ts';
import { seoEnhance } from './plugins/seo-enhance.ts';

// Privacy guard: vuepress-theme-hope force-enables @vuepress/plugin-git on build
// (even when plugins.git is false), compiling contributor names/emails into every
// page bundle. Registering a no-op placeholder under the same name makes its
// "already installed" check skip the injection.
const blockGitPlugin = { name: "@vuepress/plugin-git" };

export default defineUserConfig({
  base: '/',
  title: 'aiti',
  description: '自托管 AI 开发工作台（基于 pi-web 增强）——多 agent 同堂 · 60+ 内置扩展 · aiti-agent / aiti-devtools / aiti-bridge',
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#7c3aed' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    // Baidu Analytics (tongji.baidu.com) — equivalent of the official snippet:
    // define _hmt first (sync), then load hm.js async.
    ['script', {}, 'var _hmt = _hmt || [];'],
    ['script', { async: true, src: 'https://hm.baidu.com/hm.js?a708f5b3da36a2aeb0402c8cccc8f33b' }],
  ],
  port: 8082,

  bundler: viteBundler({
    viteOptions: {
      define: {
        // 修复 dev 模式 HMR 崩溃：vuepress bundler 仅在 isDebug 时定义 NODE_ENV=development，
        // 导致正常 dev 模式下 @vue/runtime-core 的 __VUE_HMR_RUNTIME__ 被 tree-shake 掉
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV === 'production' ? 'production' : 'development'),

        // 修复 dev 模式 PageMeta 崩溃：plugin-git 注入的 __GIT_* 编译期全局同样只在
        // isDebug 时生效 → useLastUpdated 读 locale.value.latestUpdateAt（无 typeof 兜底）
        // TypeError: Cannot read properties of undefined (reading 'latestUpdateAt')。
        // 这里手动补齐（值 = @vuepress/plugin-git gitPlugin 的 define，zh-CN 单 locale）。
        // 注意 __GIT_CONTRIBUTORS__/__GIT_CHANGELOG__ 保持 false：dev 下 page.data.git
        // 未被 extendsPage 注入，useContributors 走空数组分支才不崩（显示不依赖它）。
        __GIT_CHANGELOG__: 'false',
        __GIT_CONTRIBUTORS__: 'false',
        __GIT_LOCALES__: JSON.stringify({
          '/': {
            contributors: '贡献者',
            changelog: '更新日志',
            timeOn: '于',
            viewChangelog: '查看所有更新日志',
            latestUpdateAt: '最近更新',
          },
          '/en/': {
            contributors: 'Contributors',
            changelog: 'Changelog',
            timeOn: 'on',
            viewChangelog: 'View full changelog',
            latestUpdateAt: 'Last updated',
          },
        }),
      },
      server: {
        // 放开 Host 限制（dev server 无妨）：支持任意隧道/代理域名访问，
        // 否则 vite 对非白名单 Host 的模块请求返回 403（Blocked request）→ 页面 JS 加载失败。
        allowedHosts: true,
      },
    },
  }),
  theme,

  plugins: [
    blockGitPlugin,
    // 扩展注册表：扫描 docs/extensions/*.md 的 ext frontmatter → 生成 /extensions.json
    extensionsCatalog(),
    // SEO 增强：keywords / og:image / twitter 卡片 / JSON-LD / llms.txt（依赖 extensions.json，须在其后）
    seoEnhance(),
  ],

  locales: {
    // 默认中文 locale
    '/': {
      lang: 'zh-CN',
      title: 'aiti',
      description: '自托管 AI 开发工作台（基于 pi-web 增强）——多 agent 同堂 · 60+ 内置扩展 · 模型多 key 轮转 · 终端/VNC/RDP · IM 遥控 · 页面调试注入',
    },
    // 英文镜像（docs/en/）
    '/en/': {
      lang: 'en-US',
      title: 'aiti',
      description: 'Self-hosted AI dev workbench enhanced from pi-web — all agents in one panel, 60+ built-in extensions, multi-key model rotation, terminal/VNC/RDP, remote-control AI from IM, page-debug injection',
    },
  },
});
