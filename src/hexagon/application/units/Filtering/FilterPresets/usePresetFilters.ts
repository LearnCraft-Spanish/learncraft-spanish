import type { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import { useExampleFilterCoordinator } from '@application/coordinators/hooks/useExampleFilterCoordinator';
import { preSetQuizzes } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import { useCallback } from 'react';

export function usePresetFilters() {
  const { bulkUpdateSkillTagKeys } = useExampleFilterCoordinator();

  const setFilterPreset = useCallback(
    (preset: PreSetQuizPreset) => {
      const skillTagKeys: string[] =
        preSetQuizzes.find((quiz) => quiz.preset === preset)?.SkillTagKeys ??
        [];
      bulkUpdateSkillTagKeys(skillTagKeys);
    },
    [bulkUpdateSkillTagKeys],
  );

  return {
    setFilterPreset,
  };
}
