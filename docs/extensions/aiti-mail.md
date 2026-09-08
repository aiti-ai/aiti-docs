---
title: aiti-mail
icon: ✉️
ext:
  id: aiti-mail
  name: aiti-mail
  description: pi-web 内通用「邮件发送出口」——零依赖 SMTP 客户端 + 发送记录（node:sqlite）+ 管理弹窗（配置/测试/记录）
  soul: 配置一次 SMTP，pi-web 里任何扩展和 AI 都能发邮件。
  type: dev-repo
  category: 系统工具
  version: 0.1.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    node dev-repo/aiti-mail/tools/deploy.mjs   # 双实例部署 + 热重载
  license: MIT
  tags: [mail, smtp, email, notify, sqlite]
---

# aiti-mail

> ❝ **配置一次 SMTP，pi-web 里任何扩展和 AI 都能发邮件。** ❝

pi-web 内的通用邮件发送出口（v0.1.0）。首个消费方是 ⏰调度（`aiti-ai-schedule` v0.4.0 的任务结果邮件送达）。

- 设计全文：`aiti-work/docs/aiti-ai-schedule-integration-plan.md` §4.6

## 能力一览

| 能力 | 说明 |
|---|---|
| SMTP 客户端 | 零依赖（`net`/`tls`）：465 隐式 TLS / 587·25 STARTTLS 自动升级；AUTH PLAIN 优先 LOGIN 兜底；全程 25s 超时；不自动重试 |
| MIME | UTF-8 正文（base64 76 切行）；主题 RFC 2047 encoded-word；`Date`/`Message-ID`/`From`/`To` 头；DATA 阶段 dot-stuffing |
| 发送记录 | `node:sqlite`（`dataDir/mails.db`）：时间/收件人/主题/状态/耗时/来源；90 天保留自动清理 |
| 管理弹窗 | 工具条 ✉ → 两 tab（配置[SMTP 表单+发送测试] / 发送记录表格）；`data-ext-float` 浮窗契约 |

## API（registerHttpRoute，同源调用）

| 端点 | 说明 |
|---|---|
| `GET /config` | 当前配置（**`pass` 不回显，只回 `hasPass`**） |
| `POST /config` | 保存（`pass` 缺省=保留旧值；文件 0600） |
| `POST /test` | `{to}` 发测试邮件（source=test） |
| `POST /send` | `{to, subject, body, source?}`；`to` 逗号/全角分隔，逐个发送逐条记录；返回 `{ok, results:[{to,status,error}]}` |
| `GET /log` | 发送记录（默认 50 条倒序，可按 status 过滤） |

## AI 帮助点（M3）

`ai: { manage: true, skills: "skills" }` —— `skills/mail-setup/SKILL.md`：教 AI 帮用户配 SMTP、调 `/send`、查 `/log`（弹窗右上角 🤖 可见）。

## 安全

- SMTP 密码只存 `dataDir/config.json`（0600）；API 永不回显明文。
- 已纳入 aiti-configs 加密同步面（`encrypt.patterns`: `web/data/aiti-mail/*.json`，aes-256-gcm 密文入仓可备份）；`mails.db` 被 `**/*.db` 排除规则兜住不入仓。
- 已知取舍：TLS 不校验证书链（`rejectUnauthorized:false`，自托管场景宽松档）。

## 门控与部署

无 feature 开关；工具条按钮注册即出现。`node tools/deploy.mjs` 部署双实例。
