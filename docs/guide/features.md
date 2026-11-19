---
title: 特色功能总览
icon: 🌟
description: aiti-agent 在原生 pi-web 之上新增的功能全景——按场景分组，每个功能一句话简介
tags: [guide, features, overview]
---

# 特色功能总览

**aiti-agent** 构建于开源 pi-web 之上，在引擎与界面两侧持续加建出大量特色能力。本文按场景分组收录全部功能点，每个功能一句话；点击功能名可深入对应文档。

## 宿主本体增强

工作台本体（宿主层）相对原生 pi-web 的增强，这些能力内置于应用、无需安装扩展：

| 功能 | 简介 |
|---|---|
| 会话脱离运行（detached） | 会话可由 systemd-run / wrapper 托管脱离浏览器进程，关掉浏览器 agent 不死，空闲自动回收 |
| 队列持久化与崩溃恢复 | 排队的追问/指示镜像落盘，服务重启后可手动恢复丢失消息 |
| 多语言界面 | 内置简体中文、繁体中文与英文语言包，界面文案随时切换 |
| 移动端完整适配 | 移动工具栏、返回手势、右栏状态恢复、触屏发送键与思考菜单等全套触屏体验 |
| 会话分支导航 | 树状浏览消息分支、预览并切换任意叶子节点，支持引用分支跳转 |
| MCP 密钥脱敏 | 设置面板展示 MCP 配置时对 URL/参数中的凭据打码，敏感值不发送到浏览器 |
| 会话删除进回收站 | 删除的会话文件移入系统回收站并带还原信息，可从文件管理器找回 |
| 分支批量删除 | 按项目「删除全部会话」，级联清理子 agent、运行中进程与置顶/归档记录 |
| 完成通知体系 | 运行结束响铃一次不重复，favicon 加待读角标，支持 Web Push 桌面通知 |
| 自动命名会话 | 由首轮对话自动生成会话标题；运行结果统一判定，失败不再误报「任务完成」 |
| Git worktree 工作区 | 创建/切换 worktree，会话按项目与 worktree 分组排序，支持重命名与拖拽 |
| 聊天外观可调 | 内容宽度、字体、终端主题等外观偏好可调并持久化 |
| 输入框连贯性 | 草稿跨会话保留、休眠压缩、收缩链动画，中断后待发提示词可恢复 |
| 文件管理器直达 | 一键在系统文件管理器打开当前工作区目录 |
| 应用自更新 | 比较当前与最新发布版本并提示升级 |
| 叠加对话框键盘语义 | 多层对话框 Esc 只关最顶层，避免误关设置面板 |
| 会话统计与导出 | 每会话 token/成本/工具调用/活跃时长汇总，支持导出 HTML |

## 输入与消息

| 功能 | 简介 |
|---|---|
| [输入框 AI 智能](/extensions/aiti-ai-input.md)（aiti-ai-input） | 打字时自动补全下一句、检测语音听写并修复转写错别字，支持多识别引擎、热词和用量报表 |
| [消息智能](/extensions/aiti-msg-smart.md)（aiti-msg-smart） | 点一下消息里的段落、标题或代码行即可引用、复制或唤出操作弹层，省去手动选取 |
| [输入草稿保存](/extensions/aiti-draft-keeper.md)（aiti-draft-keeper） | 没发出去的内容自动保存，切换会话、关页面甚至崩溃重启后都能原样恢复，不怕丢稿 |
| [消息分享](/extensions/aiti-msg-share.md)（aiti-msg-share） | 整段会话、单条消息或选区一键生成公开链接和二维码，上传前自动抹掉密钥等敏感信息 |
| [提示词](/extensions/aiti-prompts.md)（aiti-prompts） | 常用提示词收藏成分组片段库，也能从会话随手提取、输入即存，重复话术一键复用 |
| [队列保存](/extensions/aiti-queue-keeper.md)（aiti-queue-keeper） | AI 忙时排队的消息可拖拽排序、提前发送、取回修改或删除，误删还能撤销和回收站恢复 |
| [消息导航](/extensions/aiti-msg-nav.md)（aiti-msg-nav） | 长会话一键跳到最早、最新或上一条/下一条自己的提问，长按保持屏幕常亮 |
| [消息锚点](/extensions/aiti-msg-anchor.md)（aiti-msg-anchor） | 滚动时顶部常驻显示「当前屏幕内容由哪条提问生成」，长对话随时知道上下文出处 |
| [追加系统提示词](/extensions/aiti-append-system.md)（aiti-append-system） | 网页里直接编辑全局和项目两级「永久记忆」规则文件，也能让 AI 代为起草 |
| [语音朗读](/extensions/aiti-ai-speek.md)（aiti-ai-speek） | AI 的回答自动朗读，可切音色、随时暂停跳过，解放双眼边听边干活 |
| [定时任务](/extensions/aiti-ai-schedule.md)（aiti-ai-schedule） | 按 cron、间隔或指定时间自动执行任务，也能让 AI 自己创建和管理计划 |
| [会话搜索](/extensions/pi-session-search.md)（pi-session-search · pi 插件） | 给 AI 提供搜索历史会话的工具，上下文被压缩后也能找回「上次聊到哪」的原文 |

