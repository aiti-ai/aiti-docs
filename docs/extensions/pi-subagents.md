---
title: pi-subagents（pi 子 agent 委派）
icon: 🕸️
ext:
  id: pi-subagents
  name: pi-subagents 子 agent 委派
  description: pi 编码代理的子 agent 委派插件（aiti fork）——单 agent 委派 + 脚本化多 agent 工作流（并行/后台/council 顾问团/saved workflow/worktree 隔离），代码评审、并行审计、实现分工的第二三双眼睛
  soul: 一双手忙不过来时，派几双专注的眼睛。
  type: pi-plugin
  category: pi 插件
  version: 0.88.0-aiti.1
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: "@aiti-ai/pi-subagents"
  install: |
    # settings.json npm 直连（发新版走 dev-repo/tools/publish-all.mjs）：
    pi install npm:@aiti-ai/pi-subagents
  license: MIT
  tags: [pi, plugin, subagents, delegation, workflow, council, parallel, fork]
  installable: false  # pi 插件——装进 ~/.pi/agent，不进 aiti-agent/pi-web 扩展体系：extman 不列出、extensions.json 归 integrations
---

# pi-subagents（pi 子 agent 委派）

> ❝ **一双手忙不过来时，派几双专注的眼睛。** ❞

pi 编码代理的子 agent 委派插件（[aiti fork](https://github.com/nicobailon/pi-subagents)——上游 nicobailon/pi-subagents 的 aiti 维护版）：

- **单 agent 委派**：`{agent, task}` 派生专注子 agent（code review / scouting / implementation）
- **并行 / 后台**：多子 agent 并行审计、后台长任务、完成唤醒主会话
- **脚本化工作流**：saved workflow + worktree 隔离 + 失败恢复
- **council 顾问团**：有界监督者中介的多顾问辩论（`/council`）

随包自带技能（council-mode / pi-subagents），pi 会话按需加载。
