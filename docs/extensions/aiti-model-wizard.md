---
title: 模型添加向导（aiti-model-wizard）
icon: 🧙
ext:
  id: aiti-model-wizard
  name: 模型添加向导
  description: 引导添加 AI 提供商/模型：目录搜索（models.dev + 国内 AI 目录，中英文，贴 API 地址也能反向搜到）→ 填 token → 测试（2xx/429 都算通过）→ 选/输模型 → 写 models.json；找不到用 baseUrl 反向匹配（任意文档/代码片段自动提取 URL）/ 自动探测（漏 v1/v2 也能补，命中带 key 拉模型列表 + OpenAPI/模型前缀品牌信号）；编辑时 token 打码不返回前端
  soul: 地址、token、注册页——散落四方的钥匙，串成一串。
  type: dev-repo
  category: AI 能力
  version: "0.1.10"
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-model-wizard/ 后 reload
  license: MIT
  tags: [model, provider, wizard, onboarding, models.dev, catalog]
---

# aiti-model-wizard

> ❝ **地址、token、注册页——散落四方的钥匙，串成一串。** ❞

模型添加开机向导扩展：**目录驱动 + 反向匹配 + 自动探测** 三步把 AI 提供商/模型加进 models.json。

- **目录**：models.dev 全量（191 家，含 44 家国内）+ 内嵌**国内 AI 目录**（中文名 / 注册说明 / 领 token 地址 / api 类型 / 已知模型，20+ 家）
- **下载**：**justget 多源竞速**（官方 models.dev + **Gitee 镜像** `justdb-mirrors/downloads/raw/master/models-dev/api.json`，谁快用谁，失败自动切）；缓存 7 天，可一键刷新
- **搜索**：中文/英文/别名/模型 id 全匹配 → 返回 api 地址 / 注册说明 / 获取 token 地址 / 文档 / 已知模型
- **凭据**：填 token → **测试连接（2xx 或 429 都算通过**；429=key/端点正确只是限流）→ 选/输模型 → 写 models.json
- **兜底**：目录未命中 → 贴 baseUrl **反向匹配**（规范化剥 /v1 /v2 后比 host+path）→ 再未命中 **自动探测** api 类型 + 真实地址（漏 /v1 /v2 /v1beta 自动补）；**搜索框直接贴 API 地址也能反向命中**（带「🔁 地址反向命中」徽标，点开自动探测、保留原套餐地址）
- **零门槛输入**：反向/探测输入框接受任意文本/代码片段/文档（如 SDK 示例里的 `base_url='https://…'`），自动提取所有 URL 逐个穷尽匹配+探测
- **品牌识别**：探测命中后三层信号（OpenAPI `info.title` 声明 > 模型 id 前缀 > 目录 URL 匹配），显示真实品牌名；带 key 时顺手拉 /models 模型列表直接勾选
- **安全**：token **只进不出**，任何读取都打码（`sk-***abcd`）；编辑留空=保留原 key
- **apiKey 三形态**：字面量 / 环境变量名（全大写）/ `!shell命令`（取 stdout）——测试连接、探测、拉模型统一解析；models.json 存原始值由 pi 运行时解析
- **元数据六源反填**：已配置条目 → 内置目录 → 厂商 /models 富字段 → models.dev → OpenRouter/LiteLLM 兕底 → **跨提供商同 id 互证**（本目录缺新模型时借其它网关同 id/命名变体条目，字段取共识多数派；cost 仅全部一致才带）；保存反馈展示逐字段来源「🪄 自动反填：…」
- **maxTokens 实测校正（probe-cap）**：新保存的模型逐个发最小探针验证输出上限，虚报被拒解析报错自动下调并回写（ark-coding glm 修正表）；模型行 ⏳/✓↓/! 徽标
- **三层临时禁用（2026-09）**：provider `/enable`、模型 `/model-enable`、key `enabled` 三级——向导 UI 禁用/启用按钮；core 透传/同步（apiKey 切到首个启用 key；combo 保存保留成员禁用态、全禁拒绝）。联动 pi-models-combo（provider 级不建代理、key 级不入轮转、模型级隐藏/组合成员跳过）
- **状态面板事件驱动**：「聚合/多 key 运行状态」横幅走 `mc:avail` 帧直供数据（[aiti-model-check](aiti-model-check.md)），后台不拉取；`/proxy-status` 补报未构建 combo（成员解析探测：能出槽位=懒建待激活、0 槽=configError 标修复）
- **成员承接类别（types，2026-09）**：组合成员按**模型能力**自动给出可勾选的承接类别（文本必选勾、图形仅当模型 input 含 image 时出现，**没有的能力不显示、不可勾**；默认可用的全部勾上 = 承接全部，与不限定等价）——取消「图形」= 该成员只接纯文本，带图请求自动绕开；**图形专用成员**（只勾图形）只接带图请求、纯文本请求不发给它。可在「🧩 模型聚合」编辑器按成员勾选，也可经 `model_wizard_combo_save` 工具写 `types: ["vision"]` 等（其他媒体类别音频/视频/PDF 不在 UI 出现，手写/工具仍支持）。引擎侧按请求内容分类（openai/anthropic/google 三协议）路由
- **多 key 等间距节流（minIntervalMs，v0.4 起承接）**：每把 key 除 rpm 上限外可设「间隔ms」输入框——留空=auto（按 rpm 折算 60000÷rpm 匀速）、0=关闭匀速走突发滑窗、数字=固定间隔毫秒；与 rpm 同时生效取最大等待。添加流/编辑流 key 行与 `aiti_model_wizard_keys` 工具同款；「聚合/多 key 运行状态」面板按「间隔auto / 间隔2s」标注，上游 retry-after 透明展示（capped⚠=超内部封顶截断）
- **脱敏导入导出**：`GET /export` + `POST /import`（差异预览/应用）；添加流搜索并入 pi 内置 provider（原生目录未收录的家也能补齐）；🧙 左侧导航内嵌「模型检查」页签（[aiti-model-check](aiti-model-check.md) 面板直达）
- **UI 规范化 + 拆包**：功能菜单图标统一 lucide SVG；薄壳 entry 11.5K + 重 chunk 524K 按需（[懒加载契约](/guide/ext-lazy-loading.html) 路线 B）
- **一级撤销**：保存/删除前快照受影响 provider 旧条目，「↩ 撤销上次保存」一键回滚（订阅登录型豁免）
- **一键体检 + 测试留存（2026-09-17）**：左树「🩺 一键体检」逐已配置 provider 串行发真实探针（跳过聚合组/禁用/无凭据；首个启用模型作聊天探针、列表有≠可推理），报告卡逐家显示 HTTP/延迟/明细、失败行「去修」直达详情；所有手动测试（添加流/编辑流/详情「重测」/体检）结论留存 `cache/last-test.json`（key 打码），树上徽标显示最近结论+延迟（model-check 有探测聚合时让位不重复）、详情健康条「🩺 通过 · 428ms [重测]」；`/test` 超时可在设置调
- **订阅登出（2026-09-17）**：订阅页已登录卡「登出」按钮（危险确认）→ 服务端转发宿主 `/api/auth/logout/<pid>` 清 auth.json 凭据 + 失效模型缓存，全部模型立即不可用、可重登恢复；登录面板内同入口
- **余额健康条（2026-09-17）**：provider 详情健康条显示余额——消费 [aiti-provider-usage](aiti-provider-usage.md) 新增的 `aiti-provider-usage.overview` **ctx.services** 服务（TTL 5min/并发 3 归它管，向导不自行拉上游；缺席静默降级），currency/percent/count bucket 短文案 + 全量桶 title 悬浮 + 「重查」强制刷新；未装 provider-usage 时回退 aiti-model-check 余额文案
- **设置面板（2026-09-17）**：头部 ⚙ 打开 `/config` 三组可视化——新模型提醒（开关/扫描间隔/拉取超时/每日上限/toast 间隔与时长）、目录（主源/镜像 URL/TTL/立即刷新）、探测与测试（测试超时/探测超时/探针 maxTokens），保存即时生效（提醒扫描 timer 幂等重建）；`/config` 由「唯一无 UI 的 API」转正
- **参数查看/编辑弹窗**：任意位置的 👁 打开——显示名/能力勾选/contextWindow/maxTokens/cost 四项/thinkingLevelMap 七级/DeepSeek 思考兼容/developer 角色/模型级 headers/API 覆盖；纯 key 条目与 OAuth·目录型 provider 也能看（后者只读 + 「目录反填」徽标）
- **品牌图标**：@lobehub/icons 按需引入（订阅服务/浏览目录/推荐卡/已配置卡），未命中回退首字母方块

