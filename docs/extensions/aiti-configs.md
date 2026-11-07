---
title: 配置版本化 + 崩溃自检（aiti-configs）
icon: 🛡
ext:
  id: aiti-configs
  name: 配置版本化 + 崩溃自检
  description: 配置的安全网 —— AI/人改配置、改扩展改坏了，有锅可回、有 diff 可看、一键恢复；系统崩了，命令行哨兵不依赖出问题系统本身兜底恢复
  soul: AI 敢乱改，因为身后有一整个 git 当后悔药。
  type: dev-repo
  category: AI 能力
  version: "0.1.7"
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
- **只收明文小配置（黑名单制）**：默认全收（includes 面），仅排除可重建物/运行时/下载物（分层兜底 excludes + 尺寸闸）；敏感两道闸——非加密文件命中 token/key/password 正则直接拦截，**protected 涉密名单（auth.json/token/key/pem…）加密或阻断、绝不排除**（auth.json 不再被丢）
- **远端同步**：`remote.url`+push → commit 后 pull --rebase → push（冲突写 sentry.jsonl，URL 脱敏展示）
- **密文 commit**：AES-256-GCM git filter——工作区明文/对象库密文（确定性 IV=HMAC(key,明文)），密钥 `{repo}/.git/configs-key`（600，永不入仓），`configs_key generate` 生成
- **定时任务三件**（注册给 aiti-ai-schedule，不自建 setInterval）：configs-sentry 60s 哨兵指纹 / configs-stale-warn 1h 滞留提醒 / configs-auto-commit 24h 兜底提交
- **安全盾网页（🛡）**：状态（变更清单 + 提交）/ 历史（版本 + diff 预览 + 一键恢复）/ 自检报告 / 配置查看编辑
- **MCP 工具**（10 个，整组 feature `agentTools.enabled` **默认关**——helper 🤖 临时启用或 extman 开）：`aiti_configs_status/commit/restore/selfcheck/log/config/snapshot/tag/key/scan`——AI 直接用，改配置前后看 diff、改坏回滚；`configs_scan` 预扫描 + 自动 .gitignore + 清孤儿副本
- **watchdog CLI**：`ai-configs status/commit/selfcheck/restore/recover/log/keygen/export/import`（纯 Node，零依赖）
- **恢复协议五步走（不丢数据）**：固化现场 → 打 pre-recover tag → checkout 写回源 → 复测 → 写 HEAD
- **操作前固化现场（对标 etckeeper Pre-Invoke）**：`POST /snapshot`（sync+commit+可选 tag）——**ai-helper invoke 前自动调用**，AI 改配置/扩展前先备份，改坏可回滚
- **tag 标记「好用版本」**：安全盾历史 tab 🏷 打/列/删 tag + `configs_tag` 工具 + `GET/POST/DELETE /tag` API；回滚可直接指 tag（如 `good-v1`）
- **暴露给其他扩展**：程序化 `POST /snapshot`、`POST/DELETE /tag`、`POST /commit` API + MCP 工具（status/commit/snapshot/restore/selfcheck/log/config/tag）——**其他扩展适配：声明 configs.includes 即自动入网（详见内部接入指南）**

## 配置 `ai-configs.json`（2026-09 搬仓重构后位于 `~/.pi/configs-self/`，AI 可编辑）

> 自身配置独立于扩展 dataDir（防 dataDir 被清连配置一起丢），并经 configs-self include 进备份面。
> 旧位置（aiti-configs dataDir）的配置会在首次加载时一次性自动迁入，无需手工处理。

```jsonc
{
  "repo": "~/.pi/configs",                // 配置仓路径（搬仓重构默认；旧仓归档 ~/.pi/configs-archive-*）
  "includes": [                           // 手写项（扩展声明自动聚合；首装默认模板为黑名单制目录通配）
    { "path": "~/.pi/agent/**",      "dest": "pi/agent/" },
    { "path": "~/.pi/web/**",        "dest": "web/" },
    { "path": "dev-repo/aiti-ai-created/**", "dest": "src/ai-created/" },
    { "path": "~/.pi/configs-self/**", "dest": "self/" }   // 自身配置防自丢
  ],
  "hardExcludes": [ "**/.git/**", "**/.aiti-trace/**" ],      // 仅仓元数据
  "protected": [ "**/auth.json", "**/*token*", "**/*.key", "**/*.pem" ],  // 加密或阻断，绝不排除
  "sizeLimitKB": 2048
}
```

**数据分层（2026-09）**：web/data 拆三层 `ctx.configDir`（配置区，本扩展备份范围）/ `ctx.stateDir`（不可再生数据，排除出备份）/ `ctx.cacheDir`（`<configDir>/cache/`，可删重建，排除）；
`ctx.dataDir` 已移除（访问即抛）。分层兜底 excludes（`**/cache/**`、`**/state/**` 等）内置于默认配置。
state 类大数据（归档/历史）的备份由独立的 **aiti-backup** 扩展承接（规划中，快照+硬链接+保留轮转）——本扩展只负责配置/小数据版本化。
详见 [扩展数据与存储规范](/guide/ext-data.md) 与 authoring-reference §2.1/§2.2。

**体积自防御**：`selfcheck` 含仓体积检查（工作区 >100M / .git >300M 报 bad）；`snapshot` 单次同步量 >50M（`snapshotGateMB` 可调）拒绝并提示查 excludes，`force:true` 豁免一次。

## watchdog CLI（崩溃时命令行兜底）

```bash
node <extDir>/watchdog.mjs [dataDir] status     # 同步 + 变更摘要
node <extDir>/watchdog.mjs [dataDir] commit     # 提交（conventional message）
node <extDir>/watchdog.mjs [dataDir] selfcheck  # 自检（仓/关键 JSON/扩展入口）
node <extDir>/watchdog.mjs [dataDir] restore --commit=<hash> --yes  # 五步走恢复
node <extDir>/watchdog.mjs [dataDir] recover    # 诊断包（喂给独立 AI 会话修复）
node <extDir>/watchdog.mjs [dataDir] export/import  # 迁移（不含 session）
```

> 设计全文：内部方案文档（含拓展点：注册制 includes、自动哨兵、AI 智能提交、迁移包）。
