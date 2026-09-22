/**
 * CSS / SCSS stub for Vitest.
 *
 * Returns the class name as-is so CSS Modules (`styles.root` → `"root"`) work
 * in tests without invoking sass-embedded (which fails in Cursor's sandbox).
 */
const styleMock: Record<string, string> = new Proxy(
  {} as Record<string, string>,
  {
    get: (_target, prop: string | symbol): string | undefined => {
      if (typeof prop === 'string') {
        return prop;
      }
      return undefined;
    },
  },
);

export default styleMock;
