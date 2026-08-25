---
title: ext 元数据规范
icon: 📐
description: 扩展 md 的 ext frontmatter 规范、type 枚举、提交新扩展、JSON 消费
---

# ext 元数据规范

扩展注册表的数据来自每个扩展 md 的 `ext` frontmatter，编译时由插件汇总为 `/extensions.json`。

## 1. ext 元数据

扩展 md 的 frontmatter 中放一个 `ext` 对象（除 `id`/`name` 外均可选，缺省用默认值）：

```yaml
---
title: aiti-helper              # 页面标题（列表也用它做展示名时的兜底）
icon: 🧰                        # 页面图标
ext:
  id: aiti-helper               # 必须，唯一 id（一般与文件名一致）
  name: aiti helper             # 展示名（缺省 = id）
  description: 一句话描述        # 列表卡片副标题
  soul: 一句话灵魂描述          # 设计源动力（卡片斜体标注，可选但推荐）
  type: dev-repo              # 类型枚举（见下）
  category: 页面调试注入         # 列表分组（自定义中文分类）
  version: 0.2.1                # 当前版本
  status: active                # active / beta / experimental / archived
  author: aiti-ai               # 维护者
  repo: ""                      # 有独立仓库时填 "owner/repo"（暂无仓库留空）
  npm: "@aiti-ai/my-ext"         # npm 包名（可选）
  install: |
    pnpm add -D @aiti-ai/my-ext
  license: MIT
  tags: [inject, inspector, mcp] # 检索标签
---
```

### 字段说明

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | ✅ | 唯一标识，与文件名一致；也是 JSON 里的主键 |
| `name` | — | 展示名，缺省用 `id` |
| `description` | — | 一句话描述（列表卡片显示） |
| `soul` | — | 一句话灵魂描述——设计这个扩展的源动力（卡片斜体高亮，推荐填） |
| `type` | — | 类型枚举，缺省 `other` |
| `category` | — | 列表分组，自定义中文分类名，缺省归"其他" |
| `version` / `status` / `author` | — | 版本、状态（active/beta/experimental/archived）、维护者 |
| `repo` | — | 独立仓库 `owner/repo`；**尚未开仓库的扩展留空**，之后有了再补 |
| `npm` | — | npm 包名（若有） |
| `install` | — | 安装/部署方式（多行用 `\|` 块） |
| `license` / `tags` | — | 许可、检索标签 |

### type 枚举

> ⚠️ **注册表只收 pi-web 扩展**：aiti-devtools 的 SDK 本体与各框架插件（Vite/webpack/Nuxt/Astro…）**不是扩展**，归独立大主题 [/devtools/](/devtools/)，登记在 `docs/devtools/integrations/`（见下文「integrations 注册」）；IDE 插件归 [/ide/](/ide/)。原 `devtools-plugin`/`ide-plugin` 类型已废弃移出。

| type | 含义 |
|---|---|
| `dev-repo` | aiti-agent 运行时扩展（`~/.pi/web/extensions/`） |
| `bridge` | MCP 桥 / 本地服务 |
| `theme` / `skill` | 主题 / 技能（pi / aiti-agent 生态预留） |
| `other` | 其他 |

## 1.5 integrations 注册（aiti-devtools 框架集成）

aiti-devtools 各框架集成页放在 `docs/devtools/integrations/<id>.md`，frontmatter 同样用 `ext:` 块（字段同上，type 自由填如 `vite-plugin`）。它们不进 `extensions.extensions` 数组，而是编译进独立的 `integrations` 数组（见下文 JSON 消费），页面 docs 链接指向 `/devtools/integrations/*.html`。

## 2. 提交新扩展

1. 复制下方模板，新建 `docs/extensions/<id>.md`（id 与文件名一致）；
2. 填好 `ext` 元数据，正文写 2-5 句简介（可链接到详细文档）；
3. 在导航 `docs/.vuepress/sidebar/zh.ts` 的「扩展」分组里加一个条目；
4. 开 PR —— 列表页与 `/extensions.json` 会在编译时自动更新，无需手动维护。

```markdown
---
title: my-ext
icon: 🧩
ext:
  id: my-ext
  name: My Extension
  description: 它做什么
  type: other
  category: 其它
  version: 0.1.0
  status: experimental
  author: you
  publisher: you
  website: https://example.com
  repo: ""
  npm: ""
  install: |
    pnpm add -D my-ext
  license: MIT
  tags: []
---

# my-ext

（一句话定位 + 链接到使用文档 / 源码。临时无仓库时，说明当前状态和获取方式。）
```

## 3. JSON 消费

`/extensions.json` 结构（`schemaVersion: 2`——**分家**：`extensions` 只含 pi-web 扩展；框架集成分离到 `integrations` 数组）：

```json
{
  "schemaVersion": 2,
  "generatedAt": "2026-08-14T00:00:00.000Z",
  "count": 38,
  "extensions": [
    {
      "id": "aiti-helper",
      "name": "aiti helper",
      "description": "…",
      "type": "dev-repo",
      "docs": "/extensions/aiti-helper.html"
    }
  ],
  "integrations": [
    {
      "id": "aiti-devtools-vite",
      "name": "aiti-devtools-vite",
      "description": "Vite 插件 —— dev 自动本地注入，一行插件 = 同源 /aiti/ 全套",
      "type": "vite-plugin",
      "npm": "@aiti-ai/aiti-devtools-vite",
      "install": "pnpm add -D @aiti-ai/aiti-devtools-vite\n# vite.config.ts: plugins: [aitiDevtools()]",
      "status": "active",
      "docs": "/devtools/integrations/vite.html"
    }
  ]
}
```

aiti-agent 拉取 `https://aiti.pw/extensions.json` 即可自动发现扩展列表——**扩展发现只消费 `extensions` 数组**（框架插件不是可安装扩展，不该出现在扩展列表里）。
