---
title: AI 输入增强（aiti-ai-input）
icon: ⌨️
ext:
  id: aiti-ai-input
  name: AI 输入增强
  description: 聊天输入框增强 —— L0 本地/L1 AI 两层自动补全 + 语音输入检测与转写修复
  soul: 你还没打完的字，它已经替你想到一半了。
  type: dev-repo
  category: 聊天增强
  version: 0.1.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-ai-input/ 后 reload
  license: MIT
  tags: [input, autocomplete, voice, speech, chat]
---

# aiti-ai-input

> ❝ **你还没打完的字，它已经替你想到一半了。** ❞

AI 聊天输入框的输入增强扩展（长期保留，非临时测试）。

### 自动补全（L0 本地秒出 → L1 AI）

打字静止 700ms 且光标在末尾 → 灰字显示下一句（Tab/→ 接受，Esc/继续打字取消）。

- **L0 本地层（零模型秒出）**：先查本地收藏 prompt + 会话历史输入，服务端 `POST /complete mode=local` 前缀匹配，命中即灰字直出 + ↦收藏/↦历史 角标，不请求 AI
- **L1 AI 层**：仅 L0 未命中才请求同款模型小请求（0.4–2s 后出灰字）
- **治理**：extman 功能管理——`autocomplete.enabled` 总开关 · `autocomplete.localOnly`（只跑 L0，零出网）· ctx 三档上下文预算

### 语音输入

1. 纯浏览器事件特征检测语音/高速输入（`beforeinput` inputType + 节奏），零服务端依赖
2. 检测到 → 输入框上方「🎤 正在帮你检查修复转写错误」标记条，可 ✕ 删除
3. 发送时对错字/音译词/重复词做 AI 拼写修复，仅歧义处给替换建议
