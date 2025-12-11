import type { PendingFlashcardUpdateObject } from '@application/units/studentFlashcardUpdates/types';
import { LocalStorageAdapter } from '@application/adapters/localStorageAdapter';
import { PENDING_UPDATES_KEY } from '@application/units/studentFlashcardUpdates/constants';
import { useCallback, useRef } from 'react';

export function useStudentFlashcardUpdatesUtils() {
  // Initialize the localStorage adapter
  const localStorageAdapterRef = useRef(LocalStorageAdapter());
  const localStorageAdapter = localStorageAdapterRef.current;

  // helper functions
  const getPendingFlashcardUpdateObjectsFromLocalStorage = useCallback(() => {
    const storedUpdates =
      localStorageAdapter.getItem<PendingFlashcardUpdateObject[]>(
        PENDING_UPDATES_KEY,
      );
    if (storedUpdates && Array.isArray(storedUpdates)) {
      return storedUpdates;
    }
    return undefined;
  }, [localStorageAdapter]);

  const setPendingFlashcardUpdateObjectsInLocalStorage = useCallback(
    (pendingFlashcardUpdateObjects: PendingFlashcardUpdateObject[]) => {
      localStorageAdapter.setItem(
        PENDING_UPDATES_KEY,
        pendingFlashcardUpdateObjects,
      );
    },
    [localStorageAdapter],
  );

  return {
    getPendingFlashcardUpdateObjectsFromLocalStorage,
    setPendingFlashcardUpdateObjectsInLocalStorage,
  };
}
