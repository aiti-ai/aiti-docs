---
title: .pwarc 归档格式
icon: 📦
description: session-manager「真归档」的容器格式规范 —— brotli 随机访问容器的二进制布局、manifest、完整性校验与设计决策记录
---

# `.pwarc` 归档格式

> session-manager「真归档」的容器格式规范。实现：`dev-repo/session-manager/lib/session-archive.ts`（读写唯一权威源）。

## 1. 一句话与设计动机

`.pwarc`（Pi Web ARChive）是自定义容器：**每会话一个独立 brotli 块 + 尾部 manifest**，支持随机访问——提取单个归档会话只需 seek + 解压一个块，不用顺序解整个流。

**为什么不用 tar.gz / zip**（2026-08-08 设计决策，出处见 §10）：

| 方案 | 当时实测/结论 |
|---|---|
| tar.gz | Node **无内置 tar 模块**；且解包必须顺序解整个流 → 按需查看单个会话代价高 |
| zip | Node v24.11.1 **无内置 `node:zip`**（实测不可用） |
| gzip | 内置，但 JSONL 样本压缩率实测 gzip-9 **2.9%** |
| **brotli** | 内置（`zlib.brotliCompress`），同样本实测 **0.5%**，明显更优 → 选它 |
| zstd | 当时不内置（需原生模块）→ 留作未来可选 |

核心洞察：**逐文件独立块 = 随机访问**。「打包」与「按需取单文件」两个需求同时满足，这是 tar.gz 做不到的。

## 2. 二进制布局

```
偏移                内容
─────────────────────────────────────────────────────────
0                   magic "PWARC1\n"（7 字节）
7                   [会话 0 的 brotli 流]
…                   [会话 1 的 brotli 流]
                    ⋮
                    [会话 N-1 的 brotli 流]
(EOF-8-manifestLen) manifest.json —— 单行 JSON（UTF-8，无换行）
EOF-8               [u32 LE: manifest 字节长度][u32 LE: magic 0x43524157 → 字节 "WARC"]
```

- 每个会话一个独立 `brotliCompressSync` 流（`BROTLI_PARAM_QUALITY: 6`）——可单独解压
- footer 固定 8 字节，从文件尾倒读即可定位 manifest（头里不需要目录，写入天然流式）
- 空 manifest 长度字段为 0 时不合法；footer magic 是格式自识别的唯一凭据

## 3. Manifest 结构

```json
{
  "version": 1,
  "createdAt": "2026-09-12T02:00:00.000Z",
  "files": [
    {
      "sessionId": "<sessionId>",
      "path": "/home/<user>/.pi/agent/sessions/--home-<user>-workspace-myproj--/<sessionId>.jsonl",
      "offset": 7,
      "size": 693504,
      "brotliSize": 136662,
      "mtimeMs": 1755000000000,
      "sha256": "a41e479159e9…"
    }
  ]
}
```

| 字段 | 语义 |
|---|---|
| `version` | 格式版本，当前 `1` |
| `createdAt` | 打包时间（ISO） |
| `files[].sessionId` | 会话 id —— 提取 / 恢复 / 删除的查找键 |
| `files[].path` | 原始活文件绝对路径（恢复的写回目标） |
| `files[].offset` / `brotliSize` | 该块在包内的位置与长度（随机访问用） |
| `files[].size` | 原始（未压缩）字节数 |
| `files[].mtimeMs` | 原文件修改时间 |
| `files[].sha256` | **原始明文**的 sha256（解压后校验，不是压缩块的哈希） |

## 4. 包命名与滚动分桶

- 命名：**`<cwdKey>-<YYYY-MM>-<uuid8>.pwarc`**
  - `cwdKey`：cwd 中非 `[A-Za-z0-9_-]` 字符替换为 `-`，去首尾连字符，截断 40 字符
  - `YYYY-MM`：本批首个候选会话的末活动月份（rolling bucket）
  - `uuid8`：随机 8 位 hex，防重名
- 滚动分桶：单包最多 **200 个会话** 或 **50MB（未压缩）**，超出自动开新包

## 5. 存储位置（数据分层）

| 内容 | 路径 | 层级 |
|---|---|---|
| 归档包 | `<configDir>/state/archive/*.pwarc` | **state** —— 不可再生数据，禁整体删除 |
| 解压缓存 | `<configDir>/cache/archive-extract/<sessionId>.jsonl` | cache —— 可再生，200MB LRU 上限 |

