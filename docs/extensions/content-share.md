---
title: content-share（内容分享基础能力包）
icon: 📦
ext:
  id: content-share
  name: content-share 内容分享引擎
  description: 按 provider 把内容换成 URL 的基础能力包——内置 161 个分享目标（ShareX .sxcu 全量 148 份 + 国内直连 Gitee/兰空/SM.MS/Pastebin/Rentry/paste.rs/阿里云 OSS + 笔记库 Joplin/Obsidian/memos/思源/flomo），零运行时依赖的 .sxcu 执行引擎（4 种 body、ShareX 语法解析、JSONPath/regex 取 URL），支持远端目录 overlay 与脱敏 hook
  soul: 一套 provider 引擎，所有应用共享同一份"从内容到 URL"。
  type: other
  installable: false  # 基础库——不是 aiti-agent/pi-web 扩展：extman 不列出、extensions.json 归 integrations
  category: 基础库
  version: 0.1.6
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: "https://github.com/aiti-ai/content-share"
  npm: "@aiti-ai/content-share"
  install: |
    npm install @aiti-ai/content-share
    # 或直接用 CLI：
    npx @aiti-ai/content-share list text
  license: MIT
  tags: [share, upload, paste, image-host, sxcu, sharex, gist, gitee, oss, joplin, base-library]
---

# content-share

> ❝ **一套 provider 引擎，所有应用共享同一份"从内容到 URL"。** ❞

## 它是什么

把文本、图片或文件上传到 paste 站、图床、对象存储或笔记库，拿回一个可分享 URL 的基础能力包。**包到 URL 为止**——二维码、剪贴板、系统分享面板归调用方。

被 [aiti-msg-share](/extensions/aiti-msg-share) 用作分享引擎。

## 为什么是它

- **161 个内置目标**：[ShareX CustomUploaders](https://github.com/ShareX/CustomUploaders) 全量 148 份 `.sxcu`（脚本同步上游）+ 国内直连 7 家 + 笔记库 5 家 + 2 个代码 provider。
- **数据驱动**：`.sxcu` 配置**就是** provider——不写代码就能加一个目标，统一引擎执行（4 种 body、ShareX 语法解析移植、JSONPath/regex 取 URL）。
- **运行时注册**：`registry.register()` / `addEntry()`，支持用户自定义与远端下发。
- **远端目录 overlay**：推荐集、死站标注、新条目可在中心 JSON URL 维护（磁盘缓存 + TTL + 过期兜底）。
- **脱敏 hook**：`share()` 接受 `hooks.transformText`，调用方可注入密钥扫描（如 `@aiti-ai/secret-mask-core`）。包本身不干涉内容。
- **零运行时依赖**，Node ≥ 22.18。

## 用法

```ts
import { Registry, share } from "@aiti-ai/content-share";

const registry = new Registry();
await registry.init();                       // 载入 161 条目录

const result = await share(
  registry.get("gitee-gist")!,
  { text: "# 你好" },
  { provider: "gitee-gist", values: { token: process.env.GITEE_TOKEN! } },
);
console.log(result.url);                     // 终态
```

CLI：

```bash
content-share list [text|image|file]            # 按类型列目标
content-share share --provider <id> --text hi   # 上传并打印 URL
content-share import-sxcu <file.sxcu>           # 校验配置兼容性
content-share mock paste-demo --port 8931       # 起演示 paste 服务
```

## 类别

`publish`（公网 URL）· `archive`（Joplin/Obsidian 等深链）· `bookmark` · `local`（本机会话链接）。

## 许可

MIT。`.sxcu` 语法语义由 ShareX（GPL v3）独立重实现推导，未包含其源码。
