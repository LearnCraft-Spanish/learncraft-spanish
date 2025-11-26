import type { PendingFlashcardUpdateObject } from '@application/units/studentFlashcardUpdates/types';
import { LocalStorageAdapter } from '@application/adapters/localStorageAdapter';
import { PENDING_UPDATES_KEY } from '@application/units/studentFlashcardUpdates/constants';
import { useCallback, useRef } from 'react';

export function useStudentFlashcardUpdatesUtils() {
  // Initialize the localStorage adapter
  const lsAdapterRef = useRef(LocalStorageAdapter());
  const lsAdapter = lsAdapterRef.current;

  // helper functions
  const getPendingFlashcardUpdateObjectsFromLocalStorage = useCallback(() => {
    const storedUpdates =
      lsAdapter.getItem<PendingFlashcardUpdateObject[]>(PENDING_UPDATES_KEY);
    if (storedUpdates && Array.isArray(storedUpdates)) {
      return storedUpdates;
    }
    return undefined;
  }, [lsAdapter]);

  const setPendingFlashcardUpdateObjectsInLocalStorage = useCallback(
    (pendingFlashcardUpdateObjects: PendingFlashcardUpdateObject[]) => {
      lsAdapter.setItem(PENDING_UPDATES_KEY, pendingFlashcardUpdateObjects);
    },
    [lsAdapter],
  );

  return {
    getPendingFlashcardUpdateObjectsFromLocalStorage,
    setPendingFlashcardUpdateObjectsInLocalStorage,
  };
}
