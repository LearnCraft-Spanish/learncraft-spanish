import { useCallback, useSyncExternalStore } from 'react';

/** Guards the `matchMedia` call, which jsdom does not implement. */
function queryMatches(query: string): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(query).matches
  );
}

/**
 * Tracks a CSS media query in React state. Visual-only (responsive layout
 * branching), so it is allowed to live in the interface layer per
 * `interface/DECISIONS.md`. Returns `false` where `matchMedia` is missing
 * (jsdom, SSR) rather than throwing.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void): (() => void) => {
      if (
        typeof window === 'undefined' ||
        typeof window.matchMedia !== 'function'
      ) {
        return () => {};
      }
      const list = window.matchMedia(query);
      list.addEventListener('change', onStoreChange);
      return () => list.removeEventListener('change', onStoreChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => queryMatches(query),
    () => false,
  );
}
