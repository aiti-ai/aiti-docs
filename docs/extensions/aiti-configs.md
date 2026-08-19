---
title: aiti-configs
icon: 🛡
ext:
  id: aiti-configs
  name: 配置版本化 + 崩溃自检
  description: 配置的安全网 —— AI/人改配置、改扩展改坏了，有锅可回、有 diff 可看、一键恢复；系统崩了，命令行哨兵不依赖出问题系统本身兜底恢复
  soul: AI 敢乱改，因为身后有一整个 git 当后悔药。
  type: dev-repo
  category: AI 能力
  version: 0.1.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-configs/ 后 reload
  license: MIT
  tags: [config, versioning, git, watchdog, restore, safety]
---

# aiti-configs

> ❝ **AI 敢乱改，因为身后有一整个 git 当后悔药。** ❞
> 让 AI 放心大胆实验的安全网：每次改动都有提交、有 diff、可回滚；改崩了，命令行哨兵在系统之外把东西捞回来。

配置版本化 + 崩溃自检独立扩展（原 ai-helper 的 M4 独立化）。**不依赖 ai-helper 活着**——watchdog 是纯命令行，pi-web/桥挂掉也能跑。

- **注册制 includes（生态自动入网）**：任何扩展声明 `configs.includes` 即被版本化（启动聚合所有扩展声明 + `ai-configs.json` 手写项）
- **只收明文小配置**：session JSONL / 日志 / 二进制 / >512KB 永不入仓（硬排除 + 尺寸双保险）；敏感内容（token/key/password）扫描拦截
- **安全盾网页（🛡）**：状态（变更清单 + 提交）/ 历史（版本 + diff 预览 + 一键恢复）/ 自检报告 / 配置查看编辑
- **MCP 工具**（`aiti_configs_status/commit/restore/selfcheck/log/config`）：AI 直接用，改配置前后看 diff、改坏回滚
- **watchdog CLI**：`ai-configs status/commit/selfcheck/restore/recover/export/import`（纯 Node，零依赖）
- **恢复协议五步走（不丢数据）**：固化现场 → 打 pre-recover tag → checkout 写回源 → 复测 → 写 HEAD
- **操作前固化现场（对标 etckeeper Pre-Invoke）**：`POST /snapshot`（sync+commit+可选 tag）——**ai-helper invoke 前自动调用**，AI 改配置/扩展前先备份，改坏可回滚
- **tag 标记「好用版本」**：安全盾历史 tab 🏷 打/列/删 tag + `configs_tag` 工具 + `GET/POST/DELETE /tag` API；回滚可直接指 tag（如 `good-v1`）
- **暴露给其他扩展**：程序化 `POST /snapshot`、`POST/DELETE /tag`、`POST /commit` API + MCP 工具（status/commit/snapshot/restore/selfcheck/log/config/tag）——**其他扩展适配见 `docs/aiti-configs-integration-guide.md`（声明 configs.includes 即自动入网）**

## 配置 `ai-configs.json`（放 aiti-configs dataDir，AI 可编辑）

```jsonc
{
  "repo": "~/workspace/dev-repo/dev-repo/ai-configs",  // 配置仓（git init 一次）
  "includes": [                           // 手写项（扩展声明自动聚合）
    { "path": "~/.pi/agent/settings.json", "dest": "pi/agent/settings.json" },
    { "path": "~/.pi/agent/models.json",   "dest": "pi/agent/models.json" },
    // 系统 skills（~/.pi/agent/skills/）不纳入——不污染系统 skills
    { "path": "dev-repo/aiti-ai-created/**",  "dest": "src/ai-created/" }
  ],
  "hardExcludes": [ "**/auth.json", "**/*.key", "**/*token*", "**/sessions/**", "**/*.jsonl" ],
  "sizeLimitKB": 512
}
```

## watchdog CLI（崩溃时命令行兜底）

```bash
node <extDir>/watchdog.mjs [dataDir] status     # 同步 + 变更摘要
node <extDir>/watchdog.mjs [dataDir] commit     # 提交（conventional message）
node <extDir>/watchdog.mjs [dataDir] selfcheck  # 自检（仓/关键 JSON/扩展入口）
node <extDir>/watchdog.mjs [dataDir] restore --commit=<hash> --yes  # 五步走恢复
node <extDir>/watchdog.mjs [dataDir] recover    # 诊断包（喂给独立 AI 会话修复）
node <extDir>/watchdog.mjs [dataDir] export/import  # 迁移（不含 session）
```

> 设计全文：`dev-repo/docs/aiti-configs-extension-plan.md`（含拓展点：注册制 includes、自动哨兵、AI 智能提交、迁移包）。
