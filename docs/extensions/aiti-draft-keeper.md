---
title: 草稿保管员（aiti-draft-keeper）
icon: 📝
ext:
  id: aiti-draft-keeper
  name: 草稿保管员
  description: 草稿持久化 + 恢复接管 —— composer 契约 v2 唯一所有者（applyIntent 唯一写入口）、多标签共享槽位、无贡献不回写防震荡、pruneStale 7 天清理、水合后恢复
  soul: 崩溃可以带走页面，带不走你打到一半的话。
  type: dev-repo
  category: 聊天增强
  version: "0.1.7"
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
- **scan 只读永不写**：框空有存储 → 静默恢复；存储 ⊇ known → 同步进框；分叉不动；**恢复发生时本轮 onChange 直接 return**（本轮空快照已过时，等写框引发的新快照裁决——防「恢复即删」）
- **恢复等宿主水合完成**（`pi-web:hydrated` 信号 + stage 重放二道防线），不被 hydration 失配重渲染抹掉

**composer 契约 v2（状态机唯一所有者）**：core（pi-web）只发意图——`applyIntent` 是唯一写入口：

- `sessionCreated {provisionalKey, sessionId}`：promote 时 provisional 草稿作废、promote 窗口（draftKey prop 切换前）的新输入**重定向落 sid 槽位**（`new:<cwd>` 整族内存副本同清，防已发送消息残留）
- `rejected {key,text,images}`：发送失败**合并回草稿**（提交在前、原稿在后）并写回当前框
- v1 方法（saveDraft/clearDraft/rekeyDraft/restoreSubmission）deprecated，仅供未升级旧 core 回退

**维护与迁移**：`pruneStale()` 注册时一次清理 >7 天未写入槽位（含旧 per-tab 残留、无 ts 旧格式；非轮询）；槽位归一化 `crashrestore-new:<cwd>` 按 cwd 共享，旧 `crashrestore-<key>-<tabId>` 首读自动迁入。`core.test.mjs` 26 用例钉死语义；core.mjs 薄壳（hydration 门控 + DraftApi 注册）。
