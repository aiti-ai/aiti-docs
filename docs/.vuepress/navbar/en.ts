import { navbar } from "vuepress-theme-hope";

export const enNavbar = navbar([
  "/en/",
  {
    text: "Products",
    icon: "table-columns",
    link: "/en/products/",
  },
  {
    text: "Guide",
    icon: "lightbulb",
    link: "/en/guide/",
  },
  {
    text: "Extension Dev",
    icon: "wrench",
    link: "/en/ext-dev/",
  },
  {
    text: "Install",
    icon: "download",
    link: "/en/guide/install.md",
  },
  {
    text: "aiti-devtools",
    icon: "screwdriver-wrench",
    link: "/en/devtools/",
  },
  {
    text: "Extensions",
    icon: "puzzle-piece",
    link: "/en/extensions/",
  },
  {
    text: "MCP Bridge",
    icon: "link",
    link: "/en/guide/mcp/",
  },
  {
    text: "IDE Plugins",
    icon: "puzzle-piece",
    link: "/en/ide/",
  },
  {
    text: "Roadmaps",
    icon: "road",
    link: "/en/roadmaps/",
  },
  {
    text: "External Links",
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
