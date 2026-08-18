import { describe, expect, it } from 'vitest';
import assignCssLayer, { resolveCssLayer } from './assign-css-layer.js';

function createRoot(nodes) {
  const root = {
    nodes,
    append(node) {
      this.nodes.push(node);
    },
    each(callback) {
      for (const node of [...this.nodes]) {
        callback(node);
      }
    },
  };
  for (const node of nodes) {
    node.parent = root;
  }
  return root;
}

class FakeAtRule {
  constructor({ name, nodes, params }) {
    this.type = 'atrule';
    this.name = name;
    this.params = params;
    this.nodes = nodes ?? [];
  }

  append(node) {
    if (node.parent?.nodes) {
      node.parent.nodes = node.parent.nodes.filter(
        (existing) => existing !== node,
      );
    }
    node.parent = this;
    this.nodes.push(node);
  }
}

function runPlugin(nodes, from) {
  const root = createRoot(nodes);
  assignCssLayer().Once(root, {
    AtRule: FakeAtRule,
    result: { opts: { from } },
  });
  return root;
}

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

describe('assignCssLayer plugin', () => {
  it('leaves stylesheets that already declare @layer untouched', () => {
    const existingLayer = {
      type: 'atrule',
      name: 'layer',
      params: 'tokens',
      nodes: [],
    };
    const root = runPlugin([existingLayer], '/repo/src/App.css');
    expect(root.nodes).toEqual([existingLayer]);
  });

  it('does not wrap an empty stylesheet', () => {
    const root = runPlugin([], '/repo/src/App.css');
    expect(root.nodes).toEqual([]);
  });

  it('wraps global src CSS in @layer legacy', () => {
    const rule = { type: 'rule', selector: '.foo' };
    const root = runPlugin([rule], '/repo/src/App.css');
    expect(root.nodes).toHaveLength(1);
    expect(root.nodes[0]).toMatchObject({
      name: 'layer',
      params: 'legacy',
      type: 'atrule',
    });
    expect(root.nodes[0].nodes).toEqual([rule]);
  });
});
