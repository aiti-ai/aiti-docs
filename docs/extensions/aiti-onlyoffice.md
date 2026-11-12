---
title: OnlyOffice 编辑（aiti-onlyoffice）
icon: 📚
ext:
  id: aiti-onlyoffice
  name: OnlyOffice 深度保真编辑
  description: .docx/.xlsx/.pptx 完整保真预览+编辑（OnlyOffice DocumentServer Docker 后端）。AGPL 社区版，feature 默认关
  soul: 深度保真档——与桌面 Office 同引擎，复杂排版编辑不将就。
  type: aiti-ext
  category: 开发工具
  version: "0.1.7"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 1) 部署到 ~/.pi/web/extensions/aiti-onlyoffice/ 后 reload
    # 2) 启动 DocumentServer：scripts/onlyoffice-up.sh（Docker，常态 ~2G 内存）
    # 3) 扩展管理器 → aiti-onlyoffice → 功能 → 勾选「启用 OnlyOffice」并刷新页面
    # 依赖：aiti-editor（多编辑器仲裁宿主）+ Docker
  license: AGPL-3.0（OnlyOffice DocumentServer 社区版，可选 Docker 档不装即无）
  tags: [word, excel, powerpoint, onlyoffice, editor, docker]
---

# aiti-onlyoffice

> ❝ 深度保真档——与桌面 Office 同引擎，复杂排版编辑不将就。 ❞

多编辑器机制（aiti-editor M0）的深度保真实现扩展（M2，`aiti-<filetype>-<impl>` 命名规范的多域例外）。

## 能力

- **.docx / .doc / .odt / .xlsx / .xlsm / .xls / .ods / .pptx / .ppt / .odp** 完整保真渲染与编辑（与桌面 Office 同引擎；老格式原生编辑，DS 回存保持原扩展名，Word/WPS/soffice 均按内容正常打开）
- word / sheet / slide 三 provider 分开注册——可分别设默认；老格式另有 doc-pdf / xls-readonly 兜底预览（「打开方式」菜单共存）
- DS 侧保存：forcesave / 自动保存经 callback 直写服务端（原子写 tmp+rename）
- mtime 变 → key 变 → DS 重拉（文件变化实时跟随天然成立）

## 功能开关

- `onlyoffice.enabled`：默认关；开启后探测 DocumentServer，健康时才注册 provider（菜单自然多一项）
- `onlyoffice.url`：DS 地址（默认 `http://127.0.0.1:8802`）
- `onlyoffice.publicUrl`：浏览器侧 DS 地址（nginx `/onlyoffice/` 反代场景填反代地址）
- `onlyoffice.containerBase`：留空即与网页同 URL（容器与浏览器同源可达，推荐）；仅 DS 在别的机器等特殊拓扑才需覆盖

## 安全

- download/callback URL 带一次性 HMAC token（path+expiry 签名）防穿越/盗链
- JWT(HS256) 签名 editor config；secret 存扩展 configDir（`~/.pi/web/data/aiti-onlyoffice/config/jwt-secret`，不入仓；onlyoffice-up.sh 读同一份给容器）
- 保存白名单 = blob-save-route 同款（workspace + 用户根）

## 网络（部署固化，已落地）

- **回访基址 = 网页 URL**：DS 容器与浏览器访问同一地址（域名 → 本机、证书有效），document.url /
  callbackUrl 直接用浏览器 origin + basePath；nginx 对 `/{,dev/}api/extensions/aiti-onlyoffice/`
  免 Authelia（凭证由扩展侧 HMAC token 承担）
- 浏览器加载 DS：`location /onlyoffice/` 子路径反代（官方配方：rewrite 剥前缀 +
  X-Forwarded-Host 携 `/onlyoffice` 后缀，否则缓存外链丢前缀 → 「下载失败」）
- 容器访问宿主直连端口（本机 IP 直连调试场景）：ufw 放行 `ufw allow from 172.16.0.0/12`
- ⚠ 本机用 `127.0.0.1:<port>` 直连调试时容器回访不可达——请用 LAN IP / 域名访问，或配 containerBase
