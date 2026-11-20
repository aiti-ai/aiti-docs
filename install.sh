#!/bin/sh
# aiti Web (@aiti-ai/pi-web) one-line installer for macOS / Linux.
#
#   curl -fsSL https://aiti.pw/install.sh | sh
#   curl -fsSL https://aiti.pw/install.sh | sh -s -- --ref v0.15.7     # pin a version
#
# Installs the prebuilt archive from GitHub Releases — no npm involved on
# your machine. The archive bundles node_modules, so you only need the
# Node.js runtime itself (>= 22.19).
#
# Release sources: GitHub primary, Gitee mirror as fallback for CN networks
# (identical assets + checksums; archives above the Gitee 100 MB per-file cap
# are published as .part-N pieces + a .split manifest and reassembled here).
#
# Overrides:
#   AITI_MIRROR=auto|github|gitee  source order (default auto: GitHub, then Gitee)
#   AITI_RELEASE_REPO=owner/repo   GitHub repo (default aiti-ai/aiti-ai)
#   AITI_GITEE_REPO=owner/repo     Gitee mirror repo (default aiti-ai/aiti-ai)
#   AITI_INSTALL_DIR=~/.aiti       install root
#   curl -fsSL https://aiti.pw/install.sh | AITI_RELEASE_REPO=you/fork sh

# curl | sh note: 本脚本不读 stdin（无交互、无子进程消费管道）——不要 exec </dev/null，
# 那会关掉 sh 自身的 stdin（=管道=脚本源），curl|sh 形态下脚本立即截断退出。

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
GH_REPO="${AITI_RELEASE_REPO:-aiti-ai/aiti-ai}"
GE_REPO="${AITI_GITEE_REPO:-aiti-ai/aiti-ai}"
MIRROR="${AITI_MIRROR:-auto}"
INSTALL_ROOT="${AITI_INSTALL_DIR:-$HOME/.aiti}"
BIN_DIR="${AITI_BIN_DIR:-$HOME/.local/bin}"

REF=""
while [ $# -gt 0 ]; do
  case "$1" in
    --ref) REF="${2:-}"; shift 2 ;;
    --ref=*) REF="${1#*=}"; shift ;;
    *) say "${Y}unknown option: $1${N}"; shift ;;
  esac
done

say ""
say "${B}aiti Web installer${N}  ${D}(prebuilt · no npm)${N}"
say "${D}----------------------------------------${N}"
say ""

# ---- Node.js runtime check (the app is a Node application) ----
if ! command -v node >/dev/null 2>&1; then
  bad "Node.js not found. aiti Web needs the Node.js runtime >= ${NEED_MAJOR}.${NEED_MINOR}."
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
  say "  Update Node.js, then re-run this installer (nvm: nvm install 22)."
  exit 1
fi
ok "Node.js ${NODE_VERSION}"

# ---- download tool ----
fetch() { # fetch <url> <outfile>
  if command -v curl >/dev/null 2>&1; then curl -fsSL --retry 2 --connect-timeout 20 "$1" -o "$2"
  elif command -v wget >/dev/null 2>&1; then wget -qO "$2" "$1"
  else return 127; fi
}
command -v curl >/dev/null 2>&1 || command -v wget >/dev/null 2>&1 || { bad "curl or wget required."; exit 1; }

# ---- platform detection ----
case "$(uname -s)" in
  Linux) OS_NAME=linux ;;
  Darwin) OS_NAME=darwin ;;
  *) bad "Unsupported OS: $(uname -s) (Windows: use install.ps1)."; exit 1 ;;
esac
case "$(uname -m)" in
  x86_64|amd64) ARCH_NAME=x64 ;;
  arm64|aarch64) ARCH_NAME=arm64 ;;
  *) bad "Unsupported architecture: $(uname -m)"; exit 1 ;;
esac
ok "platform ${OS_NAME}-${ARCH_NAME}"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# ---- release sources (GitHub primary, Gitee mirror fallback) ----
# JSON extraction is line-structure agnostic (grep -o): the Gitee API returns
# the whole release object on ONE line, GitHub pretty-prints it.
# resolve_release <src> → sets TAG (global); release JSON lands in $TMP/release-<src>.json
resolve_release() {
  if [ "$1" = gh ]; then
    API="https://api.github.com/repos/${GH_REPO}"
  else
    API="https://gitee.com/api/v5/repos/${GE_REPO}"
  fi
  URL="${API}/releases/latest"
  [ -n "$REF" ] && URL="${API}/releases/tags/${REF}"
  fetch "$URL" "$TMP/release-$1.json" || return 1
  TAG="$(grep -o '"tag_name": *"[^"]*"' "$TMP/release-$1.json" | head -1 | sed 's/.*"\([^"]*\)"$/\1/')"
  [ -n "$TAG" ] || return 1
  return 0
}

# asset_url <src> <asset-name> → prints the browser_download_url, or empty
asset_url() {
  grep -o '"browser_download_url": *"[^"]*"' "$TMP/release-$1.json" \
    | sed 's/^"browser_download_url": *"\(.*\)"$/\1/' \
    | grep "${2}\$" | head -1
}

