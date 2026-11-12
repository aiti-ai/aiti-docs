---
title: aiti-plan-review
icon: 🧐
ext:
  id: aiti-plan-review
  name: 方案评审
  description: Plan-Sandbox 采认收尾 UI——读 review.json 契约（声明 vs 其他），采认选中并关闭沙箱 / 仅保存（保留沙箱）/ 全部丢弃 + 沙箱历史（重新提取/重用/销毁）
  soul: 方案落地前，最后一道闸。
  type: dev-repo
  category: 系统工具
  version: "0.1.7"
  status: beta
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  license: MIT
  tags: [plan, review, sandbox, lineage]
---

# aiti-plan-review

Plan-Sandbox 采认收尾 UI：方案沙箱试跑后的采认界面。服务端 API 13 条：list / status / start / new-plan / end / preview / settle / extract / reuse / history / file / apply / discard。

- **契约**：读 `review.json`（声明变更 vs 沙箱实际变更对照），逐项**采认选中并关闭沙箱 / 仅保存（保留沙箱）/ 全部丢弃 + 沙箱历史（重新提取/重用/销毁）**。
- **会话接管**：agent 工具 plan_start / sandbox_bash / declare_deliverables（+ plan_abort 失败出口），同名覆盖 read/write/edit/bash/ls/find/grep——激活后读写与命令全进隔离快照，未激活透传内置实现；feature 分「Plan 工具 / 沙箱化系统工具 / Plan UI」三组。
- **采认安全**：manifest.baseHashes 工作区漂移检测（缺键拒绝采认）+ 门禁失败整单回滚；采认/丢弃落 aiti-git-trace 台账（plan-accept / plan-discard），终态副本存 configDir cache/ 供事后追溯。
- **lineage 关联**：是 lineage closure 中「沙箱采认绕过追踪」缺口（GAP-3）的收口环节；台账行 additive `planRel`（方案绑定入行）已实施（2026-09，P1-2）。

