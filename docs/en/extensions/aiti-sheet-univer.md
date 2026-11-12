---
title: Excel Editor (aiti-sheet-univer)
icon: 📊
description: In-browser preview + editing for .xlsx/.xlsm (exceljs data layer + Univer view layer); read-only preview and one-click convert to .xlsx for .xls/.ods
---

# aiti-sheet-univer

> ❝ Old formats don't block the road — conversion, derivation and editing each in their place. ❞

The Excel implementation extension of the multi-editor mechanism (aiti-editor M0), named per the `aiti-<filetype>-<impl>` convention.

## Capabilities

- **.xlsx / .xlsm**: Univer preview + editing (styles / formulas / merges / freeze / row height & column width / multiple sheets / hidden sheets / tab color), Ctrl+S save (409 conflict asks to confirm overwrite), stripped items explicitly listed before saving (charts / pivot tables / conditional formatting / rich text etc.)
- **.xls / .ods**: read-only spreadsheet preview + one-click "convert to .xlsx and open" (`-fromxls` / `-fromods` name derivation, `(1)/(2)` increments on name clashes, never overwrites the original)
- **"About this editor"**: the ⋯ menu shows capabilities / limitations / dependencies / licenses
- Conversion (.xls/.ods → .xlsx) depends on LibreOffice (soffice) — preview is pure-JS zero-install parsing (@e965/xlsx); when soffice is missing, degrade options are offered — install / configure (aiti-editor feature `soffice.path`) / download to edit locally / open in a virtual environment (aiti-ui-env)

## Feature Switch

- `sheet.edit`: when off, .xlsx/.xlsm are preview-only (editing capability disabled as a whole)

## Limitations

- Charts / pivot tables / conditional formatting / data validation unsupported (stripped on save); rich text flattened to plain text; hyperlinks keep their text
- Saving rewrites the whole workbook via exceljs: .xlsm macro preservation is not guaranteed
- Large-sheet truncation: 50,000 rows / 2,000 columns
