#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SHARED_REPO="${LCS_SHARED_PATH:-../lcs-shared}"
SHARED_LINK="node_modules/@learncraft-spanish/shared"
STAGING_DIR="$ROOT/.local-shared-staging"
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
(cd "$SHARED_REPO" && pnpm install && pnpm build)

if [[ ! -d "$SHARED_REPO/dist" ]]; then
  echo "error: shared build did not produce dist/ at $SHARED_REPO/dist" >&2
  exit 1
fi

echo "Staging dist-only package (matches published install layout)..."
rm -rf "$STAGING_DIR"
mkdir -p "$STAGING_DIR"
cp "$SHARED_REPO/package.json" "$STAGING_DIR/package.json"
cp -R "$SHARED_REPO/dist" "$STAGING_DIR/dist"

echo "Linking staged @learncraft-spanish/shared from $STAGING_DIR"
mkdir -p node_modules/@learncraft-spanish
rm -rf "$SHARED_LINK"
ln -sfn "$STAGING_DIR" "$SHARED_LINK"

echo "$SHARED_REPO" > "$MARKER"
echo "Local shared mode enabled (dist-only staging)."
echo "Source repo: $SHARED_REPO"
echo "Run pnpm install:published to restore the published package."