## 模型与用量

| 功能 | 简介 |
|---|---|
| [模型添加向导](/extensions/aiti-model-wizard.md)（aiti-model-wizard） | 搜索或粘贴 API 地址即可引导接入提供商和模型，自动测试连通并完成配置，密钥安全打码 |
| [多模型配置导入](/extensions/aiti-models-import.md)（aiti-models-import） | 自动扫描 Codex/ZCode/OpenCode 里已有的模型配置，一键迁移进来且可一步撤销 |
| [模型列表与多 Key 管理](/extensions/pi-models-combo.md)（pi-models-combo · pi 插件） | 精简模型列表，多把 API Key 自动轮转避开限流，还能把多家提供商聚合成组合模型 |
| [提供商余额查询](/extensions/aiti-provider-usage.md)（aiti-provider-usage） | 一键查看 18 家提供商的余额与配额，会话面板常驻剩余额度，多 Key 池也能感知 |
| [Token 用量报表](/extensions/aiti-ai-usage.md)（aiti-ai-usage） | 按项目、提供商、模型、密钥、时段多维度统计用量，支持透视、图表与 CSV 导出 |
| [模型健康检查](/extensions/aiti-model-check.md)（aiti-model-check） | 定期轻量探测各模型是否可用、被限流，解析恢复时间并在限流到期时提醒 |
| [上下文指示条](/extensions/aiti-ctx-meter.md)（aiti-ctx-meter） | 输入区旁实时显示上下文占用比例，接近上限变色提醒，点击直达会话统计 |
| [最近使用模型](/extensions/aiti-model-recent.md)（aiti-model-recent） | 模型选择器顶部展示最近用过的模型，快速切换无需翻找长列表 |

## 安全与数据

| 功能 | 简介 |
|---|---|
| [密钥脱敏](/extensions/pi-secret-mask.md)（pi-secret-mask · pi 插件） | 随手粘贴的 token、API key 发给模型前自动变占位符，工具执行时才还原真值，贴了也不泄密 |
| [密钥保险库](/extensions/pi-secret-vault.md)（pi-secret-vault · pi 插件） | 密钥加密存本地，模型只能拿到占位令牌，增删改与查看明文始终由人操作 |
| [保险库管理](/extensions/aiti-secret-vault.md)（aiti-secret-vault） | 网页里管理加密密钥库——新增、轮换、锁定解锁，并查看哪些会话正在用哪个密钥 |
| [配置安全网](/extensions/aiti-configs.md)（aiti-configs） | 配置被 AI 或人改坏有据可查、一键恢复，系统崩溃时独立哨兵也能兜底恢复 |
| [数据快照备份](/extensions/aiti-backup.md)（aiti-backup） | 会话等大体积数据定期快照备份，增量省空间、保留多轮，随时整份拷回 |
| 设备互连（aiti-pair） | 手机、其他电脑等设备与工作台互发消息、互传文件，跨设备协作即开即用 |
| [恢复向导](/extensions/aiti-recovery.md)（aiti-recovery） | 会话中断后排队消息和中断任务逐条给出处理选择，绝不自动投递，恢复完全由你决定 |

## Git、调试与基础设施

