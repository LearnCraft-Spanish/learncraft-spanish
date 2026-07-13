#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

rm -f .shared-local-mode

echo "Installing published @learncraft-spanish/shared from CI lockfile..."
pnpm install --frozen-lockfile --ignore-workspace --lockfile-dir=lockfiles/ci

echo "Published shared mode enabled."
