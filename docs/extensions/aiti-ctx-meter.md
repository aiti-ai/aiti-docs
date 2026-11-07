---
title: aiti-ctx-meter
icon: 🔋
ext:
  id: aiti-ctx-meter
  name: aiti-ctx-meter
  description: 输入区上下文比例条指示器——桌面 compactLead 竖向比例条 + 小屏 modelInfoLead 前导位，urgency 四档色阶 + critical 呼吸，点击开宿主会话统计面板
  soul: 上下文还剩多少，看一眼电池就知道。
  type: dev-repo
  category: 聊天增强
  version: "0.1.12"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    node dev-repo/aiti-ctx-meter/tools/deploy.mjs   # 构建产物拷贝 + 双实例部署 + reload
  license: MIT
  tags: [context, meter, compact-lead, model-info-lead, urgency, breathing, session-stats]
---

# aiti-ctx-meter

> ❝ **上下文还剩多少，看一眼电池就知道。** ❞

输入区上下文比例条指示器：桌面 `compactLead` 竖向比例条（压缩按钮左邻位）显示 context %，小屏宿主新插槽 `modelInfoLead`（展开态输入行 + InfoSheet 模型行两处 ModelSelector 前导位）也有它。纯 client 扩展（免 vite，纯 mjs + 宿主渲染原语），装上即生效。

## 能力

- **urgency 四档色阶**：色阶由宿主 `contextUrgency()` 的 `CtxUrgency` 对象驱动（扩展零展示逻辑只消费）——calm（<70 灰）/ warn（70–90 黄）/ urgent（90–97 红）/ critical（>97 深红 + 呼吸动画，`prefers-reduced-motion` 时关闭）
- **压缩三态**：`compact.isCompacting / compactQueued`（streamingActions 提案压缩子集接缝）在 tooltip 附加行标注「压缩中… / 压缩已排队」
- **点击**：`openSessionInfo()` 开宿主会话统计面板（token 明细 + 压缩按钮）——slot extra 回调优先 → `pi-web.composer` 客户端服务兜底 → 均缺席不可点降级
- **小屏（v0.1.4）**：只显示比例条本体不显示数字（数字仍在 title/aria-label，无障碍不丢信息）——给底排右侧按钮让宽
- 纯函数内核（`barFillHeight`/`barPercentLabel`/`formatWindow`/`shouldShowPercentLabel`/`barTitleText`）5 组测试钉住；无轮询——percent 由宿主 state 事件驱动经插槽 extra 直达

## 契约与降级

- 宿主插槽：`compactLead`（硬）+ `modelInfoLead`（软）——宿主过旧缺新插槽时 `safeRegister` console.warn 且不显示，不抛不白屏
- v0.1.3 起 `sessionStats` 余额区块退役：余额/额度统一归宿主 provider-usage 面板（去重），本扩展不再接管该插槽

## 来源

2026-09-13 上线；方案 `docs/aiti-ctx-meter-plan.md`（已实施，宿主透传 `contextUsage`/`onSessionStatsPanelOpen` + `lib/ext/types.ts` 契约）。
