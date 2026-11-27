---
title: aiti-codehub (R&D hub)
icon: 🗂️
description: One hub for work items and repositories across Yunxiao, GitHub, Gitee and GitLab — work item search/detail/comments, repositories and branches, clone into a workspace, merge requests; multiple accounts; AI tools and skills.
---

# aiti-codehub (R&D hub)

> **Requirements, branches and sessions in one place.**

> 🟡 **Internal beta**: not distributed with releases and not on npm; currently deployed from the experimental source only (dev instance recommended). Interfaces and behavior may change.

Brings work items and repositories from your R&D platforms into the workbench, so you stop hunting across a browser, an IDE and a chat for "which branch belongs to this requirement, and which conversation produced it".

## Two surfaces

- **Work items**: Yunxiao projects / work items (search, filters, detail, comments, custom fields); GitHub / Gitee / GitLab issues (repo-scoped list / detail / comments). Rich text and Markdown descriptions render properly; images and attachments inside Yunxiao work items are proxied by the extension, and the PAT never reaches the browser.
- **Repositories**: namespace / group → repository → branches; favorites and clone URLs; clone straight from *Get a workspace* (through the `aiti-quickstart` clone engine); create merge requests on Yunxiao.

Both surfaces dock in the right panel by default and can float or move to the left sidebar; *Recent* belongs to the work-items surface and *Settings* is shared.

## Multiple accounts

A platform can hold several accounts (personal + work + bot): the default account keeps the platform id, extra ones use a stable id such as `github~work`; each has its own credentials, favorites, recents and cache, with an editable alias. GitHub can also reuse the local `gh` CLI login.

## AI and workspace

- `aiti_codehub_*` tools: query work items, read repositories / branches, create a branch from a template; write operations such as creating merge requests are off by default and must be enabled explicitly.
- Three skills let the AI read the details on demand; a work item can be copied as a template, written into the commit box, or sent to the current or a new session.
- Clones appear as a *Code hosting* source tab in *Get a workspace*; start a new session right after cloning.

## Platforms and auth

| Platform | Auth | Work items | Code | Merge requests |
|---|---|---|---|---|
| Yunxiao | PAT + OAuth (DCR + PKCE, zero setup) | projects / work items | groups / repositories / branches | create |
| GitHub | PAT + device code + local `gh` | issues | orgs / repositories / branches | read-only |
| Gitee | PAT | issues | orgs / repositories / branches | read-only |
| GitLab | PAT + device code (17.1+) | issues | groups / repositories / branches | read-only |

Self-hosted GitLab and GitHub Enterprise are supported through `baseUrl`.

## Install (beta)

Not on npm and not bundled with releases. Deploy from the experimental source to a **dev instance** and reload; a production instance needs explicit confirmation. Credentials are stored server-side under `config/providers/<id>.json` (mode 0600) and are never echoed by the API.
