---
title: aiti-git-trace
icon: 📜
ext:
  id: aiti-git-trace
  name: AI 变更追踪
  description: 编外 AI 变更追踪——.git/aiti 独立追踪仓 + op 编号 before/after 双 commit + 文件⇄消息⇄操作全链路 + 回撤
  soul: AI 改过的每一行都有账。
  type: dev-repo
  category: 系统工具
  version: 0.2.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  license: MIT
  tags: [git, trace, lineage, rollback]
---

# aiti-git-trace

编外 AI 变更追踪：`.git/aiti` 独立追踪仓（依赖 `.git` 存在，无 git 只提醒不建仓），op 编号 before/after 双 commit，文件⇄消息⇄操作全链路可溯。

- **关注路径模型**：cwd 外=关注路径（workspace 级配置 + session 识别，autoDiscover 可关）；只追 git 仓。
- **双端**：pi 扩展（tool_call 拦截生产 op）+ pi-web 扩展（UI/API，元数据存 dataDir）。
- **时间线双视图**：按消息 / 按文件（文件触达史 + 文件级区间评审，只认 before→after 增量）；`trace open` 支持 files 过滤。
- **回撤**：forkGate 三选项；git-review 内一键部分回滚（文件/行级，写路径收敛到本扩展）。
- **服务出口** `aiti-git-trace.trace`：readOps/sessionStores/watchPaths/listMd 拉取面 + onOp 事件面 / SSE `/events`——消费方 aiti-plan-first（方案文档绑定提醒）、aiti-msg-smart、aiti-doc-center。契约 §16.3/§16.5 见方案文档。
- **known issue**：多 session 共享 worktree 并行污染（per-session index 只隔离 staged）——诊断档案 `docs/todo-git-trace-shared-worktree-pollution.md`。

方案文档：`dev-repo/docs/aiti-git-trace-plan.md`。
