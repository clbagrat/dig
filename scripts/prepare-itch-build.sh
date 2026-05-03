#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="${1:-.itch-build}"
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

rsync -a ./ "$OUT_DIR" \
  --exclude ".git/" \
  --exclude ".github/" \
  --exclude "node_modules/" \
  --exclude ".itch-build/" \
  --exclude "debug/" \
  --exclude "*.log" \
  --exclude "npm-debug.log*"

if [[ ! -f "$OUT_DIR/index.html" ]]; then
  echo "index.html not found in build output: $OUT_DIR" >&2
  exit 1
fi

echo "Prepared itch build in: $OUT_DIR"
