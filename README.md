# aiti-docs

aiti 官方文档站 —— 以 **pi** 为引擎的个人 AI 开发工作台与本地调试注入生态。

- 官网：<https://aiti.py>
- GitHub：<https://github.com/aiti-ai>
- npm scope：`@justdb/*`

## 内容

| 目录 | 内容 |
|---|---|
| `docs/products/` | **产品矩阵**：aiti-agent / aiti-devtools 系列 / aiti-mcp-bridge 系列 / IDE 插件 |
| `docs/guide/` | 指南：概念、架构、快速开始 |
| `docs/devtools/` | aiti-devtools 使用文档（注入、插件、命令集） |
| `docs/mcp-bridge/` | MCP 桥文档（server、会话、AI agent 接入） |
| `docs/ide/` | IDE 插件文档（vscode / idea） |
| `docs/roadmaps/` | **整体规划**（master-plan）与产品路线图 |

## 开发

```bash
pnpm install
pnpm docs:dev      # http://localhost:8082
pnpm docs:build    # 产物在 docs/.vuepress/dist
```

## 配置说明

核心配置参照 `justdb/justdb-docs` 的 VuePress 结构（`docs/.vuepress/config.ts` + `theme.ts` + navbar/sidebar 拆分），使用 `vuepress-theme-hope`，含 Mermaid、代码高亮、全文搜索（slimsearch）、SEO 插件。
