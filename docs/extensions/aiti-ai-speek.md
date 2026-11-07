---
title: aiti-ai-speek
icon: 🔊
ext:
  id: aiti-ai-speek
  name: 跟读模式
  description: AI 输出语音朗读——可切音色/暂停/跳过/停止；默认浏览器 Web Speech，可选 edge-tts
  soul: AI 说给你听。
  type: dev-repo
  category: 聊天增强
  version: "0.1.7"
  status: beta
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  license: MIT
  tags: [tts, speech, audio]
---

# aiti-ai-speek

pi-web「跟读模式」扩展：把 AI 输出的文本用语音朗读出来。

- **双引擎**：默认浏览器 Web Speech（零依赖）；可选 edge-tts 服务端合成（更自然的音色）。
- **播放控制**：暂停/继续/跳过/停止；朗读进度与消息锚定。
- **ASR 热词联动**：热词提取走 `session-manager.hotwords` 服务（消费 [session-manager](session-manager.md) 出口）。

## 近期变更（2026-09）

- **双 SSE 双推合并（方案A）**：文本流与播放进度两条 SSE 通道合并为单通道双推，消除乱序/重复；extman 对懒扩展前置物化（打开面板即拉起 client）。
- 扩展已懒加载化（`clientImmediately:false`）。

方案文档：`dev-repo/docs/aiti-ai-speek-*.md`（4 份 plan）。
