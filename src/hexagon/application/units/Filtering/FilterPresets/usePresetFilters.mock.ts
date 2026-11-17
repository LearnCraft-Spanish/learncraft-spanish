import type { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import type { usePresetFilters } from '@application/units/Filtering/FilterPresets/usePresetFilters';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

type UsePresetFiltersReturnType = ReturnType<typeof usePresetFilters>;

/**
 * Not registered in `setupTests.ts`: install it per test file with
 * `vi.mock('@application/units/Filtering/FilterPresets/usePresetFilters', async () => {
 *   const { mockUsePresetFilters } = await import(
 *     '@application/units/Filtering/FilterPresets/usePresetFilters.mock'
 *   );
 *   return { usePresetFilters: () => mockUsePresetFilters };
 * });`
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
