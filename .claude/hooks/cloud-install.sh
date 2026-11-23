#!/bin/bash
# SessionStart hook for Claude Code cloud sessions.
# Writes the GitHub Packages auth to ~/.npmrc and installs dependencies.
# The setup script (configured in the cloud environment) provides Node 24 and pnpm
# under /opt/node24; env vars from the environment form are only available here,
# not in the setup script.
set -euo pipefail

[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0   # cloud sessions only

if [ -z "${GH_PACKAGE_KEY:-}" ]; then
  echo "GH_PACKAGE_KEY is not set in the cloud environment; cannot install @learncraft-spanish/shared" >&2
  exit 1
fi

cd "$CLAUDE_PROJECT_DIR"

export PATH=/opt/node24/bin:$PATH
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo 'export PATH=/opt/node24/bin:$PATH' >> "$CLAUDE_ENV_FILE"
fi

umask 077
echo "//npm.pkg.github.com/:_authToken=${GH_PACKAGE_KEY}" > ~/.npmrc

# Skip the install when lockfiles and package.json are unchanged.
STAMP=$(cat lockfiles/ci/* package.json | sha256sum | cut -d' ' -f1)
if [ ! -d node_modules ] || [ "$(cat .cloud-install-stamp 2>/dev/null || true)" != "$STAMP" ]; then
  pnpm install:ci
  echo "$STAMP" > .cloud-install-stamp
fi