读写两侧必须共用 `archivePackagesDir()` / `archiveExtractDir()`（**写读同源**是路径类改动红线：历史上曾因读写路径分裂导致恢复/查看/删除全线静默失败 30h+）。

## 6. 归档生命周期与守卫

| 规则 | 默认值 |
|---|---|
| 候选阈值（自动） | 末活动 > **90 天** 或 单文件 > **20MB**（`archiveAgeDays` / `maxLiveSizeMb`） |
| 自动归档 | 开，间隔 **6 小时**（`autoArchive` / `autoArchiveIntervalH`） |
| 运行中 / 存活会话 | **永不自动归档**；显式归档（`ids`）先释放 idle handle，真正运行中的跳过并计入 `skippedIds` |
| 归档前置校验 | 包重解析通过 **且** 索引 `markArchived` 行数一致，否则**删包中止**（不删原文件） |

显式归档的候选必须已在索引中（无索引记录 = 无法安全恢复 → 剔除）。归档会话只读：可查看 / 导出 / 恢复 / 删除，禁止 resume/fork。

## 7. 随机访问与失败安全

- **查看**：`findEntry`（逐包读 manifest 找 sessionId）→ `readSync` 只读该块 → `brotliDecompressSync` → sha256 校验 → 写入解压缓存
- **恢复**：解压 → **sha256 校验** → 写回原 `path` → 从包中移除条目。顺序是「先文件、后重写包」——中断时归档仍完整，重跑收敛
- **删除条目**：拷贝存活 brotli 块（**不重新压缩**，只重算 offset）→ 写 `.tmp` → 重解析校验通过 → `rename` 覆盖；包清空则删除包文件
- **删除原文件**永远发生在「包可验证」之后（三重保险：包重解析 + sha256 + 索引行数）

## 8. 相关 API

端点前缀：`/api/extensions/session-manager/`

| 端点 | 作用 |
|---|---|
| `GET archive/status` | 归档候选列表 `{sessionId, cwd, modified, sizeBytes, ageDays}` + 缓存占用 |
| `POST archive/run` | 执行归档（可带 `ids`；可覆盖 `ageDays` / `maxLiveSizeMb`） |
| `GET archive/session/:id` | 查看归档会话（内部解压到缓存后解析为消息返回） |
| `GET archive/export/:id?format=jsonl\|md` | 导出（原始 JSONL / Markdown） |
| `POST archive/restore` | 恢复到原路径并从包中移除 |
| `POST archive/delete` | 永久删除归档记录（重写包 + 清索引行） |
| `POST archive/extract` | 仅解压到缓存（返回缓存路径） |
| `GET archive/cache?clear=1` | 清理解压缓存 |
| `POST archive/ext` | ext 源行「视图层归档」隐藏/恢复（`archive_ref="__ext__"`，**无 .pwarc 包**，源数据不动） |

## 9. 版本与演进

- 当前 `version: 1`；footer magic 固定，读取侧对未知版本返回 null（不猜测）
- 未来压缩算法演进可在 manifest 增加 per-entry `codec` 字段（旧包无 codec 默认 brotli，存量零迁移）——压缩率/性能实测见「索引与压缩调研」记录

## 10. 设计决策记录（出处可查）

`.pwarc` 是**按当时约束推导出的原创容器格式**，不是移植任何现成实现（结构上与 ZIP 中央目录 / 游戏资源 PAK「块 + 目录」同构，属通用模式）。设计过程可回溯：

1. **需求原点**（2026-08-08 09:54，用户原话）：*"长期运行……消息归档就是要真归档，打包，压缩，节省资源，但是相关搜索和查看如果归档前有索引，可以快速搜索或浏览到。"*
2. **首版方案是 tar.gz**（同日 09:56）：`<cwdKey>-<年月>.tar.gz` + manifest（每文件 sha256）。
3. **格式转向**（同日 10:14，逐文件独立 brotli 块的设计推导）：按需解包要随机访问 → tar.gz 顺序解是痛点；Node 无内置 zip/tar（实测）→ 自定义容器；brotli 实测优于 gzip。
4. **落盘方案**（同日 10:15–10:16）：压缩对比选型（gzip / brotli / zstd / zip / tar）；代码于 2026-08-16 提交。

- 原始会话记录：`~/.pi/agent/sessions/--home-wind-workspace-pi-web--/2026-08-06T07-38-25-787Z_019fd602-587b-76c7-85b3-fc96401d7f49.jsonl`（2026-08-08 09:54–10:22 段）
