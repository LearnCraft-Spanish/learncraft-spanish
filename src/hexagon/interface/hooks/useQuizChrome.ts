import { useCallback, useSyncExternalStore } from 'react';

let quizActive = false;
const listeners = new Set<() => void>();

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

/** Marks whether a v2 text-quiz card is on screen (hides mobile tab bar). */
export function setQuizActive(active: boolean): void {
  if (quizActive === active) {
    return;
  }
  quizActive = active;
  emitChange();
}

/**
 * Tracks whether a v2 text-quiz card is active. Visual-only chrome signal,
 * so it lives in the interface layer per `interface/DECISIONS.md`.
 */
export function useQuizActive(): boolean {
  const subscribe = useCallback((onStoreChange: () => void): (() => void) => {
    listeners.add(onStoreChange);
    return () => listeners.delete(onStoreChange);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => quizActive,
    () => false,
  );
}
