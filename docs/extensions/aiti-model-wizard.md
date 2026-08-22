---
title: aiti-model-wizard
icon: 🧙
ext:
  id: aiti-model-wizard
  name: 模型添加向导
  description: 引导添加 AI 提供商/模型：目录搜索（models.dev + 国内 AI 目录，中英文，贴 API 地址也能反向搜到）→ 填 token → 测试（2xx/429 都算通过）→ 选/输模型 → 写 models.json；找不到用 baseUrl 反向匹配（任意文档/代码片段自动提取 URL）/ 自动探测（漏 v1/v2 也能补，命中带 key 拉模型列表 + OpenAPI/模型前缀品牌信号）；编辑时 token 打码不返回前端
  soul: 开机配模型不用再满世界找 api 地址、注册说明、领 token 的链接 —— 一个向导全搞定。
  type: dev-repo
  category: AI 能力
  version: 0.1.0
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

> ❝ **开机配模型不用再满世界找 api 地址、注册说明、领 token 的链接 —— 一个向导全搞定。** ❞

模型添加开机向导扩展：**目录驱动 + 反向匹配 + 自动探测** 三步把 AI 提供商/模型加进 models.json。

- **目录**：models.dev 全量（191 家，含 44 家国内）+ 内嵌**国内 AI 目录**（中文名 / 注册说明 / 领 token 地址 / api 类型 / 已知模型，20+ 家）
- **下载**：**justget 多源竞速**（官方 models.dev + **Gitee 镜像** `justdb-mirrors/downloads/raw/master/models-dev/api.json`，谁快用谁，失败自动切）；缓存 7 天，可一键刷新
- **搜索**：中文/英文/别名/模型 id 全匹配 → 返回 api 地址 / 注册说明 / 获取 token 地址 / 文档 / 已知模型
- **凭据**：填 token → **测试连接（2xx 或 429 都算通过**；429=key/端点正确只是限流）→ 选/输模型 → 写 models.json
- **兜底**：目录未命中 → 贴 baseUrl **反向匹配**（规范化剥 /v1 /v2 后比 host+path）→ 再未命中 **自动探测** api 类型 + 真实地址（漏 /v1 /v2 /v1beta 自动补）；**搜索框直接贴 API 地址也能反向命中**（带「🔁 地址反向命中」徽标，点开自动探测、保留原套餐地址）
- **零门槛输入**：反向/探测输入框接受任意文本/代码片段/文档（如 SDK 示例里的 `base_url='https://…'`），自动提取所有 URL 逐个穷尽匹配+探测
- **品牌识别**：探测命中后三层信号（OpenAPI `info.title` 声明 > 模型 id 前缀 > 目录 URL 匹配），显示真实品牌名；带 key 时顺手拉 /models 模型列表直接勾选
- **安全**：token **只进不出**，任何读取都打码（`sk-***abcd`）；编辑留空=保留原 key

## agent 工具

```
aiti_model_wizard_status    # 已配置 providers（token 打码）
aiti_model_wizard_search    # 搜索提供商（中英文），返回 api 地址/注册说明/领 token 地址
aiti_model_wizard_provider  # 提供商详情（含已知模型）
aiti_model_wizard_detect    # baseUrl → 自动探测 api 类型 + 真实地址（漏 v1/v2 也能补）
aiti_model_wizard_test      # 测试连接（2xx/429 均算通过）
aiti_model_wizard_save      # 保存 provider+models 到 models.json
aiti_model_wizard_delete    # 删除 provider
```

## 🧙 面板

- **添加**：搜索 → 提供商详情（api/注册/领 token/已知模型）→ 填 token 测试 → 勾选模型 → 保存
- **自定义**：贴 baseUrl / 文档片段 / 代码示例 → 反向匹配候选 / 自动探测（品牌 + 模型列表 + 一键回填）→ 同凭据/测试/选模型/保存
- **已配置**：列表（token 打码）→ 改 token（留空保留）/ 删除
- **新模型检测与提醒**：后台扫描（启动 +3s 与每 30min，拉取有 key 的 provider /models，8s 超时静默失败）存两份快照（`dataDir/reminder.json`：`prev`=前日基线、`curr`=今日可用）；**新模型 = (今日 − 前日) − 已配置**，跨天自动推进 prev，首次运行只建基线不提醒。发现新增后：① 页面顶部 10s 绿色 toast（**点击 → 打开向导「已配置」页**）② provider 卡片显示「✨ 新增 N」徽标 ③ 编辑流「刷新可选模型」自动**预勾选**新模型（带「新」标，点保存即一键启用）
- toast 频控（服务端持久化裁决，`GET /new-models?toast=1` 才消费额度）：每天 ≤ 3 次、相邻间隔 ≥ 2h；超限静默（徽标/预勾选仍可用，不影响）
- 无模型时自动顶部 banner 引导

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
