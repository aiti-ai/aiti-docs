---
title: IM 渠道（aiti-channels）
icon: 📮
ext:
  id: aiti-channels
  name: IM 渠道
  description: IM 渠道接入 + cc-connect 大前端外壳 —— 托管 cc-connect 进程、概览/项目/通道/会话面板、socket API 出站发消息
  soul: AI 不该被锁在网页里——钉钉/飞书/微信都是它的窗口。
  type: dev-repo
  category: IM 渠道
  version: 0.1.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-channels/ 后 reload
  license: MIT
  tags: [im, dingtalk, feishu, wechat, cc-connect, channel]
---

# aiti-channels

> ❝ **AI 不该被锁在网页里——钉钉/飞书/微信都是它的窗口。** ❞

IM 渠道接入扩展：托管 cc-connect 进程（无 systemd 依赖），给 cc-connect 一个大前端外壳。

- **进程托管**：cc-connect 由扩展拉起/管理，免 systemd 配置
- **面板**：概览 / 项目 / 通道 / 会话 / 配置 + 管理台内嵌 cc-connect 原生 Web UI
- **出站 API**：socket API 发消息（文本/文件），供 agent 工具链调用（如 `aiti-im-send`）
- **client**：JSX + vite 构建（模板 templates/ext-jsx-client）
