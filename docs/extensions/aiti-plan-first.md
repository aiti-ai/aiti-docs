---
title: 方案先行（aiti-plan-first）
icon: 📋
ext:
  id: aiti-plan-first
  name: 方案先行
  description: AI 开发先方案后动手 —— aiti-git-trace 事件感知（推-听架构零扫描）：md 变更弹绑定向导（方案命名优先）、大改未跟方案提醒、领先提醒「先做方案」、tags 闭环（front-matter 事实源 + 手工/自荐标签）、会话列表行前部 📋 绑定标
  soul: 不强制不打断，只在 md 变了和大改跑偏时轻轻提一句：先有方案，再动手。
  type: dev-repo
  category: 开发工具
  version: "0.1.7"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 依赖：aiti-git-trace ≥0.2.0（services.trace v2 事件出口；缺席自动休眠，手动绑定仍可用）
    # 部署：node dev-repo/aiti-plan-first/tools/deploy.mjs 后 POST /api/extensions/reload
    # pi 扩展 emit 需重启 pi 进程生效（终端桥接会话不触发自动提醒——见方案文档 §9）；另需
    #   aiti-prompts（slogan 提示词编辑）、aiti-doc-center（tag 词表/🧵 会话视图消费绑定标）
  license: MIT
  tags: [plan-first, git-trace, reminder, sse, workflow, tags, plan]
---

# aiti-plan-first · 方案先行

> ❝ AI 开发，先方案后动手 ❞

## 是什么

工具条「📋 方案先行」按钮 + 短非模态下拉。**推-听架构**（零轮询、常态零扫描）：

1. **绑定向导**：本轮变更出现 md（**方案命名优先**：design/plan/spec/rfc/方案/计划/设计 新生成即弹、绕过冷却）→ 问「这是本 session 的方案吗？」（可浏览全部 md 选择；skills/** 与 SKILL.md 等明显非方案排除）
2. **失联提醒**：已绑定且单轮改动 ≥ 阈值（默认 3 文件/3 op）方案未更新 → 弹提醒，一键插入「更新方案文档：@file」
3. **领先提醒**：未绑定 + 改了代码或任何非忽略文件 ≥ 1 → 弹「先做方案」（30min 独立冷却；写 skills 也算在改代码）
4. **tags 闭环**：教（prompt/插入文本自带 front-matter tags 约定，含状态 tag 方案/评审中·已实施·已过时）→ AI 写（front-matter 事实源，标签可自荐不限词表）→ 自检（status/doctags 实时读文档 + followed 触发 doc-center scan）→ 手工（绑定态下拉 tags 行：chips × 移除 / 输入回车添加写回）
5. **列表图标**：`sessionRowLeading` 行前部扩展槽（pi-web 新增通用位）——绑定会话行常驻 📋 绿标；All Sessions 面板与 doc-center 🧵 会话视图同样显示
6. **进入会话检查**（0.3.0，方案文档里程碑编号，≠ 包版本）：切会话 / 带 `?session=` 进入 → POST /check 一次性评台账——终端桥接/页面不在场错过的会话也弹绑定向导；**enter 检查评 stale** 是终端桥接会话唯一自动提醒通道（其事件过不了桥）
7. **suggest-md 路径可点击**：疑似方案文档路径在提醒中是按钮，点击 openFile 开标签页核实

## 事件链（推-听，对 git-trace 零侵入）

```
pi 扩展 appendRow 台账行 → globalThis.__aitiTraceEmit?（松耦合可选链；core §6 保留口——生产者 pi 扩展装载器在扩展 ctx 体系外）
  → aiti-git-trace sink → traceBus
     ├─ services.trace.onOp（v2 + onOp/SSE /events）  ← 本扩展进程内监听（主通道）
     ├─ GET /events（SSE）                            ← 浏览器
     └─ readOps                                      ← 跳号补洞 + 降级，非常态
```

设计要点：冷启动种子、跳号补洞、三档降级、buffer 容量、终端桥接会话边界等。

## 门控（extman 功能开关）

| feature | 缺省 | 说明 |
|---|---|---|
| plan.toolbar | 开 | 工具条按钮 |
| plan.suggestMd | 开 | md 变更绑定向导 |
| plan.leadRemind | 开 | 领先提醒（未绑定开始改代码即弹先做方案） |
| plan.staleRemind | 开 | 大改未跟提醒 |
| plan.bigFiles / plan.bigOps | 3 / 3 | 「改动很多」阈值 |
| plan.mdIgnores | 空 | 追加 md 忽略（glob） |
| plan.autoCloseSuggestSec / autoCloseStaleSec / autoCloseLeadSec | 0 / 30 / 10 | 提醒自动收起秒数（向导/失联/领先；0=常驻） |
