import type { ExampleFilterStateWithoutLesson } from '@application/coordinators/contexts/ExampleFilterContext';
import type { SkillTag } from '@learncraft-spanish/shared';
import { ExampleFilterContext } from '@application/coordinators/contexts/ExampleFilterContext';
import { useSkillTags } from '@application/queries/useSkillTags';
import { use, useCallback, useMemo } from 'react';

export interface UseExampleFilterCoordinatorReturnType {
  filterStateWithoutLesson: ExampleFilterStateWithoutLesson;
  selectedSkillTags: SkillTag[];
  excludeSpanglish: boolean;
  audioOnly: boolean;
  batchUpdateFilterStateWithoutLesson: (
    filters: ExampleFilterStateWithoutLesson,
  ) => void;
  addSkillTagToFilters: (tagKey: string) => void;
  removeSkillTagFromFilters: (tagKey: string) => void;
  bulkUpdateSkillTagKeys: (skillTagKeys: string[]) => void;
  updateExcludeSpanglish: (excludeSpanglish: boolean) => void;
  updateAudioOnly: (audioOnly: boolean) => void;
  isLoading: boolean;
  error: Error | null;
}

export function useExampleFilterCoordinator(): UseExampleFilterCoordinatorReturnType {
  const { exampleFilters, updateExampleFilters } = use(ExampleFilterContext);
  const { skillTags, isLoading, error } = useSkillTags();

  const selectedSkillTags: SkillTag[] = useMemo(() => {
    if (isLoading) {
      return [];
    }
    if (error) {
      return [];
    }

    const filteredSkillTags =
      skillTags?.filter((tag) =>
        exampleFilters.skillTagKeys.includes(tag.key),
      ) ?? [];
    return filteredSkillTags;
  }, [skillTags, exampleFilters.skillTagKeys, isLoading, error]);

  const filterStateWithoutLesson: ExampleFilterStateWithoutLesson =
    useMemo(() => {
      const filters: ExampleFilterStateWithoutLesson = {
        excludeSpanglish: exampleFilters.excludeSpanglish,
        audioOnly: exampleFilters.audioOnly,
        skillTagKeys: selectedSkillTags.map((tag) => tag.key),
      };
      return filters;
    }, [exampleFilters, selectedSkillTags]);

  const batchUpdateFilterStateWithoutLesson = useCallback(
    (filters: ExampleFilterStateWithoutLesson) => {
      updateExampleFilters(filters);
    },
    [updateExampleFilters],
  );

  const addSkillTagToFilters = useCallback(
    (tagKey: string) => {
      if (exampleFilters.skillTagKeys.includes(tagKey)) {
        return;
      }
      updateExampleFilters({
        ...exampleFilters,
        skillTagKeys: [...exampleFilters.skillTagKeys, tagKey],
      });
    },
    [exampleFilters, updateExampleFilters],
  );

  const removeSkillTagFromFilters = useCallback(
    (keyToRemove: string) => {
      updateExampleFilters({
        ...exampleFilters,
        skillTagKeys: exampleFilters.skillTagKeys.filter(
          (tagKey) => tagKey !== keyToRemove,
        ),
      });
    },
    [exampleFilters, updateExampleFilters],
  );

  const bulkUpdateSkillTagKeys = useCallback(
    (skillTagKeys: string[]) => {
      updateExampleFilters({ ...exampleFilters, skillTagKeys });
    },
    [exampleFilters, updateExampleFilters],
  );

  const updateExcludeSpanglish = useCallback(
    (excludeSpanglish: boolean) => {
      updateExampleFilters({ ...exampleFilters, excludeSpanglish });
    },
    [exampleFilters, updateExampleFilters],
  );

  const updateAudioOnly = useCallback(
    (audioOnly: boolean) => {
      updateExampleFilters({ ...exampleFilters, audioOnly });
    },
    [exampleFilters, updateExampleFilters],
  );

  return {
    filterStateWithoutLesson,
    selectedSkillTags,
    excludeSpanglish: exampleFilters.excludeSpanglish,
    audioOnly: exampleFilters.audioOnly,
    batchUpdateFilterStateWithoutLesson,
    addSkillTagToFilters,
    removeSkillTagFromFilters,
    bulkUpdateSkillTagKeys,
    updateExcludeSpanglish,
    updateAudioOnly,
    isLoading,
    error,
  };
}
