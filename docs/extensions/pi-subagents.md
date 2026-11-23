---
title: pi-subagents（pi 子 agent 委派）
icon: 🕸️
ext:
  id: pi-subagents
  name: pi-subagents 子 agent 委派
  description: pi 编码代理的子 agent 委派插件（aiti fork）——单 agent 委派 + 脚本化多 agent 工作流（并行/后台/council 顾问团/saved workflow/worktree 隔离），代码评审、并行审计、实现分工的第二三双眼睛
  soul: 一双手忙不过来时，派几双专注的眼睛。
  soulEn: "Many hands, one conductor."
  type: pi-plugin
  category: pi 插件
  version: 0.89.0-aiti.1
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: "@aiti-ai/pi-subagents"
  install: |
    # settings.json npm 直连（发新版走 >dev-repo/tools/publish-all.mjs）：
    pi install npm:@aiti-ai/pi-subagents
  license: MIT
  tags: [pi, plugin, subagents, delegation, workflow, council, parallel, fork]
  installable: false  # pi 插件——装进 ~/.pi/agent，不进 aiti-agent/pi-web 扩展体系：extman 不列出、extensions.json 归 integrations
---

# pi-subagents（pi 子 agent 委派）

> ❝ **一双手忙不过来时，派几双专注的眼睛。** ❞

pi 编码代理的子 agent 委派插件（[aiti fork](https://github.com/nicobailon/pi-subagents)——上游
nicobailon/pi-subagents 的 aiti 维护版，基于 v0.86.0 跟随式同步）。pi 是父会话，子 agent 是有自己
任务的专注子 pi 会话：前台子会话在父进程内流式进对话，后台子会话跑在分离 runner 进程里持续工作、
随时可查。

## 能力清单

- **单 agent 委派**：`{agent, task}` 派生专注子 agent——code review、scouting、implementation 各司其职
- **并行审计**：`{workflow:"parallel", tasks:[...]}` 多子 agent 并行（如正确性/测试/复杂度三路评审）
- **后台长任务**：detached runner 承载，完成原生唤醒主会话；`bg_wait` 供无通知场景等待
- **脚本化工作流**：`async:true` 的 ```js workflow``` 块多步依赖编排 + saved workflow + worktree 隔离
  （每子 agent 独立工作树，并发写者隔离）+ 失败恢复
- **council 顾问团**：有界监督者中介的多顾问辩论（`/council`），交叉质询建议案
- **管理面**：resume/steer/stop、runs 状态、指南体系（workflows/recommended-orchestration-pattern 等）

## 安全纪律（内建）

- **委托需授权**：复杂度本身不构成委派理由——操作员直接/间接要求才委派
- **工具激活门**：新会话先暴露 `subagents_enable` 小加载器，请求/指令授权委派后模型自调、下一轮
  才暴露完整 `subagent` schema（保 provider prompt cache；`toolActivation` 设置可改）
- **写者隔离**：一个 cwd/worktree 一个写者；并发写者须隔离
- **失败即报告**：启动/运行失败必须停下报告，绝不静默换通道

## aiti fork 的改造

- **宿主能力层**（`src/host/`）：`PI_SUBAGENTS_HOST=pi-web` 开关关闭终端载体面（fleet 视图/异步
  widget/slash 命令）——作为嵌入式引擎跑在 pi-web 里，子 agent 活动经 web 面板呈现；`pi` 默认值与
  上游行为完全一致，引擎面不受影响、上游单测双态全绿
- **引擎层纯净纪律**：`src/runs/**` 禁 import `src/tui/`（上游 engine-import-boundary 守卫同源共治）；
  唯一残留引擎→TUI 触点经 `src/host/shims/noop-widget.ts` 无操作化
- **上游回馈**：fork 通用改进持续提 PR 上游（#3182 transcript 解析下沉、#3186 async 变更证据已上游落地）
- **打包**：随包发布 TypeScript 源码，暴露稳定 `./host` 子路径供嵌入宿主

## 用法（零配置起步）

装完即可自然语言驱动，无需建 agent/写配置/学 slash 命令：

```text
Use reviewer to review this diff.
Run parallel reviewers: one for correctness, one for tests, one for unnecessary complexity.
```

pi 自行决定是否调 `subagent` 工具、用哪个 agent、如何编排。pi ≥ 1.2.0。
