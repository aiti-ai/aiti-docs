---
title: "OnlyOffice Editing (aiti-onlyoffice)"
icon: 📚
description: Full-fidelity preview + editing for .docx/.xlsx/.pptx (OnlyOffice DocumentServer Docker backend). AGPL community edition, feature off by default
---

# aiti-onlyoffice

> ❝ The deep-fidelity tier — the same engine as desktop Office, no compromise on complex-layout editing. ❞

The deep-fidelity implementation extension of the multi-editor mechanism (aiti-editor M0) (M2, a multi-domain exception to the `aiti-<filetype>-<impl>` naming convention).
Plan: `docs/aiti-editor-office-plan.md` §2.4.

## Capabilities

- **.docx / .doc / .odt / .xlsx / .xlsm / .xls / .ods / .pptx / .ppt / .odp** full-fidelity rendering and editing (same engine as desktop Office; legacy formats edited natively, saved back through DS keeping the original extension — Word/WPS/soffice all open them normally by content)
- word / sheet / slide three providers registered separately — defaults can be set independently; legacy formats additionally have doc-pdf / xls-readonly fallback previews (coexisting in the "Open with" menu)
- DS-side saving: forcesave / autosave written straight to the server via callback (atomic write tmp+rename)
- mtime changes → key changes → DS re-fetches (following file changes in real time holds naturally)

## Feature switches

- `onlyoffice.enabled`: off by default; when enabled, the DocumentServer is probed and providers are registered only while healthy (the menu naturally gains one more entry)
- `onlyoffice.url`: DS address (default `http://127.0.0.1:8802`)
- `onlyoffice.publicUrl`: browser-side DS address (fill in the reverse-proxy address for the nginx `/onlyoffice/` scenario)
- `onlyoffice.containerBase`: leave empty to use the same URL as the web page (container and browser same-origin reachable, recommended); only special topologies such as DS running on another machine need an override

## Security

- download/callback URLs carry a one-time HMAC token (path+expiry signature) against traversal/hotlinking
- JWT(HS256) signs the editor config; the secret is stored in the extension's configDir (`~/.pi/web/data/aiti-onlyoffice/config/jwt-secret`, not committed; onlyoffice-up.sh reads the same copy for the container)
- Save whitelist = same as blob-save-route (workspace + user root)

## Networking (deployment-fixed, landed)

- **Callback base = the web URL**: the DS container and the browser hit the same address (domain → this machine, valid certificate); document.url /
  callbackUrl use the browser origin + basePath directly; nginx exempts `/{,dev/}api/extensions/aiti-onlyoffice/`
  from Authelia (credentials are carried by the extension-side HMAC token)
- Browser loads DS: `location /onlyoffice/` sub-path reverse proxy (official recipe: rewrite strips the prefix +
  X-Forwarded-Host carries the `/onlyoffice` suffix, otherwise cache external links lose the prefix → "download failed")
- Container reaching the host's direct port (local-IP direct-connect debugging scenario): ufw allows `ufw allow from 172.16.0.0/12`
- ⚠ When debugging with `127.0.0.1:<port>` locally, the container's callback is unreachable — access via LAN IP / domain, or configure containerBase
