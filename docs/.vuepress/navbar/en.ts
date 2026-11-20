import { navbar } from "vuepress-theme-hope";

export const enNavbar = navbar([
  "/en/",
  {
    text: "Guide",
    icon: "lightbulb",
    link: "/en/guide/",
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
    text: "Install",
    icon: "download",
    link: "/en/guide/install.md",
  },
  {
    text: "Changelogs",
    icon: "history",
    link: "/en/changelogs/",
  },
  {
    text: "Feedback",
    icon: "comment",
    link: "/en/feedback/",
  },
  {
    text: "More",
    icon: "ellipsis",
    children: [
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
    ],
  },
]);
