import { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import { usePresetFilters } from '@application/units/Filtering/FilterPresets/usePresetFilters';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockBulkUpdateSkillTagKeys = vi.fn();

vi.mock('@application/coordinators/hooks/useExampleFilterCoordinator', () => ({
  useExampleFilterCoordinator: () => ({
    bulkUpdateSkillTagKeys: mockBulkUpdateSkillTagKeys,
  }),
}));

describe('usePresetFilters', () => {
  beforeEach(() => {
    mockBulkUpdateSkillTagKeys.mockClear();
  });

  it('calls bulkUpdateSkillTagKeys with Ser/Estar tag keys', () => {
    const { result } = renderHook(() => usePresetFilters());
    result.current.setFilterPreset(PreSetQuizPreset.SerEstar);
    expect(mockBulkUpdateSkillTagKeys).toHaveBeenCalledWith(
      expect.arrayContaining(['Verb-1', 'Verb-5']),
    );
  });

  it('calls bulkUpdateSkillTagKeys with empty array for None preset', () => {
    const { result } = renderHook(() => usePresetFilters());
    result.current.setFilterPreset(PreSetQuizPreset.None);
    expect(mockBulkUpdateSkillTagKeys).toHaveBeenCalledWith([]);
  });

  it('calls bulkUpdateSkillTagKeys with empty array for unrecognized preset', () => {
    const { result } = renderHook(() => usePresetFilters());
    result.current.setFilterPreset('unknown-preset' as PreSetQuizPreset);
    expect(mockBulkUpdateSkillTagKeys).toHaveBeenCalledWith([]);
  });
});
