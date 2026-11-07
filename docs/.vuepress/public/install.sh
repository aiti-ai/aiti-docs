#!/bin/sh
# aiti Web (@aiti-ai/pi-web) one-line installer for macOS / Linux.
#
#   curl -fsSL https://aiti.pw/install.sh | sh
#
# Custom npm registry (intranet / mirror):
#   curl -fsSL https://aiti.pw/install.sh | AITI_NPM_REGISTRY=https://npm.example.com sh
#
# The script is read-only about your system: it checks Node.js, runs one
# `npm install -g`, and prints next steps. No sudo, no file changes.

# curl | sh guard: stop child processes from eating the rest of the pipe.
exec </dev/null 2>/dev/null

set -u

if [ -t 1 ]; then
  B="\033[1m"; G="\033[32m"; Y="\033[33m"; R="\033[31m"; D="\033[2m"; N="\033[0m"
else
  B=""; G=""; Y=""; R=""; D=""; N=""
fi

say() { printf "%b\n" "$1"; }
ok()  { printf "%b\n" "${G}✓${N} $1"; }
bad() { printf "%b\n" "${R}✗${N} $1"; }

NEED_MAJOR=22
NEED_MINOR=19

say ""
say "${B}aiti Web installer${N}  ${D}(npm package: @aiti-ai/pi-web)${N}"
say "${D}----------------------------------------${N}"
say ""

# ---- Node.js check ----
if ! command -v node >/dev/null 2>&1; then
  bad "Node.js not found. aiti Web needs Node.js >= ${NEED_MAJOR}.${NEED_MINOR}."
  say ""
  say "  Install Node.js first, then re-run this installer:"
  say "    ${B}nvm${N}:     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | sh; nvm install 22"
  say "    ${B}macOS${N}:   brew install node@22"
  say "    ${B}manual${N}:  https://nodejs.org/en/download"
  say ""
  exit 1
fi

NODE_VERSION="$(node --version 2>/dev/null | sed 's/^v//')"
NODE_MAJOR="$(printf '%s' "$NODE_VERSION" | cut -d. -f1)"
NODE_MINOR="$(printf '%s' "$NODE_VERSION" | cut -d. -f2)"
case "$NODE_MAJOR" in ''|*[!0-9]*) NODE_MAJOR=0 ;; esac
case "$NODE_MINOR" in ''|*[!0-9]*) NODE_MINOR=0 ;; esac

if [ "$NODE_MAJOR" -lt "$NEED_MAJOR" ] || { [ "$NODE_MAJOR" -eq "$NEED_MAJOR" ] && [ "$NODE_MINOR" -lt "$NEED_MINOR" ]; }; then
  bad "Node.js ${NODE_VERSION} is too old (need >= ${NEED_MAJOR}.${NEED_MINOR})."
  say ""
  say "  Update Node.js, then re-run this installer:"
  say "    ${B}nvm${N}:     nvm install 22 && nvm use 22"
  say "    ${B}macOS${N}:   brew upgrade node"
  say ""
  exit 1
fi
ok "Node.js ${NODE_VERSION}"

command -v npm >/dev/null 2>&1 || { bad "npm not found (it ships with Node.js)."; exit 1; }

# ---- install ----
REGISTRY_ARGS=""
if [ -n "${AITI_NPM_REGISTRY:-}" ]; then
  REGISTRY_ARGS="--registry ${AITI_NPM_REGISTRY}"
  say "${D}  using registry: ${AITI_NPM_REGISTRY}${N}"
fi

say "Installing @aiti-ai/pi-web (global) ..."
if ! npm install -g "@aiti-ai/pi-web@latest" $REGISTRY_ARGS; then
  bad "npm install failed (see output above)."
  say ""
  say "  Hit EACCES / permission errors? Prefer a user-writable global prefix:"
  say "    ${B}npm config set prefix ~/.npm-global${N}   ${D}# then add ~/.npm-global/bin to PATH${N}"
  say ""
  exit 1
fi
ok "Installed @aiti-ai/pi-web"

# ---- pi engine hint ----
say ""
if command -v pi >/dev/null 2>&1; then
  ok "pi coding agent (engine) found on PATH"
else
  bad "pi coding agent (engine) not found on PATH."
  say "  ${D}aiti Web drives the pi CLI as its session engine. Install:${N}"
  say "    ${B}npm install -g @earendil-works/pi-coding-agent${N}"
fi

# ---- next steps ----
say ""
say "${G}${B}Done!${N} Start aiti Web with:"
say ""
say "  ${B}pi-web${N}          ${D}# serves http://127.0.0.1:30141 and opens your browser${N}"
say ""
say "${D}More commands:  pi-web status | stop | open | update${N}"
say "${D}Docs:           https://aiti.pw/guide/install.html${N}"
say ""