| 功能 | 简介 |
|---|---|
| [页面内 AI 调试助手](/extensions/aiti-devtools.md)（aiti-devtools） | 把任意网页变成 AI 可协作的调试现场：点选元素直达 AI，AI 可执行 DOM/CSS/输入/性能等类 DevTools 操作，人机同页并肩排障 |
| [Git 变更审核](/extensions/aiti-git-review.md)（aiti-git-review） | 专职审核未提交代码——diff 工作区配行级标注（必须改/建议/疑问），还可让 AI 预审出终审清单 |
| [Git 写操作](/extensions/aiti-git-ops.md)（aiti-git-ops） | 让 AI 安全执行切换分支、暂存等 git 写操作——执行前预检、可设断点、全程留审计 |
| [AI 变更追踪](/extensions/aiti-git-trace.md)（aiti-git-trace） | AI 每次改动编号留档，文件、对话、操作全链路可查，随时一键回撤——没有 git 的目录也能追踪 |
| [AI 变更追踪 pi 插件](/extensions/pi-git-trace.md)（pi-git-trace · pi 插件） | 与 aiti-git-trace 同源同能力的 pi 插件版，纯 CLI 用户在终端里获得同样的追踪与回撤 |
| [服务隧道](/extensions/service-tunnels.md)（service-tunnels） | 本机服务一键公网可达——自动发现端口、多种暴露方式任选，配套动态口令等认证网关与网络体检 |
| [命令中心](/extensions/aiti-cmd.md)（aiti-cmd） | 命令收藏、运行中会话与真终端三合一，常用命令分组一键执行，全程留有记录 |
| 容器管理（aiti-containers） | 一个面板管容器、镜像、卷和编排项目；AI 也能直接帮你操作，危险动作需二次确认 |
| 终端桥接到浏览器（pi-web-bridge · pi 插件） | 终端里照常跑 pi，敲一个 `/web` 即可在浏览器实时看到同一会话并双向操作 |
| [流畅度检测器](/extensions/aiti-cpu-meter.md)（aiti-cpu-meter） | 实时流畅度评分加颜色提示，可长期挂角落，卡死时刻有硬信号 |
| [无头服务器图形环境](/extensions/aiti-ui-env.md)（aiti-ui-env） | 给没有显示器的服务器分配虚拟桌面，AI 启动的图形应用可通过浏览器 VNC/RDP 直看直操 |
| [远程调试注入](/extensions/aiti-debug-inject.md)（aiti-debug-inject） | 把另一个工作台实例的调试器注入本实例页面，远程排查线上工作台问题，默认关闭按需开启 |

## 多 Agent 生态

| 功能 | 简介 |
|---|---|
| [pi 多会话](/extensions/aiti-pi-agent.md)（aiti-pi-agent） | 把本机 pi CLI 会话拉进网页统一管理，多开互不干扰，是网页端跑 pi 的主路径 |
| [通用 ACP 后端](/extensions/aiti-acp-agent.md)（aiti-acp-agent） | 通过统一的 Agent Client Protocol 接入 25 家内置自动探测的 agent，一个适配器兼容整个生态 |
| [子代理舰队](/extensions/aiti-subagents.md)（aiti-subagents） | 在界面里观测并控制并行子代理，发起委派、查看进度、管理并发，大任务拆给舰队协同 |
| [Agent 账号管理](/extensions/aiti-agent-manager.md)（aiti-agent-manager） | 一个面板统一查看各外部 agent 的登录状态与额度，支持多账号备份、别名和一键切换 |
| [Claude Code 接入](/extensions/aiti-claude-code-agent.md)（aiti-claude-code-agent） | 把 Claude Code CLI 会话接进统一列表，可恢复历史会话并识别其登录凭据状态 |
| [Codex 接入](/extensions/aiti-codex-agent.md)（aiti-codex-agent） | 接入 OpenAI Codex CLI，支持恢复历史会话与 OAuth/环境变量两种登录 |
| [Cursor 接入](/extensions/aiti-cursor-agent.md)（aiti-cursor-agent） | 把 Cursor Agent CLI 会话接进网页多轮续聊，还能只读浏览 Cursor IDE 历史会话 |
| [CodeBuddy 接入](/extensions/aiti-codebuddy-agent.md)（aiti-codebuddy-agent） | 接入腾讯 CodeBuddy Code CLI，流式长连接为主、命令行为兜底，可恢复历史会话 |
| [Qoder 接入](/extensions/aiti-qoder-agent.md)（aiti-qoder-agent） | 接入 Qoder CLI（国际/国内双版本），额外提供额度查询、模型目录、任务计划镜像 |
| [智谱 ZCode 接入](/extensions/aiti-zcode-agent.md)（aiti-zcode-agent） | 接入智谱 ZCode 桌面端运行时，流式对话、工具卡、中途插话、附件一应俱全 |
| [Oh My Pi 接入](/extensions/aiti-omp-agent.md)（aiti-omp-agent） | 把 pi 的最大分支 Oh My Pi 作为会话后端接入网页，支持登录、分支与主机工具共享 |
| [附着运行中会话](/extensions/aiti-attach-agent.md)（aiti-attach-agent） | 把终端里正在运行的 agent 会话「附着」到网页上查看和续聊，终端与网页两边同步 |
| [自定义后端](/extensions/aiti-custom-agent.md)（aiti-custom-agent） | 用表单登记任意 CLI 作为会话后端（含 Docker 化启动），保存即生效，想接谁就接谁 |
| [AI 助手入口](/extensions/aiti-helper.md)（aiti-helper） | 为各扩展面板提供统一的 AI 帮助按钮——一句话生成、预览确认再回填，支持多轮追问 |
| [Java 调试注入](/extensions/aiti-testagent.md)（aiti-testagent） | AI 直连运行中的 Java 进程，在线修改、Mock、SQL 拦截与热更新全部可逆，调试不重启应用 |
| [Windows 原生调试](/extensions/aiti-testagent-native.md)（aiti-testagent-native） | 把 Windows 原生进程的运行状态、挂钩与事件流搬进面板，AI 也能观测和操控本地进程 |

