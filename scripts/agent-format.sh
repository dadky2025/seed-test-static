#!/usr/bin/env bash
# PostToolUse hook: format the file the agent just edited. Never fails the edit.
set -uo pipefail

payload="$(cat)"
file="$(printf '%s' "$payload" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)"
file="${file//\\\\//}" # JSON-escaped Windows backslashes → forward slashes

case "$file" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs | *.json | *.jsonc | *.css | *.md | *.yml | *.yaml) ;;
  *) exit 0 ;;
esac
case "$file" in
  */node_modules/* | */.next/* | */dist/* | */build/* | *routeTree.gen.ts) exit 0 ;;
esac
[[ -f "$file" ]] || exit 0

cd "$(git rev-parse --show-toplevel)" || exit 0

# One file only — well under a second, not a project-wide run.
if ! pnpm exec prettier --write --log-level warn "$file" >/dev/null 2>&1; then
  echo "agent-format: prettier could not format $file — run pnpm format" >&2
fi
exit 0
