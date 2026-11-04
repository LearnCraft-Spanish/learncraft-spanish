/**
 * Keeps secrets out of the shipped bundle. See documentation/SECRETS.md.
 *
 * Netlify gets every key in the Doppler config, secrets included, and Vite
 * inlines every VITE_* key into the bundle. So:
 * - A VITE_* key that isn't in PUBLIC_ENV_KEYS stops the dev server and build.
 * - After a build, any BUILD_SECRET_KEYS value found in the output (source maps
 *   included) fails the build.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

export const PUBLIC_ENV_KEYS = [
  'VITE_API_AUDIENCE',
  'VITE_AUTH0_CLIENTID',
  'VITE_AUTH0_DOMAIN',
  'VITE_BACKEND_DOMAIN',
  'VITE_ENVIRONMENT',
  'VITE_PORT',
];

export const BUILD_SECRET_KEYS = ['GH_PACKAGE_KEY', 'SENTRY_AUTH_TOKEN'];

// Shorter values could match by chance; real tokens are much longer.
const MIN_SECRET_LENGTH = 8;

export function findUnknownPublicKeys(env) {
  return Object.keys(env).filter(
    (key) => key.startsWith('VITE_') && !PUBLIC_ENV_KEYS.includes(key),
  );
}

export function findLeakedSecrets(files, env) {
  const secrets = BUILD_SECRET_KEYS.map((key) => [key, env[key]]).filter(
    ([, value]) =>
      typeof value === 'string' && value.length >= MIN_SECRET_LENGTH,
  );
  const leaks = [];
  for (const { file, contents } of files) {
    for (const [key, value] of secrets) {
      if (contents.includes(value)) {
        leaks.push({ key, file });
      }
    }
  }
  return leaks;
}

async function readOutputFiles(dir) {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map(async (entry) => {
        const fullPath = path.join(entry.parentPath, entry.name);
        return {
          file: path.relative(dir, fullPath),
          contents: await readFile(fullPath, 'utf8'),
        };
      }),
  );
}

export default function envGuard() {
  let outDir;
  return {
    name: 'env-guard',
    // Tests ship nothing, and old local .env.test files still hold retired keys.
    apply: (_config, { mode }) => mode !== 'test',
    configResolved(config) {
      if (config.command === 'build') {
        outDir = path.resolve(config.root, config.build.outDir);
      }
      const unknown = findUnknownPublicKeys(config.env);
      if (unknown.length > 0) {
        throw new Error(
          `[env-guard] ${unknown.join(', ')} would be inlined into the public bundle. ` +
            'Add it to PUBLIC_ENV_KEYS in vite-plugins/env-guard.js if it is safe to publish; ' +
            'otherwise drop the VITE_ prefix. Old local .env files can also cause this; delete them ' +
            '(see documentation/SECRETS.md).',
        );
      }
    },
    async closeBundle() {
      if (!outDir) {
        return;
      }
      const leaks = findLeakedSecrets(
        await readOutputFiles(outDir),
        process.env,
      );
      if (leaks.length > 0) {
        throw new Error(
          `[env-guard] Build secrets found in the build output: ${leaks
            .map(({ key, file }) => `${key} in ${file}`)
            .join(', ')}. Nothing may ship until this is fixed.`,
        );
      }
    },
  };
}
