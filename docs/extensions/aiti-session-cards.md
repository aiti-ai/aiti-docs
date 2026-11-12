---
title: aiti-session-cards
icon: 💬
ext:
  id: aiti-session-cards
  name: 会话请求卡
  description: 会话请求卡扩展——交互元语卡（zcode 方案审批 / AskUser / omp OAuth / generic 兜底）与工具授权卡完整 UI，自 pi-web core 外迁（agent 能力 UI 去核化 P1）
  soul: agent 求你作答的卡片，长什么样由扩展说了算。
  type: aiti-ext
  category: 聊天增强
  version: "0.1.9"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
  license: MIT
  tags: [session-request-card, plan-approval, ask-user, tool-auth, oauth, interaction, permission]
---

# aiti-session-cards · 会话请求卡

> ❝ **agent 求你作答的卡片，长什么样由扩展说了算。** ❞

agent 能力 UI 去核化 P1 外迁产物（组件 ~630 行自 pi-web core 迁出）：宿主留 `sessionRequestCard` 插槽（请求-作答形态唯一缝）+ 极简兜底卡（capability 不裸奔），完整卡 UI 归本扩展。

## 请求卡家族

- **`interaction:plan_approval`**（zcode ExitPlanMode 适配）：方案全文 MiniMarkdown 渲染 + 批准 / 拒绝 / 反馈修改意见（反馈经 respond message 回给 agent 继续改方案）
- **`interaction:ask_user`**（zcode AskUserQuestion 适配）：多题选项按钮（单选/多选，全部答完才可提交）+ 跳过/提交 + 可选附加说明
- **`interaction:tool_auth`**（CC 族 can_use_tool 兜底形态）：人话摘要（reason/command/path 等 key 归一）+ 拒绝/允许
- **`interaction:open_url`**（omp login 适配）：登录授权单向卡——打开登录页 / 复制链接（本机短链优先，防长 URL 截断）/ 关闭；agent 检测授权完成自动继续
- **`interaction:generic`**：自由形态兜底（prompt + input 摘要 + 接受/拒绝）
- **`permission`**（cursor/claude 等后端 permission_request）：结构化渲染 = 摘要单行 + `<details>` 完整入参折叠；按钮集来自宿主透传 `options`（ACP optionId 协议语义透传，如「总是允许」），无 options 回退 允许/拒绝
- 红线：正文为空的卡不许裸奔——缺正文的 plan/tool_auth/generic 一律退 input 摘要 + 默认作答按钮

## 契约

- 宿主按 `meta.kinds ∋ request.kind` 过滤、priority 最高者胜出；未命中落 core 极简兜底卡（每家族 ≤40 行，会话不卡死）
- extra：`SessionRequestPayload`（kind/capability/prompt/plan/questions/options/captchaConfig…）+ `respond(answer) => Promise<boolean>`；`provider_headers` 验证码卡不归本扩展——「谁的能力谁渲染」，归 aiti-zcode-agent client；aiti-provider-usage 承接用量徽标
- **浮窗契约**：卡挂 `data-ext-float` 全家桶（可拖拽/置前/位置持久化），未装 aiti-float 时居中样式兜底
- 自带 MiniMarkdown（React 转义零 `dangerouslySetInnerHTML`，防 agent 注入）；host-shim 把 react 重定向到宿主渲染原语，产物零 React 引用

## feature 开关

`sessionCards.enabled`（默认开）关停 → 宿主 core 极简兜底卡接管（仍可接受/拒绝）。旧宿主无此插槽 → registerItems try/catch 降级，不抛不白屏。

## 来源

2026-09-16 外迁（已实施）。task 等未来 agent 能力禁进核，一律走扩展通道承接。