## agent 工具

```
aiti_model_wizard_status    # 已配置 providers（token 打码）
aiti_model_wizard_search    # 搜索提供商（中英文），返回 api 地址/注册说明/领 token 地址
aiti_model_wizard_provider  # 提供商详情（含已知模型）
aiti_model_wizard_detect    # baseUrl → 自动探测 api 类型 + 真实地址（漏 v1/v2 也能补）
aiti_model_wizard_test      # 测试连接（2xx/429 均算通过）
aiti_model_wizard_save      # 保存 provider+models 到 models.json（可带 keys[] 多 key / provider 级 headers；combo 组拒写走 combo_save）
aiti_model_wizard_delete    # 删除 provider
aiti_model_wizard_keys      # 多 key 管理（list/set/remove；同步 apiKey=首个 key）
aiti_model_wizard_combo_save # 创建/更新模型聚合组（成员可带 weight 权重 + types 承接类别）
```

## 新增 API（2026-09-17）

- `GET /last-test` → 各 provider 最近一次向导测试结论 `{ ts, providers: { <p>: { ts, pass, partial?, rateLimited, status, latencyMs, detail, keyName, masked, model } } }`（树上徽标/详情健康条）
- `POST /checkup` → 一键体检：串行探针全部已配置 provider（跳过聚合组/禁用/无凭据），逐家写 last-test，返回 `{ ok, total, pass, rateLimited, fail, skip, results[] }`（globalThis 单飞，进行中 409）
- `POST /oauth-logout {provider}` → 订阅登出：转发宿主 `/api/auth/logout/<pid>`（宿主清 auth.json + invalidateModelsCache；未登录/未知 provider 回宿主错误）
- `GET /usage?provider=X&force=1` → 余额：软依赖 `aiti-provider-usage.overview` 服务，`{ ok, available, capturedAt?, entry? }`；`available:false` = provider-usage 未装（UI 降级）

