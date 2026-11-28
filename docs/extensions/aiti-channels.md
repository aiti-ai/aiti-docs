---
title: IM 渠道（aiti-channels）
icon: 📮
ext:
  id: aiti-channels
  name: IM 渠道
  nameEn: "IM Channels"
  description: IM 渠道接入 + cc-connect 大前端外壳 —— 托管 cc-connect 进程、六 tab 管理面板、机器人向导五步、对话实时流、移动端远程控制
  descriptionEn: "IM channel integration + a full frontend shell for cc-connect — hosts the cc-connect process, a six-tab management panel, a five-step bot wizard, live chat, and mobile remote control"
  iconUrl: "/ext-icons/aiti-channels.svg"
  soulEn: "AI shouldn't be locked inside a web page — DingTalk/Feishu/WeChat are all its windows."
  soul: AI 不该被锁在网页里——钉钉/飞书/微信都是它的窗口。
  type: aiti-ext
  category: IM 渠道
  version: "0.1.14"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: "@aiti-ai/aiti-channels"
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-channels/ 后 reload
  license: MIT
  tags: [im, dingtalk, feishu, wechat, cc-connect, channel]
---

# aiti-channels

> ❝ **AI 不该被锁在网页里——钉钉/飞书/微信都是它的窗口。** ❞

IM 渠道接入扩展：托管 cc-connect 进程，给 cc-connect 一个大前端外壳。平台 schema 覆盖 14 类：dingtalk / feishu / wechat / telegram / discord / slack / line / qq / qqbot / wecom / matrix / webex / yuanbao / googlechat。

## 面板（六 tab）

- **总览**：状态驱动 onboarding——按实例真实状态给出下一步（未安装→装、未运行→启动、无机器人→打开向导、未绑定→诊断、全就绪→手机接入/对话）
- **机器人**：机器人列表（= cc-connect 项目，1:1）+ **向导五步**（基础→选平台→凭据→生效→验证，全程不换 tab；生效动作按创建路径自动判定 reload 或 restart）+ 行内项目设置（心跳/工作区/模型）+ 回复颗粒度
- **对话**：bridge WebSocket 实时流 + 会话管理（出站发送/删除）+ 消息日志
- **自动化**：定时任务（cron）/ Providers（37 预设 + 项目级激活）/ Skills（已装矩阵 + 预设市场，统一搜索）
- **系统**：安装/更新（justget 双源）、进程托管（systemd transient unit + 外部进程接管）、全局设置、配置批量生成（带整份重写警示）、实例日志（journald 或文件尾）
- **原版**：cc-connect 原生管理台内嵌（URL 自动推导：页面 host 子域置换 `cc.` 前缀，或显式 adminOrigin 配置）

## 接入

- **机器人向导**：唯一创建主线。扫码直建（微信/飞书/Lark，走 cc-connect 官方 device flow，凭证不代保存）或 token 表单（schema 动态渲染）；新建/生效/验证一气呵成
- **渠道健康**：平台连接状态、白名单 allow_from、心跳，经 management API 实时读取

## agent 后端（ACP）

- **pi-web 常驻 ACP server**，每实例独立端点：POSIX = Unix socket；**Windows = TCP（127.0.0.1，端口按实例派生 29000-29999）与命名管并存**——Windows 上 cc-connect piweb agent 以 `tcp://` 直拨，原生链零子进程
- cc-connect 侧连接器兜底（几 KB，stdio ⇄ 端点转发）保留；POSIX 原生链走 unix socket 直拨
- 反向人闸：session/request_permission → IM 弹批准卡
- 移动端远程：扫码深链携带当前会话（`?session=<id>`），手机登录后直接接管当前对话

## 托管与运维

- **进程托管**：Linux systemd transient unit（cgroup 树杀）；Windows CIM/taskkill；外部进程（手工 unit/nohup）可一键接管到面板托管
- **出站 API**：management API 通道（文本 `projects/{name}/send`），附件走 socket/TCP；`aiti-im-list` / `aiti-im-send` agent 工具同通道（默认关，extman `agentTools.enabled` 开）
- **配置生成**：表单批量生成 config.toml（写前备份 + 覆盖需显式确认 + token 不轮换）；日常加机器人走向导
- **多实例**：每实例独立 config/dataDir/端点；default 实例保护不可删
