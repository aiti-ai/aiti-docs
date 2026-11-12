---
title: service-tunnels
icon: 🌐
description: One-click public reachability for local services — port discovery (service identification/custom names) / five exposure modes (tunnel·vhost·hybrid·router portmap·IPv6 direct) / auth gateway (portal·TOTP·face and voiceprint) / DDNS auto resolution / network health doctor
---

# service-tunnels

Service port discovery and tunnels (**the full implementation ships self-contained with the extension**, split out of pi-web core in 2026-08). **Your local services should be safely reachable from anywhere** — that is exactly where it comes from.

## Capabilities

### 1. Service port discovery (Ports)

- Automatically discovers the TCP ports currently listened on by the host process tree (including the pi agent and the processes it spawns) (`GET /api/extensions/service-tunnels/services?refresh=1`)
- The port list doubles as the proxy's allow-list: only enrolled ports can be accessed via vhost (`<port><suffix>`) proxying (zero forwarding by default)
- Comes with tunnel info and platform info

### 2. Exposure and tunnels (Expose / Tunnels)

- **expose**: expose a local port as an http / https / tcp tunnel (schema-driven parameters, e.g. provider / site / host suffix)
- **tunnel-start / tunnel-stop / tunnel-stop-all**: tunnel start/stop management
- Exposure entry binding (addBinding) is proxied uniformly by the extension middleware (vhost passthrough)

### 3. Self-exposure (Self)

- **exposeSelf / stopSelf**: expose the host itself as a reachable site (`PI_WEB_EXPOSE` startup config)
- **allowlocal two-stage gate**: self-exposure direct access requires explicit permission (local access control)
- **allowhosts**: self-exposure host allowlist management
- Self-exposure access URL query (getSelfAccessUrls)

### 4. Auth (Users / TOTP)

- **User management**: user-add / remove / list / set-password / managers / summary (Basic auth)
- **TOTP two-factor**: enroll / activate / status / disable / default-label (prod sites enforce the two_factor policy)
- Unauthenticated requests get 401/302 to login (Authelia or built-in users)

### 5. Injection linkage (Inject)

- The middleware injects the aiti-devtools launcher into HTML responses after the auth decision (injection port allowlist determined by `globalThis.__aitiInject`)
- Injected pages are same-origin with the tunnels; injection/debug bridge/tunnels share the same vhost gating

### 6. Router portmap / IPv6 direct / DDNS (0.4.0)

- **portmap mode**: UPnP/NAT-PMP/PCP/ssh-router router mapping; form "probe router" adjudication (CGNAT→suggest tunnel, public direct→no mapping needed); details include external ip:port and remaining lease
- **ipv6 mode**: direct exposure (candidate address dropdown + public egress annotation + manual input)
- **DDNS tab**: three layers of provider credentials (120-provider dropdown) / profile / registered entries — portmap/tunnel exposures auto-update A/AAAA/CNAME/TXT; the same registry file is shared and cross-checked with the library CLI/own UI running side by side

### 7. Experience and governance (0.4.0)

- capabilities negotiation: library-version capability probing gates tabs/form items, auto-hiding those missing capability (0.3.66 deployment-side graceful degradation)
- Service identification: port card main row favicon/probed title/user-defined name (label > title single-source rule) + ✎ rename
- Public exposure plans (encrypted storage + last-used backfill + one-click actions), injection source checkboxes, Base Path port attribute

### 8. Security and records

- **DNS-rebinding gate** (host proxy.ts): all API requests pass the gate first (fail-closed)
- **allow-tool-download**: tool download permission switch
- **Tunnel logs**: exposure/tunnel start-stop and self-exposure status records

## Architecture (after being split out of pi-web core in 2026-08)

```
pi-web core (only the generic gate remains)
  ├─ proxy.ts：extension middleware hook (fail-closed) → DNS-rebinding + PI_WEB_PASSWORD
  ├─ instrumentation.ts：ext registry loading/startup (service-tunnels started by startAll)
  └─ app/api/extensions/[...path]/route.ts：/api/extensions/<id>/<action> dispatch (gated)

service-tunnels extension (~/.pi/web/extensions/service-tunnels/, fully self-contained)
  ├─ server.startup    → createServiceTunnels singleton (globalThis.__piServiceTunnels) + PI_WEB_EXPOSE
  ├─ server.middleware → service vhost branch (st.proxy.parseHost/resolve) + allowlocal gate
  ├─ server.api        → /api/extensions/service-tunnels/<action> (discovery/expose/tunnels/users/TOTP/self-expose)
  ├─ ui.toolbar/dialogs/banners + client bundle → ServicesDialog (five tabs: Ports/Pi-web/Users/DDNS/Doctor, capabilities-gated) + 🔴 self-exposure alert
  └─ node_modules/service-tunnels/ —— standard npm dependency (private npm registry, installed by
     `npm install --omit=dev` at deploy; the loader resolves bare specifiers against the extension directory)
```

- **URL changes**: the old `/api/services` and `/api/service-tunnels` were removed along with the split; everything goes through
  `/api/extensions/service-tunnels/services` and `/api/extensions/service-tunnels/status`
- **middleware compatibility**: the host proxy.ts calls the extension middleware hook before the core gate — vhost
  decisions, the allowlocal gate, and self-exposure tunnel domain mapping all live inside the extension (same process, same
  globalThis singleton as before the migration)
- **aiti-devtools linkage**: since DI plan P1 the new channel = `ctx.services.get("service-tunnels.api")`; `globalThis.__piServiceTunnels` is kept on both tracks (the host middleware's independent bundle still uses it). The library instance performs
  injection port enrollment; the middleware's aiti injection reads via `globalThis.__aitiInject`
- **Without the extension**: no vhost/self-exposure features, `/api/extensions/service-tunnels/*` 404s,
  the core gate is unaffected

## Development and deployment

```bash
cd dev-repo/service-tunnels
node tools/build-client.mjs   # client bundle (esbuild, react→host-shim externalized)
npm install                  # dev dependencies (esbuild)
node tools/deploy.mjs         # build client + copy sources + in-target npm install --omit=dev
# To take effect: POST /api/extensions/reload; tests: node --test server/*.test.mjs
```

> Dependency note: `service-tunnels` 0.3.39+ has bundled justget into its own dist (zero runtime dependencies);
> the extension brings it in via a standard npm dependency; the pi-web extension loader resolves bare specifiers
> against the extension directory (`lib/ext/loader.ts` jiti id = extension entry), so extensions can carry standard node_modules.

## Dual-end single source and full design text

Display semantics (modeOf/identityView/ddnsBadge/netcheckEventView/portmapProbeView) and the doctor event contract keys (`ui.doctor.ev.*`) are carried single-source by the library's `src/ui-shared.ts` — the library's own `st ui` panel and the pi-web dialog necessarily behave identically (drift is pinned by tests).

Real-machine acceptance covers UPnP portmap / ipv6 failure paths / DDNS dual-end cross-check closed loop.
