import { describe, expect, it } from 'vitest';
import { resolveCssLayer } from './assign-css-layer.js';

describe('resolveCssLayer', () => {
  it('assigns global src stylesheets to legacy', () => {
    expect(resolveCssLayer('/repo/src/App.css')).toBe('legacy');
    expect(
      resolveCssLayer(
        '/repo/src/hexagon/interface/components/Quizzing/general/QuizSetupMenu.scss',
      ),
    ).toBe('legacy');
  });

  it('assigns general CSS Modules to primitives', () => {
    expect(
      resolveCssLayer(
        '/repo/src/hexagon/interface/components/general/Buttons/Button/Button.module.scss',
      ),
    ).toBe('primitives');
  });

  it('assigns other CSS Modules to features', () => {
    expect(
      resolveCssLayer(
        '/repo/src/hexagon/interface/pages/GetHelpPage.module.scss',
      ),
    ).toBe('features');
  });

  it('skips tokens.css, node_modules, and files outside src', () => {
    expect(
      resolveCssLayer('/repo/src/hexagon/interface/styles/tokens.css'),
    ).toBeNull();
    expect(resolveCssLayer('/repo/node_modules/foo/bar.css')).toBeNull();
    expect(resolveCssLayer('/repo/coverage/base.css')).toBeNull();
  });

  it('strips Vite query strings', () => {
    expect(resolveCssLayer('/repo/src/App.css?direct')).toBe('legacy');
  });
});
