---
title: aiti-ai-usage
icon: 📊
ext:
  id: aiti-ai-usage
  name: aiti-ai-usage
  description: AI token 用量统计 —— workspace/provider/model/key/时段多维报表，任意多维组合透视 + 桑基图 + CSV 导出，事件驱动零轮询，独立 SQLite 存储
  soul: 用量不是账单来了才知道——每一枚 token 都该有去向。
  type: dev-repo
  category: 系统工具
  version: 0.1.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-ai-usage/ 后 reload
  license: MIT
  tags: [usage, token, statistics, sqlite, dashboard]
---

# aiti-ai-usage

> ❝ **每一枚 token 都该有去向。** ❞

AI token 用量统计扩展：workspace / provider / model / key / 时段(0–23) / 日期多维统计，维度透视页支持任意多维组合 × 多指标（交叉热力表 / 扁平明细 / 桑基流向图三视图 + CSV 导出），Web 报表 + 月视图上卷查询，独立 SQLite（node:sqlite）存储（明细幂等 PK + 日汇总分区重算）。

**数据三路汇入（全事件驱动，零轮询）**：

1. 启动/手动 sync：增量扫描活跃会话 JSONL + session-manager `.pwarc` 归档
2. `server.agent.onAgentSession → subscribeEvent("message_end")` 实时摄入
3. pi-models-respect v0.2.1+ key 日志：fs.watch tail（含 client→sessionId 归因）

带 AI 自管理帮助点：AI 能帮用户解读用量报表、排查费用异常。

## 维度透视（matrix 端点 + 「维度」标签页）

`GET matrix?dims=a,b,c,...&days=N|day=|month=|from=&to=`（兼容旧 `dim`/`dim2`）：

- **维度池（去重后不限个数）**：`workspace`（会话 cwd）/ `provider` / `model` / `hour`（本地时区 0–23）/ `day` / `key`；dims 含 `key` → 自动切代理口径（key_req 经 client→session 归因 join sessions），否则会话口径（msg_usage join sessions）
- **每行返回全部指标列**：会话口径 `msgs/tokens/cost/input/output/cacheRead/cacheWrite/reasoning`；代理口径 `reqs/ok/err429/errOther/tokens/input/output/cacheRead/cacheWrite`
- 兜底 `LIMIT 200000` 防组合爆炸；正常多维分组远小于此

前端「维度」标签页：维度链动态增删（桑基视图连接符 `→`）；指标多选 chips + 全选；三视图——**交叉热力表**（行=前 N-1 维组合、列=最后一维 Top12+其他，hour 列补全 0–23，单值指标）/ **扁平明细表**（全维度×全指标，点列头排序，>500 行截断）/ **桑基流向图**（手写 SVG，每层 Top10+其他，hour 全 24、day ≤31 全量自然序）；发生截断时底部 `※` 小字说明；⬇ 导出 CSV（全量行、BOM+转义）。

排序规则：hour 按数值 0→23、day 按日期升序（自然序）；workspace/provider/model/key 等类别维度按指标值降序。

时间范围：预设（今天/近7天/近30天/本月/全部）+ 自定义起止（`from`/`to`，YYYY-MM-DD 含端，可只给一端；跨度 >60 天趋势自动切月粒度）。
