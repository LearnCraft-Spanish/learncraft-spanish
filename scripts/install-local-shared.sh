#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SHARED_REPO="${LCS_SHARED_PATH:-../lcs-shared}"
SHARED_LINK="node_modules/@learncraft-spanish/shared"
MARKER=".shared-local-mode"

if [[ ! -d "$SHARED_REPO" ]]; then
  echo "error: local shared package not found at $SHARED_REPO" >&2
  echo "Clone lcs-shared as a sibling repo (../lcs-shared) or set LCS_SHARED_PATH." >&2
  exit 1
fi

SHARED_REPO="$(cd "$SHARED_REPO" && pwd)"

echo "Installing published dependencies from CI lockfile..."
pnpm install --frozen-lockfile --ignore-workspace --lockfile-dir=lockfiles/ci

echo "Building local @learncraft-spanish/shared..."
(cd "$SHARED_REPO" && pnpm install)

echo "Linking local @learncraft-spanish/shared from $SHARED_REPO"
mkdir -p node_modules/@learncraft-spanish
rm -rf "$SHARED_LINK"
ln -sfn "$SHARED_REPO" "$SHARED_LINK"

echo "$SHARED_REPO" > "$MARKER"
echo "Local shared mode enabled. Run pnpm install:published to restore the published package."
