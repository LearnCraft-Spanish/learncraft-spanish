#!/usr/bin/env bash
# Write the GitHub Packages token from your Doppler config (from `doppler setup`) into
# ~/.npmrc so local installs of @learncraft-spanish/shared work. Never writes the project .npmrc.
set -euo pipefail
umask 077

REGISTRY_LINE_PREFIX="//npm.pkg.github.com/:_authToken="
NPMRC="$HOME/.npmrc"

TOKEN="$(doppler secrets get GH_PACKAGE_KEY --plain)"

touch "$NPMRC"
grep -v "^${REGISTRY_LINE_PREFIX}" "$NPMRC" > "$NPMRC.tmp" || true
echo "${REGISTRY_LINE_PREFIX}${TOKEN}" >> "$NPMRC.tmp"
mv "$NPMRC.tmp" "$NPMRC"
chmod 600 "$NPMRC"

echo "GitHub Packages auth written to $NPMRC"
