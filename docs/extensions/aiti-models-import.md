---
title: aiti-models-import
icon: 📥
ext:
  id: aiti-models-import
  name: 模型配置导入
  description: 其他 agent models 配置导入——扫描 codex/ZCode/OpenCode 的 provider·模型配置成草稿，首启弹窗一次性引导导入；落盘一律经 aiti-model-wizard saveBatch（可一步撤销），绝不直写 models.json
  soul: 不抄配置，只搬家。
  type: dev-repo
  category: AI 能力
  version: "0.1.9"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: "@aiti-ai/aiti-models-import"
  install: |
    node dev-repo/aiti-models-import/tools/deploy.mjs   # vite 构建 + 双实例部署 + reconcile + reload
  license: MIT
  tags: [models, import, migration, codex, zcode, opencode, onboarding, wizard]
---

# aiti-models-import · 模型配置导入

> ❝ **不抄配置，只搬家。** ❞

把本机其他 coding agent 的 provider·模型配置扫描成草稿，首启弹窗一次性引导导入 pi 的 models.json。key 明文全程不出 server、变更靠源级指纹检测、保存全走 🧙 aiti-model-wizard 链路。

## 来源适配器

- **codex**：`~/.codex/config.toml`（smol-toml 解析）——`[model_providers.*]` → wire_api 映射（chat→openai-completions / responses→openai-responses）；顶层 `model+model_provider` 作默认模型；auth.json OAuth 不导，key 走 `apiKeyEnv` + 警告
- **zcode**：`~/.zcode/v2/config.json` 顶层 provider 段——剥 `builtin:` 前缀、`*-start-plan` 通道彻底排除、coding-plan-cache 按套餐授权过滤；key 在桌面端 credentials.json 加密 → 草稿不带 key
- **opencode**：`~/.config/opencode/opencode.json` 多文件 merge + `auth.json`（api key）；npm SDK 包名映射协议，models 空则导骨架 + 提示
- **不可导入灰显**：cursor（登录态加密）、qoder（凭据 WASM 加密）——诚实标注原因

## 机制

- **首启自动弹**：`GET /status`（只看文件存在性，零轮询）判定 firstRun 且存在可用来源才弹；关过/导过不再弹
- **`GET /scan`**：逐源扫描 → 规整 → 源级 sha256 指纹（剔除 key 明文，含 hasKey 语义）→ 状态机 `available-new / changed / unchanged / source-gone` + 合并/覆盖冲突检测；草稿脱 key 输出（keyHint 只露末 4 位），模型清单带预览元数据（上下文/输出/推理/新增|已有）
- **`POST /import`**：勾选去重 → 逐源**新鲜重扫**（不用 /scan 缓存）→ `keepKey:true`（同名 provider 已有 key 不被清）→ `aiti-model-wizard.saveBatch` 服务落盘 → 逐条结果回填标记（失败条目不进标记；全失败不算完成，首启还会再弹）
- 存储 `<stateDir>/import-state.json`（0600 原子写）；导入成功广播 `pi-web:models-changed` 让模型选择器即时刷新

## 依赖

- 硬依赖 `aiti-model-wizard.saveBatch`（批前 stashUndo 一步回整批 / 缺席 `/import` 返回 503 提示升级向导）；软依赖 aiti-quickstart（引导卡探测 `aiti-models-import.open` 服务零重实现打开本弹窗）
- npm `smol-toml` 经 extman reconcile 装进共享根，缺失时 codex 适配器降级不炸

## 来源

计划中的 M2 源（openclaw / claude 档案等）未实施。