## 办公与文档

| 功能 | 简介 |
|---|---|
| [文件浏览器](/extensions/aiti-folder.md)（aiti-folder） | 像本地资源管理器一样浏览、选择和删除文件，支持回收站找回和按分支分组提交 |
| [在线表格](/extensions/aiti-sheet-univer.md)（aiti-sheet-univer） | 浏览器里直接打开、查看和编辑 Excel，老格式只读预览并一键转换，无需装 Office |
| [Word 预览](/extensions/aiti-word-docx-preview.md)（aiti-word-docx-preview） | 高保真还原 Word 文档的分页、页眉页脚、表格和图片，只读查看不跑版 |
| [Word 编辑](/extensions/aiti-word-superdoc.md)（aiti-word-superdoc） | 浏览器里直接编辑 .docx 并保持格式互转，写文档不再依赖本地 Word |
| [全功能 Office](/extensions/aiti-onlyoffice.md)（aiti-onlyoffice） | 接入 OnlyOffice 实现 Word、Excel、PPT 完整保真预览与编辑，适合重度办公场景 |
| [文档中心](/extensions/aiti-doc-center.md)（aiti-doc-center） | 自动收集整理项目里的 Markdown 文档，支持中文全文搜索和标签筛选 |
| [代码/文件编辑器](/extensions/aiti-editor.md)（aiti-editor） | 接管文件查看与编辑，支持压缩包解析和统一图片查看，是各类编辑体验的公共底座 |
| [邮件发送](/extensions/aiti-mail.md)（aiti-mail） | 统一的邮件发送出口，配置一次即可让各种流程发邮件，完整发送记录可查 |
| [IM 渠道接入](/extensions/aiti-channels.md)（aiti-channels） | 把钉钉、飞书、微信等聊天渠道接入工作台，统一界面管理通道和收发消息 |

## 界面与框架

| 功能 | 简介 |
|---|---|
| [会话管理面板](/extensions/session-manager.md)（session-manager） | 跨项目统一管理所有会话——标签分组、收藏、搜索、归档、看板总览，新建时可挑分支与 Worktree |
| [应用中心](/extensions/aiti-app-center.md)（aiti-app-center） | 左栏收起后的「开始菜单」应用抽屉，所有功能入口按分类集中，支持搜索、置顶和排序 |
| [会话请求卡](/extensions/aiti-session-cards.md)（aiti-session-cards） | AI 的方案审批、向你提问、工具授权等请求呈现为清晰卡片，一眼看懂、一键确认 |
| [浮动面板](/extensions/aiti-float.md)（aiti-float） | 各功能面板变成可拖拽、可缩放的浮窗，位置自动记忆，小屏自动全屏 |
| [快速上手](/extensions/aiti-quickstart.md)（aiti-quickstart） | 新会话欢迎页提供上手步骤、快捷操作和示例提示词，可一键克隆仓库或导入目录 |
| [扩展管理](/extensions/aiti-extman.md)（aiti-extman） | 界面内搜索、安装、启用/停用扩展，配合在线注册表即装即用 |
| [页面事件总线](/extensions/aiti-event-bus.md)（aiti-event-bus） | 让各功能实时联动刷新——状态、进度即时更新，连接不稳时静默重连、无感知恢复 |

## 深入了解

- 全部扩展逐个详解：[扩展目录](/extensions/README.md)
- 产品定位与能力五层：[aiti-agent](/products/aiti-agent.md)
- 架构总览：[架构](/guide/architecture.md)
