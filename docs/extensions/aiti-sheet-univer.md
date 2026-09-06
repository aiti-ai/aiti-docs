---
title: Excel 编辑器（aiti-sheet-univer）
icon: 📊
ext:
  id: aiti-sheet-univer
  name: Excel 表格编辑器
  description: .xlsx/.xlsm 在线预览+编辑（exceljs 数据面 + Univer 视图面）；.xls/.ods 只读预览与一键转 .xlsx
  soul: 老格式不挡路——转换、派生、编辑各归其位。
  type: dev-repo
  category: 开发工具
  version: 0.1.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-sheet-univer/ 后 reload
    # 依赖：aiti-editor（多编辑器仲裁宿主）；服务器端转换需 LibreOffice (soffice)
  license: Apache-2.0（本扩展）/ exceljs MIT + Univer Apache-2.0
  tags: [excel, xlsx, spreadsheet, univer, editor, file-viewer]
---

# aiti-sheet-univer

> ❝ 老格式不挡路——转换、派生、编辑各归其位。 ❞

多编辑器机制（aiti-editor M0）的 Excel 实现扩展，命名规范 `aiti-<filetype>-<impl>`。
方案：`docs/aiti-editor-office-plan.md` §2.1。

## 能力

- **.xlsx / .xlsm**：Univer 预览 + 编辑（样式 / 公式 / 合并 / 冻结 / 行高列宽 / 多 sheet / 隐藏 sheet / tab 色），Ctrl+S 保存（409 冲突确认覆盖），保存前明示剥离项（图表 / 透视表 / 条件格式 / 富文本等）
- **.xls / .ods**：只读表格预览 + 一键「转为 .xlsx 并打开」（`-fromxls` / `-fromods` 命名派生，重名 `(1)/(2)` 递增，绝不覆盖原文件）
- **「关于编辑器」**：⋯ 菜单查看能力 / 限制 / 依赖 / 许可
- 转换与预览依赖 LibreOffice (soffice)：缺失时给出安装 / 配置（aiti-editor 功能 `soffice.path`）/ 下载本机编辑 / 虚拟环境打开（aiti-ui-env）降级选项

## 功能开关

- `sheet.edit`：关闭后 .xlsx/.xlsm 仅预览（编辑能力整体关闭）

## 限制

- 图表 / 透视表 / 条件格式 / 数据验证不支持（保存剥离）；富文本并纯文本；超链接留文本
- 保存经 exceljs 重写整个工作簿：.xlsm 宏保留不保证
- 大表截断：5 万行 / 2000 列