# download_asset <src> <asset-name> <dest-file>
# Handles split uploads: when <asset-name>.split exists (a tiny manifest holding
# the part count, used on hosts with per-file size caps), the parts
# <asset-name>.part-1..N are fetched and concatenated in order.
download_asset() {
  SPLIT_URL="$(asset_url "$1" "$2.split")"
  if [ -n "$SPLIT_URL" ]; then
    fetch "$SPLIT_URL" "$TMP/split.txt" || return 1
    PARTS="$(tr -cd '0-9' < "$TMP/split.txt")"
    case "$PARTS" in ''|*[!0-9]*|0) return 1 ;; esac
    say "  ${D}split upload: ${PARTS} part(s)${N}"
    : > "$3"
    i=1
    while [ "$i" -le "$PARTS" ]; do
      P_URL="$(asset_url "$1" "$2.part-$i")"
      [ -n "$P_URL" ] || { bad "split part $i missing on source $1."; return 1; }
      fetch "$P_URL" "$TMP/part-$i" || return 1
      cat "$TMP/part-$i" >> "$3"
      i=$((i + 1))
    done
    return 0
  fi
  URL="$(asset_url "$1" "$2")"
  [ -n "$URL" ] || return 1
  fetch "$URL" "$3"
}

case "$MIRROR" in
  github|gh) SOURCES="gh" ;;
  gitee|ge)  SOURCES="ge" ;;
  *)         SOURCES="gh ge" ;;
esac

# ---- resolve + download + verify (first source that fully works wins) ----
TAG=""
FETCHED=""
for SRC in $SOURCES; do
  if [ "$SRC" = gh ]; then SRC_LABEL="GitHub (${GH_REPO})"; else SRC_LABEL="Gitee (${GE_REPO})"; fi
  say "Querying release from ${SRC_LABEL} ..."
  resolve_release "$SRC" || { say "${Y}  source unavailable, trying next ...${N}"; continue; }
  ASSET="aiti-web-${TAG}-${OS_NAME}-${ARCH_NAME}.tar.gz"
  if ! download_asset "$SRC" "$ASSET" "$TMP/$ASSET" || [ ! -s "$TMP/$ASSET" ]; then
    say "${Y}  download failed on ${SRC_LABEL}, trying next ...${N}"
    continue
  fi
  CHECK_URL="$(asset_url "$SRC" "checksums.txt")"
  if [ -n "$CHECK_URL" ] && command -v sha256sum >/dev/null 2>&1; then
    if fetch "$CHECK_URL" "$TMP/checksums.txt"; then
      WANT="$(grep " ${ASSET}\$" "$TMP/checksums.txt" | awk '{print $1}')"
      GOT="$(sha256sum "$TMP/$ASSET" | awk '{print $1}')"
      if [ -n "$WANT" ] && [ "$WANT" = "$GOT" ]; then
        ok "sha256 verified  ${D}(${SRC_LABEL}, release ${TAG})${N}"
        FETCHED="$SRC"
        break
      fi
      bad "sha256 mismatch on ${SRC_LABEL} — trying next source ..."
      continue
    fi
    say "${Y}  checksums.txt unreachable on ${SRC_LABEL} — skipping verification${N}"
    FETCHED="$SRC"
    break
  fi
  say "${Y}  no checksums.txt / sha256sum on ${SRC_LABEL} — skipping verification${N}"
  FETCHED="$SRC"
  break
done
if [ -z "$FETCHED" ]; then
  bad "all release sources failed. check:"
  say "  ${D}https://github.com/${GH_REPO}/releases${N}"
  say "  ${D}https://gitee.com/${GE_REPO}/releases${N}"
  exit 1
fi

# ---- install ----
say "Installing to ${D}${INSTALL_ROOT}/aiti-web-${TAG}${N} ..."
mkdir -p "$INSTALL_ROOT"
rm -rf "${INSTALL_ROOT}/aiti-web-${TAG}.tmp"
mkdir -p "${INSTALL_ROOT}/aiti-web-${TAG}.tmp"
tar xzf "$TMP/$ASSET" -C "${INSTALL_ROOT}/aiti-web-${TAG}.tmp" || { bad "extract failed."; exit 1; }
rm -rf "${INSTALL_ROOT}/aiti-web-${TAG}"
mv "${INSTALL_ROOT}/aiti-web-${TAG}.tmp/aiti-web" "${INSTALL_ROOT}/aiti-web-${TAG}"
rm -rf "${INSTALL_ROOT}/aiti-web-${TAG}.tmp"

# pi-web launcher symlink
APP_DIR="${INSTALL_ROOT}/aiti-web-${TAG}"
chmod +x "$APP_DIR/bin/pi-web.js" 2>/dev/null
mkdir -p "$BIN_DIR"
ln -sfn "$APP_DIR/bin/pi-web.js" "$BIN_DIR/pi-web"
ok "installed aiti-web ${TAG}"

# PATH check
case ":${PATH}:" in
  *":${BIN_DIR}:"*) ;;
  *) say ""
     bad "PATH does not include ${BIN_DIR}."
     say "  Add to your shell profile:  ${B}export PATH=\"${BIN_DIR}:\$PATH\"${N}"
     ;;
esac

# ---- pi engine hint ----
say ""
if command -v pi >/dev/null 2>&1; then
  ok "pi coding agent (engine) found on PATH"
else
  bad "pi coding agent (engine) not found on PATH."
  say "  ${D}aiti Web drives the pi CLI as its session engine. Install via npm/bun:${N}"
  say "    ${B}npm install -g @earendil-works/pi-coding-agent${N}"
fi

say ""
say "${G}${B}Done!${N} Start aiti Web with:"
say ""
say "  ${B}pi-web${N}          ${D}# serves http://127.0.0.1:30141 and opens your browser${N}"
say ""
say "${D}Upgrade: re-run this installer (or: pi-web stop && curl -fsSL https://aiti.pw/install.sh | sh)${N}"
say "${D}Docs:    https://aiti.pw/guide/install.html${N}"
say ""
