import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

import { defaultBarDir, outDir, parseArgs, resolveBarHtml } from './cli.mjs';
import { pngSize } from './png-size.mjs';
import { chromium } from './pw.mjs';

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(`Usage: node capture-bar.mjs --specimen <name> [--bar <path>]

Screenshots design frames marked with [data-screen-label] into
.gauntlet/out/<specimen>/bar/ and writes crop-manifest.json.

Examples:
  node capture-bar.mjs --specimen smoke
  node capture-bar.mjs --specimen home --bar ~/Downloads/handoff
`);
  process.exit(0);
}

const specimen = args.specimen;
const barHtml = resolveBarHtml(args.bar, specimen);
const OUT = outDir(specimen, 'bar');
mkdirSync(OUT, { recursive: true });

const url = pathToFileURL(barHtml).toString();
console.log(`specimen=${specimen}`);
console.log(`bar=${barHtml}`);
console.log(`out=${OUT}`);

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 2600, height: 1900 },
  deviceScaleFactor: 2,
});

const failures = [];
page.on('requestfailed', (r) => failures.push(r.url()));
page.on('pageerror', (e) => failures.push(`pageerror: ${e.message}`));

// Design HTML may load optional CDNs; do not abort file:// navigation.
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForSelector('[data-screen-label]', { timeout: 30000 });
await page.evaluate(() => document.fonts.ready).catch(() => {});
await page.waitForTimeout(800);

const frames = await page.$$eval('[data-screen-label]', (els) =>
  els.map((el) => {
    const frame = el.getBoundingClientRect();
    const headerEl = el.firstElementChild;
    const header = headerEl
      ? headerEl.getBoundingClientRect()
      : { bottom: frame.top };
    return {
      label: el.dataset.screenLabel,
      x: frame.left + window.scrollX,
      y: frame.top + window.scrollY,
      width: frame.width,
      height: frame.height,
      headerHeight: header.bottom - frame.top,
    };
  }),
);

if (frames.length === 0) {
  console.error('No [data-screen-label] frames found in the bar HTML.');
  await browser.close();
  process.exit(1);
}

const rows = [];

for (const frame of frames) {
  const { label, headerHeight } = frame;

  const framePath = resolve(OUT, `${label}.png`);
  await page
    .locator(`[data-screen-label="${label}"]`)
    .screenshot({ path: framePath });

  const bodyPath = resolve(OUT, `${label}-body.png`);
  await page.screenshot({
    path: bodyPath,
    fullPage: true,
    clip: {
      x: frame.x,
      y: frame.y + headerHeight,
      width: frame.width,
      height: Math.max(1, frame.height - headerHeight),
    },
  });

  rows.push({
    label,
    formFactor: frame.width > 800 ? 'desktop' : 'mobile',
    frameCss: { width: frame.width, height: frame.height },
    headerHeight,
    framePng: pngSize(framePath),
    bodyPng: pngSize(bodyPath),
  });
}

console.log('label            frame(css)  header  frame.png   body.png');
for (const r of rows) {
  console.log(
    [
      r.label.padEnd(16),
      `${r.frameCss.width}x${r.frameCss.height}`.padEnd(11),
      `${r.headerHeight}`.padEnd(7),
      `${r.framePng.width}x${r.framePng.height}`.padEnd(11),
      `${r.bodyPng.width}x${r.bodyPng.height}`,
    ].join(' '),
  );
}

function summarise(formFactor) {
  const group = rows.filter((r) => r.formFactor === formFactor);
  if (group.length === 0) {
    return null;
  }
  const heights = [...new Set(group.map((r) => r.headerHeight))];
  if (heights.length !== 1) {
    console.error(
      `\nERROR: ${formFactor} frames disagree on header height (${heights.join(', ')}).`,
    );
    process.exitCode = 1;
    return null;
  }
  const { width, height } = group[0].frameCss;
  return {
    frame: { width, height },
    headerHeight: heights[0],
    bodyViewport: { width, height: height - heights[0] },
  };
}

const mobile = summarise('mobile');
const desktop = summarise('desktop');

const manifest = {};
if (mobile) {
  manifest.mobile = mobile;
  console.log(`\nmobile header height:  ${mobile.headerHeight} css px`);
}
if (desktop) {
  manifest.desktop = desktop;
  console.log(`desktop header height: ${desktop.headerHeight} css px`);
}

if (!mobile && !desktop) {
  console.error('No mobile or desktop frames could be summarised.');
  process.exitCode = 1;
} else {
  const manifestPath = resolve(OUT, 'crop-manifest.json');
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\nwrote ${manifestPath}`);
}

if (failures.length) {
  console.log(
    '\nNETWORK/PAGE FAILURES (bar HTML; may be optional CDN assets):',
  );
  for (const f of new Set(failures)) console.log(`  ${f}`);
}

if (!args.bar) {
  console.log(`\n(default bar dir: ${defaultBarDir(specimen)})`);
}

await browser.close();
