---
title: aiti-plan-review
icon: 🧐
ext:
  id: aiti-plan-review
  name: 方案评审
  description: Plan-Sandbox 采认收尾 UI——读 review.json 契约（声明 vs 其他），点选采认/回滚/销毁
  soul: 方案落地前，最后一道闸。
  type: dev-repo
  category: 系统工具
  version: 0.1.0
  status: beta
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  license: MIT
  tags: [plan, review, sandbox, lineage]
---

# aiti-plan-review

Plan-Sandbox 采认收尾 UI：方案沙箱试跑后的采认界面。

- **契约**：读 `review.json`（声明变更 vs 沙箱实际变更对照），逐项点选**采认 / 回滚 / 销毁**。
- **lineage 关联**：是 lineage closure 中「沙箱采认绕过追踪」缺口（GAP-3）的收口环节；台账行 additive `planRel`（方案绑定入行）已实施（2026-09，P1-2）。

设计文档：`dev-repo/docs/aiti-lineage-closure-plan.md`。
