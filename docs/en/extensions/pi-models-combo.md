---
title: pi-models-combo (pi model governance)
icon: 🎛️
description: Model governance for the pi coding agent — model list filtering + sticky multi-key API rotation against 429 rate limits + multi-provider aggregation (combo virtual models) + quality monitoring; installs into ~/.pi/agent/pi-plugins/
---

# pi-models-combo (pi model governance)

> ❝ **Keep the model list tidy and keep 429s from breaking your flow — filtering, rotation and aggregation each do their part.** ❞

A model governance plugin for the pi coding agent (formerly pi-models-respect):

- **Model list filtering**: provider/model allow & deny lists keep the model list clean
- **Sticky multi-key rotation**: several keys per provider, sticky sessions with failover — 429
  rate limits stop interrupting work
- **Multi-provider aggregation**: combo virtual models merge several providers/models into one
  selectable entry
- **Quality monitoring**: model quality metrics

Design docs: the two plan pages (models / builtin-and-apikeys) in the aiti source repo.
