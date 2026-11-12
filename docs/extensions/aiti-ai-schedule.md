---
title: aiti-ai-schedule
icon: 🗓️
ext:
  id: aiti-ai-schedule
  name: aiti-ai-schedule
  description: pi-web 常驻调度器 —— 扩展声明式定时任务 + AI 计划（cron/间隔/一次性）+ 三模式执行引擎 + AI 自建计划工具 + 管理页
  soul: 别再每个扩展自造 setInterval 了——声明即调度，AI 也能自己排班。
  type: aiti-ext
  category: 系统工具
  version: "0.4.7"
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

- 设计全文：内部方案文档

## 能力一览（v0.4）

| 能力 | 说明 |
|---|---|
| 调度 | cron 表达式（5/6 段，`0 9 * * *`）、间隔（`30m`/`90s`）、一次性（`+30m` / ISO 时间）；多调度（数组/多行，任一时点到达即执行） |
| 水位持久化 | state.json 记 `nextRunAt`；停机宽限内（默认 5min）补跑、超宽限记 missed |
| 执行三模式 | `session` 注入活会话 steer · 一次性全功能会话（工具/文件可用）· `invokeAI` 轻量问答；`auto` 自动降级 |
| 安全网 | 并发上限 2 · 单次超时 10min · 失败重试 1 次（60s 后）· once/maxRuns 到量自停 · 连续失败 3 次自动暂停 · 每日执行预算（计划级 dailyCap + 全局 config.dailyCap，手动不占额） |
| 时区 | 计划可指定 IANA 时区（cron 按该墙钟计算，DST 迭代收敛）；缺省本机 |
| 权限 | AI 创建的计划默认停用待人工批准；agent 工具无启用/批准能力；编辑不得携带启停字段 |
| AI 自建计划 | `schedule_task` 工具 action 只有 `add/list/get/update/disable/remove/run-now`（无 enable/approve——调用即报错提示去管理页批准），agent 创建默认待确认（工具默认关：extman 或 helper 帮助点开启，agentTools.enabled） |
| 管理页 | ⏰调度 页：列表/新建编辑/启停/批准/立即执行/删除/运行历史/实时刷新（帧上总线）/浏览器通知 |
| 结果送达 | ccProject+ccSessionKey 推 cc-connect 指定 IM 会话 · mailTo 经 aiti-mail 发邮件 · sendOn 控送达条件（all\|ok\|error 缺省 all）；missed 也告警（1h 节流）；备注就地补记运行记录 |

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
| `AITI_AI_SCHEDULE_DATA_DIR` | 自管数据目录（其下直接 state/），覆盖宿主三目录默认。**双实例分离预案**：dev/prod 各配独立 DATA_DIR——两实例 plans/state 天然隔离，即使将来同时开门控也不会互踩水位 |
| `PORT` | drop-in 显式设置（一次性会话自调地址兜底，不依赖 Next 内部行为） |
| `AITI_AI_SCHEDULE_API_ORIGIN` | 一次性会话自调地址（默认 `http://127.0.0.1:$PORT`） |
| `AITI_AI_SCHEDULE_CATCHUP_GRACE_SEC` | 补跑宽限秒数（默认 300） |

## 存储

```
<extRoot>/state/plans.json                # AI 计划快照（原子写）
<extRoot>/state/state.json                # 水位表（崩溃后凭此补跑/记 missed）
<extRoot>/state/runs.jsonl                # 运行历史（append-only，≥256KB 截断保留最近 500 条）
<extRoot>/config/aiti-ai-schedule.json    # 运行时启停开关
```

## 其他扩展接入（hook 任务）

```ts
export default {
  id: "my-ext",
  schedules: [
    { id: "my-job", name: "我的任务", intervalSec: 3600, enabled: true,
      run: async (ctx) => { /* ctx = { configDir, extId, scheduleId, manual } */ } },
  ],
}
```

首个接入方 [aiti-configs](./aiti-configs.md)：崩溃哨兵（60s）/ 滞留提醒（1h）/ 兜底 commit（24h）。

## API 速查

`/api/extensions/aiti-ai-schedule/…`
`GET plans` · `POST plans` · `PUT plans/:id` · `DELETE plans/:id` · `POST plans/:id/run|enable|disable|approve` · `POST plans/validate`
`GET schedules` · `POST schedules/:id/run` · `GET schedules/log` · `GET runs?limit=` · `GET|POST config`
`GET cc/projects` · `GET cc/sessions?project=`

## 文件结构

```
the internal dev repo
├─ index.ts              # 入口装配（api / agent 钩子 / schedule_task 工具）
├─ sched/cron.ts         # 零依赖 cron·interval·once 时间计算
├─ sched/store.ts        # plans/state/runs 持久化
├─ sched/engine.ts       # 调度内核 + 执行引擎
├─ sched/outbound.ts     # 结果送达（cc-connect + aiti-mail）
├─ client/src/*.tsx      # ⏰调度 管理页（vite 构建）
└─ tools/deploy.mjs      # 双实例部署
```
