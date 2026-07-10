import type { PendingFlashcardUpdateObject } from '@application/units/studentFlashcardUpdates/types';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

interface UseStudentFlashcardUpdatesUtilsReturn {
  getPendingFlashcardUpdateObjectsFromLocalStorage: () =>
    | PendingFlashcardUpdateObject[]
    | undefined;
  setPendingFlashcardUpdateObjectsInLocalStorage: (
    pendingFlashcardUpdateObjects: PendingFlashcardUpdateObject[],
  ) => void;
}

const defaultMockUseStudentFlashcardUpdatesUtils: UseStudentFlashcardUpdatesUtilsReturn =
  {
    getPendingFlashcardUpdateObjectsFromLocalStorage: vi.fn<() => undefined>(),
    setPendingFlashcardUpdateObjectsInLocalStorage: vi.fn<() => void>(),
  };

export const {
  mock: mockUseStudentFlashcardUpdatesUtils,
  override: overrideMockUseStudentFlashcardUpdatesUtils,
  reset: resetMockUseStudentFlashcardUpdatesUtils,
} = createOverrideableMock<UseStudentFlashcardUpdatesUtilsReturn>(
  defaultMockUseStudentFlashcardUpdatesUtils,
);

export default mockUseStudentFlashcardUpdatesUtils;
