---
title: 特色功能全览
icon: 🌟
description: aiti-agent 全部特色功能深挖——多 Agent 会话汇聚、多维统计、输入消息、安全数据、调试基建、办公文档、界面框架，逐项标注上游/自研来源
tags: [guide, features, overview, capabilities]
---

# 特色功能全览

aiti-agent 构建于开源项目 [pi-web](https://github.com/agegr/pi-web) 之上。本文把「上游原本就有的能力」和「我们后来加建的能力」分开讲清楚：上游底座不抢功，自研特性逐项深挖，规划中的独有能力单列一节。

**来源图例**（每个功能都标注）：

| 标记 | 含义 |
|---|---|
| ⚪ **上游** | 上游 pi-web 原生提供，我们只做跟进维护 |
| 🔵 **上游 + 增强** | 上游有基础版，我们做了 substantial 扩展（部分功能已面目全非） |
| 🟢 **自研** | 上游没有，完全由我们新增（含全部扩展与 pi 插件） |

判定依据：以 `up/main`（上游主线）逐个路径比对——上游主线没有 `extensions/`、`pi-plugins/`、`packages/` 目录，因此**下文所有扩展与 pi 插件均为 🟢 自研**；宿主层每项按「上游是否存在该模块 + 我方提交量」判定。

---

## 一、四大招牌能力（先看这里）

### 🟢 招牌一：把几十种 Agent 的历史会话全部汇进一个界面

这不是简单的「导入」——是把各家 agent 的**私有会话存储格式**统一解析成一套会话模型，塞进同一个「All Sessions」侧栏里，点开就能看、能续聊、能搜索、能归档：

- **pi 原生会话**由宿主直接读取；`aiti-pi-agent` 通过 `pi --mode rpc` 拉起多开会话，是网页端跑 pi 的主路径。
- **通用 ACP 后端** `aiti-acp-agent` 一个适配器覆盖 **25 家内置自动探测**的 Agent Client Protocol agent，另有自定义后端面板；授权卡、队列、模型目录都统一呈现。
- **专业 CLI 驱动**各自吃透一家的细节：`aiti-codex-agent`（`exec --json` + `resume`，OAuth/环境变量双认证，直播与冷回放同形工具卡）、`aiti-claude-code-agent`（keyring 凭据三级裁决登录态）、`aiti-cursor-agent`（stream-json + `--resume`，还能只读浏览 Cursor IDE 历史会话）、`aiti-codebuddy-agent`（长连接 + exec 兜底，control_request 三通道）、`aiti-qoder-agent`（国际/国内双 CLI、额度、模型目录、任务计划）、`aiti-zcode-agent`（桌面端内嵌 runtime，长驻 + oneshot 双通道）、`aiti-omp-agent`（pi 最大 fork 的 RPC 分支）。
- **附着模式** `aiti-attach-agent` 用 socket 连上终端里正在跑的 agent 进程，环境变量全自动上桥，排队消息回显、图片附件透传；`aiti-testagent` / `aiti-testagent-native` 则把 Java 进程与 Windows 原生进程的调试会话也接进来。
- **统一管理面** `session-manager` 内建 **23 家 agent 历史解析**，All Sessions 侧栏提供 tag 树 + 颜色、收藏、FTS5 全文搜索、agent/tag 高级过滤、归档（`.pwarc` 快照）与看板视图——新建会话时还能直接挑分支与 Worktree。

> 结果：终端里用 Claude Code、网页里用 pi、IDE 里用 Cursor、服务器上跑 Qoder——历史会话都在同一个侧栏，不用再记「这条是哪个工具聊的、存哪儿了」。详见 [session-manager](/extensions/session-manager.md) 与 [AI agent 接入](/guide/mcp/ai-agents.md)。

### 🟢 招牌二：全栈用量与统计体系

不是一个「本月 token 数」计数器，而是从** token 明细 → 多维透视 → 成本/配额 → 上下文/流畅度 → 会话级汇总**的完整观测体系：

- **多维用量报表** `aiti-ai-usage`：按 workspace / provider / model / key / 时段（0–23）/ 日期统计，支持任意维度组合 × 多指标的三种视图——交叉热力表、扁平明细表、手写 SVG 桑基流向图，全部可导 CSV（含 BOM）；数据落独立 SQLite（明细幂等主键 + 日汇总分区重算），事件驱动零轮询。还能摄入**外部 agent 的 token 用量**（Claude / Qoder / CodeBuddy / ZCode 四源 + codex / opencode / cursor 的 model 归因），不只统计 pi 自己。
- **余额与配额** `aiti-provider-usage`：16 个适配器 id（DeepSeek / OpenRouter / Z.AI / Kimi / Codex / Copilot 等），会话信息面板「剩余额度」区块当前会话置顶展开，5 分钟 TTL 总览 + 手动刷新，多 Key 池感知。
- **模型健康度** `aiti-model-check`：对每个模型发极小探针，识别可用 / 429 限流 / 异常，解析 Retry-After 等恢复时间，记录历史可用窗口，长期限流到期自动提醒。
- **上下文与流畅度** `aiti-ctx-meter` 在输入区实时显示上下文占用比例（四档色阶 + critical 呼吸），点击直达宿主会话统计面板；`aiti-cpu-meter` 给主线程打出 0–100 流畅度分、颜色分层、可最小化常驻，还带 AI 卡顿调试，并有可注入任意网站的单文件外部版。
- **会话级统计**（🔵 上游基础 + 我方增强）每会话 token / 成本 / 工具调用 / 活跃时长汇总，可导出 HTML；再由 `aiti-git-trace` 把「AI 改了哪些文件、对应哪句对话、哪个操作」也纳入统计与审计。

### 🟢 招牌三：多工作区并行 + 一个工作区多文件夹 + 固定常用目录

上游只支持「当前工作区」这一个上下文。我们把工作区与文件夹做成可并行、可固定：

- **多个工作区同时工作**：`session-manager` 的项目下拉列出所有会话派生的工作区，不同项目的会话可同时打开、同时运行，互不打断；侧栏按项目分组、支持隐藏不用的工作区，还能批量把会话搬到新目录或整组归档。
- **项目与会话置顶**：项目可以 📌 置顶并自定义顺序（拖拽调序），会话同样可置顶；置顶项在 All Sessions 树中优先展示，常用项目不用每次翻找。
- **一个工作区同时开多个文件夹**：`aiti-folder` v2 把文件夹区块升级为动态 dock 实例——每个目录一个面板，可停靠在左栏区块、右栏面板或独立浮窗；项目切换时自动为新的工作目录开一个文件夹实例，也可以从 ＋ 选择器手动加。
- **📌 钉住目录**：文件夹 ⋮ 菜单可钉住，钉住的实例不受自动关闭影响；未钉实例默认最多保留 3 个，超出按 FIFO 挤掉最旧的（配额可在扩展管理的 `behavior.folder-quota` 调整，1–9）。同一部署子路径下各自独立记忆目录清单与钉住状态，不同实例互不串味。

> 结果：A 项目的 agent 在跑、B 项目的会话同时在看，两个项目的几个目录都摊在侧栏/浮窗里，常用的直接钉住——真正是多线并行的工作台，而不是一次只能盯一个目录。详见 [session-manager](/extensions/session-manager.md) 与 [aiti-folder](/extensions/aiti-folder.md)。

### 🟢 招牌四：会话脱离服务进程运行（start detached）

原生的 agent 会话跑在 pi-web **服务进程**里：关掉浏览器标签页或断开网络，agent 照常继续跑——这一点本来就没问题；真正会中断的是**停掉或重启 pi-web 服务**（会话文件还在，但正在运行的 agent 随之终止）。我们做了完整的 `agent-starter` 体系来解决这一点：Linux/macOS 用 systemd-run 或普通脱离进程，Windows 走 Win32_Process.Create + 管道端点，agent 由独立 wrapper 进程托管并通过本地 socket 与服务通信。于是服务重启后仍能重连回原会话，agent 全程不停；无客户端附着且长时间无输出的会话由 wrapper 空闲回收，不会无限占资源。CLI 接入家族（含 ACP 全系与 CodeBuddy）也在陆续接入这个可脱离宿主。详见 [会话与 detachment 说明](/guide/architecture.md)。

---

## 二、⚪ 上游 pi-web 原本就有的底座

这些是上游的功劳，我们只做跟进与兼容维护，**不是我们的特色功能**：

| 上游能力 | 说明 |
|---|---|
| 会话工作区 | 按项目分组浏览、恢复、重命名、导出、删除会话，显示运行状态、上下文用量、成本与压缩详情 |
| 双分支机制 | 「新建会话」从某条消息派生独立会话文件；「从这里编辑」在当前会话内建分支 |
| 项目文件工具 | 浏览/上传文件、看 Git diff、预览源码/Markdown/图片/音频/PDF/DOCX，自动刷新 |
| Git worktree 切换 | 侧栏切换 checkout，同一仓库的会话自动归组 |
| Web 配置 | 提供商登录、API key、模型、模型测试、插件包、skills 全在网页管理 |
| 三语界面 | 英文 / 简体中文 / 繁体中文，初次跟随浏览器语言 |
| PWA / 单文件 CLI 分发 | `npx` 启动、默认仅监听本机 |

下游所有增强都建立在这些底座之上：比如「上游有 worktree 切换」→「我们加上会话按 worktree 分组排序、分支选择器与批量删除」；「上游有三语」→「我们把语言包扩到 199 次提交覆盖的功能面」。

---

## 三、宿主本体增强（内置于应用，无需装扩展）

### 🔵 队列持久化与崩溃恢复
上游有发送队列，我们把 steer / 追问队列镜像到 sidecar 文件（`lib/queue-store.ts`、`lib/composer/recovery.ts`），服务重启后通过恢复对话框逐条决议，绝不自动投递——配合 `aiti-recovery` 扩展给出「重发 / 丢弃 / 稍后」的选择。

### 🟢 移动端完整适配
上游没有成体系的触屏交互。我们新增了移动工具栏、返回手势、右栏状态恢复、顶栏折叠、微信式输入矩阵、思考菜单、长按需常亮等一整套（`AppShell.mobile*`、`ChatInput.mobile*`），小屏不是「桌面缩小版」而是重新设计的输入与导航。

### 🔵 会话分支导航
上游有双分支机制，我们加了 `BranchNavigator`：树状浏览消息分支、预览后切换到任意叶子节点、从引用处直接跳转到对应分支。长会话反复试方案时不再迷路。

### 🔵 MCP 密钥脱敏（宿主侧）
设置面板展示 MCP 配置时，对 URL / 参数中的凭据自动打码，env / header 的敏感值根本不送到浏览器（`lib/mcp-secrets.ts`）。与 `pi-secret-mask`（对话侧脱敏）是两道不同的防线。

### 🟢 会话删除进回收站 + 分支批量删除
上游的删除是直接删。我们把会话文件移入 XDG 桌面回收站并附还原信息，可从文件管理器找回；另提供「按项目删除全部会话」，级联清理子 agent、脱离运行的 wrapper、置顶与归档记录，避免留一堆孤儿进程。

### 🔵 完成通知体系
运行结束浏览器响铃一次且不重复，favicon 加待读角标，支持 Web Push 桌面通知——即便切到别的标签页干活也不会错过结果。

### 🔵 自动命名与运行结果判定
首轮对话后自动生成会话标题；新增统一的运行结果判定（失败不再误报「任务完成」），让侧栏状态与通知语义一致。

### 🔵 Git worktree 工作区增强
上游能切 worktree，我们进一步做到：会话按项目与 worktree 分组排序、支持重命名与拖拽、`session-manager` 新建会话时提供分支 / Worktree 选择器，并与 `aiti-git-ops` 的写操作闸门联动。

### 🔵 聊天外观与输入框连贯性
内容宽度（820–2000px）、字体、终端主题等外观偏好持久化；草稿跨会话保留、休眠压缩、收缩链动画，中断后的待发提示词可恢复（与 `aiti-draft-keeper` 配合形成完整的 composer 状态机）。

### 🔵 其他细节增强
一键在系统文件管理器打开工作区；Debian 风格版本比较的自更新提示；多层对话框 Esc 只关最顶层（`stacked-dialog`）；每会话统计与 HTML 导出；文件管理器直达与查看器窗口聚焦转发等。

---

## 四、🟢 输入与消息（全部自研扩展）

#### 输入框 AI 智能（`aiti-ai-input`）
打字时两层自动补全：本地规则秒出建议，AI 兜底生成更长的续写；还能检测语音听写文本并修复转写错别字。ASR 支持流式识别 + 2-pass 精修，可切换自建 / 讯飞 / 百度 / 硅基流动 / 任意 OpenAI 兼容端点，配热词系统与用量报表——输入既快又准。

#### 输入草稿保存（`aiti-draft-keeper`）
composer 草稿状态机的唯一所有者（v2 意图契约），跨标签页共享槽位，切换会话、关页面、崩溃重启后原样恢复；7 天陈旧清理，避免草稿库无限膨胀。

#### 消息智能（`aiti-msg-smart`）
点击消息里的段落、标题或代码行即可引用 / 复制 / 唤出操作弹层，并对子句或代码行高亮；文件操作行、代码操作顺序与多语言问题句式都做了细致适配，省掉手动选中复制的麻烦。

#### 消息导航（`aiti-msg-anchor` + `aiti-msg-nav`）
锚点在消息区顶部常驻横幅，显示「当前屏幕内容由哪条用户输入生成」，随滚动跟随回合段，可切换为第一条输入 / 最近输入 / 会话标题；导航条提供到最早 / 到最新 / 上一条 / 下一条用户输入的一键直达，长按「到最新」保持屏幕常亮，手机翻长会话不费劲。

#### 消息分享（`aiti-msg-share`）
整段会话、单条消息、选区、文件与图片都能通过可插拔目标分享（Gitee / 图床 / 对象存储 / 笔记归档），上传前自动做密钥脱敏，生成链接附二维码。还提供 share-sink 扩展点：别家扩展能把分享内容收进自己的收藏或命令库。

#### 队列面板（`aiti-queue-keeper`）
接管输入框的 queuePanel 插槽，提供完整队列 UI：横幅、行操作（移动 / 拖拽 / steer 发送 / 转 follow-up / 取回 / 删除）与回收站，纯客户端实现；AI 忙时排队消息的每一次改动都能反悔。

#### 提示词（`aiti-prompts`）
常用提示词收藏成分组片段库，支持从历史会话提取、输入即存，还能接收 `aiti-msg-share` 的收藏内容；重复话术一键复用。

#### 追加系统提示词（`aiti-append-system`）
在网页里直接编辑全局与项目两级的「永久记忆」规则文件，也能让 AI 代起草，不用登服务器手改文件。

#### 语音朗读（`aiti-ai-speek`）
AI 输出自动朗读，可切音色、暂停、跳过、停止；默认走浏览器 Web Speech，可选 edge-tts 等引擎，另有本地 TTS 与滚动跟随方案持续演进——解放双眼，边听边干活。

#### 定时任务（`aiti-ai-schedule`）
常驻调度器：扩展可声明式注册周期任务，用户与 AI 都能建计划（cron / 间隔 / 一次性），三种执行模式 + AI 自建计划工具 + 管理页；备份、模型探测等扩展都挂在它上面。

#### 会话搜索（`pi-session-search` · pi 插件）
给 AI 一个搜索历史会话的工具：上下文被压缩后，agent 可以自己翻回「上次聊到哪」的原文并接着做，等于给会话加了长期记忆索引。

---

## 五、🟢 模型与用量（全部自研）

#### 模型添加向导（`aiti-model-wizard`）
目录搜索（models.dev + 国内 AI 目录，中英文，贴 API 地址也能反查）→ 填 token → 连通性测试（2xx / 429 均算通过）→ 选或输模型 → 写 `models.json`；找不到时支持从任意文档/代码片段自动提取 baseUrl 反向匹配，缺 v1/v2 前缀能自动探测补全，靠 OpenAPI / 模型前缀推断品牌。编辑时 token 打码不返回前端；导出/导入配置走白名单字段，永不带明文 key。

#### 多模型配置导入（`aiti-models-import`）
扫描 Codex / ZCode / OpenCode 里已有的 provider 与模型配置生成草稿，首次启动一次性引导导入；所有落盘经向导的 `saveBatch`，可一步撤销，绝不直写 `models.json`。

#### 模型列表与多 Key 轮转（`pi-models-combo` · pi 插件）
精简模型列表（按需要过滤显示），多把 API Key 粘性轮转以避开限流，还能把多家提供商聚合成一个「组合模型」——同一个模型名背后按策略分流到不同后端。

#### 提供商余额（`aiti-provider-usage`）
16 个适配器 id 的余额 / 配额查询，会话信息面板常驻「剩余额度」区块且当前会话置顶展开；总览 5 分钟 TTL 缓存 + 手动刷新，多 Key 池总量感知。

#### Token 用量报表（`aiti-ai-usage`）
见「招牌二」——多维透视、桑基图、CSV、独立 SQLite、外部 agent 用量摄入，是全套统计体系的核心。

#### 模型健康检查（`aiti-model-check`）
极小探针消息探测每个模型的可用性 / 限流 / 异常，解析限流恢复时间，记录历史可用窗口，长期限流到期时本地提醒（零额外探测开销）。

#### 上下文指示条（`aiti-ctx-meter`）
桌面 compactLead 竖向比例条 + 小屏 modelInfoLead 前导位，四档 urgency 色阶与 critical 呼吸效果，点击直达宿主会话统计面板。

#### 最近使用模型（`aiti-model-recent`）
纯 service 扩展（零 UI）：模型选择器 recent 段同步取数，pick 事件入 LRU；与旧实现的 localStorage key 兼容，零迁移。

---

## 六、🟢 安全与数据（全部自研）

#### 密钥脱敏（`pi-secret-mask` · pi 插件）
「随手贴，不泄密」：贴进 prompt 的 token / API key 在发给模型前自动变占位符，工具执行时才还原真值；确定性脱敏 + `/secret` 命令管理。适合临时值，不跨会话持久。

#### 密钥保险库（`pi-secret-vault` · pi 插件）
需要跨会话、加密落盘、模型按别名查询时用持久版：模型只看到 `rsec_<hash8>` 令牌，增删改与查看明文始终由人操作。与 mask 共享同一引擎、同会话互斥（vault 优先时 mask 自动停用）。

#### 保险库管理（`aiti-secret-vault`）
Web 侧管理界面：列别名 / 新增 / 轮换 / 揭示 / 删除，锁定解锁，keyfile 与系统钥匙串两种解锁方式，还能查看每个会话挂载了哪些别名——值永远不进 AI 对话。

#### 配置安全网（`aiti-configs`）
AI 或人改坏配置、改坏扩展时有 diff 可看、有锅可回、一键恢复；系统崩溃时独立命令行哨兵不依赖出问题的系统本身兜底。

#### 数据快照备份（`aiti-backup`）
针对 state 层大体积数据（会话等）的硬链接增量快照，独立子进程执行 + 崩溃安全临时文件 + keepCount 轮转；与小配置的 git 版本化互补。

#### 设备互连（`aiti-pair`）
连到同一个桥的设备（手机浏览器 / 其他电脑 / agent 会话 / 注入页面）互发消息、互传文件——跨设备协作不用自己搭中转。

#### 恢复向导（`aiti-recovery`）
会话中断后，排队消息与中断任务逐条给出处理选择；红线是**绝不自动投递**，续跑只发「继续」，恢复完全由人决定。

---

## 七、🟢 Git、调试与基础设施（全部自研扩展/插件）

#### 页面内 AI 调试助手（`aiti-devtools`）
生态核心卖点：把任意网页变成 AI 可协作的调试现场。点选页面元素即把结构化信息直达 AI；AI 可执行类 DevTools 的 DOM / CSS / 输入 / 性能操作，还能反过来向用户提问、请用户帮忙点选元素——人与 AI 在同一页面上并肩排障。配套 vite / webpack / nuxt 载体插件、VS Code 扩展与浏览器扩展，桥协议由独立核心包统一提供。

#### Git 变更审核（`aiti-git-review`）
专职审核未提交代码：Monaco diff 工作区（并排 / 合并 / 纯新 / 大纲），行级标注分「必须改 / 建议 / 疑问」，anchor 标志行重映射保证边审边改标注不失效，汇总终审清单；`aiti_review_*` 工具只注入评审会话，日常会话零工具负担。

#### Git 写操作（`aiti-git-ops`）
白名单 git 写引擎：checkout 预检、stash、plan 断点、全程审计、changed topic；供文件浏览器与会话管理器消费，让 AI 能安全地做 git 写操作而不弄丢工作。

#### AI 变更追踪（`aiti-git-trace` / `pi-git-trace`）
编外追踪仓 `.aiti-trace`，无 git 的目录也能 autoInit；每次改动按 op 编号做 before/after 双 commit，文件 ⇄ 消息 ⇄ 操作全链路可查，随时一键回撤，影子仓还能 compact 瘦身。两者同源：`aiti-git-trace` 是工作台扩展，`pi-git-trace` 给纯 CLI 用户。

#### 服务隧道（`service-tunnels`）
本机服务一键公网可达：端口自动发现（服务识别 / 自定义名），五种暴露模式（隧道 / vhost / 混合 / 路由器映射 / IPv6 直连），认证网关（portal / TOTP / 人脸声纹），DDNS 自动解析与网络体检 doctor。这是全生态独有的暴露层能力。

#### 命令中心（`aiti-cmd`）
一个扩展三个应用：命令收藏（分组 / 标签 / 词库 + 一键执行）、运行中（终端会话 / agent 命令 / 执行记录）、真 PTY 终端；另有消息识别、输入框运行态势入口、跨扩展统一执行出口，终端会话在重载与重启后仍存活。

#### 容器管理（`aiti-containers`）
一个面板管容器、镜像、卷、网络与 compose 项目（docker / podman / nerdctl），启停、日志、清理全覆盖；AI 也能通过工具操作，危险动作需二次确认，并与服务隧道的端口页联动。

#### 终端桥接到浏览器（`pi-web-bridge` · pi 插件）
终端里照常跑 pi TUI，敲一个 `/web` 即把同一会话实时开在浏览器里，双向 IO（prompt / steer / follow-up / abort / 切模型）、排队消息回显、图片附件透传——终端与网页随时交接。

#### 无头服务器图形环境（`aiti-ui-env`）
给没有显示器的服务器分配虚拟桌面：4 态模式裁决新启动 MCP / 应用的显示环境，Xvfb + openbox + AT-SPI 虚拟屏，VNC-on-web 与 RDP-on-web，Linux / Windows / macOS 三平台服务化；VNC 密码由 VNC server 自己认证，桥只透传。

#### 远程调试注入（`aiti-debug-inject`）
把另一个工作台实例的调试器注入本实例页面，方便开发者远程排查线上问题；服务地址是扩展管理里的文本 feature，默认关闭、按需开启。

#### 流畅度检测器（`aiti-cpu-meter`）
见「招牌二」——0–100 流畅度分、颜色分层、最小化常驻、AI 卡顿调试，内部扩展版 + 可注入任意网站的 standalone 单文件版双产物。

---

## 八、🟢 多 Agent 生态（全部自研扩展）

### 统一入口与编排

#### pi 多会话（`aiti-pi-agent`）
`pi --mode rpc` 子进程作为会话，多开互不干扰，是网页端跑 pi 的主路径；启动模型与 agentRunModelRef 对齐，选的模型就是实际用的模型。

#### 通用 ACP 后端（`aiti-acp-agent`）
一个适配器接所有 Agent Client Protocol agent：25 家内置自动探测 + 自定义后端面板，统一授权卡、队列、模型目录与权限策略；全系支持可脱离托管。

#### 子代理舰队（`aiti-subagents`）
在界面里观测并控制并行子代理：发起委派、查看进度事件、管理并发配置；fork 引擎与工具面由 pi 子代理体系提供，工作台负责可视化与运行控制。

#### Agent 账号管理（`aiti-agent-manager`）
一个面板统一聚合外部 agent 的登录态、登录操作代理、多账号档（备份 / 别名 / 一键切换）与账号额度显示——它不实现任何登录协议，只做聚合与切换。

#### 自定义后端（`aiti-custom-agent`）
用表单登记任意 CLI 作为会话后端：启动命令、参数前缀、成员 env、桥模式，保存即热生效；generic 驱动 one-shot spawn，支持 Docker 化、命令包装、同一 CLI 多配置。

#### AI 助手入口（`aiti-helper`）
为所有扩展面板提供统一的「一句话 AI 能力入口」：声明式 AI 帮助点（pi skills 标准）+ 输入 / 结果预览 / 审核回填 + 流式进度总线 + 多轮追问与历史；用户还能写自己的 skills。

### CLI 接入家族（每家都把私有会话格式啃下来了）

| 扩展 | 接入对象与差异点 |
|---|---|
| `aiti-claude-code-agent` | Claude Code CLI：`agentKey: claude`，从 All Sessions 恢复历史，2.1.318+ keyring 凭据三级裁决登录态 |
| `aiti-codex-agent` | OpenAI Codex CLI：`exec --json` + `resume`，auth.json OAuth / openrouter env 双轨，直播与冷回放同形原生工具卡 |
| `aiti-cursor-agent` | Cursor Agent CLI：stream-json print + `--resume` 多轮，另可只读解析 Cursor IDE 的历史会话 |
| `aiti-codebuddy-agent` | 腾讯 CodeBuddy Code CLI：stream 长连接（默认）+ exec 兜底，control_request 三通道，API-key env 登录，可脱离托管 |
| `aiti-qoder-agent` | Qoder CLI 国际/国内双版本：额度查询、WASM 签名模型目录、任务计划镜像、运行排队管理、plan/权限模式 |
| `aiti-zcode-agent` | 智谱 ZCode 桌面端 runtime：app-server 长驻（流式 / 工具卡 / steer / 附件）+ oneshot 兜底，合规吃 GLM 编程套餐 |
| `aiti-omp-agent` | Oh My Pi（pi 最大 fork）：`omp --mode rpc` 子进程 + ready 握手 / get_state 能力面 / host tools / login / branch |
| `aiti-attach-agent` | Socket 附着已运行 agent 进程（pi TUI bridge）：`PI_WEB_BRIDGE_AUTO=1` 全自动上桥，followUp 回显 + 图片透传 + 空闲超时退出 |
| `aiti-testagent` | Java 后端 AI 调试：扫描进程 / attach 连桥 / Tunnel 多端点纳管，JVM 内修改、Mock、SQL 拦截、热更新、诊断采样，57 工具按需暴露且全可逆 |
| `aiti-testagent-native` | Windows 原生进程活体操控：broker 进程 / 会话 / 挂钩 / 事件流的可视面板 |

> 同构但不同源：这些都是「把某一家的会话变成工作台里的一行 + 一个可续聊的会话」，但每家的登录态、流式协议、历史存储、工具卡格式都不一样——适配工作绝大部分花在这些细节上。

---

## 九、🟢 办公与文档（全部自研扩展）

#### 文件浏览器（`aiti-folder`）
接管 `fileViewer` 文件夹视图与 `pathPicker` 目录选择器：像本地资源管理器一样浏览、删除（进回收站可找回），带 git 工具条与按分支分组提交计划（软依赖 `aiti-git-ops`）；还能复用文档中心的全文检索做文档搜索。v2 多实例 dock 支持同时开多个目录，各自可停靠左栏/右栏或浮窗，⋮ 菜单里 📌 钉住常用目录，未钉的按 FIFO 保留（默认 3 个、可配 1–9）。

#### 代码/文件编辑器（`aiti-editor`）
Monaco 编辑接管 + 保存（mtime 冲突 409、白名单与大小校验）、diff 视图、压缩包解析、统一图片查看器（消息图片与文件图片合一，缩放 / 捏合 / 信息面板），是各类文档编辑体验的公共底座。

#### 在线表格（`aiti-sheet-univer`）
`.xlsx/.xlsm` 在线预览 + 编辑（exceljs 数据面 + Univer 视图面），`.xls/.ods` 只读预览并可一键转 `.xlsx`——不用装 Office 也能改表。

#### Word 三档体验
`aiti-word-docx-preview` 做高保真只读预览（分页 / 页眉页脚 / 表格 / 图片 / 列表还原）；`aiti-word-superdoc` 用 SuperDoc（ProseMirror docx 双向）在线编辑并保持格式；`aiti-onlyoffice` 接 OnlyOffice DocumentServer，实现 Word / Excel / PPT 完整保真预览与编辑（AGPL 社区版，默认关闭）。三档按需安装，重度办公用 OnlyOffice，轻量查看用预览版。

#### 文档中心（`aiti-doc-center`）
自动收集 workspace 里的 Markdown 文档，FTS5 trigram 中文全文检索 + 七来源两层 tag 体系 + 四视图浮窗；支持 smart 排序、tag 重命名导出、按文档反查「哪些会话写过它」——资料不再靠翻目录。

#### 邮件发送（`aiti-mail`）
工作台统一邮件出口：零依赖 SMTP 客户端 + 发送记录（SQLite）+ 配置/测试/记录管理弹窗；隧道生命周期通知等流程都建立在它之上。

#### IM 渠道接入（`aiti-channels`）
托管 cc-connect 进程，提供概览 / 项目 / 通道 / 会话面板与 socket API 出站发消息，把钉钉、飞书等聊天渠道接进工作台统一收发。

---

## 十、🟢 界面与框架（全部自研扩展）

#### 会话管理面板（`session-manager`）
跨项目统一管理所有会话：tag 树 + 颜色、收藏、FTS5 搜索、agent/tag 高级过滤、归档与看板总览；新建会话可挑分支与 Worktree，承载 All Sessions 侧栏 DockStack 编排，并解析 23 家 agent 的历史。多工作区同时运行时，项目可 📌 置顶、拖拽调序、隐藏或整组搬移/归档；项目切换还会自动触发 `aiti-folder` 为新工作目录开文件夹实例（见「四大招牌」）。

#### 应用中心（`aiti-app-center`）
左栏区块全折叠后的「开始菜单」：应用视图（动作 / 面板 / 管理入口卡，hover 快捷钉 + 信息页）与开关视图（feature 开关按扩展分组）双视图单行切换；tag 分类、按视图搜索、编辑模式排序 / 隐藏 / 恢复。

#### 会话请求卡（`aiti-session-cards`）
把 AI 的方案审批、AskUser 提问、OAuth 授权、工具授权等请求呈现为清晰卡片，一眼看懂、一键确认，覆盖 zcode / omp / generic 等多种交互元语。

#### 浮动面板（`aiti-float`）
`data-ext-float` 契约接管：拖拽、边缘缩放、位置持久化、点按置前、双击复位、自动最大化按钮，小屏自动全屏且系统返回关闭；同时提供 DockStack 左栏统一区块栈服务，是「所有弹窗都长得一样好用」的底座。

#### 快速上手（`aiti-quickstart`）
新会话欢迎页给上手步骤、快捷操作、任务运行时与示例提示词；工作区获取 Hub 支持 Git 克隆 / 上传压缩包 / 本地目录 / 新建；还有左栏全折叠空白引导卡与侧栏静态条目。

#### 扩展管理（`aiti-extman`）
界面内搜索 / 安装 / 启停扩展，配合在线注册表即装即用；共享依赖由它统一 reconcile，不用手改文件。

#### 页面事件总线（`aiti-event-bus`）
接管页面事件层，提供 topic 订阅 + 服务端过滤、高频帧的 publish-local 通道、装载优先级保证与 STALE_CONN 静默重建——各扩展因此能实时联动刷新（侧栏状态、运行进度等），连接抖动也不掉线。

---

## 十一、规划中的独有能力（路线图摘录）

状态口径来自公开路线图（✅ 已落地 / 🚧 进行中 / 📋 待定）与各功能的实施记录；只列**相对上游 pi-web 独有**的条目。

| 能力 | 状态 | 一句话说明 |
|---|---|---|
| 多 Agent CLI 桥接（12+ 家） | ✅ | 已超额交付，见「招牌一」 |
| CDP 远程调试通道（chrome-devtools / msedge-cdp / remote-cdp） | ✅ | 浏览器调试走标准 MCP，与页面内 `page_exec` 互补 |
| 编辑器套件（editor / onlyoffice / sheet-univer / word） | ✅ | 见「办公与文档」 |
| 容器桌面 VNC / RDP | ✅ | `aiti-ui-env` 交付了虚拟桌面与 web 化 VNC/RDP |
| 浏览器扩展三市场上架 | 🚧 | 源码与发布手册就绪，待上架（不改代码即可注入任意网站） |
| VS Code 扩展市场上架 | 🚧 | 0.3.x 源码就绪（注入 + 桥 + MCP 接线 + AI 窗口跳转） |
| noVNC full 镜像编排 / TOTP 编排 | 🚧 | 桌面可视化与认证编排的最后一公里 |
| PWA / 移动端深化 | 📋 | 触屏交互已做，PWA 安装态与离线能力待推进 |
| SSH 多机联邦 | 📋 | 多台机器统一入口 |
| `just get` 工具市场 | 📋 | 命令行工具分层安装 |
| 扩展市场公开化（npm + MCP registry 数据源） | 📋 | 从在线注册表走向开放生态 |
| 引擎抽象（pi / omp 双内核评估） | 📋 | 主线仍绑 pi，先做 omp 会话适配，远期评估双引擎 |
| IntelliJ 插件（devtools-idea） | 📋 | 注入生态补齐 IDEA |
| 用量 P2：外部 agent 成本估算 | 📋 | 在已有 token 归因之上补成本视角 |

> 路线图是活文档，状态以 [Master Plan](/roadmaps/master-plan.md) 与 [aiti-agent 路线图](/roadmaps/aiti-agent.md) 为准。

---

## 深入了解

- 全部扩展逐个详解：[扩展目录](/extensions/README.md)
- 产品定位与能力五层：[aiti-agent](/products/aiti-agent.md)
- 架构总览：[架构](/guide/architecture.md)
- 项目来历：[上游血缘](/guide/lineage.md)
