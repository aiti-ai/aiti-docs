---
title: pi-secret-mask（粘贴防泄密）
icon: 🎭
ext:
  id: pi-secret-mask
  name: pi-secret-mask 粘贴防泄密
  description: pi 的会话级秘密脱敏——贴进 prompt 的密钥/token/凭据在模型看到之前替换为稳定占位符 [REDACTED:*]，模型在工具参数里回显占位符时于执行前还原真实值；随手贴，不泄密。零依赖，TUI 与全部 pi-web 会话一次安装全覆盖
  soul: 随手贴，不泄密。
  type: pi-plugin
  category: pi 插件
  version: 0.1.1
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: "@aiti-ai/pi-secret-mask"
  install: |
    pi install npm:@aiti-ai/pi-secret-mask
  license: MIT
  tags: [pi, plugin, secrets, redaction, paste-safe, placeholder, security]
  installable: false  # pi 插件——装进 ~/.pi/agent，不进 aiti-agent/pi-web 扩展体系：extman 不列出、extensions.json 归 integrations
---

# pi-secret-mask（粘贴防泄密）

> ❝ **随手贴，不泄密。** ❞

pi 的**会话级秘密脱敏**插件：

- **粘贴即脱敏**：贴进 prompt 的 API key / token / 凭据，在模型看到之前替换为稳定占位符
  `[REDACTED:github-token]`（同值同占位符，跨消息一致）
- **工具参数还原**：模型把占位符写进工具参数时，执行前还原为真实值——功能不受影响
- **会话级作用域**：一次安装覆盖 TUI 与全部 pi-web 会话（每个 pi-web pi 会话都是加载全局包的
  `pi --mode rpc` 子进程）
- **零依赖**，也可脱离 pi 独立使用

## 安装

```sh
pi install npm:@aiti-ai/pi-secret-mask
```
