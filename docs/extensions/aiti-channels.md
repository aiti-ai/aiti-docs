---
title: IM 渠道（aiti-channels）
icon: 📮
ext:
  id: aiti-channels
  name: IM 渠道
  description: IM 渠道接入 + cc-connect 大前端外壳 —— 托管 cc-connect 进程、概览/项目/通道/会话面板、socket API 出站发消息
  soul: AI 不该被锁在网页里——钉钉/飞书/微信都是它的窗口。
  type: aiti-ext
  category: IM 渠道
  version: "0.1.7"
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

IM 渠道接入扩展：托管 cc-connect 进程（无 systemd 依赖），给 cc-connect 一个大前端外壳。平台 schema 覆盖 14 类：dingtalk / feishu / wechat / telegram / discord / slack / line / qq / qqbot / wecom / matrix / webex / yuanbao / googlechat。

- **进程托管**：cc-connect 由扩展拉起/管理，免 systemd 配置
- **面板**：概览 / 项目 / 通道 / 会话 / 配置 + 管理台内嵌 cc-connect 原生 Web UI
- **出站 API**：socket API 发消息（文本/文件），供 agent 工具链调用（如 `aiti-im-send`）
- **client**：JSX + vite 构建（模板 templates/ext-jsx-client）

## 能力一览

- **多实例**：向导式添加（自动分配 id/端口：mgmt 9821-9849、bridge 9811-9839），每实例独立 config/dataDir/socket；default 实例保护不可删
- **配置生成**：表单按平台 schema 动态渲染 → 生成 config.toml（写前自动 .bak 备份），免手编
- **扫码授权**：飞书/微信走 cc-connect 官方向导（本扩展代理转发，凭证回填表单、不代保存）
- **ACP agent 后端**：pi-web 常驻 ACP server（每实例 Unix socket），cc-connect 连接器仅几 KB——IM 消息由 pi-web 真会话承接，含 session/request_permission 人闸批准卡
- **agent 工具**：`aiti-im-list` / `aiti-im-send`——send 不带 session_key 自动选该项目首个活跃会话；filePath 发文件；默认关（extman `agentTools.enabled` 开）
- **安装/更新**：面板一键 install/update（justget，github+gitee 双源）
- **运维端点**：log（tail）/ msg-log（出站记录）/ reload-cc / restart-cc
