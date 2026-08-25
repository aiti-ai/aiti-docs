import { navbar } from "vuepress-theme-hope";

export const zhNavbar = navbar([
  "/",
  {
    text: "产品矩阵",
    icon: "table-columns",
    link: "/products/",
  },
  {
    text: "指南",
    icon: "lightbulb",
    link: "/guide/",
  },
  {
    text: "aiti-devtools",
    icon: "screwdriver-wrench",
    link: "/devtools/",
  },
  {
    text: "扩展",
    icon: "puzzle-piece",
    link: "/extensions/",
  },
  {
    text: "MCP 桥",
    icon: "link",
    link: "/guide/mcp/",
  },
  {
    text: "IDE 插件",
    icon: "puzzle-piece",
    link: "/ide/",
  },
  {
    text: "路线图",
    icon: "road",
    link: "/roadmaps/",
  },
  {
    text: "外部链接",
    icon: "link",
    children: [
      {
        text: "GitHub",
        link: "https://github.com/aiti-ai",
        icon: "github",
      },
      {
        text: "aiti.pw",
        link: "https://aiti.pw",
        icon: "globe",
      },
    ],
  },
]);
