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
  version: 0.1.8
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: "@aiti-ai/pi-git-trace"
  install: |
    # settings.json 本地路径直连（改源码即生效，无需部署）：
    pi -e ~/workspace/dev-repo/pi-git-trace/src/index.ts
    # 或 npm：
    pi install npm:@aiti-ai/pi-git-trace
  license: MIT
  tags: [pi, plugin, git, trace, audit, rollback, lineage, .aiti-trace]
  installable: false  # pi 插件——装进 ~/.pi/agent，不进 aiti-agent/pi-web 扩展体系：extman 不列出、extensions.json 归 integrations
---

# pi-git-trace（AI 变更带外追踪）

> ❝ **AI 改了什么、为什么改、怎么改回去——trace 仓全记着。** ❞

pi 编码代理的 **AI 变更带外追踪**插件：

- **独立追踪仓**：repo 根 `.aiti-trace/`（不污染业务 git；目录无 git 也能 autoInit）
- **op 编号双提交**：每次 AI 文件操作记 before/after 双提交，操作可编号引用
- **全 lineage**：文件 ⇄ 消息 ⇄ 操作三方血缘——某个文件被哪条消息里的哪次操作改过，一查到底
- **回滚**：按操作粒度回滚
- **影子仓瘦身**：`compact` 压缩 trace 历史，防止追踪仓无限膨胀
