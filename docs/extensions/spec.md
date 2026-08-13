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
title: aiti-devtools            # 页面标题（列表也用它做展示名时的兜底）
icon: 🧰                        # 页面图标
ext:
  id: aiti-devtools             # 必须，唯一 id（一般与文件名一致）
  name: aiti devtools           # 展示名（缺省 = id）
  description: 一句话描述        # 列表卡片副标题
  soul: 一句话灵魂描述          # 设计源动力（卡片斜体标注，可选但推荐）
  type: devtools-plugin         # 类型枚举（见下）
  category: 页面调试注入         # 列表分组（自定义中文分类）
  version: 0.2.1                # 当前版本
  status: active                # active / beta / experimental / archived
  author: aiti-ai               # 维护者
  repo: ""                      # 有独立仓库时填 "owner/repo"（暂无仓库留空）
  npm: "@justdb/aiti-devtools"  # npm 包名（可选）
  install: |
    pnpm add -D @justdb/aiti-devtools-vite
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

| type | 含义 |
|---|---|
| `devtools-plugin` | 开发工具插件（Vite / Vue / Next 等本地注入） |
| `dev-repo` | aiti-agent 运行时扩展（`~/.pi/web/extensions/`） |
| `bridge` | MCP 桥 / 本地服务 |
| `ide-plugin` | IDE 插件（VSCode / IDEA 等） |
| `theme` / `skill` | 主题 / 技能（pi / aiti-agent 生态预留） |
| `other` | 其他 |

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

`/extensions.json` 结构（`schemaVersion: 1`）：

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-08-14T00:00:00.000Z",
  "count": 8,
  "extensions": [
    {
      "id": "aiti-devtools",
      "name": "aiti devtools",
      "description": "…",
      "soul": "我的输入是我宝贵的财富——说过的好话，值得收藏。",
      "type": "devtools-plugin",
      "category": "页面调试注入",
      "version": "0.2.1",
      "status": "active",
      "author": "aiti-ai",
      "repo": "",
      "npm": "@justdb/aiti-devtools",
      "install": "pnpm add -D …",
      "license": "MIT",
      "tags": [],
      "docs": "/extensions/aiti-devtools.html"
    }
  ]
}
```

aiti-agent 拉取 `https://aiti.pw/extensions.json` 即可自动发现扩展列表。