## 🧙 面板

- **添加**：搜索 → 提供商详情（api/注册/领 token/已知模型）→ 填 token 测试 → 勾选模型 → 保存
- **自定义**：贴 baseUrl / 文档片段 / 代码示例 → 反向匹配候选 / 自动探测（品牌 + 模型列表 + 一键回填）→ 同凭据/测试/选模型/保存
- **已配置**：列表（token 打码）→ 改 token（留空保留）/ 删除
- **新模型检测与提醒**：后台扫描（启动 +3s 与每 30min，拉取有 key 的 provider /models，8s 超时静默失败）存两份快照（`dataDir/reminder.json`：`prev`=前日基线、`curr`=今日可用）；**新模型 = (今日 − 前日) − 已配置**，跨天自动推进 prev，首次运行只建基线不提醒。发现新增后：① 页面顶部 10s 绿色 toast（**点击 → 打开向导「已配置」页**）② provider 卡片显示「✨ 新增 N」徽标 ③ 编辑流「刷新可选模型」自动**预勾选**新模型（带「新」标，点保存即一键启用）
- toast 频控（服务端持久化裁决，`GET /new-models?toast=1` 才消费额度）：每天 ≤ 3 次、相邻间隔 ≥ 2h；超限静默（徽标/预勾选仍可用，不影响）
- 无模型时自动顶部 banner 引导

## 🧩 模型聚合（组合模型）

