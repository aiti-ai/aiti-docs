---
title: aiti-ai-schedule
icon: 🗓️
ext:
  id: aiti-ai-schedule
  name: aiti-ai-schedule
  description: pi-web 常驻调度器 —— 扩展声明式定时任务 + AI 计划（cron/间隔/一次性）+ 三模式执行引擎 + AI 自建计划工具 + 管理页
  soul: 别再每个扩展自造 setInterval 了——声明即调度，AI 也能自己排班。
  type: dev-repo
  category: 系统工具
  version: 0.3.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 内置于 pi-web 扩展目录，随 pi-web 启动；门控见下方「门控与部署」
  license: MIT
  tags: [scheduler, cron, interval, ai-plan, declarative]
---

# aiti-ai-schedule

> ❝ **别再每个扩展自造 setInterval 了——声明即调度，AI 也能自己排班。** ❝

pi-web 常驻调度器：**7×24 与会话死活无关**。两类任务统一进同一内核：

1. **扩展 hook 任务（§2.5 机制）**：其他扩展在入口 `export default` 加顶层 `schedules: [{ id, name, intervalSec, enabled, run(ctx) }]`，本扩展聚合注册、到点调用——接入方零定时器。
2. **AI 计划（plans.json）**：用户在 ⏰调度 页新建，或 agent 经 `schedule_task` 工具自建；到点由执行引擎按三模式驱动 AI 完成。

- 设计全文：`docs/aiti-ai-schedule-真正方案.md`

## 能力一览（v0.3）

| 能力 | 说明 |
|---|---|
| 调度 | cron 表达式（5/6 段，`0 9 * * *`）、间隔（`30m`/`90s`）、一次性（`+30m` / ISO 时间） |
| 水位持久化 | state.json 记 `nextRunAt`；停机宽限内（默认 5min）补跑、超宽限记 missed |
| 执行三模式 | `session` 注入活会话 steer · 一次性全功能会话（工具/文件可用）· `invokeAI` 轻量问答；`auto` 自动降级 |
| 安全网 | 并发上限 2 · 单次超时 10min · 失败重试 1 次（60s 后）· once/maxRuns 到量自停 |
| AI 自建计划 | `schedule_task` 工具（add/list/get/update/enable/disable/remove/run-now），agent 创建默认待确认 |
| 管理页 | ⏰调度 页：列表/新建编辑/启停/批准/立即执行/删除/运行历史/SSE 实时刷新/浏览器通知 |

## 门控与部署（防双实例双触发）

```bash
# prod（跑调度）：systemd drop-in 已置 —— 下次重启自然生效
#   /etc/systemd/system/pi-web.service.d/ai-schedule.conf
#   Environment=AITI_AI_SCHEDULE_ENABLED=1
# dev（不跑调度）：不设 env = off（UI/API 照常可看可管）
```

| 变量 | 含义 |
|---|---|
| `AITI_AI_SCHEDULE_ENABLED` | 未设 = 不自动触发（宁可手动开）；运行时还可用 config `{enabled:false}` 暂停 |
| `AITI_AI_SCHEDULE_DATA_DIR` | 覆盖存储目录（默认 `~/.pi/web/data/aiti-ai-schedule/`） |
| `AITI_AI_SCHEDULE_API_ORIGIN` | 一次性会话自调地址（默认 `http://127.0.0.1:$PORT`） |
| `AITI_AI_SCHEDULE_CATCHUP_GRACE_SEC` | 补跑宽限秒数（默认 300） |

## 存储

```
<dir>/plans.json    # AI 计划快照（原子写）
<dir>/state.json    # 水位表（崩溃后凭此补跑/记 missed）
<dir>/runs.jsonl    # 运行历史（append-only，启动截断保留最近 500 条）
```

## 其他扩展接入（hook 任务）

```ts
export default {
  id: "my-ext",
  schedules: [
    { id: "my-job", name: "我的任务", intervalSec: 3600, enabled: true,
      run: async (ctx) => { /* ctx = { dataDir, extId, scheduleId } */ } },
  ],
}
```

首个接入方 [aiti-configs](./aiti-configs.md)：崩溃哨兵（60s）/ 滞留提醒（1h）/ 兜底 commit（24h）。

## API 速查

`/api/extensions/aiti-ai-schedule/…`
`GET plans` · `POST plans` · `PUT plans/:id` · `DELETE plans/:id` · `POST plans/:id/run|enable|disable|approve`
`GET schedules` · `POST schedules/:id/run` · `GET runs?limit=` · `GET events`(SSE) · `GET|POST config`

## 文件结构

```
dev-repo/aiti-ai-schedule/
├─ index.ts              # 入口装配（api / agent 钩子 / schedule_task 工具）
├─ sched/cron.ts         # 零依赖 cron·interval·once 时间计算
├─ sched/store.ts        # plans/state/runs 持久化
├─ sched/engine.ts       # 调度内核 + 执行引擎
├─ client/*.mjs          # ⏰调度 管理页（零构建 hyperscript）
└─ tools/deploy.mjs      # 双实例部署
```
