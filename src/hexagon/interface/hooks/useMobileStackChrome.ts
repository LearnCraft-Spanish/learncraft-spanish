import { useCallback, useSyncExternalStore } from 'react';

export interface MobileStackOverride {
  title: string;
  onBack: () => void;
}

let override: MobileStackOverride | null = null;
const listeners = new Set<() => void>();

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

/** In-page title/back for the mobile stack header (quiz, custom step 2). */
export function setMobileStackOverride(next: MobileStackOverride | null): void {
  if (override === next) {
    return;
  }
  if (
    override !== null &&
    next !== null &&
    override.title === next.title &&
    override.onBack === next.onBack
  ) {
    return;
  }
  override = next;
  emitChange();
}

/**
 * Visual-only chrome signal, so it lives in the interface layer per
 * `interface/DECISIONS.md`.
 */
export function useMobileStackOverride(): MobileStackOverride | null {
  const subscribe = useCallback((onStoreChange: () => void): (() => void) => {
    listeners.add(onStoreChange);
    return () => listeners.delete(onStoreChange);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => override,
    () => null,
  );
}