把多个真实模型组成**一个虚拟模型**暴露给 pi（由 [pi-models-combo](https://github.com/aiti-ai/pi-models-combo) 引擎接管路由）。「模型聚合」页签：聚合组列表卡（成员构成徽标 + 权重标注 + 聚合组级/虚拟模型/成员三层的临时禁用）＋ 组合编辑器：

- **成员选择**：搜索已配置 provider×model（含运行时注册 provider 如 freeflow）点选入组，重复引用去重；同协议才能同组、聚合组不能嵌套作成员、contextWindow/maxTokens 取最小值、input 取并集、cost 取最贵估算
- **权重（weight）**：每成员权重框（默认 10）——按权重占比随机选点（成员级语义，多 key 不放大）
- **承接类别（types）**：每成员「承接」chips——**按模型能力过滤**：文本恒可勾（基础类别）；**图形仅在模型支持图片输入时出现**（没声明的能力不显示也不可勾，**不允许误配**）；默认可用的全部勾上 = 承接全部（等价不写字段，将来新增类别自动承接）。取消「图形」= 仅文本（带图绕开）；纯文本模型取消后文本 chip🔒 锁定（无其他类别可承接）。**图形专用成员**：取消文本 chip → 只勾图形，带图请求自动路由到它、纯文本请求不发给它；仅文本成员（有图形能力但取消图形）→ 带图/媒体请求避开它。其他媒体（音频/视频/PDF）不进 UI，手写配置/工具仍支持。引擎按请求体内容分类路由（openai `image_url`/`input_audio`、anthropic `image`/`document`、google `inline_data`/`file_data` mime）
- **粘性空闲 TTL**（分钟，默认 15）：同会话 TTL 内固定同一成员，最大化 prompt cache；429 冷却自动切换
- **误配警告分级**：🔴 阻止（空的/全禁成员、跨协议、失效引用）🟡 确认级（上下文悬殊、输出差异>20%、能力不一致、**无成员承接纯文本请求**）🟢 提示（全部成员无 vision）。UI 按能力过滤勾选项 → 勾选层不会产生能力误配；手写配置的错配（如无 vision 模型配 types 含 vision）由引擎 warn 防御
- **保存**：写入 models.json 的 `combo:true` 虚拟 provider（占位 baseUrl 运行时被引擎 override），保存后自动刷新运行中代理槽位 + 广播模型变更（新会话 dropdown 立即出现聚合模型）；「↩ 撤销上次保存」可用
- models.json 手写示例：成员引用可带 `weight` 与 `types`（缺省 = 全收）——详见 pi-models-combo 仓库 README

## 新模型检测 API

- `GET /new-models` → `{ ok, scanning, total, providers: { <p>: { count, newModels[] } }, baseline, toast? }`（徽标/总览用，不消费 toast 额度；`baseline=false` 表示首日只建基线）
- `GET /new-models?toast=1` → 同上 + `toast`（`allowed:true` 表示消费一次额度；`false` 附 `reason: gap|daily-limit` 与 `nextAtMs`）
- `POST /new-models/refresh` → 强制立即后台重扫

## 配置 `config.json`（aiti-model-wizard dataDir）

```jsonc
{
  "modelsPath": "~/.pi/agent/models.json",
  "catalog": {
    "primaryUrl": "https://models.dev/api.json",
    "mirrorUrl": "https://gitee.com/justdb-mirrors/downloads/raw/master/models-dev/api.json",
    "ttlHours": 168
  },
  "download": { "justget": "auto", "timeoutMs": 90000 },
  "probe": { "timeoutMs": 12000, "maxTokens": 8 },
  "reminder": {
    "enabled": true,
    "checkIntervalMs": 1800000,
    "fetchTimeoutMs": 8000,
    "maxPerDay": 3,
    "minGapMs": 7200000,
    "toastMs": 10000
  }
}
```

## 维护

- 刷新目录快照 + 推 Gitee 镜像：`node tools/fetch-catalog.mjs --sync-gitee`
- 部署：`node tools/deploy.mjs` + `POST /api/extensions/reload`
