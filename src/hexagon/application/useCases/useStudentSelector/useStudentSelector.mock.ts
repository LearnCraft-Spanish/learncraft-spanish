import type { UseStudentSelectorResult } from '@application/useCases/useStudentSelector/useStudentSelector';
import type { AppUserAbbreviation } from '@learncraft-spanish/shared';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';
import { vi } from 'vitest';

const defaultMockResult: UseStudentSelectorResult = {
  searchTerm: '',
  setSearchTerm: vi.fn<(term: string) => void>(),
  options: [],
  isListLoading: false,
  isUsingAsStudent: false,
  isSelecting: false,
  error: null,
  selectStudent: vi.fn<(student: AppUserAbbreviation) => Promise<boolean>>(
    async () => true,
  ),
  exitUsingAsStudent: vi.fn<() => void>(),
  clearError: vi.fn<() => void>(),
};

export const {
  mock: mockUseStudentSelector,
  override: overrideMockUseStudentSelector,
  reset: resetMockUseStudentSelector,
} = createOverrideableMockHook<[], UseStudentSelectorResult>(defaultMockResult);

export default mockUseStudentSelector;
