import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

import { loadStates, outDir, parseArgs, SPECIMEN_ORIGIN } from './cli.mjs';
import { pngSize } from './png-size.mjs';
import { chromium } from './pw.mjs';

const DEFAULT_DESKTOP = { width: 1240, height: 760 };
const DEFAULT_MOBILE = { width: 390, height: 760 };

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(`Usage: node capture-app.mjs --specimen <name> [--no-bar]

Requires the preview server (pnpm gauntlet:preview). A prior capture-bar
run is optional: pass --no-bar, or omit the bar when crop-manifest.json
is missing, to capture without reference crops.

Environment:
  SPECIMEN_URL   override base URL (default ${SPECIMEN_ORIGIN})
`);
  process.exit(0);
}

const specimen = args.specimen;
const BASE = process.env.SPECIMEN_URL ?? SPECIMEN_ORIGIN;
const OUT = outDir(specimen, 'app');
const BAR = outDir(specimen, 'bar');
mkdirSync(OUT, { recursive: true });

const manifestPath = resolve(BAR, 'crop-manifest.json');
const manifestExists = existsSync(manifestPath);
const barLess = args.noBar || !manifestExists;

/** @type {any} */
let manifest = null;
if (manifestExists) {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} else if (!args.noBar) {
  console.log(
    `No ${manifestPath}; capturing in bar-less mode (viewport from states.json or defaults).`,
  );
}

const states = loadStates(specimen);

/**
 * @param {any} state
 * @param {string} formFactor
 */
function resolveViewport(state, formFactor) {
  const v = state.viewport;
  if (
    v &&
    typeof v === 'object' &&
    typeof v.width === 'number' &&
    typeof v.height === 'number'
  ) {
    return v;
  }
  if (barLess) {
    return formFactor === 'desktop' ? DEFAULT_DESKTOP : DEFAULT_MOBILE;
  }
  return formFactor === 'desktop'
    ? manifest?.desktop?.bodyViewport
    : manifest?.mobile?.bodyViewport;
}

/**
 * @param {import('playwright').Page} page
 * @param {any} action
 * @param {string} label
 * @param {number} index
 */
async function runStateAction(page, action, label, index) {
  if (!action || typeof action !== 'object' || Array.isArray(action)) {
    throw new Error(
      `${label}  actions[${index}]: expected object with exactly one of click|fill|waitFor`,
    );
  }
  const keys = ['click', 'fill', 'waitFor'].filter((k) => k in action);
  if (keys.length !== 1) {
    throw new Error(
      `${label}  actions[${index}]: expected exactly one of click|fill|waitFor, got ${JSON.stringify(Object.keys(action))}`,
    );
  }
  const kind = keys[0];
  if (kind === 'click') {
    const { role, name } = action.click ?? {};
    if (typeof role !== 'string' || typeof name !== 'string') {
      throw new Error(
        `${label}  actions[${index}].click: requires string role and name`,
      );
    }
    await page.getByRole(role, { name }).click();
    return;
  }
  if (kind === 'fill') {
    const { label: fieldLabel, value } = action.fill ?? {};
    if (typeof fieldLabel !== 'string' || typeof value !== 'string') {
      throw new Error(
        `${label}  actions[${index}].fill: requires string label and value`,
      );
    }
    await page.getByLabel(fieldLabel).fill(value);
    return;
  }
  const { role, name } = action.waitFor ?? {};
  if (typeof role !== 'string') {
    throw new Error(
      `${label}  actions[${index}].waitFor: requires string role`,
    );
  }
  if (name !== undefined && typeof name !== 'string') {
    throw new Error(
      `${label}  actions[${index}].waitFor: name must be a string when present`,
    );
  }
  await page
    .getByRole(role, name !== undefined ? { name } : undefined)
    .waitFor();
}

const browser = await chromium.launch();
const problems = [];
let pageErrors = 0;
let blockedBackend = 0;
let actionFailures = 0;
let specimenBlockedFailures = 0;
const rows = [];

