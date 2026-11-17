import type { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import type { usePresetFilters } from '@application/units/Filtering/FilterPresets/usePresetFilters';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

type UsePresetFiltersReturnType = ReturnType<typeof usePresetFilters>;

/**
 * Not registered in `setupTests.ts`. In a test file, mock the hook's module with an
 * async factory that imports this file and returns
 * `{ usePresetFilters: () => mockUsePresetFilters }` (see `useCombinedFilters.test.ts`).
 */
const defaultMockResult: UsePresetFiltersReturnType = {
  setFilterPreset: vi.fn<(preset: PreSetQuizPreset) => void>(),
};

export const {
  mock: mockUsePresetFilters,
  override: overrideMockUsePresetFilters,
  reset: resetMockUsePresetFilters,
} = createOverrideableMock<UsePresetFiltersReturnType>(defaultMockResult);

export default mockUsePresetFilters;
