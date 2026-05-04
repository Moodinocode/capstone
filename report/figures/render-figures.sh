#!/usr/bin/env bash
# Render every .mmd in this folder to a same-named .png using mmdc.
#
# Install once:
#   sudo apt-get update && sudo apt-get install -y chromium-browser
#   npm i -g @mermaid-js/mermaid-cli
#
# Then run:
#   cd report/figures && bash render-figures.sh

set -euo pipefail

cd "$(dirname "$0")"

if ! command -v mmdc >/dev/null 2>&1; then
  echo "mmdc not found. Install with: npm i -g @mermaid-js/mermaid-cli"
  exit 1
fi

# Puppeteer (used by mmdc) needs --no-sandbox under WSL/root.
PUPPETEER_CFG="$(mktemp --suffix=.json)"
cat >"$PUPPETEER_CFG" <<'JSON'
{ "args": ["--no-sandbox", "--disable-setuid-sandbox"] }
JSON

for src in *.mmd; do
  out="${src%.mmd}.png"
  echo "rendering $src -> $out"
  mmdc -i "$src" -o "$out" -b transparent -t neutral -w 1600 -p "$PUPPETEER_CFG"
done

rm -f "$PUPPETEER_CFG"
echo "all figures rendered."
