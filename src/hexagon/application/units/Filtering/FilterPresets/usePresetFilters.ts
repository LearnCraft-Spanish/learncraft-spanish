import type { PreSetQuizPreset } from './preSetQuizzes';
import { useExampleFilterCoordinator } from '@application/coordinators/hooks/useExampleFilterCoordinator';
import { useCallback } from 'react';
import { preSetQuizzes } from './preSetQuizzes';

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
