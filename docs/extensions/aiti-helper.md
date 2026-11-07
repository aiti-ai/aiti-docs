---
title: AI Helper（aiti-helper）
icon: 🤖
ext:
  id: aiti-helper
  name: AI Helper
  description: 全扩展的一句话 AI 能力入口 —— 声明式 AI 帮助点（pi skills 标准）+ 输入/结果预览/审核回填 + 流式进度总线交付 + 多轮追问 + 历史与后台任务 + 用户自定义 skills（配置版本化已独立为 aiti-configs）
  soul: AI 的工具该由 AI 自己接线、自己进化——人类的角色是掌舵，不是搬砖。
  type: dev-repo
  category: AI 能力
  version: "0.5.8"
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-helper/ 后 reload
  license: MIT
  tags: [ai, helper, generate, fill, followup, history, user-skills, lazy-loading]
---

# aiti-helper

> ❝ **AI 的工具该由 AI 自己接线、自己进化——人类的角色是掌舵，不是搬砖。** ❞
> 工具本该会飞（AI），却像一滴水圣母的眼泪——清澈、珍贵，却只能往下坠。ai-helper 就是那个「坐飞机」的通道：**扩展一句话呼唤 AI，AI 的产出落地成扩展能用的东西。**

给**所有扩展**的「一句话 AI 能力」入口。扩展只需声明帮助点 + 调一次 `invoke`，其余（AI 输入框、上下文装配、输出校验、预览审核、回填/执行）全由 ai-helper 完成。

- **声明式帮助点（pi skills 标准）**：扩展在 `index.ts` 声明 `ai: { manage, intro, skills: "skills" }`；帮助点按 **skills 目录**组织——`skills/index.json`（只列 skill 名，避免全目录扫描）+ `skills/<name>/SKILL.md`（frontmatter 承载元数据 title/placeholder/outputs/action，正文是给 AI 读的手册）。ai-helper 读 index → 各 SKILL.md frontmatter 组装；invoke 只注入一行 skill 路径，AI 用 read 工具按需阅读（不内联长 system）。输出格式支持 `json-obj`（列字段即可）与 `text`；动作支持 API 直写或 CDP 回填扩展弹窗表单
- **全局弹窗 AI 按钮**：所有扩展弹窗右上角、关闭按钮左边自动一个 🤖 按钮（框架统一注入，扩展不手写）——弹窗开着时一句话唤起 AI
- **AI 输入框 + 结果预览**：弹窗输入 → AI 会话内生成 → schema 校验 → 可编辑预览 → 用户审核后「填入并执行 / 只复制 / 重来」
- **发起方来源标注**：invoke 时把发起方报告给 AI——`发自: <pageId>（AI 主窗口/宿主页）` + `来源会话 ID: <当前 pi-web 会话 id>`（pages slot 传 selectedSession），多窗口场景 AI 知道用户从哪个窗口发起、可读对应会话历史
- **AI 主动交互**：invoke 默认提示词内置「与用户交互」——AI 可用 `aiti_user_choose`（候选项让用户选）/`aiti_user_input`/`aiti_user_confirm`/`aiti_user_pick_element` 等工具在信息不足、需选择/确认时主动向你收集，而非猜测（如「列出所有 session 让我选择」会调 choose 弹候选卡）
- **流式进度 + 结果总线交付**：进度与结果走 aiti-event-bus topics `helper-<sid>`（result 带全文直接落地；HTTP `/result` 降级为纯快照、永不持连接；3s 宽限后零产出轮发 no_result 帧——旧 long-poll 被 nginx 60s 掐断的链路已废）
- **多轮追问**：弹窗内追问输入框 → `POST /followup` 同 agent 会话 steer 续问（上下文完整延续，会话回收后自动重建续跑）
- **历史与后台任务**：invoke 历史 JSONL 落 `state/history.jsonl`（含落地标记 land）；后台执行发系统通知，重开弹窗列未结算任务（`/active`）、`/origin` 接回实时进度
- **用户自定义 skills**：🤖「AI 帮我新增/修改 skill」→ `/user-skills` CRUD（存 data 目录、owner 归属扩展，不打扩展部署产物）+ 帮助点 `skill-manage`
- **invoke 安全网**：invoke 前自动 `POST` aiti-configs `/snapshot` 固化现场（fire-and-forget，对标 etckeeper Pre-Invoke；配置版本化已 M4 独立化为 [aiti-configs](aiti-configs.md)，本扩展只留这一个接线）
- **会话级工具启用**：帮助点 owner 扩展的 aiti_* 工具只注入本次 helper 会话（enableExtTools——无 feature 写、无竞态）；建会前 `ai-prebind` 预绑资源；ownerTools 统计
- **懒加载 v2**：薄 entry 常驻（全局 🤖 按钮 + 稳定 invoke 入口即装），重 UI 弹窗首次 invoke 按需 import；发起页 boundPageId 绑定
- **自由发挥**：不选预置帮助点时直接提问，结果可为文本/代码/JSON，回填到当前输入框/剪贴板
- **AI 自管理清单**：读取各扩展 `ai` 段（自管理清单）→ 维护命令/prompt/扩展，乃至**新建一个扩展**（配合 aiti-extman）

> 工作流与设计全文：内部方案文档（含 aiti-devtools「AI 管自己」自桥接、各扩展自管理清单、进化的 AI agent 理念、版本化设计）。
>
> **其他扩展接入指南**（三步声明 skills + 集成 + 验证清单，见内部接入指南）——声明 `ai` 段 → 写 `skills/<name>/SKILL.md` → deploy 递归拷贝；含 SKILL.md 规范速查 / api+fill 输出契约 / 来源标注 / 常见坑。