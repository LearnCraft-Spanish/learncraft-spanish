#!/usr/bin/env bash
# Keep the root pnpm-lock.yaml identical to lockfiles/ci/pnpm-lock.yaml.
#
# lockfiles/ci/pnpm-lock.yaml is the canonical lockfile (CI and local installs
# use it). Netlify only runs `pnpm build`, so its automatic install reads the
# root pnpm-lock.yaml. The two must resolve the same versions, or production
# ships different dependencies from the ones CI tests.
#
# The only difference between the files is the importer key: the CI lockfile
# lives two directories down, so it names the project `../..`; the root
# lockfile names it `.`.
#
# Usage:
#   bash scripts/sync-root-lockfile.sh          # overwrite root lockfile from CI lockfile
#   bash scripts/sync-root-lockfile.sh --check  # exit 1 if they differ
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

CI_LOCK="lockfiles/ci/pnpm-lock.yaml"
ROOT_LOCK="pnpm-lock.yaml"

if [[ ! -f "$CI_LOCK" ]]; then
  echo "error: $CI_LOCK not found" >&2
  exit 1
fi

if ! grep -qx '  \.\./\.\.:' "$CI_LOCK"; then
  echo "error: $CI_LOCK has no '../..' importer; its layout changed, update this script" >&2
  exit 1
fi

expected() {
  sed 's|^  \.\./\.\.:$|  .:|' "$CI_LOCK"
}

if [[ "${1:-}" == "--check" ]]; then
  if expected | cmp -s - "$ROOT_LOCK"; then
    echo "Root lockfile matches $CI_LOCK."
    exit 0
  fi
  echo "error: $ROOT_LOCK is out of sync with $CI_LOCK." >&2
  echo "Netlify installs from $ROOT_LOCK, so production would ship different dependencies than CI tests." >&2
  echo "Fix: run 'pnpm lockfile:sync' and commit $ROOT_LOCK." >&2
  exit 1
fi

expected > "$ROOT_LOCK"
echo "Synced $ROOT_LOCK from $CI_LOCK."
