/**
 * Assigns compiled CSS to a cascade layer based on the source filename.
 *
 * Layer order is reserved in index.html:
 *   @layer legacy, tokens, primitives, features;
 *
 * - CSS Modules under interface/components/general/ → primitives
 * - Other CSS Modules → features
 * - tokens.css is skipped (it declares @layer tokens itself)
 * - All other src CSS/SCSS → legacy
 */

function stripQuery(filePath) {
  return filePath.split('?')[0] ?? filePath;
}

function normalizePath(filePath) {
  return stripQuery(filePath).replaceAll('\\', '/');
}

function hasTopLevelLayer(root) {
  return root.nodes.some(
    (node) => node.type === 'atrule' && node.name === 'layer',
  );
}

export function resolveCssLayer(filePath) {
  if (!filePath) {
    return null;
  }

  const normalized = normalizePath(filePath);

  if (normalized.includes('/node_modules/')) {
    return null;
  }

  if (!normalized.includes('/src/')) {
    return null;
  }

  if (normalized.endsWith('/interface/styles/tokens.css')) {
    return null;
  }

  const isModule = normalized.includes('.module.');
  if (isModule) {
    if (normalized.includes('/interface/components/general/')) {
      return 'primitives';
    }
    return 'features';
  }

  return 'legacy';
}

function assignCssLayer() {
  return {
    postcssPlugin: 'assign-css-layer',
    Once(root, { AtRule, result }) {
      const from = result.opts.from;
      if (hasTopLevelLayer(root)) {
        return;
      }

      const layerName = resolveCssLayer(from);
      if (!layerName) {
        return;
      }

      // Empty files serialize as `@layer legacy` (no block). Concatenating
      // those with a following `@layer legacy { … }` produces invalid CSS.
      if (root.nodes.length === 0) {
        return;
      }

      const layerAtRule = new AtRule({
        name: 'layer',
        nodes: [],
        params: layerName,
      });

      root.each((node) => {
        layerAtRule.append(node);
      });
      root.append(layerAtRule);
    },
  };
}

assignCssLayer.postcss = true;

export default assignCssLayer;
