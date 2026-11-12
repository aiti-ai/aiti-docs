---
title: aiti-crash-fatal
icon: 💥
ext:
  id: aiti-crash-fatal
  name: 崩溃演习
  description: flag 写入 → startup throw → ⚠ 指示器 + restore-ext 幂等清除——崩溃自愈链路的演习工具
  soul: 崩溃要演，不要等。
  type: aiti-ext
  category: 系统工具
  version: "0.0.3"
  status: dev-only
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  license: MIT
  tags: [crash, drill, devtools, testing]
---

# aiti-crash-fatal

崩溃演习扩展：验证 pi-web 扩展崩溃自愈/恢复链路。三个崩溃入口（部分崩理念：每次只蹦一个，均有备份/可恢复）：

- **🧨 崩扩展 startup**：`POST /crash-ext` 写崩溃标志 → reload 后 startup throw → 页面左下角 ⚠「启动失败」指示器（页面/API/client 全活）→ `POST /restore-ext` 幂等清除恢复（或 ⚠ 弹层恢复，60s 自动恢复）
- **💥 崩页面**：`POST /corrupt` 备份 `app/page.tsx` 并写入 render throw 版 → 刷新 → 🚑 `global-error` 急救页 → `POST /restore` 还原（备份缺失时 `git show HEAD:` 兜底）
- **🧱 崩编译**：`POST /corrupt-build` 往 `components/AppShell.tsx` 顶部注入不存在导出 import → Turbopack Build Error overlay 全屏接管（编译错发生在 React 树建立前，global-error 接不住）→ rescue-hook 🚑 横幅自动引导 `/rescue.html`（public/ 静态页不进编译图）→ `POST /restore-build` 还原
- **入口**：dev 页面顶部工具栏红色 💥 Fatal 按钮（自定义可复制确认框选场景）；`GET /status` 查各场景破坏态
- **dev 隔离专用**：`NODE_ENV !== development` 直接 403；deploy 只打 `~/.pi/web-dev/`，不进生产
