---
title: aiti-secret-vault（密钥库管理）
icon: 🔑
ext:
  id: aiti-secret-vault
  name: aiti-secret-vault 密钥库管理
  description: pi-web 的加密密钥库管理弹窗——别名查看/新增/轮换/查看明文/删除、锁定/解锁、keyfile ↔ 系统钥匙串切换、会话挂载总览；值只走浏览器→本机服务→加密库，不经过 AI 对话
  soul: 在网页里管库，AI 永远只拿令牌。
  type: aiti-ext
  category: 安全
  version: 0.1.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  license: MIT
  npm: "@aiti-ai/aiti-secret-vault"
  tags: [vault, secrets, security, keychain, pi-web, management]
---

# aiti-secret-vault（密钥库管理）

> ❝ **在网页里管库，AI 永远只拿令牌。** ❞

`@aiti-ai/pi-secret-vault` 的 pi-web 管理面：工具栏钥匙图标 → 管理弹窗，直接操作同一份
`~/.pi/agent/secret-vault/` 加密库。

## 弹窗能力

**密钥库 Tab**

- 条目表格：别名、scope（global/project）、说明、标签、版本、最近使用（**零值**）
- 新增 / 轮换：值输入框为 write-only（浏览器 → 本机 pi-web 服务 → 加密库，不落日志）
- 查看：显示 + 一键复制（仅本机浏览器；响应 `cache-control: no-store`）
- 删除：两段式确认；挂载中的同名令牌随即失效（guard 拦截）
- 锁定 / 解锁；**解锁模式切换**：keyfile ↔ 系统钥匙串（切换会重新生成主密钥并重加密全库，需确认）

**会话挂载 Tab**

- pi 扩展写入的零值会话记录：session id、cwd、落盘策略（landing）、当前挂载的别名名
- 用于确认“哪个会话正握着哪个别名”，不含任何值

## API（同源、需 pi-web 登录态）

```text
GET    /api/extensions/aiti-secret-vault/status
GET    /api/extensions/aiti-secret-vault/entries
POST   /api/extensions/aiti-secret-vault/entries            {alias,value,desc?,tags?,project?}
DELETE /api/extensions/aiti-secret-vault/entries/:alias
POST   /api/extensions/aiti-secret-vault/entries/:alias/reveal
POST   /api/extensions/aiti-secret-vault/lock | /unlock
POST   /api/extensions/aiti-secret-vault/mode               {mode:"keyfile"|"keychain"}
GET    /api/extensions/aiti-secret-vault/sessions
```

所有响应 `no-store`；值不进服务日志、不进 AI 上下文。

## 依赖与部署

- server 依赖 `@aiti-ai/secret-vault-core`（AES-256-GCM store + keychain 后端），由 aiti-extman 管理的共享 `node_modules` 解析
- 安装后自动出现工具栏入口；弹窗遵守 aiti-float 浮动契约（拖拽/缩放/位置持久化/小屏全屏），🤖/🔧 按钮由框架统一注入
