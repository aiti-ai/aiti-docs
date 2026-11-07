---
title: 弹窗浮动增强器（aiti-float）
icon: 🎈
ext:
  id: aiti-float
  name: 弹窗浮动增强器
  description: data-ext-float 契约接管 —— 拖拽/边缘缩放/位置持久化/点按置前/双击复位/自动最大化按钮，小屏自动全屏 + 系统返回关闭浮窗；DockStack 左栏统一区块栈服务
  soul: 面板只管标一个属性，浮起来的一切交给它。
  type: dev-repo
  category: 聊天增强
  version: "0.5.9"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-float/ 后 reload
  license: MIT
  tags: [float, dialog, drag, resize, mobile, contract]
---

# aiti-float

> ❝ **面板只管标一个属性，浮起来的一切交给它。** ❞

纯 client 扩展：凡根节点标 `data-ext-float="1"` 的弹窗面板，自动获得拖拽移动、边缘缩放、位置持久化、点按置前、双击复位；首个子元素作拖拽把手。v0.4.0 起还会自动往标题栏注入标准 ⛶/❐ **最大化按钮**（点击铺满视口，小屏全屏态自动隐藏；`data-ext-float-max="0"` 豁免）——扩展零代码。再加 `data-ext-float-full="1"` 即小屏（≤640px 宽）自动铺满视口并停用手势/持久化，跨断点动态切换。v0.4.5 起**遮罩自动去除**：增强面板时祖先链上的半透明全屏遮罩自动变透明 + 点击穿透（浮窗不再挡消息区操作；真模态确认框加 `data-ext-float-keepmask="1"` 豁免，副作用=点外关闭失效）。

未安装/禁用本扩展时，面板回退普通居中弹窗（自身 style 兜底）——接入方零逻辑零状态。

v0.5.0 起小屏（≤640px）面板打开时**系统返回优先关闭面板**（Android 返回键 / iOS 侧滑，消费宿主 `pi-web.overlayBack` 退栈服务，接入方零代码；无 ✕ 面板不注册，旧宿主/桌面自动降级）。v0.5 另注册 **`aiti-float.dockstack` 服务**——左栏统一区块栈容器（常驻 blocks + dockable items、用户排序/折叠持久化、对齐分组、单展开手风琴、懒扩展静态壳展开才物化；**`filler` prop v2 = 全折叠空白填充物**），session-manager 侧栏接管即由它编排，且 `dependsOn` 本能力（extman 阻止本扩展被单独禁用）。另有 `aiti-float.dock-header` 服务（dock 头工具条 store，第三方扩展经 getExtService 接入）。

契约专题（属性全表 / 小屏全屏 / 手动最大化 API / keepmask 豁免 / pos / persist）见 `dev-repo/docs/aiti-web-ext-float-dialogs.md`；注册总纲 `docs/dev-repo-authoring-reference.md` §8.3。常用属性速查：

| 属性 | 作用 |
|---|---|
| `data-ext-float` | `"1"` 移动+缩放；`"drag"`/`"resize"` 单项 |
| `data-ext-float-w` / `-h` | 初始尺寸 px |
| `data-ext-float-autoh` | `"1"` 高度随内容自适应（不持久化高度；异步增长型弹窗用） |
| `data-ext-float-full` | 小屏（≤640px 宽）自动铺满视口——新弹窗小屏适配一律用它，勿自写 matchMedia |
| `data-ext-float-max` | `"0"` 不注入自动最大化按钮 |
| `data-ext-float-keepmask` | `"1"` 豁免遮罩自动去除（真模态确认框用） |
| `data-ext-float-drag` | 标在面板内子元素 = 指定该元素为拖拽把手 |
| `data-ext-float-pos` | `"asis"` 首次出现保持渲染位置（锚定下拉用） |
| `data-ext-float-persist` | `"0"` 禁用位置持久化（锚定下拉根治窄屏出屏） |
| `data-ext-float-min-w` / `-min-h` | 边缘缩放下限（缺省 320×200） |

## 接入示例

- 可运行参考：[demo](demo.md)、[ext-jsx-client 模板](ext-jsx-client.md)
- 实际接入方：aiti-ui-env、extman、model-wizard、session-manager、plan-first 等全仓弹窗均已接入

## 版本历史

- **0.5.x**：小屏系统返回关闭浮窗（0.5.0，`pi-web.overlayBack`）；DockStack 服务 `aiti-float.dockstack`（filler prop v2）；置前不再连带抬「非层叠上下文」定位祖先——修 plan/ask 卡后整块透明消息区压过左右栏（0.5.1）；拖拽吸附——floating 态落点命中声明 zone 容器入栈（0.5.2）；同 itemKey 浮窗+嵌入双开检测（0.5.3）
- **0.4.8**：初始/恢复位出屏兜底拉回居中
- **0.4.7**：`data-ext-float-pos="asis"`（锚定出现位）+ `data-ext-float-persist="0"`（禁持久化）——锚定下拉类弹窗组合拳
- **0.4.6**：出现置前——新挂载面板自动抬到已有浮层之上（修「后开弹窗被先开者压底」，实证：归档查看器被遮）
- **0.4.5**：**遮罩自动去除**——祖先链半透明全屏遮罩自动透明+点击穿透（`data-ext-float-keepmask` 豁免）；性能红线：scan 自愈遇已标记祖先立即返回（稳态零强制重排）
- **0.4.4**：性能事故修复——MutationObserver 回调禁微任务链（0.4.3 回归致主线程饿死页面冻结），改 rAF 调度 + style 同值守卫
- **0.4.0**（2026-08-26）：自动注入标准最大化按钮 ⛶/❐（`data-ext-float-max` 豁免）；新增 `__piweFloat.isFull()`；extman / ai-usage / subagents 自备按钮已迁移
- 0.3.x：小屏全屏 `data-ext-float-full`、手动最大化 API（`toggleMax/setMax/isMax`）、`data-ext-float-autoh`
