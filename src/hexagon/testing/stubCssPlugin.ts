import type { Plugin } from 'vite';
import path from 'node:path';

import { fileURLToPath } from 'node:url';

const STYLE_MOCK_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  './styleMock.ts',
);

const CSS_FILE_RE = /\.(?:css|scss|sass)(?:\?.*)?$/i;

/**
 * Vitest-only Vite plugin: short-circuit CSS/SCSS imports to {@link styleMock}
 * so tests never spawn sass-embedded's native Dart worker.
 */
export function stubCssPlugin(): Plugin {
  return {
    name: 'stub-css',
    enforce: 'pre',
    resolveId(id: string): string | null {
      if (CSS_FILE_RE.test(id)) {
        return STYLE_MOCK_PATH;
      }
      return null;
    },
  };
}
