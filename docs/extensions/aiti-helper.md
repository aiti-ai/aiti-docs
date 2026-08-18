---
title: aiti-helper
icon: 🤖
ext:
  id: aiti-helper
  name: AI Helper
  description: 扩展的一句话 AI 能力 —— 声明式 AI 帮助点 + 输入/结果预览/审核回填 + 配置版本化
  soul: ai 工具不 ai，有如水滴圣母的眼泪做坐飞机。工具该会飞。
  type: dev-repo
  category: AI 能力
  version: 0.1.0
  status: experimental
  author: aiti-ai
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-helper/ 后 reload
  license: MIT
  tags: [ai, helper, generate, fill, versioning]
---

# aiti-helper

> ❝ **ai 工具不 ai，有如水滴圣母的眼泪做坐飞机。** ❞
> 工具本该会飞（AI），却像一滴水圣母的眼泪——清澈、珍贵，却只能往下坠。ai-helper 就是那个「坐飞机」的通道：**扩展一句话呼唤 AI，AI 的产出落地成扩展能用的东西。**

给**所有扩展**的「一句话 AI 能力」入口。扩展只需声明帮助点 + 调一次 `invoke`，其余（AI 输入框、上下文装配、输出校验、预览审核、回填/执行）全由 ai-helper 完成。

- **声明式帮助点**：扩展在 `ai.helpers[]` 声明输入/输出/动作——输出格式支持完整 jsonschema 或简化版 `json-obj`（列字段即可）与 `text`；动作支持 API 直写或 CDP 回填扩展弹窗表单
- **全局弹窗 AI 按钮**：所有扩展弹窗右上角、关闭按钮左边自动一个 🤖 按钮（框架统一注入，扩展不手写）——弹窗开着时一句话唤起 AI
- **AI 输入框 + 结果预览**：弹窗输入 → AI 会话内生成 → schema 校验 → 可编辑预览 → 用户审核后「填入并执行 / 只复制 / 重来」
- **会话观察小窗**：扩展弹窗开着时，悬浮小窗实时显示当前 session 消息流（对话 + 工具调用滚动输出），可拖拽/折叠——掌握 session 全进程
- **自由发挥**：不选预置帮助点时直接提问，结果可为文本/代码/JSON，回填到当前输入框/剪贴板
- **AI 自管理清单**：读取各扩展 `ai` 段（自管理清单）→ 维护命令/prompt/扩展，乃至**新建一个扩展**（配合 aiti-extman）
- **配置版本化（安全网）**：`configs_status` / `configs_commit` / `configs_restore` 把 ai 扩展与 pi 核心明文配置入 git——AI 改坏可回滚；**session 等巨大文件永不入仓**（硬排除 + 大小双拦截）；**崩溃自检恢复**：`ai-configs selfcheck/recover` 后台拉起 AI（带版本提示词）协助修复 + 🛡 安全盾：用户点选历史版本恢复，恢复不丢数据（先 commit+tag 再恢复，验证 OK 才写 HEAD），命令 + 网页双入口

> 工作流与设计全文：`dev-repo/docs/aiti-ai-helper-plan.md`（含 aiti-devtools「AI 管自己」自桥接、各扩展自管理清单、进化的 AI agent 理念、版本化设计）。