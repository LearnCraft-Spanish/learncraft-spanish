import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

// Prefer vendored Chromium under .gauntlet/browsers (sandbox-friendly).
const gauntletRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const vendored = resolve(gauntletRoot, 'browsers');
if (existsSync(vendored)) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = vendored;
}

export const { chromium } = await import('playwright');
