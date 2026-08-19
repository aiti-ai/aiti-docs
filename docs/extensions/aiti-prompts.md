---
title: aiti-prompts
icon: 📌
ext:
  id: aiti-prompts
  name: aiti prompt 片段收藏库
  description: prompt 片段收藏 —— 收藏/分组/会话提取/输入即存
  soul: 我的输入是我宝贵的财富——好话不说二遍。
  type: dev-repo
  category: 命令工具
  version: 0.1.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-prompts/ 后 reload
  license: MIT
  tags: [prompt, collect, library]
---

# aiti-prompts

> ❝ **我的输入是我宝贵的财富——好话不说二遍。** ❞

pi-web 的 **prompt 片段收藏库**：把说过的好话、好用的指令收藏起来，随时取用。

- **收藏库**：prompt CRUD + 树形分组（照 aiti-cmd 命令管理）
- **会话提取**：从历史会话的 user 消息里多选批量入库（你的表达习惯是最好的语料）
- **收藏输入**：聊天输入框的 📌 按钮，把当前输入一键存库

## AI 自管理能力

> AI 能为你：**帮你把说过的好话整理成结构化收藏、帮写新 prompt 片段。**

```yaml
ai:
  manage: true
  skills:
    - 查看收藏库/分组（GET /prompts，store=prompts.json（<dataDir> 即 aiti-prompts 目录））
    - 新建/改名/删 prompt、建分组（POST/PUT/DELETE /prompts、/groups）
    - 会话提取：读历史会话 user 消息 → 批量小结入库（AI 最擅长）
    - 输入联想：suggest 候选=**命令（⚡）+ 收藏 prompt（📌）混合**，命中命令直接填/执行、不走 AI；仅无命中才轮到 AI 生成
  storage_dir: <dataDir>（= ~/.pi/web/data/aiti-prompts）
  source_dir: dev-repo/aiti-prompts
  page: 工具栏 📌 Prompt → 收藏库
```

接入 ai-helper 后：收藏面板「AI 帮我写」→ 描述一段可用指令 → 预览 → 入库（见 [aiti-helper](/extensions/aiti-helper.html)）。

### AI 帮助点（ai.helpers）

| 帮助点 | 作用 | 落地 |
|---|---|---|
| `prompt-create` AI 帮我写 prompt | 描述场景 → AI 生成 prompt JSON → 校验入库 | `POST /prompts`（mapping name/text/tags） |

声明在 `index.ts` 的 `ai.helpers`，由 ai-helper 主动聚合（无需注册）。
