---
title: Git 代码审核（aiti-git-review）
icon: 👁️
ext:
  id: aiti-git-review
  name: Git 代码审核
  description: 专职审核未提交变更 —— Monaco diff 工作区（并排/合并/纯新/大纲）+ 行级标注（必须/建议/疑问）+ anchor 标志行重映射（边审边改不失效）+ 汇总终审清单 + AI 预审（aiti_review_* 工具只注入评审会话，日常零工具）
  soul: 作为人类，这是我对抗ai的最后倔犟了
  type: dev-repo
  category: 开发工具
  version: 0.1.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-git-review/ 后 reload
  license: MIT
  tags: [git, review, diff, monaco, annotation, pre-review]
---

# aiti-git-review

> ❝ **作为人类，这是我对抗ai的最后倔犟了** ❞

Git 代码审核扩展：审「未提交的全部变更」（`git diff HEAD` + untracked，git 概念对用户隐藏）。**只读 git 白名单**（status/diff/log/show/rev-parse/merge-base/ls-files/hash-object），无任何写子命令。

- **三入口上下文感知**：顶部 toolbar 👁️（repo 全部）/ 文件工具条 👁️（该文件）/ 文件夹工具条 👁️（该目录）
- **任务即一等公民**：选择器（新建·文件树勾选 + AI 预审选项 / 打开现有列表 / 删除 / 30 天空任务 GC），任务持久化 `dataDir/aiti-git-review/tasks/`
- **Monaco diff 工作区**：并排/合并/纯新/大纲四视图一键切换，F7/Shift+F7 hunk 级导航跨文件，宽度桶布局记忆，小屏三区适配
- **行级标注（人 + AI 同库）**：右键/✍ 模式/右侧流水线表单三入口；severity 必须/建议/疑问；**anchor 标志行快照 + 内容哈希漂移自动重映射**（边审边改行号不失效，找不到标 stale 保留原文）；revision 乐观锁
- **AI 预审**：`aiti_review_*` 工具（status/diff/comment/comments/comment_update/summarize）**只注入评审任务会话**（agentTools 按会话门控 + boundSessionId 持久化 + ai-prebind 懒绑定），日常会话零工具
- **汇总终审清单**：`文件#行号 [severity] comment` 长结论 + +N/-M 统计，一键发当前会话 / 开新会话 / 复制
- **重命名/二进制/untracked/无 HEAD 全兼容**：R 状态双路径 diff 保 rename 配对，binary 标记不进 diff，首个 commit 前空树基线降级
- **trace 源 + 部分回滚**：评审源接入 aiti-git-trace 台账，评审内一键部分回滚（文件/行级，写路径收敛 git-trace）
- **懒加载两段式转换**（M3批②，[懒加载契约](/guide/ext-lazy-loading.html)）；跨扩展拉起 editor/folder 首例（ensureMaterialized + 跨扩展注册时序修复）

## agent 工具（仅评审任务会话）

```
aiti_review_status           # 变更集摸底（文件+状态）
aiti_review_diff             # 结构化 diff（hunks/segments 带行号）
aiti_review_comment          # AI 直接标注（severity + 行号 + 评论）
aiti_review_comments         # 读现有标注（防重复）
aiti_review_comment_update   # 修订/标记解决
aiti_review_summarize        # 汇总终审清单
```

## ai-helper 帮助点

`skills/pre-review/SKILL.md` —— AI 预审员手册（核对真实代码、逐条标注、输出终审建议；铁律不修改代码）。

> 设计全文：内部方案文档
