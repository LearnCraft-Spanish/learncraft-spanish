import {
  mockUseExampleFilterCoordinator,
  resetMockUseExampleFilterCoordinator,
} from '@application/coordinators/hooks/useExampleFilterCoordinator.mock';
import {
  PreSetQuizPreset,
  preSetQuizzes,
} from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import { usePresetFilters } from '@application/units/Filtering/FilterPresets/usePresetFilters';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@application/coordinators/hooks/useExampleFilterCoordinator',
  async () => {
    const { mockUseExampleFilterCoordinator: coordinator } =
      await import('@application/coordinators/hooks/useExampleFilterCoordinator.mock');
    return { useExampleFilterCoordinator: () => coordinator };
  },
);

describe('usePresetFilters', () => {
  beforeEach(() => {
    resetMockUseExampleFilterCoordinator();
  });

  it.each(preSetQuizzes)(
    'selects exactly the $preset preset’s tags',
    ({ preset, SkillTagKeys }) => {
      const { result } = renderHook(() => usePresetFilters());

      result.current.setFilterPreset(preset);

      expect(
        mockUseExampleFilterCoordinator.bulkUpdateSkillTagKeys,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockUseExampleFilterCoordinator.bulkUpdateSkillTagKeys,
      ).toHaveBeenCalledWith(SkillTagKeys);
    },
  );

  it('clears the selected tags when the None preset is chosen', () => {
    const { result } = renderHook(() => usePresetFilters());

    result.current.setFilterPreset(PreSetQuizPreset.None);

    expect(
      mockUseExampleFilterCoordinator.bulkUpdateSkillTagKeys,
    ).toHaveBeenCalledWith([]);
  });
});