for (const state of states) {
  const { label, formFactor, query } = state;
  const viewport = resolveViewport(state, formFactor);

  if (!viewport) {
    console.error(
      `No ${formFactor} bodyViewport in crop-manifest.json for label ${label}`,
    );
    process.exitCode = 1;
    continue;
  }

  const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });

  // Belt-and-suspenders: only specimen origin (and data/blob) may load.
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    if (
      url.startsWith(BASE) ||
      url.startsWith('data:') ||
      url.startsWith('blob:') ||
      url.startsWith('about:')
    ) {
      await route.continue();
      return;
    }
    blockedBackend += 1;
    problems.push(`${label}  blocked non-specimen request: ${url}`);
    await route.abort();
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      problems.push(`${label}  console ${msg.type()}: ${msg.text()}`);
    }
  });
  page.on('pageerror', (error) => {
    pageErrors += 1;
    problems.push(`${label}  pageerror: ${error.message}`);
  });
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (url.startsWith(BASE)) {
      problems.push(
        `${label}  requestfailed: ${url} (${request.failure()?.errorText})`,
      );
    }
  });

  const target = `${BASE}/?${query.replace(/^\?/, '')}`;

  await page.goto(target, { waitUntil: 'networkidle', timeout: 60000 });
  await page
    .waitForFunction(() => window.__SPECIMEN__?.ready === true, null, {
      timeout: 15000,
    })
    .catch(() => problems.push(`${label}  specimen never reported ready`));

  const actions = Array.isArray(state.actions) ? state.actions : [];
  for (let i = 0; i < actions.length; i += 1) {
    try {
      await runStateAction(page, actions[i], label, i);
    } catch (error) {
      actionFailures += 1;
      const message = error instanceof Error ? error.message : String(error);
      problems.push(
        message.startsWith(`${label}  `)
          ? message
          : `${label}  actions[${i}]: ${message}`,
      );
      break;
    }
  }

  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(400);

  const blockedCount = await page.evaluate(
    () => window.__SPECIMEN__?.blocked ?? 0,
  );
  if (blockedCount > 0 && state.allowBlocked !== true) {
    specimenBlockedFailures += 1;
    problems.push(
      `${label}  specimen blocked ${blockedCount} network call(s) (set allowBlocked: true to permit)`,
    );
  }

  const path = resolve(OUT, `${label}.png`);
  await page.screenshot({ path });
  await page.close();

  const bodyPath = resolve(BAR, `${label}-body.png`);
  const bytes = readFileSync(path);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  rows.push({
    label,
    viewport: `${viewport.width}x${viewport.height}`,
    app: pngSize(path),
    reference: !barLess && existsSync(bodyPath) ? pngSize(bodyPath) : null,
    blocked: blockedCount,
    sha256,
    path,
  });
}

await browser.close();

const fmt = (size) => (size ? `${size.width}x${size.height}` : 'MISSING');

if (barLess) {
  console.log('label            viewport(css)  app/<label>.png  blocked');
  for (const r of rows) {
    console.log(
      [
        r.label.padEnd(16),
        r.viewport.padEnd(14),
        fmt(r.app).padEnd(16),
        String(r.blocked),
      ].join(' '),
    );
  }
} else {
  console.log(
    'label            viewport(css)  app/<label>.png  bar/<label>-body.png  match  blocked',
  );
  const mismatches = [];
  for (const r of rows) {
    const match = r.reference && fmt(r.app) === fmt(r.reference);
    if (!match) mismatches.push(r);
    console.log(
      [
        r.label.padEnd(16),
        r.viewport.padEnd(14),
        fmt(r.app).padEnd(16),
        fmt(r.reference).padEnd(21),
        (match ? 'yes' : 'NO').padEnd(6),
        String(r.blocked),
      ].join(' '),
    );
  }

  if (mismatches.length) {
    console.error(
      '\nFAILED: captures do not match their reference crop dimensions:',
    );
    for (const r of mismatches) {
      console.error(
        `  ${r.label}: app ${fmt(r.app)} vs reference ${fmt(r.reference)}`,
      );
    }
    process.exitCode = 1;
  }
}

const hashToLabels = new Map();
for (const r of rows) {
  const list = hashToLabels.get(r.sha256) ?? [];
  list.push(r.label);
  hashToLabels.set(r.sha256, list);
}
for (const labels of hashToLabels.values()) {
  if (labels.length > 1) {
    console.warn(
      `WARNING: identical PNG bytes for states: ${labels.join(', ')}`,
    );
  }
}

if (problems.length) {
  console.log('\nCONSOLE / PAGE / NETWORK PROBLEMS:');
  for (const problem of new Set(problems)) console.log(`  ${problem}`);
} else {
  console.log('\nNo console errors, page errors, or failed specimen requests.');
}

console.log(`Blocked non-specimen origins: ${blockedBackend}`);

if (pageErrors > 0) {
  console.error(
    `\nFAILED: the specimen threw ${pageErrors} uncaught error(s).`,
  );
  process.exitCode = 1;
}

if (actionFailures > 0) {
  console.error(
    `\nFAILED: ${actionFailures} state(s) had Playwright action error(s).`,
  );
  process.exitCode = 1;
}

if (specimenBlockedFailures > 0) {
  console.error(
    `\nFAILED: ${specimenBlockedFailures} state(s) had blocked in-page network call(s).`,
  );
  process.exitCode = 1;
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

if (barLess) {
  console.log(`\nOK: ${rows.length} capture(s) written (bar-less mode).`);
} else {
  console.log(
    `\nOK: ${rows.length} capture(s) match reference crop dimensions.`,
  );
}
