import { navbar } from "vuepress-theme-hope";

export const zhNavbar = navbar([
  "/",
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
    text: "扩展开发",
    icon: "wrench",
    link: "/ext-dev/",
  },
  {
    text: "更多",
    icon: "ellipsis",
    children: [
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
        text: "变更历史",
        icon: "history",
        link: "/changelogs/",
      },
      {
        text: "路线图",
        icon: "road",
        link: "/roadmaps/",
      },
    ],
  },
]);
