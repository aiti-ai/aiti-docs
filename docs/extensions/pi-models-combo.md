---
title: pi-models-combo（pi 模型治理插件）
icon: 🎛️
ext:
  id: pi-models-combo
  name: pi-models-combo 模型治理
  description: pi 编码代理的模型治理插件——模型列表过滤治理 + apiKeys 多 key 粘性轮转防 429 + 多 provider 聚合（combo 虚拟模型）+ 质量监控；装进 ~/.pi/agent/pi-plugins/
  soul: 模型列表不疯长、429 不打断手——过滤、轮转、聚合各司其职。
  type: pi-plugin
  category: pi 插件
  version: 0.4.13
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: "@aiti-ai/pi-models-combo"
  install: |
    # dev-repo 部署（推荐，install-plugin.mjs 处理 pi-web 内置副本）：
    node scripts/deploy-all.mjs --only combo
    # 或手动 npm 安装：
    pi install npm:@aiti-ai/pi-models-combo
  license: MIT
  tags: [pi, plugin, models, api-keys, rotation, 429, combo, provider, aggregation]
  installable: false  # pi 插件——装进 ~/.pi/agent，不进 aiti-agent/pi-web 扩展体系：extman 不列出、extensions.json 归 integrations
---

# pi-models-combo（pi 模型治理插件）

> ❝ **模型列表不疯长、429 不打断手——过滤、轮转、聚合各司其职。** ❞

pi 编码代理的模型治理插件（原 pi-models-respect）：

- **模型过滤治理**：provider/模型黑白名单，保持模型列表干净不疯长
- **apiKeys 多 key 粘性轮转**：单 provider 配多把 key，粘性会话 + 失败换 key，429 限流不再打断工作
- **多 provider 聚合**：combo 虚拟模型把多个 provider/模型聚合成一个可选项
- **质量监控**：模型质量指标观测

方案文档：`docs/pi-models-combo-models-plan.md` / `docs/pi-models-combo-builtin-and-apikeys-plan.md`（dev-repo 仓）。

## 安装

```sh
# dev-repo 一键部署（install-plugin.mjs 处理 pi-web 内置副本）：
node scripts/deploy-all.mjs --only combo
# 或 npm 直装：
pi install npm:@aiti-ai/pi-models-combo
```
