import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

import { loadStates, outDir, parseArgs, SPECIMEN_ORIGIN } from './cli.mjs';
import { pngSize } from './png-size.mjs';
import { chromium } from './pw.mjs';

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(`Usage: node capture-app.mjs --specimen <name>

Requires the preview server (pnpm gauntlet:preview) and a prior
capture-bar run for the same specimen.

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
if (!existsSync(manifestPath)) {
  console.error(
    `Missing ${manifestPath}. Run capture-bar for specimen "${specimen}" first.`,
  );
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const states = loadStates(specimen);

const browser = await chromium.launch();
const problems = [];
let pageErrors = 0;
let blockedBackend = 0;
const rows = [];

for (const state of states) {
  const { label, formFactor, query } = state;
  const viewport =
    formFactor === 'desktop'
      ? manifest.desktop?.bodyViewport
      : manifest.mobile?.bodyViewport;

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

  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(400);

  const path = resolve(OUT, `${label}.png`);
  await page.screenshot({ path });
  await page.close();

  const bodyPath = resolve(BAR, `${label}-body.png`);
  rows.push({
    label,
    viewport: `${viewport.width}x${viewport.height}`,
    app: pngSize(path),
    reference: existsSync(bodyPath) ? pngSize(bodyPath) : null,
  });
}

await browser.close();

const fmt = (size) => (size ? `${size.width}x${size.height}` : 'MISSING');

console.log(
  'label            viewport(css)  app/<label>.png  bar/<label>-body.png  match',
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
      match ? 'yes' : 'NO',
    ].join(' '),
  );
}

if (problems.length) {
  console.log('\nCONSOLE / PAGE / NETWORK PROBLEMS:');
  for (const problem of new Set(problems)) console.log(`  ${problem}`);
} else {
  console.log('\nNo console errors, page errors, or failed specimen requests.');
}

console.log(`Blocked non-specimen origins: ${blockedBackend}`);

if (mismatches.length) {
  console.error(
    '\nFAILED: captures do not match their reference crop dimensions:',
  );
  for (const r of mismatches) {
    console.error(
      `  ${r.label}: app ${fmt(r.app)} vs reference ${fmt(r.reference)}`,
    );
  }
  process.exit(1);
}

if (pageErrors > 0) {
  console.error(
    `\nFAILED: the specimen threw ${pageErrors} uncaught error(s).`,
  );
  process.exit(1);
}

console.log(`\nOK: ${rows.length} capture(s) match reference crop dimensions.`);
