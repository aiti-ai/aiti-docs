import { hopeTheme } from "vuepress-theme-hope";

import { zhNavbar } from "./navbar/index.js";
import { zhSidebar } from "./sidebar/index.js";

export default hopeTheme({
  hostname: "https://aiti.py",
  author: {
    name: "aiti-ai",
    url: "https://github.com/aiti-ai",
  },

  // 使用新配置方式
  icon: {
    assets: "fontawesome-with-brands",
  },

  logo: "/logo.svg",

  favicon: "/favicon.svg",

  repo: "aiti-ai/aiti-docs",

  docsDir: "docs",

  // 导航栏
  navbar: zhNavbar,

  // 侧边栏
  sidebar: zhSidebar,

  // 页脚
  footer: "MIT Licensed | Copyright © 2026 aiti-ai",
  displayFooter: true,

  // Markdown 增强
  markdown: {
    // Shiki syntax highlighting
    highlighter: {
      type: "shiki",
      options: {
        theme: "github-dark",
        languages: [
          "yaml",
          "json",
          "xml",
          "typescript",
          "javascript",
          "bash",
          "html",
          "css",
          "markdown",
          "toml",
          "vue",
          "sql",
        ],
      },
    },

    // 启用 CodeTabs
    codeTabs: true,

    // 启用 Mermaid
    mermaid: true,
  },

  // Markdown增强插件 - 移到顶层
  mdEnhance: {
    align: true,
    attrs: true,
    codeTabs: true,
    component: true,
    demo: true,
    figure: true,
    imgLazyload: true,
    imgSize: true,
    include: true,
    mark: true,
    stylize: [
      {
        matcher: "Recommended",
        replacer: ({ tag }) => {
          if (tag === "em")
            return {
              tag: "Badge",
              attrs: { type: "tip" },
              children: "Recommended",
            };
        },
      },
    ],
    sub: true,
    sup: true,
    tasklist: true,
    vPre: true,
    // 显式启用 tabs
    tabs: true,
  },

  // 多语言配置
  locales: {
    "/": {
      navbar: zhNavbar,
      sidebar: zhSidebar,

      selectLanguageName: "简体中文",
      selectLanguageText: "选择语言",
      selectLanguageAriaLabel: "选择语言",

      // 页面元数据
      meta: {
        contributorsText: "贡献者",
      },

      // 404页面
      notFound: [
        "这里什么都没有",
        "我们怎么到这来了？",
        "这是一个 404 页面",
        "看起来我们进入了错误的链接",
      ],
      backToHome: "返回首页",

      // 无障碍
      a11y: {
        darkMode: "暗黑模式",
        lightMode: "明亮模式",
        accessible: "无障碍网站",
        toggleSidebar: "切换侧边栏",
      },
    },
  },

  plugins: {
    // 组件插件
    components: {
      components: ["Badge", "VPCard"],
    },

    slimsearch: {
      indexContent: true,
      suggestion: true,
      customFields: [
        {
          key: 'tags',
          getter: (page) => page.data.frontmatter.tags ?? [],
          formatter: {
            '/': '标签：$content',
          },
        },
      ],
      locales: {
        '/': {
          cancel: "取消",
          placeholder: "搜索",
          search: "搜索",
          searching: "搜索中",
          defaultTitle: "文档",
          select: "选择",
          navigate: "切换",
          autocomplete: "自动补全",
          exit: "关闭",
          queryHistory: "搜索历史",
          resultHistory: "历史结果",
          emptyHistory: "无搜索历史",
          emptyResult: "没有找到结果",
          loading: "正在加载搜索索引..."
        },
      },
    },

    // SEO 插件
    seo: {
      canonical: "https://aiti.py",
    },
  },
});
