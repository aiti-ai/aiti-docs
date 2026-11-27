---
title: aiti-codehub（研发平台）
icon: 🗂️
ext:
  id: aiti-codehub
  name: 研发平台
  nameEn: "CodeHub"
  description: 云效 / GitHub / Gitee / GitLab 的工作项与代码库统一入口——工作项搜索 / 详情 / 评论、仓库与分支、克隆到工作区、建合并请求；多账号；AI 工具 + skills
  descriptionEn: "CodeHub — one hub for work items and repositories across Yunxiao / GitHub / Gitee / GitLab: search / detail / comments, repositories and branches, clone into a workspace, merge requests; multi-account; AI tools + skills"
  soul: 需求、分支、会话，在同一个地方。
  soulEn: "Requirements, branches and sessions in one place."
  type: extension
  category: 研发协作
  version: "0.1.0"
  status: beta
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  license: MIT
  tags: [codehub, workitem, yunxiao, github, gitee, gitlab, repository, multi-account, agent]
---

# aiti-codehub（研发平台）

> ❝ **需求、分支、会话，在同一个地方。** ❞

> 🟡 **内测中**：尚未随发行版分发、未上架 npm；当前仅在实验区源码部署（建议 dev 实例），接口与行为可能变化。

把研发平台的工作项与代码库收进工作台：不用在浏览器、IDE、会话之间来回找「这个需求对应哪个分支、哪次对话」。

## 两个面

- **工作项**：云效项目 / 工作项（搜索、筛选、详情、评论、自定义字段）；GitHub / Gitee / GitLab issues（仓库维度，列表 / 详情 / 评论）。富文本与 Markdown 描述正常渲染，云效工作项里的图片与附件经扩展代理，PAT 不进浏览器。
- **代码库**：代码组 / 组织 → 仓库 → 分支；收藏、克隆地址；从「获取工作区」直接克隆（走 `aiti-quickstart` 的 clone 引擎）；云效可创建合并请求。

两个面默认停右栏，可浮窗或移到左栏；「最近」跟随工作项面，「设置」共享。

## 多账号

同一平台可加多个账号（个人 + 工作 + 机器人）：默认账号沿用平台 id，其余为 `github~work` 这种稳定 id；每个账号独立凭据、收藏、最近与缓存，别名可改。GitHub 还能复用本机 `gh` CLI 的登录态。

## AI 与工作区

- `aiti_codehub_*` 工具：查工作项、读仓库 / 分支、按模板建分支；建合并请求等写操作默认关闭（需显式开启）。
- 三个 skills 供 AI 按需阅读；工作项可复制模板、写入提交框、发送到当前或新会话。
- 克隆出现在「获取工作区」的「代码托管」来源页签，克隆完直接开新会话。

## 平台与鉴权

| 平台 | 鉴权 | 工作项 | 代码 | 合并请求 |
|---|---|---|---|---|
| 云效 | PAT + OAuth（DCR + PKCE，零配置） | 项目 / 工作项 | 代码组 / 仓库 / 分支 | 创建 |
| GitHub | PAT + device code + 本机 `gh` | issues | 组织 / 仓库 / 分支 | 只读 |
| Gitee | PAT | issues | 组织 / 仓库 / 分支 | 只读 |
| GitLab | PAT + device code（17.1+） | issues | 组 / 仓库 / 分支 | 只读 |

自建 GitLab / GitHub Enterprise 可配 `baseUrl`。

## 安装（内测）

未上架 npm、未随发行版预装；当前从实验区源码部署到 **dev 实例** 后 reload 生效，生产实例需显式确认。凭据存服务端 `config/providers/<id>.json`（0600），接口不回显。
