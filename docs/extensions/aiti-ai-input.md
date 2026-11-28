---
title: AI 输入增强（aiti-ai-input）
icon: ⌨️
ext:
  id: aiti-ai-input
  name: AI 输入增强
  nameEn: "AI Input Enhancer"
  description: 聊天输入框增强 —— L0/L1 两层自动补全 + 收藏联想 + 🎤 实时 ASR 语音输入（多引擎可插拔/热词/2-pass 精修）+ 听写检测修复
  descriptionEn: "Input enhancement for the AI chat composer: two-tier autocomplete (instant local → AI fallback), speech-input detection with spelling repair, streaming ASR with 2-pass refinement, switchable recognition engines (self-hosted / xfyun / Baidu / SiliconFlow / any OpenAI-compatible endpoint), hotwords, and usage reports."
  iconUrl: "/ext-icons/aiti-ai-input.svg"
  soulEn: "Before you finish typing, it has already guessed half of it."
  soul: 你还没打完的字，它已经替你想到一半了。
  type: aiti-ext
  category: 聊天增强
  version: "0.4.17"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: "@aiti-ai/aiti-ai-input"
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-ai-input/ 后 reload
  license: MIT
  tags: [input, autocomplete, voice, speech, chat, asr]
---

# aiti-ai-input

> ❝ **你还没打完的字，它已经替你想到一半了。** ❞

AI 聊天输入框的输入增强扩展（长期保留，非临时测试）。

### 自动补全（L0 本地秒出 → L1 AI）

打字静止 700ms 且光标在末尾 → 灰字显示下一句（Tab/→ 接受，Esc/继续打字取消）。

- **L0 本地层（零模型秒出）**：先查本地收藏 prompt + 会话历史输入，服务端 `POST /complete mode=local` 前缀匹配，命中即灰字直出 + ↦收藏/↦历史 角标，不请求 AI
- **L1 AI 层**：仅 L0 未命中才请求同款模型小请求（0.4–2s 后出灰字）
- **治理**：extman 功能管理——`autocomplete.enabled` 总开关 · `autocomplete.localOnly`（只跑 L0，零出网）· `autocomplete.minChars`（最小触发长度，默认 3，CJK 按 1.5 加权）· ctx 三档上下文预算

### 收藏联想（suggest）

输入框敲前缀弹候选面板：

- **候选静态优先**：命令 ⚡ rank0 + prompt 📌 rank1 + 应用（app-center 应用清单，点击/↑↓+Enter 直接执行不填入）；无命中时 `aiFallback` 兜底
- **后端扩展点**：`POST /providers {id,path,label,rank}` 注册联想源
- **`POST /suggest`**：聚合各 provider 结果 + 短输入严格过滤（`suggest.looseLen` 默认 10）
- **⚡ 一键执行**：feature `ai-input.suggestRun` 默认关（extman 开）
- **桌面/小屏双形态**：桌面固定弹窗（↑↓/Tab/Enter/Esc 键盘导航），小屏文档流建议条（点按生效）；标签文案走 `ui.i18n`（suggest.tag*）

### 命令直达（输入框即操作中枢）

输入框本身就是命令面板——联想区除了收藏/命令/续写，还会给出「应用命令」候选：

- **选择模型**：输入 `模型` / `model` / `切换模型` → 候选 → 点击即在原地弹出宿主模型选择框，选完面板关闭、**焦点回到输入框**（不离开输入流）。走宿主客户端服务 `pi-web.composer.openModelSelector`（ChatInput 先聚焦输入框保证小屏展开，再递增 `ModelSelector` 的 `openRequest` 信号；关闭时沿用组件既有的 `restoreFocusAfterClose` 焦点归还）
- **压缩上下文**：输入 `压缩` / `compact` → 点击直接触发当前会话压缩，与会话信息面板的压缩按钮同一链路（`pi-web.ui.compactSession`；压缩中/排队中不重入，无会话/后端不支持时静默 no-op）
- **范式**：任何扩展在 `commands` 命令目录槽注册条目（`meta.onClick` + `icon` + `keywords` + `category`）即同时获得 App Center 应用卡与输入框命令候选；执行完不向输入框插入文本，查询词自动清空
- **关键词自声明**：条目级 `meta.keywords` / 扩展顶层 `keywords`（manifest 透传）——扩展自己拥有中英别名，不依赖应用中心的写死覆盖表

愿景：把「一句话/一个词唤起任何操作、执行完自动回到输入框」做成默认交互（模型、压缩先行，会话切换 / 思考强度 / 导出 / 分支等按同一范式陆续挂载）。

### 小屏换行胶囊（⏎ 换行）

手机软键盘的 Enter 被定义为发送（微信式 enterKeyHint="send"），手机键盘没有便捷的 Shift+Enter —— 小屏输入框上方常驻一个「⏎ 换行」胶囊：

- **显示条件**：输入框聚焦且光标不在开头（行首插换行无意义）→ 建议条常驻显示（有联想/续写/语音候选时排最后，无候选时独占一条）；失焦/光标回行首/发送后清空自动收起
- **点按行为**：光标处插入换行（React 受控安全写入），光标落新行行首；继续输入后联想自动重排
- **仅触屏（pointer:coarse）渲染**：桌面 Shift+Enter 直接可用，完全不受影响
- **无独立开关**：跟随扩展启用（挂在建议条容器上），不受收藏联想 suggest 开关门控

### 语音输入（三层）

**① 听写检测 + 修复**（默认关：`voice.fix` / `voice.indicator`）

1. 纯浏览器事件特征检测语音/高速输入（`beforeinput` inputType + 节奏），零服务端依赖
2. 检测到 → 输入框上方「🎤 正在帮你检查修复转写错误」标记条，可 ✕ 删除
3. 发送时对错字/音译词/重复词做 AI 拼写修复，仅歧义处给替换建议

**② 🎤 实时 ASR（按住说话）**（两个顶级总闸 `voice.enabled` / `toolbar.enabled` 默认关，extman 开）

实时流式 WS 识别 + VAD 自动切句（~0.7s）+ 伪实时分句 SenseVoice + 松手 2-pass 离线精修（Qwen3-ASR）。

**③ ASR 引擎可插拔（asr-config.json）**

- **自建 8767**（FunASR / Qwen3 / GLM）：真流式 + 模型级热词
- **讯飞**：本地桥 8768 真流式
- **百度 / 硅基流动 / Azure / OpenAI 兼容端点**
- 面板切引擎；key 脱敏只回尾 4 位

### 热词 / 统计 / 自愈

- **热词**：session-manager `hotwords` 服务按 workspace 自动提取 + 用户词库合并（`user-hotwords.json` ≤500），按 ws 推送 8767 偏置识别（哈希 key + 10min TTL 防抖）
- **用量统计**：右栏「语音流量统计」tab（`GET /asr/usage`）
- **8767 自愈**：`/asr/ensure` 经 aiti-cmd runner PTY 拉起（熔断 60s / 防重 120s）；`/asr/control start|stop|restart`
