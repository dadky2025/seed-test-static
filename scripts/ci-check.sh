#!/usr/bin/env bash
# Runs every gate CI runs, in the same order. Usage: scripts/ci-check.sh [--fast]
#   --fast  skips the production build, bundle size and E2E, for the inner loop. CI never passes it.
#   E2E_ALL_BROWSERS=1 adds Firefox and WebKit (CI sets it on main).
#   E2E_PORT=3100 serves the E2E build on another port when 3000 is taken by something else.
set -euo pipefail
cd "$(dirname "$0")/.."

fast=false
[[ "${1:-}" == "--fast" ]] && fast=true

failed=()
# Runs one gate and keeps going, so a single run reports every failing gate.
gate() {
  local name=$1
  shift
  echo ""
  echo "── ci-check: $name"
  if ! "$@"; then
    failed+=("$name")
  fi
}

gate format pnpm format:check
gate lint pnpm lint
gate typecheck pnpm typecheck
gate i18n pnpm i18n:check
gate deploy-config pnpm deploy:check
gate architecture pnpm arch
gate unused pnpm knip
gate test pnpm test:coverage

if ! $fast; then
  # The E2E build talks to the local mock API (e2e/mock-api.ts). Client variables are compiled in, so
  # this build is for verification only — each environment's deploy job builds with its own values.
  export VITE_API_BASE_URL=http://localhost:4010/ VITE_APP_VERSION=ci
  gate build pnpm build

  if [[ " ${failed[*]:-} " == *" build "* ]]; then
    echo "ci-check: build failed — size and e2e skipped"
  else
    gate size pnpm size
    projects=(--project=chromium --project=mobile)
    [[ "${E2E_ALL_BROWSERS:-}" == "1" ]] && projects+=(--project=firefox --project=webkit)
    gate e2e pnpm e2e "${projects[@]}"
  fi
fi

echo ""
if ((${#failed[@]})); then
  echo "ci-check: FAILED — ${failed[*]}"
  exit 1
fi
echo "ci-check: all gates passed"
