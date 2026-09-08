---
title: aiti-crash-fatal
icon: 💥
ext:
  id: aiti-crash-fatal
  name: 崩溃演习
  description: flag 写入 → startup throw → ⚠ 指示器 + restore-ext 幂等清除——崩溃自愈链路的演习工具
  soul: 崩溃要演，不要等。
  type: dev-repo
  category: 系统工具
  version: 0.1.0
  status: dev-only
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  license: MIT
  tags: [crash, drill, devtools, testing]
---

# aiti-crash-fatal

崩溃演习扩展：验证 pi-web 扩展崩溃自愈/恢复链路。

- **流程**：写 flag → 下次启动故意 throw → 页面出现 ⚠ 崩溃指示器 → `restore-ext` 幂等清除 flag 恢复。
- **dev 隔离专用**：只部署 `~/.pi/web-dev/`，不进生产。
