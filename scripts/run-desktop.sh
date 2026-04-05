#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="${HOME}/hide-and-dig-deck.log"

cd "$PROJECT_ROOT"

if [[ -f "${HOME}/.nvm/nvm.sh" ]]; then
  # Game Mode often starts with a minimal PATH, so load nvm explicitly when available.
  # shellcheck disable=SC1090
  source "${HOME}/.nvm/nvm.sh"
fi

find_node() {
  if command -v node >/dev/null 2>&1; then
    command -v node
    return 0
  fi

  local candidates=(
    "/usr/bin/node"
    "/usr/local/bin/node"
    "${HOME}/.nvm/versions/node/current/bin/node"
  )

  local nvm_bins=("${HOME}"/.nvm/versions/node/*/bin/node)
  candidates+=("${nvm_bins[@]}")

  local candidate
  for candidate in "${candidates[@]}"; do
    if [[ -x "$candidate" ]]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  return 1
}

NODE_BIN="$(find_node)"
ELECTRON_BIN="${PROJECT_ROOT}/node_modules/electron/dist/electron"

if [[ ! -x "$NODE_BIN" ]]; then
  {
    echo "Node.js not found."
    echo "Checked PATH and common install locations."
  } >"$LOG_FILE"
  exit 1
fi

if [[ ! -x "$ELECTRON_BIN" ]]; then
  {
    echo "Electron is not installed in this project."
    echo "Run: npm install"
  } >"$LOG_FILE"
  exit 1
fi

{
  echo "Launching Hide and Dig Deck build"
  echo "Project: $PROJECT_ROOT"
  echo "Node: $NODE_BIN"
  echo "Electron: $ELECTRON_BIN"
  echo
} >"$LOG_FILE"

exec "$ELECTRON_BIN" "$PROJECT_ROOT" >>"$LOG_FILE" 2>&1
