---
title: pi-git-trace（AI 变更带外追踪）
icon: 🧬
ext:
  id: pi-git-trace
  name: pi-git-trace 变更追踪
  description: pi 编码代理的 AI 变更带外追踪——repo 根 .aiti-trace 独立追踪仓（无 git 也能 autoInit）+ op 编号 before/after 双提交 + 文件⇄消息⇄操作全 lineage + 回滚 + 影子仓瘦身 compact
  soul: AI 改了什么、为什么改、怎么改回去——trace 仓全记着。
  type: pi-plugin
  category: pi 插件
  version: 0.1.12
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: "@aiti-ai/pi-git-trace"
  install: |
    # settings.json 本地路径直连（改源码即生效，无需部署）：
    pi -e /path/to/pi-git-trace/src/index.ts
    # 或 npm：
    pi install npm:@aiti-ai/pi-git-trace
  license: MIT
  tags: [pi, plugin, git, trace, audit, rollback, lineage, .aiti-trace]
  installable: false  # pi 插件——装进 ~/.pi/agent，不进 aiti-agent/pi-web 扩展体系：extman 不列出、extensions.json 归 integrations
---

# pi-git-trace（AI 变更带外追踪）

> ❝ **AI 改了什么、为什么改、怎么改回去——trace 仓全记着。** ❞

pi 编码代理的 **AI 变更带外追踪**插件：AI 对文件的每次写操作都被记进一条**独立于业务 git** 的
追踪仓，事后可按操作粒度回答"谁改的、基于哪条消息、改了什么、如何还原"。

## 核心机制

- **独立追踪仓**：业务仓库根 `.aiti-trace/`——独立 git 仓（影子仓），业务分支/历史零污染；
  目录没有 git 也能 autoInit 照常工作
- **op 编号 before/after 双提交**：每次 AI 文件操作记录操作前/操作后两个提交，操作按 op 编号
  可引用、可排序、可回放
- **全 lineage**：文件 ⇄ 消息 ⇄ 操作三方血缘——某个文件被哪条 AI 消息里的哪次操作改过、
  某次操作动了哪些文件，一查到底
- **回滚**：按操作粒度还原（精确到单次 op 的 before 状态）
- **影子仓瘦身 compact**：追踪历史压缩，防止影子仓无限膨胀

## 定位

- **系统工具类**（System tools），与业务 git 审计互补：git 管"正式历史"，trace 管"AI 会话里
  发生过什么"
- aiti 源仓的 `.aiti-trace/` 目录即其产物（多机协作时可见）

## 安装

```sh
pi install npm:@aiti-ai/pi-git-trace
# 或源码路径直连（改源码即生效）：
pi -e /path/to/pi-git-trace/src/index.ts
```
