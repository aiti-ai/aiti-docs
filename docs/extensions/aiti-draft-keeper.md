---
title: aiti-draft-keeper
icon: 📝
ext:
  id: aiti-draft-keeper
  name: 草稿保管员
  description: 草稿持久化 + 恢复接管 —— 多标签共享槽位、无贡献不回写防震荡、水合后恢复
  soul: 崩溃可以带走页面，带不走你打到一半的话。
  type: dev-repo
  category: 聊天增强
  version: 0.1.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-draft-keeper/ 后 reload
  license: MIT
  tags: [draft, persistence, crash-restore, multi-tab, composer]
---

# aiti-draft-keeper

> ❝ **崩溃可以带走页面，带不走你打到一半的话。** ❞

草稿持久化 + 恢复接管扩展——pi-web 去 fork 化 P2 的产物。core 的草稿逻辑已全部迁出，**core 零 draft-store 依赖**；core 经 `lib/composer/draft-api.ts` 注册表访问本扩展的存储 API。

**模型（共享槽位 + 无贡献不回写）**：

- 每会话一个共享槽位，多标签同会话天然共享同一份草稿
- **onChange 只在真实输入时写**：快照与 known 相同不写（防震荡核心）、清空/发走再清（300ms 延迟确认防误清）
- **scan 只读永不写**：框空有存储 → 静默恢复；存储 ⊇ known → 同步进框；分叉不动
- **恢复等宿主水合完成**（`pi-web:hydrated` 信号 + stage 重放二道防线），不被 hydration 失配重渲染抹掉
