---
title: AI 输入增强（aiti-ai-input）
icon: ⌨️
ext:
  id: aiti-ai-input
  name: AI 输入增强
  description: 聊天输入框增强 —— L0/L1 两层自动补全 + 收藏联想 + 🎤 实时 ASR 语音输入（多引擎可插拔/热词/2-pass 精修）+ 听写检测修复
  soul: 你还没打完的字，它已经替你想到一半了。
  type: dev-repo
  category: 聊天增强
  version: "0.4.10"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
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

- **候选静态优先**：命令 ⚡ rank0 + prompt 📌 rank1；无命中时 `aiFallback` 兜底
- **后端扩展点**：`POST /providers {id,path,label,rank}` 注册联想源
- **`POST /suggest`**：聚合各 provider 结果 + 短输入严格过滤（`suggest.looseLen` 默认 10）
- **⚡ 一键执行**：feature `ai-input.suggestRun` 默认关（extman 开）

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
