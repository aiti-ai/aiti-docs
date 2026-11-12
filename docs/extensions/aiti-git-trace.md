---
title: aiti-git-trace
icon: 📜
ext:
  id: aiti-git-trace
  name: AI 变更追踪
  description: 编外 AI 变更追踪——仓根 .aiti-trace 独立追踪仓（无 git 也可 autoInit）+ op 编号 before/after 双 commit + 文件⇄消息⇄操作全链路 + 回撤 + 影子仓瘦身 compact
  soul: AI 改过的每一行都有账。
  type: dev-repo
  category: 系统工具
  version: "0.2.11"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  license: MIT
  tags: [git, trace, lineage, rollback]
---

# aiti-git-trace

编外 AI 变更追踪：仓根顶层 `.aiti-trace` 独立追踪仓（git 仓内 git init + hermetic 三件套，经 info/exclude 托管块对用户 git 隐身；**无 git 时 `trace.autoInit` 开（默认开）且非 denylist、文件预算内自动建简易追踪仓**，可关），op 编号 before/after 双 commit，文件⇄消息⇄操作全链路可溯。

- **关注路径模型**：cwd 外=关注路径（workspace 级配置 + session 识别，autoDiscover 可关）；非 git 目录 autoInit 简易仓（系统目录/超预算跳过）。
- **双端**：pi 扩展（tool_call 拦截生产 op）+ pi-web 扩展（UI/API，元数据存 dataDir）。
- **时间线多视图**：按消息 / 按文件（文件触达史 + 文件级区间评审，只认 before→after 增量）/ 变更总览（轮次过滤 + 在评审中打开完整 diff）/ 家谱；`trace open` 支持 files 过滤；行级「@ 此行到新会话（带版本）」version-mention（@ token 携 base/target 短 hash）。
- **回撤**：forkGate 三选项；git-review 内一键部分回滚（文件/行级，写路径收敛到本扩展）。
- **影子仓瘦身（compact）**：schedule 每日 + 启动 24h 限流自检（`AITI_TRACE_COMPACT_OFF` 一键停），spawn 独立子进程跑 `tools/trace-compact.mjs --all`（删 N 天前会话分支/tag/index + gc 回收 + 清无主台账，dry-run 报告制）；compact.lock 排他与写侧互等保并发安全；`compact.{enabled,days=30,maxObjectsMB=300}` 配置。
- **服务出口** `aiti-git-trace.trace`：readOps/sessionStores/watchPaths/listMd/sessions 拉取面 + onOp 事件面 / SSE `/events`——消费方 aiti-plan-first（方案文档绑定提醒）、aiti-msg-smart、aiti-doc-center（冷启动回填消费 sessions()）。契约 §16.3/§16.5 见方案文档。
- **消息级变更文件行（2026-09-17；09-18 去重深审）**：注册宿主 `assistantMessageFooter` 插槽（渲染在「改动的文件」之后），按 turn 的 assistantEntryIds 聚合台账、与宿主 writtenFiles 求差集，只补 write/edit 口径之外的变更（bash 等）；分组 turn 组内过程消息抑制（防重复）、中断轮消息级兜底；chips 点击在时间线总览按单文件过滤打开。数据面 = 模块级短 TTL 缓存共享一次 `/ops`（MessageBadge 同款）+ 挂载时拉取（非轮询）；旧宿主无此插槽 try/catch 静默降级。
- **known issue**：多 session 共享 worktree 并行污染（per-session index 只隔离 staged）。

