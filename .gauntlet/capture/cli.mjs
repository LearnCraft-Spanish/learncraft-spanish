import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const GAUNTLET = resolve(HERE, '..');
export const REPO = resolve(GAUNTLET, '..');

/**
 * @param {string[]} argv
 * @returns {{ specimen: string, bar: string | null, help: boolean }}
 */
export function parseArgs(argv) {
  const out = { specimen: 'smoke', bar: null, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--' || arg === '') {
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      out.help = true;
    } else if (arg === '--specimen') {
      out.specimen = argv[++i] ?? out.specimen;
    } else if (arg === '--bar') {
      out.bar = argv[++i] ?? null;
    }
  }
  return out;
}

export function specimenStatesPath(specimen) {
  return resolve(GAUNTLET, 'preview', 'specimens', `${specimen}.states.json`);
}

export function loadStates(specimen) {
  const path = specimenStatesPath(specimen);
  if (!existsSync(path)) {
    console.error(
      `Missing states file for specimen "${specimen}": ${path}\n` +
        'Add preview/specimens/<name>.states.json with a states[] array.',
    );
    process.exit(1);
  }
  const data = JSON.parse(readFileSync(path, 'utf8'));
  if (!Array.isArray(data.states) || data.states.length === 0) {
    console.error(`states[] missing or empty in ${path}`);
    process.exit(1);
  }
  return data.states;
}

export function outDir(specimen, kind) {
  return resolve(GAUNTLET, 'out', specimen, kind);
}

export function defaultBarDir(specimen) {
  return resolve(GAUNTLET, 'bars', specimen);
}

/** Resolve bar HTML: --bar path may be a directory or an .html file. */
export function resolveBarHtml(barArg, specimen) {
  const base = barArg ? resolve(barArg) : defaultBarDir(specimen);
  if (base.endsWith('.html') || base.endsWith('.htm')) {
    if (!existsSync(base)) {
      console.error(`Bar HTML not found: ${base}`);
      process.exit(1);
    }
    return base;
  }
  const indexHtml = resolve(base, 'index.html');
  if (existsSync(indexHtml)) {
    return indexHtml;
  }
  // Prefer a single *.html / *.dc.html in the directory
  // (handoffs sometimes name the file after the screen)
  console.error(
    `No index.html under ${base}. Pass --bar path/to/file.html or a folder with index.html.`,
  );
  process.exit(1);
}

export const SPECIMEN_ORIGIN = 'http://localhost:5273';
